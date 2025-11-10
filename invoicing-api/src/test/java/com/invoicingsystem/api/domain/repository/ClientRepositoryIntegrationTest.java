package com.invoicingsystem.api.domain.repository;

import com.invoicingsystem.api.domain.model.Client;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class ClientRepositoryIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ClientRepository clientRepository;

    @Test
    void findByEmail_ShouldReturnClient_WhenEmailExists() {
        // Given
        Client client = createTestClient();
        entityManager.persist(client);
        entityManager.flush();

        // When
        Optional<Client> found = clientRepository.findByEmail(client.getEmail());

        // Then
        assertTrue(found.isPresent());
        assertEquals(client.getId(), found.get().getId());
        assertEquals(client.getName(), found.get().getName());
    }

    @Test
    void findByEmail_ShouldReturnEmpty_WhenEmailDoesNotExist() {
        // When
        Optional<Client> found = clientRepository.findByEmail("nonexistent@example.com");

        // Then
        assertTrue(found.isEmpty());
    }

    @Test
    void findByNameContainingIgnoreCase_ShouldReturnMatchingClients() {
        // Given
        Client client1 = createTestClient();
        client1.setName("Company ABC");

        Client client2 = createTestClient();
        client2.setName("ABC Corporation");

        Client client3 = createTestClient();
        client3.setName("XYZ Ltd");

        entityManager.persist(client1);
        entityManager.persist(client2);
        entityManager.persist(client3);
        entityManager.flush();

        // When
        List<Client> results = clientRepository.findByNameContainingIgnoreCase("abc");

        // Then
        assertEquals(2, results.size());
        assertTrue(results.stream().anyMatch(c -> c.getId().equals(client1.getId())));
        assertTrue(results.stream().anyMatch(c -> c.getId().equals(client2.getId())));
        assertFalse(results.stream().anyMatch(c -> c.getId().equals(client3.getId())));
    }

    @Test
    void existsByEmail_ShouldReturnTrue_WhenEmailExists() {
        // Given
        Client client = createTestClient();
        entityManager.persist(client);
        entityManager.flush();

        // When
        boolean exists = clientRepository.existsByEmail(client.getEmail());

        // Then
        assertTrue(exists);
    }

    @Test
    void existsByEmail_ShouldReturnFalse_WhenEmailDoesNotExist() {
        // When
        boolean exists = clientRepository.existsByEmail("nonexistent@example.com");

        // Then
        assertFalse(exists);
    }

    private Client createTestClient() {
        Client client = new Client();
        client.setId(UUID.randomUUID().toString());
        client.setName("Test Client");
        client.setEmail(UUID.randomUUID().toString() + "@example.com");
        client.setPhone("+1-555-123-4567");
        client.setAddress("123 Test St");
        client.setCreatedAt(LocalDateTime.now());
        client.setUpdatedAt(LocalDateTime.now());
        return client;
    }
}
