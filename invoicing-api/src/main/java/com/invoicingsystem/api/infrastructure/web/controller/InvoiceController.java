package com.invoicingsystem.api.infrastructure.web.controller;

import com.invoicingsystem.api.application.command.CreateInvoiceCommand;
import com.invoicingsystem.api.application.command.UpdateInvoiceCommand;
import com.invoicingsystem.api.application.command.UpdateInvoiceStatusCommand;
import com.invoicingsystem.api.application.query.InvoiceDto;
import com.invoicingsystem.api.application.service.InvoiceService;
import com.invoicingsystem.api.domain.model.User;
import com.invoicingsystem.api.domain.repository.UserRepository;
import com.invoicingsystem.api.domain.model.Invoice.InvoiceStatus;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<InvoiceDto>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDto> getInvoiceById(@PathVariable String id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping("/number/{number}")
    public ResponseEntity<InvoiceDto> getInvoiceByNumber(@PathVariable String number) {
        return ResponseEntity.ok(invoiceService.getInvoiceByNumber(number));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<InvoiceDto>> getInvoicesByClientId(@PathVariable String clientId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByClientId(clientId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<InvoiceDto>> getInvoicesByStatus(@PathVariable InvoiceStatus status) {
        return ResponseEntity.ok(invoiceService.getInvoicesByStatus(status));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<InvoiceDto>> getOverdueInvoices() {
        return ResponseEntity.ok(invoiceService.getOverdueInvoices());
    }

    @PostMapping
    public ResponseEntity<InvoiceDto> createInvoice(@Valid @RequestBody CreateInvoiceCommand command) {
        String userId = getCurrentUserId();
        return new ResponseEntity<>(invoiceService.createInvoice(command, userId), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceDto> updateInvoice(
            @PathVariable String id,
            @Valid @RequestBody UpdateInvoiceCommand command) {

        // Ensure ID in path matches ID in body
        if (!id.equals(command.getId())) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(invoiceService.updateInvoice(command));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceDto> updateInvoiceStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateInvoiceStatusCommand command) {

        // Ensure ID in path matches ID in body
        if (!id.equals(command.getInvoiceId())) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(invoiceService.updateInvoiceStatus(command));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInvoice(@PathVariable String id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    // Helper method to get current user ID
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.invoicingsystem.api.domain.exception.ResourceNotFoundException("User", "email", email));
        return user.getId();
    }
}
