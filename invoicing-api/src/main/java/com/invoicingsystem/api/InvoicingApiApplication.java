package com.invoicingsystem.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class InvoicingApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(InvoicingApiApplication.class, args);
    }
}
