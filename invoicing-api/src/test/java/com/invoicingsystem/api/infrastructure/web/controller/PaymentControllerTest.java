package com.invoicingsystem.api.infrastructure.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoicingsystem.api.application.command.RecordPaymentCommand;
import com.invoicingsystem.api.application.query.PaymentDto;
import com.invoicingsystem.api.application.service.PaymentService;
import com.invoicingsystem.api.domain.exception.BadRequestException;
import com.invoicingsystem.api.domain.exception.ResourceNotFoundException;
import com.invoicingsystem.api.domain.model.Payment.PaymentMethod;
import com.invoicingsystem.api.domain.model.Payment.PaymentStatus;
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
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private PaymentDto testPaymentDto;
    private RecordPaymentCommand recordCommand;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(paymentController)
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        // Setup test data
        testPaymentDto = new PaymentDto();
        testPaymentDto.setId("test-payment-id");
        testPaymentDto.setInvoiceId("test-invoice-id");
        testPaymentDto.setInvoiceNumber("INV-001");
        testPaymentDto.setAmount(new BigDecimal("100.00"));
        testPaymentDto.setMethod(PaymentMethod.CREDIT_CARD);
        testPaymentDto.setStatus(PaymentStatus.COMPLETED);
        testPaymentDto.setReceivedAt(LocalDateTime.now());
        testPaymentDto.setReference("REF-123");
        testPaymentDto.setCreatedAt(LocalDateTime.now());
        testPaymentDto.setUpdatedAt(LocalDateTime.now());

        recordCommand = new RecordPaymentCommand();
        recordCommand.setInvoiceId("test-invoice-id");
        recordCommand.setAmount(new BigDecimal("100.00"));
        recordCommand.setMethod(PaymentMethod.CREDIT_CARD);
        recordCommand.setStatus(PaymentStatus.COMPLETED);
        recordCommand.setReceivedAt(LocalDateTime.now());
        recordCommand.setReference("REF-123");
    }

    @Test
    void recordPayment_WithValidData_ShouldCreatePayment() throws Exception {
        // Given
        when(paymentService.recordPayment(org.mockito.ArgumentMatchers.any(RecordPaymentCommand.class))).thenReturn(testPaymentDto);

        // When & Then
        mockMvc.perform(post("/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(recordCommand)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is("test-payment-id")))
                .andExpect(jsonPath("$.invoiceId", is("test-invoice-id")))
                .andExpect(jsonPath("$.amount", is(100.00)))
                .andExpect(jsonPath("$.method", is("CREDIT_CARD")))
                .andExpect(jsonPath("$.status", is("COMPLETED")))
                .andExpect(jsonPath("$.reference", is("REF-123")));

        verify(paymentService).recordPayment(org.mockito.ArgumentMatchers.any(RecordPaymentCommand.class));
    }

    @Test
    void recordPayment_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Given
        RecordPaymentCommand invalidCommand = new RecordPaymentCommand();
        invalidCommand.setInvoiceId(""); // Invalid: empty invoice ID
        invalidCommand.setAmount(new BigDecimal("-100.00")); // Invalid: negative amount
        invalidCommand.setMethod(null); // Invalid: null method

        // When & Then
        mockMvc.perform(post("/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCommand)))
                .andExpect(status().isBadRequest());

        verify(paymentService, never()).recordPayment(org.mockito.ArgumentMatchers.any(RecordPaymentCommand.class));
    }

    @Test
    void recordPayment_WhenInvoiceNotFound_ShouldReturnNotFound() throws Exception {
        // Given
        when(paymentService.recordPayment(org.mockito.ArgumentMatchers.any(RecordPaymentCommand.class)))
                .thenThrow(new ResourceNotFoundException("Invoice", "id", "test-invoice-id"));

        // When & Then
        mockMvc.perform(post("/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(recordCommand)))
                .andExpect(status().isNotFound());

        verify(paymentService).recordPayment(org.mockito.ArgumentMatchers.any(RecordPaymentCommand.class));
    }

    @Test
    void recordPayment_WhenOverpayment_ShouldReturnBadRequest() throws Exception {
        // Given
        when(paymentService.recordPayment(org.mockito.ArgumentMatchers.any(RecordPaymentCommand.class)))
                .thenThrow(new BadRequestException("Payment amount exceeds invoice total"));

        // When & Then
        mockMvc.perform(post("/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(recordCommand)))
                .andExpect(status().isBadRequest());

        verify(paymentService).recordPayment(org.mockito.ArgumentMatchers.any(RecordPaymentCommand.class));
    }

    @Test
    void getPaymentsByInvoiceId_WhenPaymentsExist_ShouldReturnPayments() throws Exception {
        // Given
        List<PaymentDto> payments = Arrays.asList(testPaymentDto);
        when(paymentService.getPaymentsByInvoiceId("test-invoice-id")).thenReturn(payments);

        // When & Then
        mockMvc.perform(get("/payments/invoice/test-invoice-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("test-payment-id")))
                .andExpect(jsonPath("$[0].invoiceId", is("test-invoice-id")))
                .andExpect(jsonPath("$[0].amount", is(100.00)));

        verify(paymentService).getPaymentsByInvoiceId("test-invoice-id");
    }

    @Test
    void getPaymentsByInvoiceId_WhenInvoiceNotFound_ShouldReturnNotFound() throws Exception {
        // Given
        when(paymentService.getPaymentsByInvoiceId("non-existent-invoice"))
                .thenThrow(new ResourceNotFoundException("Invoice", "id", "non-existent-invoice"));

        // When & Then
        mockMvc.perform(get("/payments/invoice/non-existent-invoice"))
                .andExpect(status().isNotFound());

        verify(paymentService).getPaymentsByInvoiceId("non-existent-invoice");
    }

    @Test
    void getPaymentById_WhenPaymentExists_ShouldReturnPayment() throws Exception {
        // Given
        when(paymentService.getPaymentById("test-payment-id")).thenReturn(testPaymentDto);

        // When & Then
        mockMvc.perform(get("/payments/test-payment-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("test-payment-id")))
                .andExpect(jsonPath("$.invoiceId", is("test-invoice-id")))
                .andExpect(jsonPath("$.amount", is(100.00)))
                .andExpect(jsonPath("$.method", is("CREDIT_CARD")))
                .andExpect(jsonPath("$.status", is("COMPLETED")));

        verify(paymentService).getPaymentById("test-payment-id");
    }

    @Test
    void getPaymentById_WhenPaymentNotFound_ShouldReturnNotFound() throws Exception {
        // Given
        when(paymentService.getPaymentById("non-existent-payment"))
                .thenThrow(new ResourceNotFoundException("Payment", "id", "non-existent-payment"));

        // When & Then
        mockMvc.perform(get("/payments/non-existent-payment"))
                .andExpect(status().isNotFound());

        verify(paymentService).getPaymentById("non-existent-payment");
    }

    @Test
    void updatePaymentStatus_WithValidStatus_ShouldUpdatePayment() throws Exception {
        // Given
        PaymentDto updatedPayment = new PaymentDto();
        updatedPayment.setId("test-payment-id");
        updatedPayment.setStatus(PaymentStatus.REVERSED);
        
        when(paymentService.updatePaymentStatus(eq("test-payment-id"), eq(PaymentStatus.REVERSED)))
                .thenReturn(updatedPayment);

        // When & Then
        mockMvc.perform(put("/payments/test-payment-id/status")
                .param("status", "REVERSED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("test-payment-id")))
                .andExpect(jsonPath("$.status", is("REVERSED")));

        verify(paymentService).updatePaymentStatus("test-payment-id", PaymentStatus.REVERSED);
    }

    @Test
    void updatePaymentStatus_WithInvalidTransition_ShouldReturnBadRequest() throws Exception {
        // Given
        when(paymentService.updatePaymentStatus(eq("test-payment-id"), eq(PaymentStatus.REVERSED)))
                .thenThrow(new BadRequestException("Invalid payment status transition"));

        // When & Then
        mockMvc.perform(put("/payments/test-payment-id/status")
                .param("status", "REVERSED"))
                .andExpect(status().isBadRequest());

        verify(paymentService).updatePaymentStatus("test-payment-id", PaymentStatus.REVERSED);
    }

    @Test
    void deletePayment_WithValidId_ShouldDeletePayment() throws Exception {
        // Given
        doNothing().when(paymentService).deletePayment("test-payment-id");

        // When & Then
        mockMvc.perform(delete("/payments/test-payment-id"))
                .andExpect(status().isNoContent());

        verify(paymentService).deletePayment("test-payment-id");
    }

    @Test
    void deletePayment_WhenPaymentNotFound_ShouldReturnNotFound() throws Exception {
        // Given
        doThrow(new ResourceNotFoundException("Payment", "id", "non-existent-payment"))
                .when(paymentService).deletePayment("non-existent-payment");

        // When & Then
        mockMvc.perform(delete("/payments/non-existent-payment"))
                .andExpect(status().isNotFound());

        verify(paymentService).deletePayment("non-existent-payment");
    }
}