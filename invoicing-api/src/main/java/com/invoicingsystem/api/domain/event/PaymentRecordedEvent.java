package com.invoicingsystem.api.domain.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentRecordedEvent {
    private final String paymentId;
    private final String invoiceId;
    private final BigDecimal amount;
    private final String method;
    private final String status;
    private final LocalDateTime occurredAt;

    public PaymentRecordedEvent(String paymentId, String invoiceId, BigDecimal amount, String method, String status, LocalDateTime occurredAt) {
        this.paymentId = paymentId;
        this.invoiceId = invoiceId;
        this.amount = amount;
        this.method = method;
        this.status = status;
        this.occurredAt = occurredAt != null ? occurredAt : LocalDateTime.now();
    }

    public String getPaymentId() { return paymentId; }
    public String getInvoiceId() { return invoiceId; }
    public BigDecimal getAmount() { return amount; }
    public String getMethod() { return method; }
    public String getStatus() { return status; }
    public LocalDateTime getOccurredAt() { return occurredAt; }
}