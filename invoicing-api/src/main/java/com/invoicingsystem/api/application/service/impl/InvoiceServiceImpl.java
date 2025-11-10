package com.invoicingsystem.api.application.service.impl;

import com.invoicingsystem.api.application.command.CreateInvoiceCommand;
import com.invoicingsystem.api.application.command.UpdateInvoiceCommand;
import com.invoicingsystem.api.application.command.UpdateInvoiceStatusCommand;
import com.invoicingsystem.api.application.mapper.InvoiceMapper;
import com.invoicingsystem.api.application.query.InvoiceDto;
import com.invoicingsystem.api.application.service.InvoiceService;
import com.invoicingsystem.api.domain.exception.BadRequestException;
import com.invoicingsystem.api.domain.exception.DuplicateResourceException;
import com.invoicingsystem.api.domain.exception.ResourceNotFoundException;
import com.invoicingsystem.api.domain.model.Client;
import com.invoicingsystem.api.domain.model.Invoice;
import com.invoicingsystem.api.domain.model.InvoiceItem;
import com.invoicingsystem.api.domain.model.User;
import com.invoicingsystem.api.domain.repository.ClientRepository;
import com.invoicingsystem.api.domain.repository.InvoiceItemRepository;
import com.invoicingsystem.api.domain.repository.InvoiceRepository;
import com.invoicingsystem.api.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final InvoiceMapper invoiceMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDto> getAllInvoices() {
        return invoiceMapper.invoicesToInvoiceDtos(invoiceRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDto getInvoiceById(String id) {
        return invoiceRepository.findById(id)
                .map(invoiceMapper::invoiceToInvoiceDto)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDto getInvoiceByNumber(String number) {
        return invoiceRepository.findByNumber(number)
                .map(invoiceMapper::invoiceToInvoiceDto)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "number", number));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDto> getInvoicesByClientId(String clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new ResourceNotFoundException("Client", "id", clientId);
        }

        return invoiceMapper.invoicesToInvoiceDtos(invoiceRepository.findByClientId(clientId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDto> getInvoicesByStatus(Invoice.InvoiceStatus status) {
        return invoiceMapper.invoicesToInvoiceDtos(invoiceRepository.findByStatus(status));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDto> getOverdueInvoices() {
        return invoiceMapper.invoicesToInvoiceDtos(
                invoiceRepository.findOverdueInvoices(LocalDate.now()));
    }

    @Override
    @Transactional
    public InvoiceDto createInvoice(CreateInvoiceCommand command, String userId) {
        Client client = clientRepository.findById(command.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", command.getClientId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Validate dates
        if (command.getIssueDate() != null && command.getDueDate() != null
                && command.getDueDate().isBefore(command.getIssueDate())) {
            throw new BadRequestException("Due date cannot be before issue date");
        }

        // Generate invoice number
        String invoiceNumber = generateInvoiceNumber();
        if (invoiceRepository.existsByNumber(invoiceNumber)) {
            throw new DuplicateResourceException("Invoice", "number", invoiceNumber);
        }

        // Create invoice
        Invoice invoice = invoiceMapper.createInvoiceCommandToInvoice(command);
        invoice.setClient(client);
        invoice.setCreatedBy(user);
        invoice.setNumber(invoiceNumber);

        // Set status if provided, otherwise default to DRAFT
        if (command.getStatus() != null && !command.getStatus().isEmpty()) {
            invoice.setStatus(Invoice.InvoiceStatus.valueOf(command.getStatus()));
        } else {
            invoice.setStatus(Invoice.InvoiceStatus.DRAFT);
        }

        invoice.setCreatedAt(LocalDateTime.now());
        invoice.setUpdatedAt(LocalDateTime.now());

        // Create invoice items
        List<InvoiceItem> items = command.getItems().stream()
                .map(itemDto -> {
                    InvoiceItem item = invoiceMapper.invoiceItemDtoToInvoiceItem(itemDto);
                    item.setInvoice(invoice);
                    item.calculateAmount();
                    item.setCreatedAt(LocalDateTime.now());
                    item.setUpdatedAt(LocalDateTime.now());
                    return item;
                })
                .collect(Collectors.toList());

        // Ensure items list is initialized before adding
        if (invoice.getItems() == null) {
            invoice.setItems(new java.util.ArrayList<>());
        }
        invoice.getItems().addAll(items);
        invoice.calculateTotals();
        
        // Initialize balance fields
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setBalance(invoice.getTotal());

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return invoiceMapper.invoiceToInvoiceDto(savedInvoice);
    }

    @Override
    @Transactional
    public InvoiceDto updateInvoice(UpdateInvoiceCommand command) {
        Invoice invoice = invoiceRepository.findById(command.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", command.getId()));

        invoiceMapper.updateInvoiceFromCommand(command, invoice);
        invoice.setUpdatedAt(LocalDateTime.now());

        // Handle items when provided: remove existing ones and add new ones
        if (command.getItems() != null) {
            if (invoice.getItems() == null) {
                invoice.setItems(new java.util.ArrayList<>());
            }
            invoice.getItems().clear();

            List<InvoiceItem> items = command.getItems().stream()
                    .map(itemDto -> {
                        InvoiceItem item;
                        if (itemDto.getId() != null && !itemDto.getId().isEmpty()) {
                            item = invoiceItemRepository.findById(itemDto.getId())
                                    .orElse(new InvoiceItem());
                        } else {
                            item = new InvoiceItem();
                        }

                        item.setDescription(itemDto.getDescription());
                        item.setQuantity(itemDto.getQuantity());
                        item.setUnitPrice(itemDto.getUnitPrice());
                        item.setInvoice(invoice);
                        item.calculateAmount();
                        item.setUpdatedAt(LocalDateTime.now());

                        if (itemDto.getId() == null || itemDto.getId().isEmpty()) {
                            item.setCreatedAt(LocalDateTime.now());
                        }

                        return item;
                    })
                    .collect(Collectors.toList());

            invoice.getItems().addAll(items);
        }
        invoice.calculateTotals();
        
        // Preserve existing balance fields (they should be managed by payment service)
        // Only recalculate if total changed significantly
        invoice.recalculateBalance();

        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return invoiceMapper.invoiceToInvoiceDto(updatedInvoice);
    }

    @Override
    @Transactional
    public InvoiceDto updateInvoiceStatus(UpdateInvoiceStatusCommand command) {
        Invoice invoice = invoiceRepository.findById(command.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", command.getInvoiceId()));

        // Validate status transition
        validateInvoiceStatusTransition(invoice.getStatus(), command.getStatus());
        Invoice.InvoiceStatus previous = invoice.getStatus();
        invoice.setStatus(command.getStatus());
        invoice.setUpdatedAt(LocalDateTime.now());

        Invoice updatedInvoice = invoiceRepository.save(invoice);

        // Publish domain event for invoice status change
        eventPublisher.publishEvent(new com.invoicingsystem.api.domain.event.InvoiceStatusChangedEvent(
                updatedInvoice.getId(),
                previous,
                updatedInvoice.getStatus(),
                updatedInvoice.getUpdatedAt()
        ));
        return invoiceMapper.invoiceToInvoiceDto(updatedInvoice);
    }

    @Override
    @Transactional
    public void deleteInvoice(String id) {
        if (!invoiceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Invoice", "id", id);
        }

        invoiceRepository.deleteById(id);
    }

    // Helper method to generate a unique invoice number
    private String generateInvoiceNumber() {
        LocalDate now = LocalDate.now();
        String year = now.format(DateTimeFormatter.ofPattern("yyyy"));

        long count = invoiceRepository.count() + 1;
        return String.format("INV-%s-%04d", year, count);
    }

    // Helper method to validate invoice status transitions
    private void validateInvoiceStatusTransition(Invoice.InvoiceStatus currentStatus, Invoice.InvoiceStatus newStatus) {
        // Allow staying in the same status
        if (currentStatus == newStatus) {
            return;
        }

        // Define allowed transitions
        switch (currentStatus) {
            case DRAFT:
                if (newStatus != Invoice.InvoiceStatus.SENT && newStatus != Invoice.InvoiceStatus.CANCELED) {
                    throw new BadRequestException("Cannot transition from DRAFT to " + newStatus);
                }
                break;
                
            case SENT:
                if (newStatus != Invoice.InvoiceStatus.PARTIALLY_PAID && 
                    newStatus != Invoice.InvoiceStatus.PAID && 
                    newStatus != Invoice.InvoiceStatus.OVERDUE && 
                    newStatus != Invoice.InvoiceStatus.CANCELED) {
                    throw new BadRequestException("Cannot transition from SENT to " + newStatus);
                }
                break;
                
            case PARTIALLY_PAID:
                if (newStatus != Invoice.InvoiceStatus.PAID && 
                    newStatus != Invoice.InvoiceStatus.OVERDUE && 
                    newStatus != Invoice.InvoiceStatus.CANCELED) {
                    throw new BadRequestException("Cannot transition from PARTIALLY_PAID to " + newStatus);
                }
                break;
                
            case PAID:
                if (newStatus != Invoice.InvoiceStatus.CANCELED) {
                    throw new BadRequestException("Cannot transition from PAID to " + newStatus);
                }
                break;
                
            case OVERDUE:
                if (newStatus != Invoice.InvoiceStatus.PARTIALLY_PAID && 
                    newStatus != Invoice.InvoiceStatus.PAID && 
                    newStatus != Invoice.InvoiceStatus.CANCELED) {
                    throw new BadRequestException("Cannot transition from OVERDUE to " + newStatus);
                }
                break;
                
            case CANCELED:
                throw new BadRequestException("Cannot transition from CANCELED status");
                
            default:
                throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }
}
