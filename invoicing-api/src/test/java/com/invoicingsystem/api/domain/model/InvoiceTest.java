package com.invoicingsystem.api.domain.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class InvoiceTest {

    @Test
    void testCalculateTotals() {
        // Setup
        Invoice invoice = new Invoice();
        invoice.setItems(new ArrayList<>());

        // Create some invoice items
        InvoiceItem item1 = new InvoiceItem();
        item1.setQuantity(2);
        item1.setUnitPrice(new BigDecimal("100.00"));
        item1.calculateAmount();

        InvoiceItem item2 = new InvoiceItem();
        item2.setQuantity(1);
        item2.setUnitPrice(new BigDecimal("50.00"));
        item2.calculateAmount();

        // Add items to invoice
        invoice.addItem(item1);
        invoice.addItem(item2);

        // Set tax rate
        invoice.setTaxRate(new BigDecimal("10"));

        // Calculate totals
        invoice.calculateTotals();

        // Verify
        assertEquals(new BigDecimal("250.00"), invoice.getSubtotal());
        assertEquals(new BigDecimal("25.00"), invoice.getTaxAmount());
        assertEquals(new BigDecimal("275.00"), invoice.getTotal());
    }

    @Test
    void testCalculateTotalsWithNoTax() {
        // Setup
        Invoice invoice = new Invoice();
        invoice.setItems(new ArrayList<>());

        // Create some invoice items
        InvoiceItem item1 = new InvoiceItem();
        item1.setQuantity(2);
        item1.setUnitPrice(new BigDecimal("100.00"));
        item1.calculateAmount();

        // Add items to invoice
        invoice.addItem(item1);

        // No tax rate set
        invoice.setTaxRate(null);

        // Calculate totals
        invoice.calculateTotals();

        // Verify
        assertEquals(new BigDecimal("200.00"), invoice.getSubtotal());
        assertEquals(BigDecimal.ZERO, invoice.getTaxAmount());
        assertEquals(new BigDecimal("200.00"), invoice.getTotal());
    }

    @Test
    void testAddAndRemoveItem() {
        // Setup
        Invoice invoice = new Invoice();
        invoice.setItems(new ArrayList<>());
        InvoiceItem item = new InvoiceItem();

        // Add item
        invoice.addItem(item);

        // Verify
        assertEquals(1, invoice.getItems().size());
        assertSame(invoice, item.getInvoice());

        // Remove item
        invoice.removeItem(item);

        // Verify
        assertEquals(0, invoice.getItems().size());
        assertNull(item.getInvoice());
    }
}
