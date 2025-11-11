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
    date = "2025-11-10T19:09:06-0600",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class ClientMapperImpl implements ClientMapper {

    @Override
    public ClientDto clientToClientDto(Client client) {
        if ( client == null ) {
            return null;
        }

        ClientDto.ClientDtoBuilder clientDto = ClientDto.builder();

        clientDto.address( client.getAddress() );
        clientDto.createdAt( client.getCreatedAt() );
        clientDto.email( client.getEmail() );
        clientDto.id( client.getId() );
        clientDto.name( client.getName() );
        clientDto.phone( client.getPhone() );
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

        client.address( command.getAddress() );
        client.email( command.getEmail() );
        client.name( command.getName() );
        client.phone( command.getPhone() );

        return client.build();
    }

    @Override
    public void updateClientFromCommand(UpdateClientCommand command, Client client) {
        if ( command == null ) {
            return;
        }

        client.setAddress( command.getAddress() );
        client.setEmail( command.getEmail() );
        client.setId( command.getId() );
        client.setName( command.getName() );
        client.setPhone( command.getPhone() );
    }
}
