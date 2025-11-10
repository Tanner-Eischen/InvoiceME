package com.invoicingsystem.api.application.query;

import com.invoicingsystem.api.domain.model.Payment.PaymentMethod;
import com.invoicingsystem.api.domain.model.Payment.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDto {
    private String id;
    private String invoiceId;
    private String invoiceNumber;
    private BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private LocalDateTime receivedAt;
    private String reference;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}