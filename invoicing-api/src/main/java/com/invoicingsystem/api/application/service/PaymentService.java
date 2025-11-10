package com.invoicingsystem.api.application.service;

import com.invoicingsystem.api.application.command.RecordPaymentCommand;
import com.invoicingsystem.api.application.query.PaymentDto;
import com.invoicingsystem.api.domain.model.Payment;

import java.util.List;

public interface PaymentService {

    List<PaymentDto> getAllPayments();

    List<PaymentDto> getPaymentsByInvoiceId(String invoiceId);

    PaymentDto getPaymentById(String id);

    PaymentDto recordPayment(RecordPaymentCommand command);

    PaymentDto updatePaymentStatus(String paymentId, Payment.PaymentStatus status);

    // Overload to accept raw string status for tests that pass strings
    PaymentDto updatePaymentStatus(String paymentId, String status);

    void deletePayment(String id);
}