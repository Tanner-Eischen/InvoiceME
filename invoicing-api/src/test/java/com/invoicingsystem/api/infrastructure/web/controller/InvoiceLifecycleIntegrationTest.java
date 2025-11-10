package com.invoicingsystem.api.infrastructure.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoicingsystem.api.application.command.RecordPaymentCommand;
import com.invoicingsystem.api.application.command.UpdateInvoiceStatusCommand;
import com.invoicingsystem.api.application.query.InvoiceDto;
import com.invoicingsystem.api.application.query.PaymentDto;
import com.invoicingsystem.api.domain.model.Client;
import com.invoicingsystem.api.domain.model.Invoice;
import com.invoicingsystem.api.domain.model.Payment;
import com.invoicingsystem.api.domain.repository.ClientRepository;
import com.invoicingsystem.api.domain.repository.InvoiceRepository;
import com.invoicingsystem.api.domain.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class InvoiceLifecycleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    private Client testClient;
    private Invoice testInvoice;

    @BeforeEach
    void setUp() {
        // Setup test client
        testClient = new Client();
        testClient.setName("Test Client");
        testClient.setEmail("test@example.com");
        testClient.setPhone("+1234567890");
        testClient.setAddress("123 Test St, Test City, TC 12345");
        testClient.setCreatedAt(LocalDateTime.now());
        testClient.setUpdatedAt(LocalDateTime.now());
        testClient = clientRepository.save(testClient);

        // Setup test invoice
        testInvoice = new Invoice();
        testInvoice.setNumber("INV-LIFECYCLE-001");
        testInvoice.setClient(testClient);
        testInvoice.setIssueDate(LocalDate.now());
        testInvoice.setDueDate(LocalDate.now().plusDays(30));
        testInvoice.setTotal(new BigDecimal("1000.00"));
        testInvoice.setTaxAmount(new BigDecimal("100.00"));
        testInvoice.setSubtotal(new BigDecimal("900.00"));
        testInvoice.setBalance(new BigDecimal("1000.00"));
        testInvoice.setStatus(Invoice.InvoiceStatus.DRAFT);
        testInvoice.setCreatedAt(LocalDateTime.now());
        testInvoice.setUpdatedAt(LocalDateTime.now());
        testInvoice = invoiceRepository.save(testInvoice);
    }

    @Test
    void invoiceLifecycle_FromDraftToPaid_ShouldCompleteSuccessfully() throws Exception {
        // Step 1: Update invoice status from DRAFT to SENT
        UpdateInvoiceStatusCommand statusCommand = new UpdateInvoiceStatusCommand();
        statusCommand.setInvoiceId(testInvoice.getId());
        statusCommand.setStatus(Invoice.InvoiceStatus.SENT);

        mockMvc.perform(patch("/invoices/{id}/status", testInvoice.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusCommand)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SENT"));

        // Step 2: Record partial payment
        RecordPaymentCommand paymentCommand = new RecordPaymentCommand();
        paymentCommand.setInvoiceId(testInvoice.getId());
        paymentCommand.setAmount(new BigDecimal("400.00"));
        paymentCommand.setMethod(Payment.PaymentMethod.CREDIT_CARD);
        paymentCommand.setStatus(Payment.PaymentStatus.COMPLETED);
        paymentCommand.setReceivedAt(LocalDateTime.now());
        paymentCommand.setReference("PAY-001");

        String paymentJson = mockMvc.perform(post("/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentCommand)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(400.00))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andReturn().getResponse().getContentAsString();

        PaymentDto paymentDto = objectMapper.readValue(paymentJson, PaymentDto.class);

        // Step 3: Verify invoice balance is updated
        String invoiceJson = mockMvc.perform(get("/invoices/{id}", testInvoice.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(600.00))
                .andExpect(jsonPath("$.status").value("SENT"))
                .andReturn().getResponse().getContentAsString();

        InvoiceDto invoiceDto = objectMapper.readValue(invoiceJson, InvoiceDto.class);
        assertEquals(new BigDecimal("600.00"), invoiceDto.getBalance());

        // Step 4: Record second payment to complete payment
        RecordPaymentCommand secondPaymentCommand = new RecordPaymentCommand();
        secondPaymentCommand.setInvoiceId(testInvoice.getId());
        secondPaymentCommand.setAmount(new BigDecimal("600.00"));
        secondPaymentCommand.setMethod(Payment.PaymentMethod.BANK_TRANSFER);
        secondPaymentCommand.setStatus(Payment.PaymentStatus.COMPLETED);
        secondPaymentCommand.setReceivedAt(LocalDateTime.now());
        secondPaymentCommand.setReference("PAY-002");

        mockMvc.perform(post("/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(secondPaymentCommand)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(600.00))
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // Step 5: Verify invoice is marked as PAID
        mockMvc.perform(get("/invoices/{id}", testInvoice.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(0.00))
                .andExpect(jsonPath("$.status").value("PAID"));
    }

    @Test
    void invoiceLifecycle_WithOverpayment_ShouldPreventOverpayment() throws Exception {
        // Step 1: Update invoice status to SENT
        UpdateInvoiceStatusCommand statusCommand = new UpdateInvoiceStatusCommand();
        statusCommand.setInvoiceId(testInvoice.getId());
        statusCommand.setStatus(Invoice.InvoiceStatus.SENT);

        mockMvc.perform(patch("/invoices/{id}/status", testInvoice.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusCommand)))
                .andExpect(status().isOk());

        // Step 2: Try to record payment for more than invoice total
        RecordPaymentCommand paymentCommand = new RecordPaymentCommand();
        paymentCommand.setInvoiceId(testInvoice.getId());
        paymentCommand.setAmount(new BigDecimal("1500.00")); // More than invoice total
        paymentCommand.setMethod(Payment.PaymentMethod.CREDIT_CARD);
        paymentCommand.setStatus(Payment.PaymentStatus.COMPLETED);
        paymentCommand.setReceivedAt(LocalDateTime.now());
        paymentCommand.setReference("PAY-OVER");

        mockMvc.perform(post("/payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentCommand)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Payment amount exceeds invoice balance")));
    }

    @Test
    @Disabled("Temporarily disabled due to incomplete reversal flow")
    void invoiceLifecycle_WithPaymentReversal_ShouldRestoreBalance() throws Exception {
        // Step 1: Update invoice status to SENT
        mockMvc.perform(put("/invoices/{id}/status", testInvoice.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("\"SENT\""))
                .andExpect(status().isOk());
    }

}