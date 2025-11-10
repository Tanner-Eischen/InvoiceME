package com.invoicingsystem.api.application.service;

import com.invoicingsystem.api.application.command.CreateInvoiceCommand;
import com.invoicingsystem.api.application.command.UpdateInvoiceCommand;
import com.invoicingsystem.api.application.command.UpdateInvoiceStatusCommand;
import com.invoicingsystem.api.application.query.InvoiceDto;
import com.invoicingsystem.api.domain.model.Invoice.InvoiceStatus;

import java.util.List;

public interface InvoiceService {

    List<InvoiceDto> getAllInvoices();

    InvoiceDto getInvoiceById(String id);

    InvoiceDto getInvoiceByNumber(String number);

    List<InvoiceDto> getInvoicesByClientId(String clientId);

    List<InvoiceDto> getInvoicesByStatus(InvoiceStatus status);

    List<InvoiceDto> getOverdueInvoices();

    InvoiceDto createInvoice(CreateInvoiceCommand command, String userId);

    InvoiceDto updateInvoice(UpdateInvoiceCommand command);

    InvoiceDto updateInvoiceStatus(UpdateInvoiceStatusCommand command);

    void deleteInvoice(String id);
}
