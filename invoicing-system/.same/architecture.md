# Invoicing System Architecture

## Overview
This document outlines the architecture for a small, production-quality ERP-style invoicing system, built with a focus on Domain-Driven Design (DDD), Command Query Responsibility Segregation (CQRS), and Vertical Slice Architecture principles.

## Tech Stack
- **Framework**: Next.js (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Database**: SQLite with Drizzle ORM (for simplicity in this demo)
- **Authentication**: NextAuth.js
- **Form Handling**: react-hook-form with zod validation

## Domain-Driven Design (DDD)
Our application is structured around the core business domains:

### Bounded Contexts
1. **Invoicing Context**:
   - Aggregates: Invoice, InvoiceItem
   - Value Objects: InvoiceStatus, InvoiceNumber
   - Domain Events: InvoiceCreated, InvoiceUpdated, InvoicePaid

2. **Client Context**:
   - Aggregates: Client
   - Value Objects: ClientId, ContactInfo
   - Domain Events: ClientCreated, ClientUpdated

3. **User Context**:
   - Aggregates: User
   - Value Objects: UserId, Role
   - Domain Events: UserLoggedIn, UserCreated

### Ubiquitous Language
- **Invoice**: A document requesting payment from a client
- **Client**: A customer who receives invoices
- **Payment**: A transaction that satisfies an invoice
- **User**: Someone who uses the system to manage invoices

## CQRS (Command Query Responsibility Segregation)
We'll implement CQRS by separating commands (write operations) from queries (read operations):

### Commands
- CreateInvoice
- UpdateInvoice
- DeleteInvoice
- CreateClient
- UpdateClient
- DeleteClient
- MarkInvoicePaid

### Queries
- GetInvoices
- GetInvoiceById
- GetClients
- GetClientById
- GetInvoicesByClient
- GetUnpaidInvoices
- GetOverdueInvoices

## Vertical Slice Architecture
Each feature (vertical slice) will contain all the necessary components (UI, validation, business logic, data access) required to implement that feature, organized in directories by feature rather than technical concerns.

### Feature Organization
```
src/
  features/
    invoices/
      create/
        page.tsx
        CreateInvoiceForm.tsx
        createInvoice.action.ts
        createInvoice.validator.ts
      list/
        page.tsx
        InvoiceList.tsx
        getInvoices.query.ts
      [id]/
        page.tsx
        InvoiceDetails.tsx
        getInvoice.query.ts
        updateInvoice.action.ts
    clients/
      create/
        ...
      list/
        ...
      [id]/
        ...
    dashboard/
      page.tsx
      RecentInvoices.tsx
      UnpaidInvoices.tsx
      OverdueInvoices.tsx
```

## Folder Structure
```
/invoicing-system
  /src
    /app
      /api
        /auth
        /invoices
        /clients
      /dashboard
      /invoices
      /clients
      /settings
    /components
      /ui          (shadcn components)
      /invoices    (reusable invoice components)
      /clients     (reusable client components)
      /shared      (shared UI components)
    /features      (vertical slices)
    /domain        (domain models)
      /invoices
      /clients
      /users
    /lib           (utilities and shared code)
      /auth
      /db
      /validation
    /hooks         (custom React hooks)
```

## Data Model

### Clients
- id: string (primary key)
- name: string
- email: string
- phone: string (optional)
- address: string
- createdAt: Date
- updatedAt: Date

### Invoices
- id: string (primary key)
- number: string (unique)
- clientId: string (foreign key to Clients)
- issueDate: Date
- dueDate: Date
- status: enum ('draft', 'sent', 'paid', 'overdue', 'canceled')
- subtotal: number
- taxRate: number (optional)
- taxAmount: number
- total: number
- notes: string (optional)
- createdAt: Date
- updatedAt: Date

### Invoice Items
- id: string (primary key)
- invoiceId: string (foreign key to Invoices)
- description: string
- quantity: number
- unitPrice: number
- amount: number
- createdAt: Date
- updatedAt: Date

### Users
- id: string (primary key)
- name: string
- email: string (unique)
- password: string (hashed)
- role: enum ('admin', 'user')
- createdAt: Date
- updatedAt: Date

## Implementation Roadmap
1. Setup database with Drizzle ORM
2. Implement authentication
3. Implement client features
4. Implement invoice features
5. Implement dashboard
6. Add PDF generation for invoices
7. Implement email sending capabilities
8. Add settings and user management
9. Add tests and final polish
