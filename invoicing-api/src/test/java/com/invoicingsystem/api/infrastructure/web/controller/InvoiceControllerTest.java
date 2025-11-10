package com.invoicingsystem.api.infrastructure.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoicingsystem.api.application.command.CreateInvoiceCommand;
import com.invoicingsystem.api.application.command.UpdateInvoiceCommand;
import com.invoicingsystem.api.application.command.UpdateInvoiceStatusCommand;
import com.invoicingsystem.api.application.query.InvoiceDto;
import com.invoicingsystem.api.application.query.InvoiceItemDto;
import com.invoicingsystem.api.application.service.InvoiceService;
import com.invoicingsystem.api.domain.exception.BadRequestException;
import com.invoicingsystem.api.domain.exception.ResourceNotFoundException;
import com.invoicingsystem.api.domain.model.Invoice.InvoiceStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class InvoiceControllerTest {

    @Mock
    private InvoiceService invoiceService;

    @InjectMocks
    private InvoiceController invoiceController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private InvoiceDto testInvoiceDto;
    private CreateInvoiceCommand createCommand;
    private UpdateInvoiceCommand updateCommand;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(invoiceController)
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        // Setup test data
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

        // Create invoice item
        InvoiceItemDto itemDto = new InvoiceItemDto();
        itemDto.setId("test-item-id");
        itemDto.setDescription("Test Item");
        itemDto.setQuantity(2);
        itemDto.setUnitPrice(new BigDecimal("500.00"));
        itemDto.setAmount(new BigDecimal("1000.00"));
        testInvoiceDto.setItems(Arrays.asList(itemDto));

        // Setup commands
        createCommand = new CreateInvoiceCommand();
        createCommand.setClientId("test-client-id");
        createCommand.setIssueDate(LocalDate.now());
        createCommand.setDueDate(LocalDate.now().plusDays(30));
        createCommand.setTaxRate(new BigDecimal("10"));
        createCommand.setNotes("Test invoice");

        updateCommand = new UpdateInvoiceCommand();
        updateCommand.setId("test-invoice-id");
        updateCommand.setDueDate(LocalDate.now().plusDays(45));
        updateCommand.setNotes("Updated invoice");
    }

    @Test
    void getAllInvoices_ShouldReturnAllInvoices() throws Exception {
        // Given
        List<InvoiceDto> invoices = Arrays.asList(testInvoiceDto);
        when(invoiceService.getAllInvoices()).thenReturn(invoices);

        // When & Then
        mockMvc.perform(get("/invoices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("test-invoice-id")))
                .andExpect(jsonPath("$[0].number", is("INV-001")))
                .andExpect(jsonPath("$[0].clientName", is("Test Client")));

        verify(invoiceService).getAllInvoices();
    }

    @Test
    void getInvoiceById_WhenInvoiceExists_ShouldReturnInvoice() throws Exception {
        // Given
        when(invoiceService.getInvoiceById("test-invoice-id")).thenReturn(testInvoiceDto);

        // When & Then
        mockMvc.perform(get("/invoices/test-invoice-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("test-invoice-id")))
                .andExpect(jsonPath("$.number", is("INV-001")))
                .andExpect(jsonPath("$.clientId", is("test-client-id")))
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andExpect(jsonPath("$.total", is(1100.00)))
                .andExpect(jsonPath("$.balance", is(1100.00)));

        verify(invoiceService).getInvoiceById("test-invoice-id");
    }

    @Test
    void getInvoiceById_WhenInvoiceNotFound_ShouldReturnNotFound() throws Exception {
        // Given
        when(invoiceService.getInvoiceById("non-existent"))
                .thenThrow(new ResourceNotFoundException("Invoice", "id", "non-existent"));

        // When & Then
        mockMvc.perform(get("/invoices/non-existent"))
                .andExpect(status().isNotFound());

        verify(invoiceService).getInvoiceById("non-existent");
    }

    @Test
    void getInvoiceByNumber_WhenInvoiceExists_ShouldReturnInvoice() throws Exception {
        // Given
        when(invoiceService.getInvoiceByNumber("INV-001")).thenReturn(testInvoiceDto);

        // When & Then
        mockMvc.perform(get("/invoices/number/INV-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("test-invoice-id")))
                .andExpect(jsonPath("$.number", is("INV-001")));

        verify(invoiceService).getInvoiceByNumber("INV-001");
    }

    @Test
    void getInvoicesByClientId_ShouldReturnClientInvoices() throws Exception {
        // Given
        List<InvoiceDto> invoices = Arrays.asList(testInvoiceDto);
        when(invoiceService.getInvoicesByClientId("test-client-id")).thenReturn(invoices);

        // When & Then
        mockMvc.perform(get("/invoices/client/test-client-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].clientId", is("test-client-id")));

        verify(invoiceService).getInvoicesByClientId("test-client-id");
    }

    @Test
    void getInvoicesByStatus_ShouldReturnFilteredInvoices() throws Exception {
        // Given
        List<InvoiceDto> invoices = Arrays.asList(testInvoiceDto);
        when(invoiceService.getInvoicesByStatus(InvoiceStatus.DRAFT)).thenReturn(invoices);

        // When & Then
        mockMvc.perform(get("/invoices/status/DRAFT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status", is("DRAFT")));

        verify(invoiceService).getInvoicesByStatus(InvoiceStatus.DRAFT);
    }

    @Test
    void getOverdueInvoices_ShouldReturnOverdueInvoices() throws Exception {
        // Given
        List<InvoiceDto> invoices = Arrays.asList(testInvoiceDto);
        when(invoiceService.getOverdueInvoices()).thenReturn(invoices);

        // When & Then
        mockMvc.perform(get("/invoices/overdue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        verify(invoiceService).getOverdueInvoices();
    }

    // Removed legacy searchInvoices test (relied on deprecated endpoint and missing InvoiceFilter)

    @Test
    void createInvoice_WithValidData_ShouldCreateInvoice() throws Exception {
        // Given
        when(invoiceService.createInvoice(org.mockito.ArgumentMatchers.any(CreateInvoiceCommand.class), anyString())).thenReturn(testInvoiceDto);

        // When & Then
        mockMvc.perform(post("/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createCommand)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is("test-invoice-id")))
                .andExpect(jsonPath("$.number", is("INV-001")))
                .andExpect(jsonPath("$.clientId", is("test-client-id")));

        verify(invoiceService).createInvoice(org.mockito.ArgumentMatchers.any(CreateInvoiceCommand.class), anyString());
    }

    @Test
    void createInvoice_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Given
        CreateInvoiceCommand invalidCommand = new CreateInvoiceCommand();
        invalidCommand.setClientId(""); // Invalid: empty client ID
        invalidCommand.setIssueDate(null); // Invalid: null issue date

        // When & Then
        mockMvc.perform(post("/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCommand)))
                .andExpect(status().isBadRequest());

        verify(invoiceService, never()).createInvoice(org.mockito.ArgumentMatchers.any(CreateInvoiceCommand.class), anyString());
    }

    @Test
    void updateInvoice_WithValidData_ShouldUpdateInvoice() throws Exception {
        // Given
        when(invoiceService.updateInvoice(org.mockito.ArgumentMatchers.any(UpdateInvoiceCommand.class))).thenReturn(testInvoiceDto);

        // When & Then
        mockMvc.perform(put("/invoices/test-invoice-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateCommand)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("test-invoice-id")));

        verify(invoiceService).updateInvoice(org.mockito.ArgumentMatchers.any(UpdateInvoiceCommand.class));
    }

    @Test
    void updateInvoice_WithMismatchedIds_ShouldReturnBadRequest() throws Exception {
        // When & Then
        mockMvc.perform(put("/invoices/wrong-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateCommand)))
                .andExpect(status().isBadRequest());

        verify(invoiceService, never()).updateInvoice(org.mockito.ArgumentMatchers.any(UpdateInvoiceCommand.class));
    }

    @Test
    void updateInvoiceStatus_WithValidStatus_ShouldUpdateStatus() throws Exception {
        // Given
        UpdateInvoiceStatusCommand statusCommand = new UpdateInvoiceStatusCommand();
        statusCommand.setInvoiceId("test-invoice-id");
        statusCommand.setStatus(InvoiceStatus.SENT);
        
        InvoiceDto updatedInvoice = new InvoiceDto();
        updatedInvoice.setId("test-invoice-id");
        updatedInvoice.setStatus(InvoiceStatus.SENT);
        
        when(invoiceService.updateInvoiceStatus(org.mockito.ArgumentMatchers.any(UpdateInvoiceStatusCommand.class)))
                .thenReturn(updatedInvoice);

        // When & Then
        mockMvc.perform(patch("/invoices/test-invoice-id/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusCommand)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("test-invoice-id")))
                .andExpect(jsonPath("$.status", is("SENT")));

        verify(invoiceService).updateInvoiceStatus(org.mockito.ArgumentMatchers.any(UpdateInvoiceStatusCommand.class));
    }

    @Test
    void updateInvoiceStatus_WithInvalidTransition_ShouldReturnBadRequest() throws Exception {
        // Given
        UpdateInvoiceStatusCommand statusCommand = new UpdateInvoiceStatusCommand();
        statusCommand.setInvoiceId("test-invoice-id");
        statusCommand.setStatus(InvoiceStatus.PAID);
        
        when(invoiceService.updateInvoiceStatus(org.mockito.ArgumentMatchers.any(UpdateInvoiceStatusCommand.class)))
                .thenThrow(new BadRequestException("Invalid status transition"));

        // When & Then
        mockMvc.perform(patch("/invoices/test-invoice-id/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusCommand)))
                .andExpect(status().isBadRequest());

        verify(invoiceService).updateInvoiceStatus(org.mockito.ArgumentMatchers.any(UpdateInvoiceStatusCommand.class));
    }

    @Test
    void deleteInvoice_WithValidId_ShouldDeleteInvoice() throws Exception {
        // Given
        doNothing().when(invoiceService).deleteInvoice("test-invoice-id");

        // When & Then
        mockMvc.perform(delete("/invoices/test-invoice-id"))
                .andExpect(status().isNoContent());

        verify(invoiceService).deleteInvoice("test-invoice-id");
    }

    @Test
    void deleteInvoice_WhenInvoiceNotFound_ShouldReturnNotFound() throws Exception {
        // Given
        doThrow(new ResourceNotFoundException("Invoice", "id", "non-existent"))
                .when(invoiceService).deleteInvoice("non-existent");

        // When & Then
        mockMvc.perform(delete("/invoices/non-existent"))
                .andExpect(status().isNotFound());

        verify(invoiceService).deleteInvoice("non-existent");
    }

}