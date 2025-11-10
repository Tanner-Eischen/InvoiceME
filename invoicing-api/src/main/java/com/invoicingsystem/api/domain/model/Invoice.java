package com.invoicingsystem.api.domain.model;

import javax.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Invoice extends BaseEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "number", nullable = false, unique = true)
    private String number;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private InvoiceStatus status;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate;

    @Column(name = "tax_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "amount_paid", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "balance", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "notes")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InvoiceItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    public enum InvoiceStatus {
        DRAFT, SENT, PARTIALLY_PAID, PAID, OVERDUE, CANCELED
    }

    // Helper method to add an item to the invoice
    public void addItem(InvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
    }

    // Helper method to remove an item from the invoice
    public void removeItem(InvoiceItem item) {
        items.remove(item);
        item.setInvoice(null);
    }

    // Helper method to calculate totals
    public void calculateTotals() {
        this.subtotal = items.stream()
                .map(InvoiceItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, java.math.RoundingMode.HALF_UP);

        if (taxRate != null) {
            this.taxAmount = subtotal
                    .multiply(taxRate.divide(new BigDecimal("100")))
                    .setScale(2, java.math.RoundingMode.HALF_UP);
        } else {
            this.taxAmount = BigDecimal.ZERO;
        }

        this.total = subtotal.add(taxAmount).setScale(2, java.math.RoundingMode.HALF_UP);
        recalculateBalance();
    }

    // Helper method to recalculate balance based on amount paid
    public void recalculateBalance() {
        if (this.amountPaid == null) {
            this.amountPaid = BigDecimal.ZERO;
        }
        this.balance = this.total.subtract(this.amountPaid).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    // Helper method to apply payment amount
    public void applyPayment(BigDecimal paymentAmount) {
        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }
        
        BigDecimal newAmountPaid = this.amountPaid.add(paymentAmount);
        if (newAmountPaid.compareTo(this.total) > 0) {
            throw new IllegalArgumentException("Payment amount would exceed invoice total");
        }
        
        this.amountPaid = newAmountPaid;
        recalculateBalance();
        
        // Update invoice status based on payment
        if (this.balance.compareTo(BigDecimal.ZERO) == 0) {
            this.status = InvoiceStatus.PAID;
        } else if (this.amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            this.status = InvoiceStatus.PARTIALLY_PAID;
        }
    }

    // Backward-compatible alias methods for tests referring to balanceDue
    public BigDecimal getBalanceDue() {
        return this.getBalance();
    }

    public void setBalanceDue(BigDecimal balanceDue) {
        this.setBalance(balanceDue);
    }

    // Helper method to reverse payment
    public void reversePayment(BigDecimal paymentAmount) {
        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Reversal amount must be positive");
        }
        
        if (paymentAmount.compareTo(this.amountPaid) > 0) {
            throw new IllegalArgumentException("Reversal amount cannot exceed amount paid");
        }
        
        this.amountPaid = this.amountPaid.subtract(paymentAmount);
        recalculateBalance();
        
        // Update invoice status based on remaining balance
        if (this.amountPaid.compareTo(BigDecimal.ZERO) == 0) {
            this.status = InvoiceStatus.SENT; // Reset to sent if no payments
        } else if (this.balance.compareTo(BigDecimal.ZERO) > 0) {
            this.status = InvoiceStatus.PARTIALLY_PAID; // Still has partial payment
        }
    }
}
