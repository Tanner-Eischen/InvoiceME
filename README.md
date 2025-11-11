# Enterprise Invoicing System

A production-quality ERP-style invoicing system built with modern software architecture principles: Domain-Driven Design (DDD), Command Query Responsibility Segregation (CQRS), and Vertical Slice Architecture.

## Architecture

This project is structured as a full-stack application with:

- **Backend**: Java with Spring Boot RESTful APIs
- **Frontend**: TypeScript with Next.js (MVVM pattern)
- **Database**: SQLite for development (can be switched to PostgreSQL for production)
- **Cloud-Ready**: Deployable to AWS or Azure

### Key Architecture Principles Demonstrated

#### Domain-Driven Design (DDD)
- Core domain entities with rich behavior
- Bounded contexts for different business capabilities
- Ubiquitous language throughout the codebase
- Aggregates, value objects, and repositories pattern

#### Command Query Responsibility Segregation (CQRS)
- Separation of read (query) and write (command) operations
- Commands for state changes (create, update, delete)
- Queries for data retrieval
- Different models optimized for read and write operations

#### Clean Architecture (Layered Boundaries)
- Domain: Entities and business rules (`invoicing-api/src/main/java/.../domain`)
- Application: Use cases, services, and mappers (`.../application`)
- Infrastructure: Controllers, persistence, configuration (`.../infrastructure`)
- Frontend MVVM: Models, ViewModels, Views (`invoicing-system/src/...`)

#### Vertical Slice Architecture
- Features organized vertically rather than by technical layers
- Each feature contains all necessary components across all layers
- Reduced coupling between features
- Easier to understand and modify individual features

#### MVVM (Model-View-ViewModel) on Frontend
- Model: Domain entities
- View: React components
- ViewModel: Mediator connecting views to models with business logic

## Documentation
- Technical Writeup: `docs/technical-writeup.md`
- Demo Script: `docs/demo-script.md`
- AI Tooling Documentation: `docs/ai-tools.md`
- Test Cases and Validation Results: `docs/test-results.md`

## Project Structure

### Frontend

The authoritative frontend code is located in the `invoicing-system/` directory.

### Backend (Spring Boot)

```
/invoicing-api
  /src/main/java/com/invoicingsystem/api
    /application                   # Application layer with commands and queries
      /command                     # Command objects representing user intents
      /query                       # Data transfer objects for queries
      /service                     # Service implementations for application logic
      /mapper                      # Object mappers for entity-DTO conversion
    /domain                        # Domain layer with rich business logic
      /model                       # Domain entities with business behavior
      /repository                  # Data access interfaces
      /exception                   # Domain-specific exceptions
    /infrastructure                # Technical infrastructure
      /config                      # Configuration classes
      /security                    # Authentication and authorization
      /web                         # Web-specific components
        /controller                # REST API controllers
```

### Frontend (Next.js with MVVM)

```
/invoicing-system
  /src
    /models                        # Domain models
    /viewmodels                    # ViewModels for connecting views to data
    /components                    # React components organized by feature
      /clients                     # Client-related components
      /invoices                    # Invoice-related components
      /dashboard                   # Dashboard components
      /layout                      # Shared layout components
    /lib                           # Utilities and services
    /app                           # Next.js app router pages

### Alignment with InvoiceMe Assessment

- Core Entities: Customers, Invoices, Payments implemented across backend and frontend.
- CQRS: Commands (`RecordPaymentCommand`, `UpdateInvoiceStatusCommand`) and queries (service/repository getters) are separated.
- Vertical Slices: Feature-first structure for Payments and Invoices (controllers, services, mappers per slice).
- DTOs & Mappers: Explicit DTOs with `InvoiceMapper` and `PaymentMapper` for boundary crossing.
- Lifecycle: Invoice transitions Draft → Sent → Paid, with balance logic and line items modeled (`InvoiceItem`).
- Authentication: Basic frontend auth utilities included; backend security can be enabled via Spring Security.
- Testing: Unit and controller tests exist; integration test coverage to be expanded for end-to-end flows.

#### Known Alignments and Fixes
- Enum standardization: Backend uses `InvoiceStatus.CANCELED`. Tests updated to use `CANCELED`.
- Payment statuses aligned to `PENDING`, `COMPLETED`, `REVERSED` across UI and models.

#### Next Steps to Fully Meet Specs
- Add Spring Security with in-memory users and protect API routes.
- Implement domain events (e.g., `PaymentRecorded`, `InvoiceFullyPaid`) for richer DDD signaling.
- Expand integration tests: customer → invoice → send → record payment → status Paid (under 200ms locally).
- Switch DB to PostgreSQL for production readiness; keep SQLite for dev/tests.
```

## Getting Started

### Local Quick Start

Run backend on port 8081 (dev profile) and frontend on port 3002 pointing to the backend:

Backend (use system Maven):
- Linux/macOS: `mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dserver.port=8081`
- Windows (PowerShell): `mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dserver.port=8081`

Windows fallback (if `mvn` is not recognized):
- From repository root (PowerShell):
  ```powershell
  cd .\invoicing-api
  & .\apache-maven-3.9.4\bin\mvn.cmd spring-boot:run -Dspring-boot.run.profiles=dev -Dserver.port=8081
  ```
  Or, stay at repo root and point to the backend `pom.xml`:
  ```powershell
  & .\invoicing-api\apache-maven-3.9.4\bin\mvn.cmd -f .\invoicing-api\pom.xml spring-boot:run -Dspring-boot.run.profiles=dev -Dserver.port=8081
  ```
  Note: Ensure JDK 17 is installed and `JAVA_HOME` is set.

PowerShell-safe options (fixes "Unknown lifecycle phase" from argument parsing):
- Move `-D` properties before the goal:
  ```powershell
  & .\invoicing-api\apache-maven-3.9.4\bin\mvn.cmd -f .\invoicing-api\pom.xml -Dspring-boot.run.profiles=dev -Dserver.port=8081 spring-boot:run
  ```
- Quote the `-D` properties so PowerShell treats them as literals:
  ```powershell
  & .\invoicing-api\apache-maven-3.9.4\bin\mvn.cmd -f .\invoicing-api\pom.xml spring-boot:run "-Dspring-boot.run.profiles=dev" "-Dserver.port=8081"
  ```
- Alternative: package then run the jar (avoids Maven argument parsing):
  ```powershell
  & .\invoicing-api\apache-maven-3.9.4\bin\mvn.cmd -f .\invoicing-api\pom.xml clean package
  java -jar .\invoicing-api\target\invoicing-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev --server.port=8081
  ```

Absolute-path invocation (if relative path fails):
```powershell
& 'C:\Users\tanne\Gauntlet\Invoice\invoicing-api\apache-maven-3.9.4\bin\mvn.cmd' -f 'C:\Users\tanne\Gauntlet\Invoice\invoicing-api\pom.xml' -Dspring-boot.run.profiles=dev -Dserver.port=8081 spring-boot:run
```

Temporary PATH add (then use `mvn` normally):
```powershell
$env:PATH = "$PWD\invoicing-api\apache-maven-3.9.4\bin;$env:PATH"
mvn -v
mvn -f .\invoicing-api\pom.xml -Dspring-boot.run.profiles=dev -Dserver.port=8081 spring-boot:run
```

Frontend (PowerShell):
```
$env:NEXT_PUBLIC_API_BASE_URL='http://localhost:8081/api'; npm run dev -- -p 3002
```
Frontend (bash):
```
NEXT_PUBLIC_API_BASE_URL='http://localhost:8081/api' npm run dev -- -p 3002
```

### Backend Setup

1. Navigate to the backend project directory:
   ```bash
   cd invoicing-api
   ```

2. Build the project with Maven:
   - Linux/macOS:
     ```bash
     mvn clean install
     ```
   - Windows:
     ```powershell
     mvn clean install
     ```

3. Run the Spring Boot application:
   - Default (port 8080):
     ```bash
     mvn spring-boot:run
     ```
   - Dev profile on port 8081:
     - Linux/macOS:
       ```bash
       mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dserver.port=8081
       ```
     - Windows (PowerShell):
       ```powershell
       mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dserver.port=8081
       ```

The API will be available at `http://localhost:8080/api` (default) or `http://localhost:8081/api` (dev profile).

### Frontend Setup

1. Navigate to the frontend project directory:
   ```bash
   cd invoicing-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server (point to your backend):
   - PowerShell:
     ```powershell
     $env:NEXT_PUBLIC_API_BASE_URL='http://localhost:8081/api'; npm run dev -- -p 3002
     ```
   - bash:
     ```bash
     NEXT_PUBLIC_API_BASE_URL='http://localhost:8081/api' npm run dev -- -p 3002
     ```

The web application will be available at `http://localhost:3002`.

## API Documentation

The REST API includes the following endpoints:

- **Authentication**:
  - `POST /api/auth/login` - Authenticate user
  - `POST /api/auth/register` - Register new user

- **Clients**:
  - `GET /api/clients` - List all clients
  - `GET /api/clients/{id}` - Get client by ID
  - `POST /api/clients` - Create new client
  - `PUT /api/clients/{id}` - Update client
  - `DELETE /api/clients/{id}` - Delete client

- **Invoices**:
  - `GET /api/invoices` - List all invoices
  - `GET /api/invoices/{id}` - Get invoice by ID
  - `GET /api/invoices/client/{clientId}` - Get invoices by client
  - `GET /api/invoices/status/{status}` - Get invoices by status
  - `GET /api/invoices/overdue` - Get overdue invoices
  - `POST /api/invoices` - Create new invoice
  - `PUT /api/invoices/{id}` - Update invoice
  - `PATCH /api/invoices/{id}/status` - Update invoice status
  - `DELETE /api/invoices/{id}` - Delete invoice

## Database Configuration

The project uses SQLite by default for development. To switch to PostgreSQL for production:

1. Update the database configuration in `application.yml`
2. Add PostgreSQL dependency to `pom.xml`
3. Update connection properties for your environment

## Deployment

The project is ready for deployment to cloud platforms:

- **AWS**: Configure with Elastic Beanstalk or ECS
- **Azure**: Deploy with Azure App Service

## License

MIT
