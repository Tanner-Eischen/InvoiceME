package com.invoicingsystem.api.domain.repository;

import com.invoicingsystem.api.domain.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {

    Optional<Invoice> findByNumber(String number);

    List<Invoice> findByClientId(String clientId);

    List<Invoice> findByStatus(Invoice.InvoiceStatus status);

    @Query("SELECT i FROM Invoice i WHERE i.status = 'SENT' AND i.dueDate < :currentDate")
    List<Invoice> findOverdueInvoices(LocalDate currentDate);

    @Query("SELECT i FROM Invoice i WHERE i.createdBy.id = :userId")
    List<Invoice> findByUserId(String userId);

    boolean existsByNumber(String number);
}
