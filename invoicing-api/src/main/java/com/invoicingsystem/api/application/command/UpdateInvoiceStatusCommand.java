package com.invoicingsystem.api.application.command;

import com.invoicingsystem.api.domain.model.Invoice.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateInvoiceStatusCommand {

    @NotBlank(message = "Invoice ID is required")
    private String invoiceId;

    @NotNull(message = "Status is required")
    private InvoiceStatus status;
}
