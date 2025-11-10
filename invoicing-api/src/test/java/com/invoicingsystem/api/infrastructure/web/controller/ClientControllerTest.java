package com.invoicingsystem.api.infrastructure.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.invoicingsystem.api.application.command.CreateClientCommand;
import com.invoicingsystem.api.application.command.UpdateClientCommand;
import com.invoicingsystem.api.application.query.ClientDto;
import com.invoicingsystem.api.application.service.ClientService;
import com.invoicingsystem.api.domain.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ClientControllerTest {

    @Mock
    private ClientService clientService;

    @InjectMocks
    private ClientController clientController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private ClientDto testClientDto;
    private CreateClientCommand createCommand;
    private UpdateClientCommand updateCommand;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(clientController)
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        // Setup test data
        testClientDto = new ClientDto();
        testClientDto.setId("test-id");
        testClientDto.setName("Test Client");
        testClientDto.setEmail("test@example.com");
        testClientDto.setPhone("+1-555-123-4567");
        testClientDto.setAddress("123 Test St");
        testClientDto.setCreatedAt(LocalDateTime.now());
        testClientDto.setUpdatedAt(LocalDateTime.now());

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
    void getAllClients_ShouldReturnAllClients() throws Exception {
        // Given
        List<ClientDto> clients = Arrays.asList(testClientDto);
        when(clientService.getAllClients()).thenReturn(clients);

        // When & Then
        mockMvc.perform(get("/clients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("test-id")))
                .andExpect(jsonPath("$[0].name", is("Test Client")));

        verify(clientService).getAllClients();
    }

    @Test
    void getClientById_WhenClientExists_ShouldReturnClient() throws Exception {
        // Given
        when(clientService.getClientById("test-id")).thenReturn(testClientDto);

        // When & Then
        mockMvc.perform(get("/clients/test-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("test-id")))
                .andExpect(jsonPath("$.name", is("Test Client")));

        verify(clientService).getClientById("test-id");
    }

    @Test
    void getClientById_WhenClientDoesNotExist_ShouldReturnNotFound() throws Exception {
        // Given
        when(clientService.getClientById("non-existent")).thenThrow(new ResourceNotFoundException("Client", "id", "non-existent"));

        // When & Then
        mockMvc.perform(get("/clients/non-existent"))
                .andExpect(status().isNotFound());

        verify(clientService).getClientById("non-existent");
    }

    @Test
    void searchClientsByName_ShouldReturnMatchingClients() throws Exception {
        // Given
        List<ClientDto> clients = Arrays.asList(testClientDto);
        when(clientService.searchClientsByName("Test")).thenReturn(clients);

        // When & Then
        mockMvc.perform(get("/clients/search").param("name", "Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Test Client")));

        verify(clientService).searchClientsByName("Test");
    }

    @Test
    void createClient_WithValidData_ShouldCreateClient() throws Exception {
        // Given
        when(clientService.createClient(org.mockito.ArgumentMatchers.any(CreateClientCommand.class))).thenReturn(testClientDto);

        // When & Then
        mockMvc.perform(post("/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createCommand)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is("test-id")))
                .andExpect(jsonPath("$.name", is("Test Client")));

        verify(clientService).createClient(org.mockito.ArgumentMatchers.any(CreateClientCommand.class));
    }

    @Test
    void updateClient_WithValidData_ShouldUpdateClient() throws Exception {
        // Given
        when(clientService.updateClient(org.mockito.ArgumentMatchers.any(UpdateClientCommand.class))).thenReturn(testClientDto);

        // When & Then
        mockMvc.perform(put("/clients/test-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateCommand)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("test-id")));

        verify(clientService).updateClient(org.mockito.ArgumentMatchers.any(UpdateClientCommand.class));
    }

    @Test
    void updateClient_WithMismatchedIds_ShouldReturnBadRequest() throws Exception {
        // When & Then
        mockMvc.perform(put("/clients/wrong-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateCommand)))
                .andExpect(status().isBadRequest());

        verify(clientService, never()).updateClient(org.mockito.ArgumentMatchers.any(UpdateClientCommand.class));
    }

    @Test
    void deleteClient_WhenClientExists_ShouldDeleteClient() throws Exception {
        // Given
        doNothing().when(clientService).deleteClient(anyString());

        // When & Then
        mockMvc.perform(delete("/clients/test-id"))
                .andExpect(status().isNoContent());

        verify(clientService).deleteClient("test-id");
    }

    @Test
    void deleteClient_WhenClientDoesNotExist_ShouldReturnNotFound() throws Exception {
        // Given
        doThrow(new ResourceNotFoundException("Client", "id", "non-existent"))
                .when(clientService).deleteClient("non-existent");

        // When & Then
        mockMvc.perform(delete("/clients/non-existent"))
                .andExpect(status().isNotFound());

        verify(clientService).deleteClient("non-existent");
    }
}
