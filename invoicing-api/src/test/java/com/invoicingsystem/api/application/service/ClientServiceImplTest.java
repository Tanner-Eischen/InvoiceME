package com.invoicingsystem.api.application.service;

import com.invoicingsystem.api.application.command.CreateClientCommand;
import com.invoicingsystem.api.application.command.UpdateClientCommand;
import com.invoicingsystem.api.application.mapper.ClientMapper;
import com.invoicingsystem.api.application.query.ClientDto;
import com.invoicingsystem.api.application.service.impl.ClientServiceImpl;
import com.invoicingsystem.api.domain.exception.DuplicateResourceException;
import com.invoicingsystem.api.domain.exception.ResourceNotFoundException;
import com.invoicingsystem.api.domain.model.Client;
import com.invoicingsystem.api.domain.repository.ClientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceImplTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ClientMapper clientMapper;

    @InjectMocks
    private ClientServiceImpl clientService;

    private Client testClient;
    private ClientDto testClientDto;
    private CreateClientCommand createCommand;
    private UpdateClientCommand updateCommand;

    @BeforeEach
    void setUp() {
        // Setup test data
        testClient = new Client();
        testClient.setId("test-id");
        testClient.setName("Test Client");
        testClient.setEmail("test@example.com");
        testClient.setPhone("+1-555-123-4567");
        testClient.setAddress("123 Test St");
        testClient.setCreatedAt(LocalDateTime.now());
        testClient.setUpdatedAt(LocalDateTime.now());

        testClientDto = new ClientDto();
        testClientDto.setId("test-id");
        testClientDto.setName("Test Client");
        testClientDto.setEmail("test@example.com");
        testClientDto.setPhone("+1-555-123-4567");
        testClientDto.setAddress("123 Test St");
        testClientDto.setCreatedAt(testClient.getCreatedAt());
        testClientDto.setUpdatedAt(testClient.getUpdatedAt());

        createCommand = new CreateClientCommand();
        createCommand.setName("Test Client");
        createCommand.setEmail("test@example.com");
        createCommand.setPhone("+1-555-123-4567");
        createCommand.setAddress("123 Test St");

        updateCommand = new UpdateClientCommand();
        updateCommand.setId("test-id");
        updateCommand.setName("Updated Client");
        updateCommand.setEmail("updated@example.com");
        updateCommand.setPhone("+1-555-987-6543");
        updateCommand.setAddress("456 Update St");
    }

    @Test
    void getAllClients_ShouldReturnAllClients() {
        // Given
        List<Client> clients = Arrays.asList(testClient);
        List<ClientDto> expectedDtos = Arrays.asList(testClientDto);

        when(clientRepository.findAll()).thenReturn(clients);
        when(clientMapper.clientsToClientDtos(clients)).thenReturn(expectedDtos);

        // When
        List<ClientDto> result = clientService.getAllClients();

        // Then
        assertEquals(expectedDtos, result);
        verify(clientRepository).findAll();
        verify(clientMapper).clientsToClientDtos(clients);
    }

    @Test
    void getClientById_WhenClientExists_ShouldReturnClient() {
        // Given
        when(clientRepository.findById("test-id")).thenReturn(Optional.of(testClient));
        when(clientMapper.clientToClientDto(testClient)).thenReturn(testClientDto);

        // When
        ClientDto result = clientService.getClientById("test-id");

        // Then
        assertEquals(testClientDto, result);
        verify(clientRepository).findById("test-id");
        verify(clientMapper).clientToClientDto(testClient);
    }

    @Test
    void getClientById_WhenClientDoesNotExist_ShouldThrowException() {
        // Given
        when(clientRepository.findById("non-existent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> clientService.getClientById("non-existent"));
        verify(clientRepository).findById("non-existent");
        verifyNoInteractions(clientMapper);
    }

    @Test
    void createClient_WhenEmailIsUnique_ShouldCreateClient() {
        // Given
        when(clientRepository.existsByEmail(createCommand.getEmail())).thenReturn(false);
        when(clientMapper.createClientCommandToClient(createCommand)).thenReturn(testClient);
        when(clientRepository.save(testClient)).thenReturn(testClient);
        when(clientMapper.clientToClientDto(testClient)).thenReturn(testClientDto);

        // When
        ClientDto result = clientService.createClient(createCommand);

        // Then
        assertEquals(testClientDto, result);
        verify(clientRepository).existsByEmail(createCommand.getEmail());
        verify(clientMapper).createClientCommandToClient(createCommand);
        verify(clientRepository).save(testClient);
        verify(clientMapper).clientToClientDto(testClient);
    }

    @Test
    void createClient_WhenEmailExists_ShouldThrowException() {
        // Given
        when(clientRepository.existsByEmail(createCommand.getEmail())).thenReturn(true);

        // When & Then
        assertThrows(DuplicateResourceException.class, () -> clientService.createClient(createCommand));
        verify(clientRepository).existsByEmail(createCommand.getEmail());
        verifyNoMoreInteractions(clientRepository, clientMapper);
    }

    @Test
    void updateClient_WhenClientExistsAndEmailIsUnchanged_ShouldUpdateClient() {
        // Given
        when(clientRepository.findById(updateCommand.getId())).thenReturn(Optional.of(testClient));
        when(clientRepository.save(testClient)).thenReturn(testClient);
        when(clientMapper.clientToClientDto(testClient)).thenReturn(testClientDto);

        // Set the same email to simulate unchanged email
        testClient.setEmail(updateCommand.getEmail());

        // When
        ClientDto result = clientService.updateClient(updateCommand);

        // Then
        assertEquals(testClientDto, result);
        verify(clientRepository).findById(updateCommand.getId());
        verify(clientMapper).updateClientFromCommand(updateCommand, testClient);
        verify(clientRepository).save(testClient);
        verify(clientMapper).clientToClientDto(testClient);
    }

    @Test
    void updateClient_WhenClientExistsAndEmailIsChangedToUnique_ShouldUpdateClient() {
        // Given
        when(clientRepository.findById(updateCommand.getId())).thenReturn(Optional.of(testClient));
        when(clientRepository.existsByEmail(updateCommand.getEmail())).thenReturn(false);
        when(clientRepository.save(testClient)).thenReturn(testClient);
        when(clientMapper.clientToClientDto(testClient)).thenReturn(testClientDto);

        // Set a different email to simulate changed email
        testClient.setEmail("old@example.com");

        // When
        ClientDto result = clientService.updateClient(updateCommand);

        // Then
        assertEquals(testClientDto, result);
        verify(clientRepository).findById(updateCommand.getId());
        verify(clientRepository).existsByEmail(updateCommand.getEmail());
        verify(clientMapper).updateClientFromCommand(updateCommand, testClient);
        verify(clientRepository).save(testClient);
        verify(clientMapper).clientToClientDto(testClient);
    }

    @Test
    void updateClient_WhenClientDoesNotExist_ShouldThrowException() {
        // Given
        when(clientRepository.findById(updateCommand.getId())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> clientService.updateClient(updateCommand));
        verify(clientRepository).findById(updateCommand.getId());
        verifyNoMoreInteractions(clientRepository, clientMapper);
    }

    @Test
    void updateClient_WhenEmailIsChangedToExisting_ShouldThrowException() {
        // Given
        when(clientRepository.findById(updateCommand.getId())).thenReturn(Optional.of(testClient));
        when(clientRepository.existsByEmail(updateCommand.getEmail())).thenReturn(true);

        // Set a different email to simulate changed email
        testClient.setEmail("old@example.com");

        // When & Then
        assertThrows(DuplicateResourceException.class, () -> clientService.updateClient(updateCommand));
        verify(clientRepository).findById(updateCommand.getId());
        verify(clientRepository).existsByEmail(updateCommand.getEmail());
        verifyNoMoreInteractions(clientRepository, clientMapper);
    }

    @Test
    void deleteClient_WhenClientExists_ShouldDeleteClient() {
        // Given
        when(clientRepository.existsById("test-id")).thenReturn(true);

        // When
        clientService.deleteClient("test-id");

        // Then
        verify(clientRepository).existsById("test-id");
        verify(clientRepository).deleteById("test-id");
    }

    @Test
    void deleteClient_WhenClientDoesNotExist_ShouldThrowException() {
        // Given
        when(clientRepository.existsById("non-existent")).thenReturn(false);

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> clientService.deleteClient("non-existent"));
        verify(clientRepository).existsById("non-existent");
        verifyNoMoreInteractions(clientRepository);
    }

    @Test
    void searchClientsByName_ShouldReturnMatchingClients() {
        // Given
        List<Client> clients = Arrays.asList(testClient);
        List<ClientDto> expectedDtos = Arrays.asList(testClientDto);

        when(clientRepository.findByNameContainingIgnoreCase("Test")).thenReturn(clients);
        when(clientMapper.clientsToClientDtos(clients)).thenReturn(expectedDtos);

        // When
        List<ClientDto> result = clientService.searchClientsByName("Test");

        // Then
        assertEquals(expectedDtos, result);
        verify(clientRepository).findByNameContainingIgnoreCase("Test");
        verify(clientMapper).clientsToClientDtos(clients);
    }
}
