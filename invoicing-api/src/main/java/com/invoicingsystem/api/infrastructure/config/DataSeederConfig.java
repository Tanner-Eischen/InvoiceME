package com.invoicingsystem.api.infrastructure.config;

import com.invoicingsystem.api.application.command.CreateClientCommand;
import com.invoicingsystem.api.application.command.CreateInvoiceCommand;
import com.invoicingsystem.api.application.command.CreateUserCommand;
import com.invoicingsystem.api.application.command.RecordPaymentCommand;
import com.invoicingsystem.api.application.query.UserDto;
import com.invoicingsystem.api.application.query.InvoiceDto;
import com.invoicingsystem.api.application.service.AuthService;
import com.invoicingsystem.api.application.service.ClientService;
import com.invoicingsystem.api.application.service.InvoiceService;
import com.invoicingsystem.api.application.service.PaymentService;
import com.invoicingsystem.api.domain.model.Payment;
import com.invoicingsystem.api.domain.model.User;
import com.invoicingsystem.api.domain.repository.ClientRepository;
import com.invoicingsystem.api.domain.repository.InvoiceRepository;
import com.invoicingsystem.api.domain.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.CommandLineRunner;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
@Profile("!test")
public class DataSeederConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSeederConfig.class);

    @Bean
    public CommandLineRunner dataSeeder(
            AuthService authService,
            UserRepository userRepository,
            ClientService clientService,
            ClientRepository clientRepository,
            InvoiceService invoiceService,
            InvoiceRepository invoiceRepository,
            PaymentService paymentService
    ) {
        return args -> {
            // Seed Users
            String adminEmail = "admin@example.com";
            String staffEmail = "staff@example.com";
            UserDto adminUser;
            if (!userRepository.existsByEmail(adminEmail)) {
                adminUser = authService.register(CreateUserCommand.builder()
                        .name("Admin User")
                        .email(adminEmail)
                        .password("password")
                        .role(User.Role.ADMIN)
                        .build());
            } else {
                adminUser = userRepository.findByEmail(adminEmail)
                        .map(u -> UserDto.builder()
                                .id(u.getId())
                                .name(u.getName())
                                .email(u.getEmail())
                                .role(u.getRole())
                                .createdAt(u.getCreatedAt())
                                .updatedAt(u.getUpdatedAt())
                                .build())
                        .orElse(null);
            }

            if (!userRepository.existsByEmail(staffEmail)) {
                authService.register(CreateUserCommand.builder()
                        .name("Staff User")
                        .email(staffEmail)
                        .password("password")
                        .role(User.Role.USER)
                        .build());
            }

            String creatorUserId = adminUser != null ? adminUser.getId() : userRepository.findByEmail(adminEmail).map(User::getId).orElse(null);

            // Seed Clients
            if (clientRepository.count() == 0) {
                List<CreateClientCommand> clients = Arrays.asList(
                        CreateClientCommand.builder()
                                .name("Acme Corp")
                                .email("billing@acme.com")
                                .phone("+1-415-555-1000")
                                .address("123 Market St, San Francisco, CA 94103")
                                .build(),
                        CreateClientCommand.builder()
                                .name("Globex Inc")
                                .email("accounts@globex.com")
                                .phone("+1-212-555-2000")
                                .address("500 5th Ave, New York, NY 10110")
                                .build(),
                        CreateClientCommand.builder()
                                .name("Umbrella LLC")
                                .email("finance@umbrella.io")
                                .phone("+1-206-555-3000")
                                .address("400 Pine St, Seattle, WA 98101")
                                .build()
                );

                clients.forEach(clientService::createClient);
            }

            // Seed Invoices & Payments
            if (invoiceRepository.count() == 0 && creatorUserId != null) {
                var clientDtos = clientService.getAllClients();
                if (clientDtos.size() >= 3) {
                    var acmeId = clientDtos.get(0).getId();
                    var globexId = clientDtos.get(1).getId();
                    var umbrellaId = clientDtos.get(2).getId();

                    // Invoice 1: Acme - will be fully paid
                    CreateInvoiceCommand inv1Cmd = CreateInvoiceCommand.builder()
                            .clientId(acmeId)
                            .issueDate(LocalDate.now().minusDays(7))
                            .dueDate(LocalDate.now().plusDays(23))
                            .status("SENT")
                            .taxRate(new BigDecimal("0.10"))
                            .notes("Website redesign services")
                            .items(Arrays.asList(
                                    CreateInvoiceCommand.InvoiceItemDto.builder().description("Design consultation").quantity(2).unitPrice(new BigDecimal("250.00")).build(),
                                    CreateInvoiceCommand.InvoiceItemDto.builder().description("UI components").quantity(3).unitPrice(new BigDecimal("100.00")).build()
                            ))
                            .build();
                    InvoiceDto inv1 = invoiceService.createInvoice(inv1Cmd, creatorUserId);

                    // Invoice 2: Globex - will be partially paid
                    CreateInvoiceCommand inv2Cmd = CreateInvoiceCommand.builder()
                            .clientId(globexId)
                            .issueDate(LocalDate.now().minusDays(14))
                            .dueDate(LocalDate.now().plusDays(16))
                            .status("SENT")
                            .taxRate(new BigDecimal("0.00"))
                            .notes("Backend integration")
                            .items(Arrays.asList(
                                    CreateInvoiceCommand.InvoiceItemDto.builder().description("API development").quantity(1).unitPrice(new BigDecimal("700.00")).build()
                            ))
                            .build();
                    InvoiceDto inv2 = invoiceService.createInvoice(inv2Cmd, creatorUserId);

                    // Invoice 3: Umbrella - draft, no payments
                    CreateInvoiceCommand inv3Cmd = CreateInvoiceCommand.builder()
                            .clientId(umbrellaId)
                            .issueDate(LocalDate.now())
                            .dueDate(LocalDate.now().plusDays(30))
                            .status("DRAFT")
                            .taxRate(new BigDecimal("0.05"))
                            .notes("Maintenance retainer")
                            .items(Arrays.asList(
                                    CreateInvoiceCommand.InvoiceItemDto.builder().description("Monthly support").quantity(2).unitPrice(new BigDecimal("120.00")).build()
                            ))
                            .build();
                    InvoiceDto inv3 = invoiceService.createInvoice(inv3Cmd, creatorUserId);

                    // Payments (resilient to avoid startup failure)
                    try {
                        // Fully pay invoice 1 (Acme): 880.00 total
                        paymentService.recordPayment(RecordPaymentCommand.builder()
                                .invoiceId(inv1.getId())
                                .amount(new BigDecimal("880.00"))
                                .method(Payment.PaymentMethod.CASH)
                                .status(Payment.PaymentStatus.COMPLETED)
                                .receivedAt(LocalDateTime.now().minusDays(2))
                                .reference("SEED-ACME-001")
                                .build());

                        // Partially pay invoice 2 (Globex): 200.00 completed, then 150.00 pending -> completed
                        paymentService.recordPayment(RecordPaymentCommand.builder()
                                .invoiceId(inv2.getId())
                                .amount(new BigDecimal("200.00"))
                                .method(Payment.PaymentMethod.BANK_TRANSFER)
                                .status(Payment.PaymentStatus.COMPLETED)
                                .receivedAt(LocalDateTime.now().minusDays(1))
                                .reference("SEED-GLOBEX-001")
                                .build());

                        var pending = paymentService.recordPayment(RecordPaymentCommand.builder()
                                .invoiceId(inv2.getId())
                                .amount(new BigDecimal("150.00"))
                                .method(Payment.PaymentMethod.CREDIT_CARD)
                                .status(Payment.PaymentStatus.PENDING)
                                .receivedAt(LocalDateTime.now())
                                .reference("SEED-GLOBEX-002")
                                .build());
                        paymentService.updatePaymentStatus(pending.getId(), Payment.PaymentStatus.COMPLETED);
                    } catch (Exception e) {
                        log.warn("Seeder: skipping payment seeding due to error: {}", e.getMessage());
                    }

                    // Leave invoice 3 (Umbrella) as DRAFT without payments
                }
            }
        };
    }
}