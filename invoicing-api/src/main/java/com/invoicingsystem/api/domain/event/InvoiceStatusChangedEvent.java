package com.invoicingsystem.api.domain.event;

import com.invoicingsystem.api.domain.model.Invoice;
import java.time.LocalDateTime;

public class InvoiceStatusChangedEvent {
    private final String invoiceId;
    private final Invoice.InvoiceStatus previousStatus;
    private final Invoice.InvoiceStatus newStatus;
    private final LocalDateTime occurredAt;

    public InvoiceStatusChangedEvent(String invoiceId, Invoice.InvoiceStatus previousStatus, Invoice.InvoiceStatus newStatus, LocalDateTime occurredAt) {
        this.invoiceId = invoiceId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.occurredAt = occurredAt != null ? occurredAt : LocalDateTime.now();
    }

    public String getInvoiceId() { return invoiceId; }
    public Invoice.InvoiceStatus getPreviousStatus() { return previousStatus; }
    public Invoice.InvoiceStatus getNewStatus() { return newStatus; }
    public LocalDateTime getOccurredAt() { return occurredAt; }
}