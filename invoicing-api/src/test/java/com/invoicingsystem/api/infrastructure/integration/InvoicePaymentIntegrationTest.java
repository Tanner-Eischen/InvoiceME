package com.invoicingsystem.api.infrastructure.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoicingsystem.api.application.command.CreateClientCommand;
import com.invoicingsystem.api.application.command.CreateInvoiceCommand;
import com.invoicingsystem.api.application.command.RecordPaymentCommand;
import com.invoicingsystem.api.application.command.UpdateInvoiceStatusCommand;
import com.invoicingsystem.api.domain.model.Invoice;
import com.invoicingsystem.api.domain.model.Payment;
import com.invoicingsystem.api.domain.model.User;
import com.invoicingsystem.api.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.event.EventListener;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class InvoicePaymentIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private EventCapture eventCapture;

    private String testEmail = "test@example.com";

    @BeforeEach
    void setupUser() {
        userRepository.findByEmail(testEmail).orElseGet(() -> {
            User user = User.builder()
                    .name("Test User")
                    .email(testEmail)
                    .password(passwordEncoder.encode("password"))
                    .role(User.Role.USER)
                    .build();
            return userRepository.save(user);
        });
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = {"USER"})
    void fullInvoicePaymentFlow_succeeds() throws Exception {
        // Create client
        CreateClientCommand createClient = CreateClientCommand.builder()
                .name("Acme Corp")
                .email("billing@acme.com")
                .phone("123-456-7890")
                .address("1 Acme Way")
                .build();

        MvcResult clientResult = mockMvc.perform(post("/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createClient)))
                .andExpect(status().isCreated())
                .andReturn();

        String clientId = objectMapper.readTree(clientResult.getResponse().getContentAsString())
                .get("id").asText();

        // Create invoice with two items
        CreateInvoiceCommand.InvoiceItemDto item1 = CreateInvoiceCommand.InvoiceItemDto.builder()
                .description("Design Work")
                .quantity(10)
                .unitPrice(new BigDecimal("50.00"))
                .build();
        CreateInvoiceCommand.InvoiceItemDto item2 = CreateInvoiceCommand.InvoiceItemDto.builder()
                .description("Consulting")
                .quantity(5)
                .unitPrice(new BigDecimal("100.00"))
                .build();

        CreateInvoiceCommand createInvoice = CreateInvoiceCommand.builder()
                .clientId(clientId)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .taxRate(new BigDecimal("10"))
                .items(List.of(item1, item2))
                .build();

        MvcResult invoiceResult = mockMvc.perform(post("/invoices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createInvoice)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(Invoice.InvoiceStatus.DRAFT.name()))
                .andReturn();

        String invoiceId = objectMapper.readTree(invoiceResult.getResponse().getContentAsString())
                .get("id").asText();

        BigDecimal total = new BigDecimal(objectMapper.readTree(invoiceResult.getResponse().getContentAsString())
                .get("total").asText());

        // Update invoice status to SENT
        UpdateInvoiceStatusCommand statusCommand = UpdateInvoiceStatusCommand.builder()
                .invoiceId(invoiceId)
                .status(Invoice.InvoiceStatus.SENT)
                .build();

        mockMvc.perform(patch("/invoices/" + invoiceId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusCommand)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(Invoice.InvoiceStatus.SENT.name()));

        // Record a partial completed payment
        BigDecimal firstPayment = total.divide(new BigDecimal("2"));
        RecordPaymentCommand paymentCmd1 = RecordPaymentCommand.builder()
                .invoiceId(invoiceId)
                .amount(firstPayment)
                .method(Payment.PaymentMethod.BANK_TRANSFER)
                .status(Payment.PaymentStatus.COMPLETED)
                .reference("PAY-001")
                .build();

        MvcResult paymentResult1 = mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentCmd1)))
                .andExpect(status().isCreated())
                .andReturn();

        String paymentId1 = objectMapper.readTree(paymentResult1.getResponse().getContentAsString())
                .get("id").asText();

        // Fetch invoice and assert partial payment state
        mockMvc.perform(get("/invoices/" + invoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(Invoice.InvoiceStatus.PARTIALLY_PAID.name()))
                .andExpect(jsonPath("$.amountPaid").value(firstPayment.toString()));

        // Record remaining payment
        BigDecimal remaining = total.subtract(firstPayment);
        RecordPaymentCommand paymentCmd2 = RecordPaymentCommand.builder()
                .invoiceId(invoiceId)
                .amount(remaining)
                .method(Payment.PaymentMethod.CASH)
                .status(Payment.PaymentStatus.COMPLETED)
                .reference("PAY-002")
                .build();

        mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentCmd2)))
                .andExpect(status().isCreated());

        // Verify invoice is paid with zero balance
        mockMvc.perform(get("/invoices/" + invoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(Invoice.InvoiceStatus.PAID.name()))
                .andExpect(jsonPath("$.balance").value("0.00"));
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = {"USER"})
    void overpayment_isRejected() throws Exception {
        // Create client
        CreateClientCommand createClient = CreateClientCommand.builder()
                .name("Beta LLC")
                .email("billing@beta.com")
                .phone("222-333-4444")
                .address("2 Beta Street")
                .build();

        MvcResult clientResult = mockMvc.perform(post("/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createClient)))
                .andExpect(status().isCreated())
                .andReturn();

        String clientId = objectMapper.readTree(clientResult.getResponse().getContentAsString()).get("id").asText();

        // Create invoice
        CreateInvoiceCommand.InvoiceItemDto item = CreateInvoiceCommand.InvoiceItemDto.builder()
                .description("Service")
                .quantity(1)
                .unitPrice(new BigDecimal("100.00"))
                .build();
        CreateInvoiceCommand createInvoice = CreateInvoiceCommand.builder()
                .clientId(clientId)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(7))
                .items(List.of(item))
                .build();

        MvcResult invoiceResult = mockMvc.perform(post("/invoices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createInvoice)))
                .andExpect(status().isCreated())
                .andReturn();

        String invoiceId = objectMapper.readTree(invoiceResult.getResponse().getContentAsString()).get("id").asText();
        BigDecimal total = new BigDecimal(objectMapper.readTree(invoiceResult.getResponse().getContentAsString()).get("total").asText());

        // Attempt overpayment
        RecordPaymentCommand overpay = RecordPaymentCommand.builder()
                .invoiceId(invoiceId)
                .amount(total.add(new BigDecimal("1.00")))
                .method(Payment.PaymentMethod.CREDIT_CARD)
                .status(Payment.PaymentStatus.COMPLETED)
                .reference("OVERPAY-001")
                .build();

        mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(overpay)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = {"USER"})
    void invalid_status_transition_isRejected() throws Exception {
        // Create client and invoice
        CreateClientCommand createClient = CreateClientCommand.builder()
                .name("Gamma Inc")
                .email("billing@gamma.com")
                .phone("555-666-7777")
                .address("3 Gamma Ave")
                .build();

        String clientId = objectMapper.readTree(
                mockMvc.perform(post("/clients")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createClient)))
                        .andExpect(status().isCreated())
                        .andReturn().getResponse().getContentAsString())
                .get("id").asText();

        CreateInvoiceCommand.InvoiceItemDto item = CreateInvoiceCommand.InvoiceItemDto.builder()
                .description("Subscription")
                .quantity(1)
                .unitPrice(new BigDecimal("25.00"))
                .build();

        String invoiceId = objectMapper.readTree(
                mockMvc.perform(post("/invoices")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(
                                        CreateInvoiceCommand.builder()
                                                .clientId(clientId)
                                                .issueDate(LocalDate.now())
                                                .dueDate(LocalDate.now().plusDays(14))
                                                .items(List.of(item))
                                                .build())))
                        .andExpect(status().isCreated())
                        .andReturn().getResponse().getContentAsString())
                .get("id").asText();

        // Attempt invalid transition: DRAFT -> PAID (not allowed)
        UpdateInvoiceStatusCommand invalid = UpdateInvoiceStatusCommand.builder()
                .invoiceId(invoiceId)
                .status(Invoice.InvoiceStatus.PAID)
                .build();

        mockMvc.perform(patch("/invoices/" + invoiceId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = {"USER"})
    void paymentRecordedEvent_isPublished() throws Exception {
        // Create client
        CreateClientCommand client = CreateClientCommand.builder()
                .name("Event Co")
                .email("billing@eventco.com")
                .phone("101-202-3030")
                .address("10 Event Blvd")
                .build();
        String clientId = objectMapper.readTree(
                mockMvc.perform(post("/clients")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(client)))
                        .andExpect(status().isCreated())
                        .andReturn().getResponse().getContentAsString())
                .get("id").asText();

        // Create invoice
        CreateInvoiceCommand createInvoice = CreateInvoiceCommand.builder()
                .clientId(clientId)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(10))
                .items(List.of(CreateInvoiceCommand.InvoiceItemDto.builder()
                        .description("Work")
                        .quantity(1)
                        .unitPrice(new BigDecimal("50.00"))
                        .build()))
                .build();
        String invoiceId = objectMapper.readTree(
                mockMvc.perform(post("/invoices")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createInvoice)))
                        .andExpect(status().isCreated())
                        .andReturn().getResponse().getContentAsString())
                .get("id").asText();

        // Record payment
        RecordPaymentCommand payment = RecordPaymentCommand.builder()
                .invoiceId(invoiceId)
                .amount(new BigDecimal("50.00"))
                .method(Payment.PaymentMethod.CASH)
                .status(Payment.PaymentStatus.COMPLETED)
                .reference("EVT-001")
                .build();
        mockMvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payment)))
                .andExpect(status().isCreated());

        // Assert that PaymentRecordedEvent was published at least once
        assertThat(eventCapture.paymentRecordedCount).isGreaterThanOrEqualTo(1);
    }

    @TestConfiguration
    static class EventCapture {
        long paymentRecordedCount = 0;
        long invoiceStatusChangedCount = 0;

        @EventListener
        public void onPaymentRecorded(com.invoicingsystem.api.domain.event.PaymentRecordedEvent evt) {
            paymentRecordedCount++;
        }

        @EventListener
        public void onInvoiceStatusChanged(com.invoicingsystem.api.domain.event.InvoiceStatusChangedEvent evt) {
            invoiceStatusChangedCount++;
        }
    }
}