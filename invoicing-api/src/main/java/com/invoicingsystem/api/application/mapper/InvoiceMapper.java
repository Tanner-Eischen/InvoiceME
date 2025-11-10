package com.invoicingsystem.api.application.mapper;

import com.invoicingsystem.api.application.command.CreateInvoiceCommand;
import com.invoicingsystem.api.application.command.UpdateInvoiceCommand;
import com.invoicingsystem.api.application.query.InvoiceDto;
import com.invoicingsystem.api.application.query.InvoiceItemDto;
import com.invoicingsystem.api.domain.model.Invoice;
import com.invoicingsystem.api.domain.model.InvoiceItem;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {

    InvoiceMapper INSTANCE = Mappers.getMapper(InvoiceMapper.class);

    @Mapping(target = "clientId", source = "client.id")
    @Mapping(target = "clientName", source = "client.name")
    @Mapping(target = "clientEmail", source = "client.email")
    @Mapping(target = "createdById", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.name")
    InvoiceDto invoiceToInvoiceDto(Invoice invoice);

    List<InvoiceDto> invoicesToInvoiceDtos(List<Invoice> invoices);

    InvoiceItemDto invoiceItemToInvoiceItemDto(InvoiceItem invoiceItem);

    List<InvoiceItemDto> invoiceItemsToInvoiceItemDtos(List<InvoiceItem> invoiceItems);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "number", ignore = true)
    @Mapping(target = "status", source = "status")
    @Mapping(target = "subtotal", ignore = true)
    @Mapping(target = "taxAmount", ignore = true)
    @Mapping(target = "total", ignore = true)
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Invoice createInvoiceCommandToInvoice(CreateInvoiceCommand command);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "number", ignore = true)
    @Mapping(target = "subtotal", ignore = true)
    @Mapping(target = "taxAmount", ignore = true)
    @Mapping(target = "total", ignore = true)
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateInvoiceFromCommand(UpdateInvoiceCommand command, @MappingTarget Invoice invoice);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "invoice", ignore = true)
    @Mapping(target = "amount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    InvoiceItem invoiceItemDtoToInvoiceItem(CreateInvoiceCommand.InvoiceItemDto itemDto);

    @Mapping(target = "invoice", ignore = true)
    @Mapping(target = "amount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    InvoiceItem invoiceItemDtoToInvoiceItem(UpdateInvoiceCommand.InvoiceItemDto itemDto);
}
