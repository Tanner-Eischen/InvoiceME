package com.invoicingsystem.api.infrastructure.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoicingsystem.api.application.command.CreateInvoiceCommand;
import com.invoicingsystem.api.application.command.RecordPaymentCommand;
import com.invoicingsystem.api.application.command.UpdateInvoiceStatusCommand;
import com.invoicingsystem.api.application.command.CreateInvoiceCommand.InvoiceItemDto;
import com.invoicingsystem.api.application.query.InvoiceDto;
import com.invoicingsystem.api.application.query.PaymentDto;
import com.invoicingsystem.api.domain.model.Invoice;
import com.invoicingsystem.api.domain.model.Payment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class InvoiceBalanceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String createdInvoiceId;
    private String createdPaymentId;

    @BeforeEach
    void setUp() throws Exception {
        // Create a client first
        String clientId = createTestClient();
        
        // Create an invoice with known total
        CreateInvoiceCommand invoiceCommand = CreateInvoiceCommand.builder()
                .clientId(clientId)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .status("DRAFT")
                .items(Arrays.asList(
                        InvoiceItemDto.builder()
                                .description("Test Item 1")
                                .quantity(2)
                                .unitPrice(new BigDecimal("100.00"))
                                .build(),
                        InvoiceItemDto.builder()
                                .description("Test Item 2")
                                .quantity(1)
                                .unitPrice(new BigDecimal("50.00"))
                                .build()
                ))
                .build();

        String invoiceResponse = mockMvc.perform(post("/invoices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invoiceCommand))
                        .header("X-User-Id", "test-user"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value("250.00"))
                .andExpect(jsonPath("$.amountPaid").value("0.00"))
                .andExpect(jsonPath("$.balance").value("250.00"))
                .andReturn().getResponse().getContentAsString();

        InvoiceDto invoiceDto = objectMapper.readValue(invoiceResponse, InvoiceDto.class);
        createdInvoiceId = invoiceDto.getId();
    }

    @Test
    void testInvoiceInitialBalanceCalculation() throws Exception {
        // Verify initial balance calculation
        mockMvc.perform(get("/invoices/{id}", createdInvoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value("250.00"))
                .andExpect(jsonPath("$.amountPaid").value("0.00"))
                .andExpect(jsonPath("$.balance").value("250.00"));
    }

    @Test
    void testPaymentReducesInvoiceBalance() throws Exception {
        // Record a payment of $100
        RecordPaymentCommand paymentCommand = RecordPaymentCommand.builder()
                .invoiceId(createdInvoiceId)
                .amount(new BigDecimal("100.00"))
                .method(Payment.PaymentMethod.BANK_TRANSFER)
                .reference("TEST-PAYMENT-001")
                .build();

        String paymentResponse = mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentCommand)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value("100.00"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString();

        PaymentDto paymentDto = objectMapper.readValue(paymentResponse, PaymentDto.class);
        createdPaymentId = paymentDto.getId();

        // Verify balance hasn't changed yet (payment is PENDING)
        mockMvc.perform(get("/invoices/{id}", createdInvoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amountPaid").value("0.00"))
                .andExpect(jsonPath("$.balance").value("250.00"));

        // Update payment status to COMPLETED
        mockMvc.perform(put("/payments/{id}/status", createdPaymentId)
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // Verify balance is now reduced
        mockMvc.perform(get("/invoices/{id}", createdInvoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amountPaid").value("100.00"))
                .andExpect(jsonPath("$.balance").value("150.00"));
    }

    @Test
    void testMultiplePaymentsReduceBalanceCorrectly() throws Exception {
        // Record first payment of $100
        RecordPaymentCommand payment1 = RecordPaymentCommand.builder()
                .invoiceId(createdInvoiceId)
                .amount(new BigDecimal("100.00"))
                .method(Payment.PaymentMethod.BANK_TRANSFER)
                .reference("TEST-PAYMENT-001")
                .build();

        String payment1Response = mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payment1)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        PaymentDto payment1Dto = objectMapper.readValue(payment1Response, PaymentDto.class);

        // Update first payment status to COMPLETED
        mockMvc.perform(put("/payments/{id}/status", payment1Dto.getId())
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk());

        // Record second payment of $75
        RecordPaymentCommand payment2 = RecordPaymentCommand.builder()
                .invoiceId(createdInvoiceId)
                .amount(new BigDecimal("75.00"))
                .method(Payment.PaymentMethod.CREDIT_CARD)
                .reference("TEST-PAYMENT-002")
                .build();

        String payment2Response = mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payment2)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        PaymentDto payment2Dto = objectMapper.readValue(payment2Response, PaymentDto.class);

        // Update second payment status to COMPLETED
        mockMvc.perform(put("/payments/{id}/status", payment2Dto.getId())
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk());

        // Verify total payments and remaining balance
        mockMvc.perform(get("/invoices/{id}", createdInvoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amountPaid").value("175.00"))
                .andExpect(jsonPath("$.balance").value("75.00"));
    }

    @Test
    void testOverpaymentPrevention() throws Exception {
        // Record a payment of $200 (should succeed)
        RecordPaymentCommand paymentCommand = RecordPaymentCommand.builder()
                .invoiceId(createdInvoiceId)
                .amount(new BigDecimal("200.00"))
                .method(Payment.PaymentMethod.BANK_TRANSFER)
                .reference("TEST-PAYMENT-001")
                .build();

        String paymentResponse = mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentCommand)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        PaymentDto paymentDto = objectMapper.readValue(paymentResponse, PaymentDto.class);

        // Update payment status to COMPLETED
        mockMvc.perform(put("/payments/{id}/status", paymentDto.getId())
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk());

        // Try to record another payment of $100 (should fail - overpayment)
        RecordPaymentCommand overpaymentCommand = RecordPaymentCommand.builder()
                .invoiceId(createdInvoiceId)
                .amount(new BigDecimal("100.00"))
                .method(Payment.PaymentMethod.CREDIT_CARD)
                .reference("TEST-PAYMENT-002")
                .build();

        mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(overpaymentCommand)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Payment amount exceeds remaining balance")));
    }

    @Test
    void testPaymentReversalRestoresBalance() throws Exception {
        // Record and complete a payment
        RecordPaymentCommand paymentCommand = RecordPaymentCommand.builder()
                .invoiceId(createdInvoiceId)
                .amount(new BigDecimal("100.00"))
                .method(Payment.PaymentMethod.BANK_TRANSFER)
                .reference("TEST-PAYMENT-001")
                .build();

        String paymentResponse = mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentCommand)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        PaymentDto paymentDto = objectMapper.readValue(paymentResponse, PaymentDto.class);

        mockMvc.perform(put("/payments/{id}/status", paymentDto.getId())
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk());

        // Verify balance is reduced
        mockMvc.perform(get("/invoices/{id}", createdInvoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amountPaid").value("100.00"))
                .andExpect(jsonPath("$.balance").value("150.00"));

        // Reverse the payment
        mockMvc.perform(put("/payments/{id}/status", paymentDto.getId())
                        .param("status", "REVERSED"))
                .andExpect(status().isOk());

        // Verify balance is restored
        mockMvc.perform(get("/invoices/{id}", createdInvoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amountPaid").value("0.00"))
                .andExpect(jsonPath("$.balance").value("250.00"));
    }

    @Test
    void testInvoiceStatusChangesWithPayment() throws Exception {
        // Change invoice status to SENT
        UpdateInvoiceStatusCommand invoiceStatusCommand = UpdateInvoiceStatusCommand.builder()
                .invoiceId(createdInvoiceId)
                .status(Invoice.InvoiceStatus.SENT)
                .build();

        mockMvc.perform(patch("/invoices/{id}/status", createdInvoiceId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invoiceStatusCommand)))
                .andExpect(status().isOk());

        // Record and complete a partial payment
        RecordPaymentCommand paymentCommand = RecordPaymentCommand.builder()
                .invoiceId(createdInvoiceId)
                .amount(new BigDecimal("150.00"))
                .method(Payment.PaymentMethod.BANK_TRANSFER)
                .reference("TEST-PAYMENT-001")
                .build();

        String paymentResponse = mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentCommand)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        PaymentDto paymentDto = objectMapper.readValue(paymentResponse, PaymentDto.class);

        mockMvc.perform(put("/payments/{id}/status", paymentDto.getId())
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk());

        // Invoice should remain SENT (partially paid)
        mockMvc.perform(get("/invoices/{id}", createdInvoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SENT"))
                .andExpect(jsonPath("$.amountPaid").value("150.00"))
                .andExpect(jsonPath("$.balance").value("100.00"));

        // Complete the payment
        RecordPaymentCommand finalPaymentCommand = RecordPaymentCommand.builder()
                .invoiceId(createdInvoiceId)
                .amount(new BigDecimal("100.00"))
                .method(Payment.PaymentMethod.CREDIT_CARD)
                .reference("TEST-PAYMENT-002")
                .build();

        String finalPaymentResponse = mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(finalPaymentCommand)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        PaymentDto finalPaymentDto = objectMapper.readValue(finalPaymentResponse, PaymentDto.class);

        mockMvc.perform(put("/payments/{id}/status", finalPaymentDto.getId())
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk());

        // Invoice should now be PAID
        mockMvc.perform(get("/invoices/{id}", createdInvoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.amountPaid").value("250.00"))
                .andExpect(jsonPath("$.balance").value("0.00"));
    }

    private String createTestClient() throws Exception {
        String clientJson = "{\"name\":\"Test Client\",\"email\":\"test@client.com\",\"phone\":\"1234567890\",\"address\":\"123 Test St\"}";
        
        String response = mockMvc.perform(post("/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(clientJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).get("id").asText();
    }
}