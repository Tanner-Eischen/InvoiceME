package com.invoicingsystem.api.application.service.impl;

import com.invoicingsystem.api.application.command.RecordPaymentCommand;
import com.invoicingsystem.api.application.mapper.PaymentMapper;
import com.invoicingsystem.api.application.query.PaymentDto;
import com.invoicingsystem.api.application.service.PaymentService;
import com.invoicingsystem.api.domain.exception.BadRequestException;
import com.invoicingsystem.api.domain.exception.ResourceNotFoundException;
import com.invoicingsystem.api.domain.model.Invoice;
import com.invoicingsystem.api.domain.model.Payment;
import com.invoicingsystem.api.domain.repository.InvoiceRepository;
import com.invoicingsystem.api.domain.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentMapper paymentMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentDto> getAllPayments() {
        return paymentMapper.paymentsToPaymentDtos(paymentRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentDto> getPaymentsByInvoiceId(String invoiceId) {
        if (!invoiceRepository.existsById(invoiceId)) {
            throw new ResourceNotFoundException("Invoice", "id", invoiceId);
        }
        return paymentMapper.paymentsToPaymentDtos(paymentRepository.findByInvoiceId(invoiceId));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDto getPaymentById(String id) {
        return paymentRepository.findById(id)
                .map(paymentMapper::paymentToPaymentDto)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
    }

    @Override
    @Transactional
    public PaymentDto recordPayment(RecordPaymentCommand command) {
        Invoice invoice = invoiceRepository.findById(command.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", command.getInvoiceId()));

        // Validate payment amount
        BigDecimal currentTotalPaid = paymentRepository.getTotalPaidAmountByInvoiceId(command.getInvoiceId());
        BigDecimal newTotalPaid = currentTotalPaid.add(command.getAmount());
        
        if (newTotalPaid.compareTo(invoice.getTotal()) > 0) {
            throw new BadRequestException("Payment amount would exceed invoice total. Current paid: " + 
                    currentTotalPaid + ", Invoice total: " + invoice.getTotal());
        }

        // Check for duplicate reference if provided
        if (command.getReference() != null && !command.getReference().isEmpty()) {
            if (paymentRepository.existsByReference(command.getReference())) {
                throw new BadRequestException("Payment with reference '" + command.getReference() + "' already exists");
            }
        }

        // Create payment
        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(command.getAmount())
                .method(command.getMethod())
                .status(command.getStatus() != null ? command.getStatus() : Payment.PaymentStatus.PENDING)
                .receivedAt(command.getReceivedAt() != null ? command.getReceivedAt() : LocalDateTime.now())
                .reference(command.getReference())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        
        // Apply payment to invoice and recalculate balance
        if (savedPayment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            invoice.applyPayment(savedPayment.getAmount());
            invoiceRepository.save(invoice);
        }

        // Publish domain event
        eventPublisher.publishEvent(new com.invoicingsystem.api.domain.event.PaymentRecordedEvent(
                savedPayment.getId(),
                invoice.getId(),
                savedPayment.getAmount(),
                savedPayment.getMethod().name(),
                savedPayment.getStatus().name(),
                savedPayment.getReceivedAt()
        ));
        
        return paymentMapper.paymentToPaymentDto(savedPayment);
    }

    @Override
    @Transactional
    public PaymentDto updatePaymentStatus(String paymentId, Payment.PaymentStatus status) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        // Validate status transition
        validateStatusTransition(payment.getStatus(), status);

        // Handle balance changes based on status transition
        Invoice invoice = payment.getInvoice();
        BigDecimal paymentAmount = payment.getAmount();
        
        if (payment.getStatus() == Payment.PaymentStatus.PENDING && status == Payment.PaymentStatus.COMPLETED) {
            // Payment becoming completed - apply to invoice
            invoice.applyPayment(paymentAmount);
            invoiceRepository.save(invoice);
        } else if (payment.getStatus() == Payment.PaymentStatus.COMPLETED && status == Payment.PaymentStatus.REVERSED) {
            // Payment being reversed - remove from invoice
            invoice.reversePayment(paymentAmount);
            invoiceRepository.save(invoice);
        }

        payment.setStatus(status);
        payment.setUpdatedAt(LocalDateTime.now());

        Payment updatedPayment = paymentRepository.save(payment);

        // Publish domain event on status change
        eventPublisher.publishEvent(new com.invoicingsystem.api.domain.event.PaymentRecordedEvent(
                updatedPayment.getId(),
                invoice.getId(),
                updatedPayment.getAmount(),
                updatedPayment.getMethod().name(),
                updatedPayment.getStatus().name(),
                updatedPayment.getUpdatedAt()
        ));
        return paymentMapper.paymentToPaymentDto(updatedPayment);
    }

    @Override
    @Transactional
    public PaymentDto updatePaymentStatus(String paymentId, String status) {
        Payment.PaymentStatus parsedStatus;
        try {
            parsedStatus = Payment.PaymentStatus.valueOf(status);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid payment status: " + status);
        }
        return updatePaymentStatus(paymentId, parsedStatus);
    }

    @Override
    @Transactional
    public void deletePayment(String id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        
        // If payment was completed, reverse it from invoice balance
        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            Invoice invoice = payment.getInvoice();
            invoice.reversePayment(payment.getAmount());
            invoiceRepository.save(invoice);
        }
        
        paymentRepository.deleteById(id);

        // Publish domain event for deletion/reversal case as REVERSED
        eventPublisher.publishEvent(new com.invoicingsystem.api.domain.event.PaymentRecordedEvent(
                payment.getId(),
                payment.getInvoice().getId(),
                payment.getAmount(),
                payment.getMethod().name(),
                Payment.PaymentStatus.REVERSED.name(),
                java.time.LocalDateTime.now()
        ));
    }

    private void validateStatusTransition(Payment.PaymentStatus currentStatus, Payment.PaymentStatus newStatus) {
        // PENDING -> COMPLETED -> REVERSED
        if (currentStatus == Payment.PaymentStatus.PENDING && newStatus != Payment.PaymentStatus.COMPLETED) {
            throw new BadRequestException("Cannot transition from PENDING to " + newStatus);
        }
        
        if (currentStatus == Payment.PaymentStatus.COMPLETED && newStatus != Payment.PaymentStatus.REVERSED) {
            throw new BadRequestException("Cannot transition from COMPLETED to " + newStatus);
        }
        
        if (currentStatus == Payment.PaymentStatus.REVERSED) {
            throw new BadRequestException("Cannot transition from REVERSED status");
        }
    }
}