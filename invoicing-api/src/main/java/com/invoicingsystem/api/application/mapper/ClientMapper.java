package com.invoicingsystem.api.application.mapper;

import com.invoicingsystem.api.application.command.CreateClientCommand;
import com.invoicingsystem.api.application.command.UpdateClientCommand;
import com.invoicingsystem.api.application.query.ClientDto;
import com.invoicingsystem.api.domain.model.Client;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ClientMapper {

    ClientMapper INSTANCE = Mappers.getMapper(ClientMapper.class);

    ClientDto clientToClientDto(Client client);

    List<ClientDto> clientsToClientDtos(List<Client> clients);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "invoices", ignore = true)
    Client createClientCommandToClient(CreateClientCommand command);

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "invoices", ignore = true)
    void updateClientFromCommand(UpdateClientCommand command, @MappingTarget Client client);
}
