package com.invoicingsystem.api.application.service;

import com.invoicingsystem.api.application.command.RecordPaymentCommand;
import com.invoicingsystem.api.application.query.PaymentDto;
import com.invoicingsystem.api.application.mapper.PaymentMapper;
import com.invoicingsystem.api.application.service.impl.PaymentServiceImpl;
import com.invoicingsystem.api.domain.exception.BadRequestException;
import com.invoicingsystem.api.domain.exception.ResourceNotFoundException;
import com.invoicingsystem.api.domain.model.Client;
import com.invoicingsystem.api.domain.model.Invoice;
import com.invoicingsystem.api.domain.model.Payment;
import com.invoicingsystem.api.domain.model.Payment.PaymentMethod;
import com.invoicingsystem.api.domain.model.Payment.PaymentStatus;
import com.invoicingsystem.api.domain.model.Invoice.InvoiceStatus;
import com.invoicingsystem.api.domain.repository.InvoiceRepository;
import com.invoicingsystem.api.domain.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private PaymentMapper paymentMapper;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Invoice testInvoice;
    private Payment testPayment;
    private PaymentDto testPaymentDto;
    private RecordPaymentCommand recordCommand;

    @BeforeEach
    void setUp() {
        // Setup test client
        Client testClient = new Client();
        testClient.setId("test-client-id");
        testClient.setName("Test Client");

        // Setup test invoice
        testInvoice = new Invoice();
        testInvoice.setId("test-invoice-id");
        testInvoice.setNumber("INV-001");
        testInvoice.setClient(testClient);
        testInvoice.setTotal(new BigDecimal("1000.00"));
        testInvoice.setBalance(new BigDecimal("1000.00"));
        testInvoice.setStatus(InvoiceStatus.SENT);

        // Setup test payment
        testPayment = new Payment();
        testPayment.setId("test-payment-id");
        testPayment.setInvoice(testInvoice);
        testPayment.setAmount(new BigDecimal("500.00"));
        testPayment.setMethod(PaymentMethod.CREDIT_CARD);
        testPayment.setStatus(PaymentStatus.COMPLETED);
        testPayment.setReceivedAt(LocalDateTime.now());
        testPayment.setReference("REF-123");
        testPayment.setCreatedAt(LocalDateTime.now());
        testPayment.setUpdatedAt(LocalDateTime.now());

        // Setup DTO
        testPaymentDto = new PaymentDto();
        testPaymentDto.setId("test-payment-id");
        testPaymentDto.setInvoiceId("test-invoice-id");
        testPaymentDto.setInvoiceNumber("INV-001");
        testPaymentDto.setAmount(new BigDecimal("500.00"));
        testPaymentDto.setMethod(PaymentMethod.CREDIT_CARD);
        testPaymentDto.setStatus(PaymentStatus.COMPLETED);
        testPaymentDto.setReceivedAt(LocalDateTime.now());
        testPaymentDto.setReference("REF-123");
        testPaymentDto.setCreatedAt(LocalDateTime.now());
        testPaymentDto.setUpdatedAt(LocalDateTime.now());

        // Setup command
        recordCommand = new RecordPaymentCommand();
        recordCommand.setInvoiceId("test-invoice-id");
        recordCommand.setAmount(new BigDecimal("500.00"));
        recordCommand.setMethod(PaymentMethod.CREDIT_CARD);
        recordCommand.setStatus(PaymentStatus.COMPLETED);
        recordCommand.setReceivedAt(LocalDateTime.now());
        recordCommand.setReference("REF-123");
    }

    @Test
    void recordPayment_WithValidData_ShouldCreatePayment() {
        // Given
        when(invoiceRepository.findById("test-invoice-id")).thenReturn(Optional.of(testInvoice));
        when(paymentMapper.recordPaymentCommandToPayment(recordCommand)).thenReturn(testPayment);
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);
        when(paymentMapper.paymentToPaymentDto(testPayment)).thenReturn(testPaymentDto);

        // When
        PaymentDto result = paymentService.recordPayment(recordCommand);

        // Then
        assertEquals(testPaymentDto, result);
        assertEquals(new BigDecimal("500.00"), testInvoice.getBalance()); // Balance should be reduced
        verify(invoiceRepository).findById("test-invoice-id");
        verify(paymentMapper).recordPaymentCommandToPayment(recordCommand);
        verify(paymentRepository).save(any(Payment.class));
        verify(invoiceRepository).save(testInvoice);
        verify(paymentMapper).paymentToPaymentDto(testPayment);
    }

    @Test
    void recordPayment_WhenInvoiceNotFound_ShouldThrowException() {
        // Given
        when(invoiceRepository.findById("test-invoice-id")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> paymentService.recordPayment(recordCommand));
        verify(invoiceRepository).findById("test-invoice-id");
        verifyNoInteractions(paymentMapper, paymentRepository);
    }

    @Test
    void recordPayment_WhenOverpayment_ShouldThrowException() {
        // Given
        recordCommand.setAmount(new BigDecimal("1500.00")); // More than invoice total
        when(invoiceRepository.findById("test-invoice-id")).thenReturn(Optional.of(testInvoice));

        // When & Then
        assertThrows(BadRequestException.class, () -> paymentService.recordPayment(recordCommand));
        verify(invoiceRepository).findById("test-invoice-id");
        verifyNoInteractions(paymentMapper, paymentRepository);
    }

    @Test
    void recordPayment_WhenInvoiceIsPaid_ShouldThrowException() {
        // Given
        testInvoice.setStatus(InvoiceStatus.PAID);
        when(invoiceRepository.findById("test-invoice-id")).thenReturn(Optional.of(testInvoice));

        // When & Then
        assertThrows(BadRequestException.class, () -> paymentService.recordPayment(recordCommand));
        verify(invoiceRepository).findById("test-invoice-id");
        verifyNoInteractions(paymentMapper, paymentRepository);
    }

    @Test
    void recordPayment_WhenInvoiceIsCanceled_ShouldThrowException() {
        // Given
        testInvoice.setStatus(InvoiceStatus.CANCELED);
        when(invoiceRepository.findById("test-invoice-id")).thenReturn(Optional.of(testInvoice));

        // When & Then
        assertThrows(BadRequestException.class, () -> paymentService.recordPayment(recordCommand));
        verify(invoiceRepository).findById("test-invoice-id");
        verifyNoInteractions(paymentMapper, paymentRepository);
    }

    @Test
    void recordPayment_WithExactAmount_ShouldMarkInvoiceAsPaid() {
        // Given
        recordCommand.setAmount(new BigDecimal("1000.00")); // Exact invoice total
        testInvoice.setBalance(new BigDecimal("1000.00"));
        
        when(invoiceRepository.findById("test-invoice-id")).thenReturn(Optional.of(testInvoice));
        when(paymentMapper.recordPaymentCommandToPayment(recordCommand)).thenReturn(testPayment);
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);
        
        PaymentDto paidDto = new PaymentDto();
        paidDto.setId("test-payment-id");
        paidDto.setStatus(PaymentStatus.COMPLETED);
        when(paymentMapper.paymentToPaymentDto(testPayment)).thenReturn(paidDto);

        // When
        PaymentDto result = paymentService.recordPayment(recordCommand);

        // Then
        assertEquals(PaymentStatus.COMPLETED, result.getStatus());
        assertEquals(InvoiceStatus.PAID, testInvoice.getStatus()); // Invoice should be marked as PAID
        assertEquals(BigDecimal.ZERO, testInvoice.getBalance());
        verify(invoiceRepository).save(testInvoice);
    }

    @Test
    void getPaymentsByInvoiceId_WhenPaymentsExist_ShouldReturnPayments() {
        // Given
        List<Payment> payments = Arrays.asList(testPayment);
        List<PaymentDto> expectedDtos = Arrays.asList(testPaymentDto);

        when(paymentRepository.findByInvoiceId("test-invoice-id")).thenReturn(payments);
        when(paymentMapper.paymentsToPaymentDtos(payments)).thenReturn(expectedDtos);

        // When
        List<PaymentDto> result = paymentService.getPaymentsByInvoiceId("test-invoice-id");

        // Then
        assertEquals(expectedDtos, result);
        verify(paymentRepository).findByInvoiceId("test-invoice-id");
        verify(paymentMapper).paymentsToPaymentDtos(payments);
    }

    @Test
    void getPaymentById_WhenPaymentExists_ShouldReturnPayment() {
        // Given
        when(paymentRepository.findById("test-payment-id")).thenReturn(Optional.of(testPayment));
        when(paymentMapper.paymentToPaymentDto(testPayment)).thenReturn(testPaymentDto);

        // When
        PaymentDto result = paymentService.getPaymentById("test-payment-id");

        // Then
        assertEquals(testPaymentDto, result);
        verify(paymentRepository).findById("test-payment-id");
        verify(paymentMapper).paymentToPaymentDto(testPayment);
    }

    @Test
    void getPaymentById_WhenPaymentNotFound_ShouldThrowException() {
        // Given
        when(paymentRepository.findById("non-existent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> paymentService.getPaymentById("non-existent"));
        verify(paymentRepository).findById("non-existent");
        verifyNoInteractions(paymentMapper);
    }

    @Test
    void updatePaymentStatus_WithValidStatus_ShouldUpdateStatus() {
        // Given
        when(paymentRepository.findById("test-payment-id")).thenReturn(Optional.of(testPayment));
        when(paymentRepository.save(testPayment)).thenReturn(testPayment);
        
        PaymentDto updatedDto = new PaymentDto();
        updatedDto.setId("test-payment-id");
        updatedDto.setStatus(PaymentStatus.REVERSED);
        when(paymentMapper.paymentToPaymentDto(testPayment)).thenReturn(updatedDto);

        // When
        PaymentDto result = paymentService.updatePaymentStatus("test-payment-id", PaymentStatus.REVERSED);

        // Then
        assertEquals(PaymentStatus.REVERSED, result.getStatus());
        assertEquals(PaymentStatus.REVERSED, testPayment.getStatus());
        verify(paymentRepository).findById("test-payment-id");
        verify(paymentRepository).save(testPayment);
        verify(paymentMapper).paymentToPaymentDto(testPayment);
    }

    @Test
    void updatePaymentStatus_WithInvalidTransition_ShouldThrowException() {
        // Given
        testPayment.setStatus(PaymentStatus.COMPLETED);
        when(paymentRepository.findById("test-payment-id")).thenReturn(Optional.of(testPayment));

        // When & Then
        assertThrows(BadRequestException.class, () -> 
                paymentService.updatePaymentStatus("test-payment-id", "INVALID_STATUS"));
        verify(paymentRepository).findById("test-payment-id");
        verifyNoMoreInteractions(paymentRepository);
    }

    @Test
    void updatePaymentStatus_WhenPaymentNotFound_ShouldThrowException() {
        // Given
        when(paymentRepository.findById("non-existent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> 
                paymentService.updatePaymentStatus("non-existent", PaymentStatus.REVERSED));
        verify(paymentRepository).findById("non-existent");
        verifyNoMoreInteractions(paymentRepository, paymentMapper);
    }

    @Test
    void deletePayment_WithValidId_ShouldDeletePayment() {
        // Given
        when(paymentRepository.findById("test-payment-id")).thenReturn(Optional.of(testPayment));
        testInvoice.setBalanceDue(new BigDecimal("500.00")); // Balance was reduced by payment

        // When
        paymentService.deletePayment("test-payment-id");

        // Then
        assertEquals(new BigDecimal("1000.00"), testInvoice.getBalanceDue()); // Balance should be restored
        assertEquals(InvoiceStatus.SENT, testInvoice.getStatus()); // Status should be restored
        verify(paymentRepository).findById("test-payment-id");
        verify(paymentRepository).delete(testPayment);
        verify(invoiceRepository).save(testInvoice);
    }

    @Test
    void deletePayment_WhenPaymentNotFound_ShouldThrowException() {
        // Given
        when(paymentRepository.findById("non-existent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> paymentService.deletePayment("non-existent"));
        verify(paymentRepository).findById("non-existent");
        verifyNoMoreInteractions(paymentRepository, invoiceRepository);
    }

    @Test
    void deletePayment_WithReversedPayment_ShouldThrowException() {
        // Given
        testPayment.setStatus(PaymentStatus.REVERSED);
        when(paymentRepository.findById("test-payment-id")).thenReturn(Optional.of(testPayment));

        // When & Then
        assertThrows(BadRequestException.class, () -> paymentService.deletePayment("test-payment-id"));
        verify(paymentRepository).findById("test-payment-id");
        verifyNoMoreInteractions(paymentRepository, invoiceRepository);
    }
}