package com.invoicingsystem.api.application.mapper;

import com.invoicingsystem.api.application.command.RecordPaymentCommand;
import com.invoicingsystem.api.application.query.PaymentDto;
import com.invoicingsystem.api.domain.model.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    PaymentMapper INSTANCE = Mappers.getMapper(PaymentMapper.class);

    @Mapping(target = "invoiceId", source = "invoice.id")
    @Mapping(target = "invoiceNumber", source = "invoice.number")
    PaymentDto paymentToPaymentDto(Payment payment);

    List<PaymentDto> paymentsToPaymentDtos(List<Payment> payments);

    // Support mapping from command to entity for tests
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "invoice", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Payment recordPaymentCommandToPayment(RecordPaymentCommand command);
}