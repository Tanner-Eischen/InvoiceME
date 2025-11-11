# Technical Writeup

## Overview
- This repository implements a full invoicing flow across a Next.js frontend and a Spring Boot backend.
- The core value stream is: Client creation → Invoice creation with line items → Payment recording and status adjustment.
- Architecture follows Domain-Driven Design (DDD) with clear boundaries and a pragmatic CQRS split using command objects for writes and query DTOs for reads.

## DDD Boundaries
- Domain (`com.invoicingsystem.api.domain`)
  - Entities: `Client`, `Invoice`, `InvoiceItem`, `Payment`, `User` encapsulate core business data and invariants.
  - Repository interfaces: `ClientRepository`, `InvoiceRepository`, `PaymentRepository`, `UserRepository` are declared here and implemented by Spring Data JPA, keeping persistence abstractions at the domain boundary.
  - Domain exceptions capture business rule violations (`ResourceNotFoundException`, `DuplicateResourceException`, `BadRequestException`).

- Application (`com.invoicingsystem.api.application`)
  - Commands: `CreateClientCommand`, `UpdateClientCommand`, `CreateInvoiceCommand`, `RecordPaymentCommand`, `CreateUserCommand`, `LoginCommand` represent intent to change state.
  - Queries (DTOs): `ClientDto`, `InvoiceDto`, `PaymentDto`, `UserDto`, `JwtResponse` provide read models shaped for clients.
  - Services: Orchestrate use cases, enforce invariants, call repositories, and publish domain events where needed (e.g., `PaymentServiceImpl` uses `ApplicationEventPublisher`).
  - Mappers: MapStruct-based mappers (`ClientMapper`, `InvoiceMapper`, `PaymentMapper`, `UserMapper`) transform between domain entities and DTOs/commands.

- Infrastructure (`com.invoicingsystem.api.infrastructure`)
  - Web: REST controllers (`ClientController`, `InvoiceController`, `PaymentController`, `AuthController`, `UserController`) expose endpoints with Spring MVC.
  - Security: JWT utilities, filters, method-level security, profiles (`WebSecurityConfig`, `JwtAuthenticationFilter`, `JwtUtils`, `DevSecurityConfig`).
  - Config: Profiles (`dev`, `test`, `prod`), data seeding (`DataSeederConfig`) and bootstrapping.

## CQRS Implementation
- Write side: Commands are used by application services to change state. Services validate business rules, persist via repositories, and may publish events.
- Read side: DTOs optimized for client consumption are mapped from domain entities via MapStruct in application services.
- Separation is pragmatic (shared process boundary, split by intent), lowering complexity while keeping benefits of clear responsibilities.

## Value Stream Architecture (VSA)
- Streams are organized around core business capabilities: Clients, Invoices, Payments, Users.
- Each stream exposes its inputs (commands), outputs (query DTOs), and rules through application services; infrastructure binds streams to HTTP endpoints.
- This aligns modules with the real-world flow: create client → issue invoice → collect payment → update invoice/payment statuses and balances.

## Backend Technology Choices
- Spring Boot 3.x with Spring Web, Security, Data JPA, Validation.
- Persistence
  - `application.yml`: SQLite via `org.sqlite.JDBC` for local development.
  - Profiles:
    - `application-dev.yml`: H2 in-memory for quick dev boot.
    - `application-test.yml`: H2 in-memory (Postgres mode) with `ddl-auto: create-drop` for hermetic tests.
    - `application-prod.yml`: PostgreSQL.
- Mapping: MapStruct (`1.5.x`) for compile-time DTO/entity conversions.
- Lombok: Builders, immutability helpers, and boilerplate reduction.

## Frontend Technology Choices
- Next.js (App Router) with TypeScript.
- UI: shadcn/ui components, Tailwind CSS.
- State & viewmodels: `useClientViewModel`, `useInvoiceViewModel` to orchestrate data fetching and presentation logic.
- API client: `src/lib/api.ts` with an auth-aware `fetchWithAuth`, supporting mock fallback for offline demos.

## Database Schema (Conceptual)
- `users(id, email, password, role, created_at, updated_at)`
- `clients(id, name, email, phone, address, created_at, updated_at)`
- `invoices(id, number, client_id, issue_date, due_date, status, subtotal, tax_rate, tax_amount, total, amount_paid, notes, created_by_id, created_at, updated_at)`
- `invoice_items(id, invoice_id, description, quantity, unit_price, amount, created_at, updated_at)`
- `payments(id, invoice_id, amount, method, status, received_at, reference, created_at, updated_at)`
- Relationships: `clients 1..n invoices`; `invoices 1..n invoice_items`; `invoices 1..n payments`.

## Design Decisions
- DDD boundaries ensure domain purity and a clear separation between application orchestration and infrastructure concerns.
- CQRS is used pragmatically to decouple write intent and read projections, improving maintainability and testability.
- Profiles allow easy environment switching: fast dev/test, and robust production with Postgres.
- MapStruct provides safe, fast, and maintainable mapping, reducing runtime errors.
- Frontend viewmodels abstract data orchestration and keep React components focused on rendering.

## Deployment & Environments
- Local dev: `sqlite` or `h2` profiles; frontend runs with `npm run dev`, backend with `spring-boot:run` or `java -jar`.
- CI: Build and test backend via Maven; lint and test frontend via Node scripts. Workflow file in `.github/workflows/ci.yml`.