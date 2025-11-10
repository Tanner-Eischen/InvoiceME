package com.invoicingsystem.api.application.mapper;

import com.invoicingsystem.api.application.command.CreateInvoiceCommand;
import com.invoicingsystem.api.application.command.UpdateInvoiceCommand;
import com.invoicingsystem.api.application.query.InvoiceDto;
import com.invoicingsystem.api.application.query.InvoiceItemDto;
import com.invoicingsystem.api.domain.model.Client;
import com.invoicingsystem.api.domain.model.Invoice;
import com.invoicingsystem.api.domain.model.InvoiceItem;
import com.invoicingsystem.api.domain.model.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-09T23:14:51-0600",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.17 (Eclipse Adoptium)"
)
@Component
public class InvoiceMapperImpl implements InvoiceMapper {

    @Override
    public InvoiceDto invoiceToInvoiceDto(Invoice invoice) {
        if ( invoice == null ) {
            return null;
        }

        InvoiceDto.InvoiceDtoBuilder invoiceDto = InvoiceDto.builder();

        invoiceDto.clientId( invoiceClientId( invoice ) );
        invoiceDto.clientName( invoiceClientName( invoice ) );
        invoiceDto.clientEmail( invoiceClientEmail( invoice ) );
        invoiceDto.createdById( invoiceCreatedById( invoice ) );
        invoiceDto.createdByName( invoiceCreatedByName( invoice ) );
        invoiceDto.id( invoice.getId() );
        invoiceDto.number( invoice.getNumber() );
        invoiceDto.issueDate( invoice.getIssueDate() );
        invoiceDto.dueDate( invoice.getDueDate() );
        invoiceDto.status( invoice.getStatus() );
        invoiceDto.subtotal( invoice.getSubtotal() );
        invoiceDto.taxRate( invoice.getTaxRate() );
        invoiceDto.taxAmount( invoice.getTaxAmount() );
        invoiceDto.total( invoice.getTotal() );
        invoiceDto.amountPaid( invoice.getAmountPaid() );
        invoiceDto.balance( invoice.getBalance() );
        invoiceDto.notes( invoice.getNotes() );
        invoiceDto.items( invoiceItemsToInvoiceItemDtos( invoice.getItems() ) );
        invoiceDto.createdAt( invoice.getCreatedAt() );
        invoiceDto.updatedAt( invoice.getUpdatedAt() );

        return invoiceDto.build();
    }

    @Override
    public List<InvoiceDto> invoicesToInvoiceDtos(List<Invoice> invoices) {
        if ( invoices == null ) {
            return null;
        }

        List<InvoiceDto> list = new ArrayList<InvoiceDto>( invoices.size() );
        for ( Invoice invoice : invoices ) {
            list.add( invoiceToInvoiceDto( invoice ) );
        }

        return list;
    }

    @Override
    public InvoiceItemDto invoiceItemToInvoiceItemDto(InvoiceItem invoiceItem) {
        if ( invoiceItem == null ) {
            return null;
        }

        InvoiceItemDto.InvoiceItemDtoBuilder invoiceItemDto = InvoiceItemDto.builder();

        invoiceItemDto.id( invoiceItem.getId() );
        invoiceItemDto.description( invoiceItem.getDescription() );
        invoiceItemDto.quantity( invoiceItem.getQuantity() );
        invoiceItemDto.unitPrice( invoiceItem.getUnitPrice() );
        invoiceItemDto.amount( invoiceItem.getAmount() );
        invoiceItemDto.createdAt( invoiceItem.getCreatedAt() );
        invoiceItemDto.updatedAt( invoiceItem.getUpdatedAt() );

        return invoiceItemDto.build();
    }

    @Override
    public List<InvoiceItemDto> invoiceItemsToInvoiceItemDtos(List<InvoiceItem> invoiceItems) {
        if ( invoiceItems == null ) {
            return null;
        }

        List<InvoiceItemDto> list = new ArrayList<InvoiceItemDto>( invoiceItems.size() );
        for ( InvoiceItem invoiceItem : invoiceItems ) {
            list.add( invoiceItemToInvoiceItemDto( invoiceItem ) );
        }

        return list;
    }

    @Override
    public Invoice createInvoiceCommandToInvoice(CreateInvoiceCommand command) {
        if ( command == null ) {
            return null;
        }

        Invoice.InvoiceBuilder<?, ?> invoice = Invoice.builder();

        if ( command.getStatus() != null ) {
            invoice.status( Enum.valueOf( Invoice.InvoiceStatus.class, command.getStatus() ) );
        }
        invoice.issueDate( command.getIssueDate() );
        invoice.dueDate( command.getDueDate() );
        invoice.taxRate( command.getTaxRate() );
        invoice.notes( command.getNotes() );

        return invoice.build();
    }

    @Override
    public void updateInvoiceFromCommand(UpdateInvoiceCommand command, Invoice invoice) {
        if ( command == null ) {
            return;
        }

        if ( command.getId() != null ) {
            invoice.setId( command.getId() );
        }
        if ( command.getIssueDate() != null ) {
            invoice.setIssueDate( command.getIssueDate() );
        }
        if ( command.getDueDate() != null ) {
            invoice.setDueDate( command.getDueDate() );
        }
        if ( command.getStatus() != null ) {
            invoice.setStatus( Enum.valueOf( Invoice.InvoiceStatus.class, command.getStatus() ) );
        }
        if ( command.getTaxRate() != null ) {
            invoice.setTaxRate( command.getTaxRate() );
        }
        if ( command.getNotes() != null ) {
            invoice.setNotes( command.getNotes() );
        }
    }

    @Override
    public InvoiceItem invoiceItemDtoToInvoiceItem(CreateInvoiceCommand.InvoiceItemDto itemDto) {
        if ( itemDto == null ) {
            return null;
        }

        InvoiceItem.InvoiceItemBuilder<?, ?> invoiceItem = InvoiceItem.builder();

        invoiceItem.description( itemDto.getDescription() );
        invoiceItem.quantity( itemDto.getQuantity() );
        invoiceItem.unitPrice( itemDto.getUnitPrice() );

        return invoiceItem.build();
    }

    @Override
    public InvoiceItem invoiceItemDtoToInvoiceItem(UpdateInvoiceCommand.InvoiceItemDto itemDto) {
        if ( itemDto == null ) {
            return null;
        }

        InvoiceItem.InvoiceItemBuilder<?, ?> invoiceItem = InvoiceItem.builder();

        invoiceItem.id( itemDto.getId() );
        invoiceItem.description( itemDto.getDescription() );
        invoiceItem.quantity( itemDto.getQuantity() );
        invoiceItem.unitPrice( itemDto.getUnitPrice() );

        return invoiceItem.build();
    }

    private String invoiceClientId(Invoice invoice) {
        if ( invoice == null ) {
            return null;
        }
        Client client = invoice.getClient();
        if ( client == null ) {
            return null;
        }
        String id = client.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String invoiceClientName(Invoice invoice) {
        if ( invoice == null ) {
            return null;
        }
        Client client = invoice.getClient();
        if ( client == null ) {
            return null;
        }
        String name = client.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private String invoiceClientEmail(Invoice invoice) {
        if ( invoice == null ) {
            return null;
        }
        Client client = invoice.getClient();
        if ( client == null ) {
            return null;
        }
        String email = client.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    private String invoiceCreatedById(Invoice invoice) {
        if ( invoice == null ) {
            return null;
        }
        User createdBy = invoice.getCreatedBy();
        if ( createdBy == null ) {
            return null;
        }
        String id = createdBy.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String invoiceCreatedByName(Invoice invoice) {
        if ( invoice == null ) {
            return null;
        }
        User createdBy = invoice.getCreatedBy();
        if ( createdBy == null ) {
            return null;
        }
        String name = createdBy.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
