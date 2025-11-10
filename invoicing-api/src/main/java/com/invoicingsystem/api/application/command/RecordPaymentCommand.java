package com.invoicingsystem.api.application.command;

import com.invoicingsystem.api.domain.model.Payment.PaymentMethod;
import com.invoicingsystem.api.domain.model.Payment.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordPaymentCommand {

    @NotBlank(message = "Invoice ID is required")
    private String invoiceId;

    @NotNull(message = "Payment amount is required")
    @Positive(message = "Payment amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod method;

    private PaymentStatus status;

    private LocalDateTime receivedAt;

    private String reference;
}