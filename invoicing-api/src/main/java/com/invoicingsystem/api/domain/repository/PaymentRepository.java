package com.invoicingsystem.api.domain.repository;

import com.invoicingsystem.api.domain.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    List<Payment> findByInvoiceId(String invoiceId);

    @Query("SELECT p FROM Payment p WHERE p.invoice.id = :invoiceId AND p.status = 'COMPLETED'")
    List<Payment> findCompletedPaymentsByInvoiceId(String invoiceId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.invoice.id = :invoiceId AND p.status = 'COMPLETED'")
    BigDecimal getTotalPaidAmountByInvoiceId(String invoiceId);

    Optional<Payment> findByReference(String reference);

    boolean existsByReference(String reference);
}