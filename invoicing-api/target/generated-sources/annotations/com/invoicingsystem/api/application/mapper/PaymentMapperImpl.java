package com.invoicingsystem.api.application.mapper;

import com.invoicingsystem.api.application.command.RecordPaymentCommand;
import com.invoicingsystem.api.application.query.PaymentDto;
import com.invoicingsystem.api.domain.model.Invoice;
import com.invoicingsystem.api.domain.model.Payment;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-10T19:09:06-0600",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class PaymentMapperImpl implements PaymentMapper {

    @Override
    public PaymentDto paymentToPaymentDto(Payment payment) {
        if ( payment == null ) {
            return null;
        }

        PaymentDto.PaymentDtoBuilder paymentDto = PaymentDto.builder();

        paymentDto.invoiceId( paymentInvoiceId( payment ) );
        paymentDto.invoiceNumber( paymentInvoiceNumber( payment ) );
        paymentDto.amount( payment.getAmount() );
        paymentDto.createdAt( payment.getCreatedAt() );
        paymentDto.id( payment.getId() );
        paymentDto.method( payment.getMethod() );
        paymentDto.receivedAt( payment.getReceivedAt() );
        paymentDto.reference( payment.getReference() );
        paymentDto.status( payment.getStatus() );
        paymentDto.updatedAt( payment.getUpdatedAt() );

        return paymentDto.build();
    }

    @Override
    public List<PaymentDto> paymentsToPaymentDtos(List<Payment> payments) {
        if ( payments == null ) {
            return null;
        }

        List<PaymentDto> list = new ArrayList<PaymentDto>( payments.size() );
        for ( Payment payment : payments ) {
            list.add( paymentToPaymentDto( payment ) );
        }

        return list;
    }

    @Override
    public Payment recordPaymentCommandToPayment(RecordPaymentCommand command) {
        if ( command == null ) {
            return null;
        }

        Payment.PaymentBuilder<?, ?> payment = Payment.builder();

        payment.amount( command.getAmount() );
        payment.method( command.getMethod() );
        payment.receivedAt( command.getReceivedAt() );
        payment.reference( command.getReference() );
        payment.status( command.getStatus() );

        return payment.build();
    }

    private String paymentInvoiceId(Payment payment) {
        if ( payment == null ) {
            return null;
        }
        Invoice invoice = payment.getInvoice();
        if ( invoice == null ) {
            return null;
        }
        String id = invoice.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String paymentInvoiceNumber(Payment payment) {
        if ( payment == null ) {
            return null;
        }
        Invoice invoice = payment.getInvoice();
        if ( invoice == null ) {
            return null;
        }
        String number = invoice.getNumber();
        if ( number == null ) {
            return null;
        }
        return number;
    }
}
