package com.invoicingsystem.api.application.query;

import com.invoicingsystem.api.domain.model.Invoice.InvoiceStatus;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDto {
    private String id;
    private String number;

    // Client details
    private String clientId;
    private String clientName;
    private String clientEmail;

    // Invoice details
    private LocalDate issueDate;
    private LocalDate dueDate;
    private InvoiceStatus status;
    private BigDecimal subtotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal total;
    private BigDecimal amountPaid;
    @JsonSerialize(using = ToStringSerializer.class)
    private BigDecimal balance;
    private String notes;

    // User who created it
    private String createdById;
    private String createdByName;

    // Items
    @Builder.Default
    private List<InvoiceItemDto> items = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
