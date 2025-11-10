package com.invoicingsystem.api.application.mapper;

import com.invoicingsystem.api.application.command.CreateClientCommand;
import com.invoicingsystem.api.application.command.UpdateClientCommand;
import com.invoicingsystem.api.application.query.ClientDto;
import com.invoicingsystem.api.domain.model.Client;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-09T23:14:50-0600",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.17 (Eclipse Adoptium)"
)
@Component
public class ClientMapperImpl implements ClientMapper {

    @Override
    public ClientDto clientToClientDto(Client client) {
        if ( client == null ) {
            return null;
        }

        ClientDto.ClientDtoBuilder clientDto = ClientDto.builder();

        clientDto.id( client.getId() );
        clientDto.name( client.getName() );
        clientDto.email( client.getEmail() );
        clientDto.phone( client.getPhone() );
        clientDto.address( client.getAddress() );
        clientDto.createdAt( client.getCreatedAt() );
        clientDto.updatedAt( client.getUpdatedAt() );

        return clientDto.build();
    }

    @Override
    public List<ClientDto> clientsToClientDtos(List<Client> clients) {
        if ( clients == null ) {
            return null;
        }

        List<ClientDto> list = new ArrayList<ClientDto>( clients.size() );
        for ( Client client : clients ) {
            list.add( clientToClientDto( client ) );
        }

        return list;
    }

    @Override
    public Client createClientCommandToClient(CreateClientCommand command) {
        if ( command == null ) {
            return null;
        }

        Client.ClientBuilder<?, ?> client = Client.builder();

        client.name( command.getName() );
        client.email( command.getEmail() );
        client.phone( command.getPhone() );
        client.address( command.getAddress() );

        return client.build();
    }

    @Override
    public void updateClientFromCommand(UpdateClientCommand command, Client client) {
        if ( command == null ) {
            return;
        }

        client.setId( command.getId() );
        client.setName( command.getName() );
        client.setEmail( command.getEmail() );
        client.setPhone( command.getPhone() );
        client.setAddress( command.getAddress() );
    }
}
