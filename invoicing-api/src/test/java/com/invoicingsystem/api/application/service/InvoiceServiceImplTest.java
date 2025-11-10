package com.invoicingsystem.api.application.service;

import com.invoicingsystem.api.application.command.CreateInvoiceCommand;
import com.invoicingsystem.api.application.command.CreateInvoiceCommand.InvoiceItemDto;
import com.invoicingsystem.api.application.command.UpdateInvoiceCommand;
import com.invoicingsystem.api.application.query.InvoiceDto;
import com.invoicingsystem.api.application.mapper.InvoiceMapper;
import com.invoicingsystem.api.application.service.impl.InvoiceServiceImpl;
import com.invoicingsystem.api.application.command.UpdateInvoiceStatusCommand;
import com.invoicingsystem.api.domain.exception.BadRequestException;
import com.invoicingsystem.api.domain.exception.ResourceNotFoundException;
import com.invoicingsystem.api.domain.model.Client;
import com.invoicingsystem.api.domain.model.Invoice;
import com.invoicingsystem.api.domain.model.InvoiceItem;
import com.invoicingsystem.api.domain.model.Invoice.InvoiceStatus;
import com.invoicingsystem.api.domain.repository.ClientRepository;
import com.invoicingsystem.api.domain.repository.InvoiceRepository;
import com.invoicingsystem.api.domain.repository.UserRepository;
import com.invoicingsystem.api.domain.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceImplTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private InvoiceMapper invoiceMapper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private InvoiceServiceImpl invoiceService;

    private Invoice testInvoice;
    private InvoiceDto testInvoiceDto;
    private Client testClient;
    private CreateInvoiceCommand createCommand;

    @BeforeEach
    void setUp() {
        // Setup test client
        testClient = new Client();
        testClient.setId("test-client-id");
        testClient.setName("Test Client");
        testClient.setEmail("test@example.com");

        // Setup test invoice
        testInvoice = new Invoice();
        testInvoice.setId("test-invoice-id");
        testInvoice.setNumber("INV-001");
        testInvoice.setClient(testClient);
        testInvoice.setIssueDate(LocalDate.now());
        testInvoice.setDueDate(LocalDate.now().plusDays(30));
        testInvoice.setStatus(InvoiceStatus.DRAFT);
        testInvoice.setTaxRate(new BigDecimal("10"));
        testInvoice.setNotes("Test invoice");
        testInvoice.setCreatedAt(LocalDateTime.now());
        testInvoice.setUpdatedAt(LocalDateTime.now());

        // Create invoice item
        InvoiceItem item = new InvoiceItem();
        item.setId("test-item-id");
        item.setDescription("Test Item");
        item.setQuantity(2);
        item.setUnitPrice(new BigDecimal("500.00"));
        item.calculateAmount();
        item.setInvoice(testInvoice);
        testInvoice.setItems(new java.util.ArrayList<>(Arrays.asList(item)));

        // Setup DTO
        testInvoiceDto = new InvoiceDto();
        testInvoiceDto.setId("test-invoice-id");
        testInvoiceDto.setNumber("INV-001");
        testInvoiceDto.setClientId("test-client-id");
        testInvoiceDto.setClientName("Test Client");
        testInvoiceDto.setIssueDate(LocalDate.now());
        testInvoiceDto.setDueDate(LocalDate.now().plusDays(30));
        testInvoiceDto.setStatus(InvoiceStatus.DRAFT);
        testInvoiceDto.setSubtotal(new BigDecimal("1000.00"));
        testInvoiceDto.setTaxRate(new BigDecimal("10"));
        testInvoiceDto.setTaxAmount(new BigDecimal("100.00"));
        testInvoiceDto.setTotal(new BigDecimal("1100.00"));
        testInvoiceDto.setBalance(new BigDecimal("1100.00"));
        testInvoiceDto.setNotes("Test invoice");
        testInvoiceDto.setCreatedAt(LocalDateTime.now());
        testInvoiceDto.setUpdatedAt(LocalDateTime.now());

        // Setup command
        createCommand = new CreateInvoiceCommand();
        createCommand.setClientId("test-client-id");
        createCommand.setIssueDate(LocalDate.now());
        createCommand.setDueDate(LocalDate.now().plusDays(30));
        createCommand.setTaxRate(new BigDecimal("10"));
        createCommand.setNotes("Test invoice");
        
        InvoiceItemDto itemCommand = new InvoiceItemDto();
        itemCommand.setDescription("Test Item");
        itemCommand.setQuantity(2);
        itemCommand.setUnitPrice(new BigDecimal("500.00"));
        createCommand.setItems(Arrays.asList(itemCommand));
    }

    @Test
    void getAllInvoices_ShouldReturnAllInvoices() {
        // Given
        List<Invoice> invoices = Arrays.asList(testInvoice);
        List<InvoiceDto> expectedDtos = Arrays.asList(testInvoiceDto);

        when(invoiceRepository.findAll()).thenReturn(invoices);
        when(invoiceMapper.invoicesToInvoiceDtos(invoices)).thenReturn(expectedDtos);

        // When
        List<InvoiceDto> result = invoiceService.getAllInvoices();

        // Then
        assertEquals(expectedDtos, result);
        verify(invoiceRepository).findAll();
        verify(invoiceMapper).invoicesToInvoiceDtos(invoices);
    }

    @Test
    void getInvoiceById_WhenInvoiceExists_ShouldReturnInvoice() {
        // Given
        when(invoiceRepository.findById("test-invoice-id")).thenReturn(Optional.of(testInvoice));
        when(invoiceMapper.invoiceToInvoiceDto(testInvoice)).thenReturn(testInvoiceDto);

        // When
        InvoiceDto result = invoiceService.getInvoiceById("test-invoice-id");

        // Then
        assertEquals(testInvoiceDto, result);
        verify(invoiceRepository).findById("test-invoice-id");
        verify(invoiceMapper).invoiceToInvoiceDto(testInvoice);
    }

    @Test
    void getInvoiceById_WhenInvoiceDoesNotExist_ShouldThrowException() {
        // Given
        when(invoiceRepository.findById("non-existent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> invoiceService.getInvoiceById("non-existent"));
        verify(invoiceRepository).findById("non-existent");
        verifyNoInteractions(invoiceMapper);
    }

    @Test
    void createInvoice_WithValidData_ShouldCreateInvoice() {
        // Given
        when(clientRepository.findById("test-client-id")).thenReturn(Optional.of(testClient));
        when(invoiceMapper.createInvoiceCommandToInvoice(createCommand)).thenReturn(testInvoice);
        when(invoiceMapper.invoiceItemDtoToInvoiceItem(any(InvoiceItemDto.class))).thenAnswer(inv -> {
            InvoiceItem item = new InvoiceItem();
            item.setDescription("Mapped");
            item.setQuantity(1);
            item.setUnitPrice(new BigDecimal("1.00"));
            return item;
        });
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(testInvoice);
        when(invoiceMapper.invoiceToInvoiceDto(testInvoice)).thenReturn(testInvoiceDto);
        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(new User()));

        // When
        InvoiceDto result = invoiceService.createInvoice(createCommand, "test-user-id");

        // Then
        assertEquals(testInvoiceDto, result);
        verify(clientRepository).findById("test-client-id");
        verify(invoiceMapper).createInvoiceCommandToInvoice(createCommand);
        verify(invoiceRepository).save(any(Invoice.class));
        verify(invoiceMapper).invoiceToInvoiceDto(testInvoice);
        verify(userRepository).findById("test-user-id");
    }

    @Test
    void createInvoice_WhenClientNotFound_ShouldThrowException() {
        // Given
        when(clientRepository.findById("test-client-id")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> invoiceService.createInvoice(createCommand, "test-user-id"));
        verify(clientRepository).findById("test-client-id");
        verifyNoInteractions(invoiceMapper, invoiceRepository);
    }

    @Test
    void createInvoice_WithDueDateBeforeIssueDate_ShouldThrowException() {
        // Given
        createCommand.setDueDate(LocalDate.now().minusDays(1)); // Due date before issue date
        
        when(clientRepository.findById("test-client-id")).thenReturn(Optional.of(testClient));
        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(new User()));

        // When & Then
        assertThrows(BadRequestException.class, () -> invoiceService.createInvoice(createCommand, "test-user-id"));
        verify(clientRepository).findById("test-client-id");
        verifyNoInteractions(invoiceMapper, invoiceRepository);
    }

    @Test
    void updateInvoice_WithValidData_ShouldUpdateInvoice() {
        // Given
        UpdateInvoiceCommand updateCommand = new UpdateInvoiceCommand();
        updateCommand.setId("test-invoice-id");
        updateCommand.setDueDate(LocalDate.now().plusDays(45));
        updateCommand.setNotes("Updated notes");

        when(invoiceRepository.findById("test-invoice-id")).thenReturn(Optional.of(testInvoice));
        when(invoiceRepository.save(testInvoice)).thenReturn(testInvoice);
        when(invoiceMapper.invoiceToInvoiceDto(testInvoice)).thenReturn(testInvoiceDto);

        // When
        InvoiceDto result = invoiceService.updateInvoice(updateCommand);

        // Then
        assertEquals(testInvoiceDto, result);
        verify(invoiceRepository).findById("test-invoice-id");
        verify(invoiceMapper).updateInvoiceFromCommand(updateCommand, testInvoice);
        verify(invoiceRepository).save(testInvoice);
        verify(invoiceMapper).invoiceToInvoiceDto(testInvoice);
    }

    @Test
    void updateInvoice_WhenInvoiceNotFound_ShouldThrowException() {
        // Given
        UpdateInvoiceCommand updateCommand = new UpdateInvoiceCommand();
        updateCommand.setId("non-existent");

        when(invoiceRepository.findById("non-existent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> invoiceService.updateInvoice(updateCommand));
        verify(invoiceRepository).findById("non-existent");
        verifyNoMoreInteractions(invoiceRepository, invoiceMapper);
    }

    @Test
    void updateInvoiceStatus_WithValidTransition_ShouldUpdateStatus() {
        // Given
        when(invoiceRepository.findById("test-invoice-id")).thenReturn(Optional.of(testInvoice));
        when(invoiceRepository.save(testInvoice)).thenReturn(testInvoice);
        
        InvoiceDto updatedDto = new InvoiceDto();
        updatedDto.setId("test-invoice-id");
        updatedDto.setStatus(InvoiceStatus.SENT);
        when(invoiceMapper.invoiceToInvoiceDto(testInvoice)).thenReturn(updatedDto);

        // When
        UpdateInvoiceStatusCommand statusCommand = new UpdateInvoiceStatusCommand();
        statusCommand.setInvoiceId("test-invoice-id");
        statusCommand.setStatus(InvoiceStatus.SENT);
        InvoiceDto result = invoiceService.updateInvoiceStatus(statusCommand);

        // Then
        assertEquals(InvoiceStatus.SENT, result.getStatus());
        verify(invoiceRepository).findById("test-invoice-id");
        verify(invoiceRepository).save(testInvoice);
        verify(invoiceMapper).invoiceToInvoiceDto(testInvoice);
    }

    @Test
    void updateInvoiceStatus_WithInvalidTransition_ShouldThrowException() {
        // Given
        testInvoice.setStatus(InvoiceStatus.PAID); // Set to PAID
        when(invoiceRepository.findById("test-invoice-id")).thenReturn(Optional.of(testInvoice));

        // When & Then
        UpdateInvoiceStatusCommand statusCommand = new UpdateInvoiceStatusCommand();
        statusCommand.setInvoiceId("test-invoice-id");
        statusCommand.setStatus(InvoiceStatus.SENT);
        assertThrows(BadRequestException.class, () ->
                invoiceService.updateInvoiceStatus(statusCommand));
        verify(invoiceRepository).findById("test-invoice-id");
        verifyNoMoreInteractions(invoiceRepository);
    }

    @Test
    void deleteInvoice_WhenInvoiceExists_ShouldDeleteInvoice() {
        // Given
        when(invoiceRepository.existsById("test-invoice-id")).thenReturn(true);

        // When
        invoiceService.deleteInvoice("test-invoice-id");

        // Then
        verify(invoiceRepository).existsById("test-invoice-id");
        verify(invoiceRepository).deleteById("test-invoice-id");
    }

    @Test
    void deleteInvoice_WhenInvoiceNotFound_ShouldThrowException() {
        // Given
        when(invoiceRepository.existsById("non-existent")).thenReturn(false);

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> invoiceService.deleteInvoice("non-existent"));
        verify(invoiceRepository).existsById("non-existent");
        verifyNoMoreInteractions(invoiceRepository);
    }

    @Test
    void getInvoicesByClientId_ShouldReturnClientInvoices() {
        // Given
        List<Invoice> invoices = Arrays.asList(testInvoice);
        List<InvoiceDto> expectedDtos = Arrays.asList(testInvoiceDto);

        when(clientRepository.existsById("test-client-id")).thenReturn(true);
        when(invoiceRepository.findByClientId("test-client-id")).thenReturn(invoices);
        when(invoiceMapper.invoicesToInvoiceDtos(invoices)).thenReturn(expectedDtos);

        // When
        List<InvoiceDto> result = invoiceService.getInvoicesByClientId("test-client-id");

        // Then
        assertEquals(expectedDtos, result);
        verify(invoiceRepository).findByClientId("test-client-id");
        verify(invoiceMapper).invoicesToInvoiceDtos(invoices);
    }

    @Test
    void getInvoicesByStatus_ShouldReturnFilteredInvoices() {
        // Given
        List<Invoice> invoices = Arrays.asList(testInvoice);
        List<InvoiceDto> expectedDtos = Arrays.asList(testInvoiceDto);

        when(invoiceRepository.findByStatus(InvoiceStatus.DRAFT)).thenReturn(invoices);
        when(invoiceMapper.invoicesToInvoiceDtos(invoices)).thenReturn(expectedDtos);

        // When
        List<InvoiceDto> result = invoiceService.getInvoicesByStatus(InvoiceStatus.DRAFT);

        // Then
        assertEquals(expectedDtos, result);
        verify(invoiceRepository).findByStatus(InvoiceStatus.DRAFT);
        verify(invoiceMapper).invoicesToInvoiceDtos(invoices);
    }

    @Test
    void getOverdueInvoices_ShouldReturnOverdueInvoices() {
        // Given
        List<Invoice> invoices = Arrays.asList(testInvoice);
        List<InvoiceDto> expectedDtos = Arrays.asList(testInvoiceDto);

        when(invoiceRepository.findOverdueInvoices(any(LocalDate.class))).thenReturn(invoices);
        when(invoiceMapper.invoicesToInvoiceDtos(invoices)).thenReturn(expectedDtos);

        // When
        List<InvoiceDto> result = invoiceService.getOverdueInvoices();

        // Then
        assertEquals(expectedDtos, result);
        verify(invoiceRepository).findOverdueInvoices(any(LocalDate.class));
        verify(invoiceMapper).invoicesToInvoiceDtos(invoices);
    }

    

    @Test
    void getInvoiceByNumber_WhenInvoiceExists_ShouldReturnInvoice() {
        // Given
        when(invoiceRepository.findByNumber("INV-001")).thenReturn(Optional.of(testInvoice));
        when(invoiceMapper.invoiceToInvoiceDto(testInvoice)).thenReturn(testInvoiceDto);

        // When
        InvoiceDto result = invoiceService.getInvoiceByNumber("INV-001");

        // Then
        assertEquals(testInvoiceDto, result);
        verify(invoiceRepository).findByNumber("INV-001");
        verify(invoiceMapper).invoiceToInvoiceDto(testInvoice);
    }

    @Test
    void getInvoiceByNumber_WhenInvoiceNotFound_ShouldThrowException() {
        // Given
        when(invoiceRepository.findByNumber("NON-EXISTENT")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> invoiceService.getInvoiceByNumber("NON-EXISTENT"));
        verify(invoiceRepository).findByNumber("NON-EXISTENT");
        verifyNoInteractions(invoiceMapper);

    }

    @Test
    void updateInvoiceStatus_WithValidTransition_ShouldUpdateStatus_UsingCommand() {
        // Given
        when(invoiceRepository.findById("test-invoice-id")).thenReturn(Optional.of(testInvoice));
        when(invoiceRepository.save(testInvoice)).thenReturn(testInvoice);

        InvoiceDto updatedDto = new InvoiceDto();
        updatedDto.setId("test-invoice-id");
        updatedDto.setStatus(InvoiceStatus.SENT);
        when(invoiceMapper.invoiceToInvoiceDto(testInvoice)).thenReturn(updatedDto);

        UpdateInvoiceStatusCommand statusCommand = new UpdateInvoiceStatusCommand();
        statusCommand.setInvoiceId("test-invoice-id");
        statusCommand.setStatus(InvoiceStatus.SENT);

        // When
        InvoiceDto result = invoiceService.updateInvoiceStatus(statusCommand);

        // Then
        assertEquals(InvoiceStatus.SENT, result.getStatus());
        verify(invoiceRepository).findById("test-invoice-id");
        verify(invoiceRepository).save(testInvoice);
        verify(invoiceMapper).invoiceToInvoiceDto(testInvoice);
    }

    @Test
    void updateInvoiceStatus_WithInvalidTransition_ShouldThrowException_UsingCommand() {
        // Given
        testInvoice.setStatus(InvoiceStatus.PAID); // Set to PAID
        when(invoiceRepository.findById("test-invoice-id")).thenReturn(Optional.of(testInvoice));

        UpdateInvoiceStatusCommand statusCommand = new UpdateInvoiceStatusCommand();
        statusCommand.setInvoiceId("test-invoice-id");
        statusCommand.setStatus(InvoiceStatus.SENT);

        // When & Then
        assertThrows(BadRequestException.class, () ->
                invoiceService.updateInvoiceStatus(statusCommand));
        verify(invoiceRepository).findById("test-invoice-id");
        verifyNoMoreInteractions(invoiceRepository);
    }
}