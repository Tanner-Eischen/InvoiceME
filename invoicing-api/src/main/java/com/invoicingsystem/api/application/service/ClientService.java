package com.invoicingsystem.api.application.service;

import com.invoicingsystem.api.application.command.CreateClientCommand;
import com.invoicingsystem.api.application.command.UpdateClientCommand;
import com.invoicingsystem.api.application.query.ClientDto;

import java.util.List;

public interface ClientService {

    List<ClientDto> getAllClients();

    ClientDto getClientById(String id);

    List<ClientDto> searchClientsByName(String name);

    ClientDto createClient(CreateClientCommand command);

    ClientDto updateClient(UpdateClientCommand command);

    void deleteClient(String id);
}
