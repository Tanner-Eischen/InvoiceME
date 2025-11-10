package com.invoicingsystem.api.infrastructure.performance;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PerformanceTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void actuatorHealthRespondsUnder200ms() throws Exception {
        long start = System.nanoTime();
        mockMvc.perform(MockMvcRequestBuilders.get("/api/actuator/health"))
                .andExpect(MockMvcResultMatchers.status().isOk());
        long end = System.nanoTime();
        long elapsedMs = (end - start) / 1_000_000;
        assertThat(elapsedMs).isLessThan(200);
    }
}