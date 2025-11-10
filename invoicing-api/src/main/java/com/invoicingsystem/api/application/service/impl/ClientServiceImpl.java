package com.invoicingsystem.api.application.service.impl;

import com.invoicingsystem.api.application.command.CreateClientCommand;
import com.invoicingsystem.api.application.command.UpdateClientCommand;
import com.invoicingsystem.api.application.mapper.ClientMapper;
import com.invoicingsystem.api.application.query.ClientDto;
import com.invoicingsystem.api.application.service.ClientService;
import com.invoicingsystem.api.domain.exception.DuplicateResourceException;
import com.invoicingsystem.api.domain.exception.ResourceNotFoundException;
import com.invoicingsystem.api.domain.model.Client;
import com.invoicingsystem.api.domain.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ClientDto> getAllClients() {
        return clientMapper.clientsToClientDtos(clientRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDto getClientById(String id) {
        return clientRepository.findById(id)
                .map(clientMapper::clientToClientDto)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientDto> searchClientsByName(String name) {
        return clientMapper.clientsToClientDtos(clientRepository.findByNameContainingIgnoreCase(name));
    }

    @Override
    @Transactional
    public ClientDto createClient(CreateClientCommand command) {
        if (clientRepository.existsByEmail(command.getEmail())) {
            throw new DuplicateResourceException("Client", "email", command.getEmail());
        }

        Client client = clientMapper.createClientCommandToClient(command);
        client.setCreatedAt(LocalDateTime.now());
        client.setUpdatedAt(LocalDateTime.now());

        return clientMapper.clientToClientDto(clientRepository.save(client));
    }

    @Override
    @Transactional
    public ClientDto updateClient(UpdateClientCommand command) {
        Client client = clientRepository.findById(command.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", command.getId()));

        // Check if email is being changed and if it already exists
        if (!client.getEmail().equals(command.getEmail()) &&
                clientRepository.existsByEmail(command.getEmail())) {
            throw new DuplicateResourceException("Client", "email", command.getEmail());
        }

        clientMapper.updateClientFromCommand(command, client);
        client.setUpdatedAt(LocalDateTime.now());

        return clientMapper.clientToClientDto(clientRepository.save(client));
    }

    @Override
    @Transactional
    public void deleteClient(String id) {
        if (!clientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Client", "id", id);
        }

        clientRepository.deleteById(id);
    }
}
