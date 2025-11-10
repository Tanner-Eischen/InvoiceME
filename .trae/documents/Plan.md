Scope & Goals

- Align backend with DDD/CQRS, complete Invoice lifecycle and Payment domain.
- Integrate frontend (MVVM) with backend APIs, remove mock defaults.
- Achieve required test coverage, integration tests, and CI quality gates.
- Ship deployment artifacts and performance baselines that meet standards.
- Document architecture and AI tool usage per the requirements.
Phase Plan

- Phase 1 — Foundations (Week 1)
  
  - Clarify domain nomenclature: unify Client vs Customer across backend and frontend.
  - Add missing Payment domain and invoice balance logic.
  - Lock down invoice lifecycle transitions with validation and enforcement.
  - Acceptance: Completed Payment entity, repository, service, endpoints; invoice balance computed from items/payments; status transitions enforced; docs updated.
- Phase 2 — Frontend Integration (Week 2)
  
  - Connect Next.js MVVM to backend; disable mock API default.
  - Resolve duplicated frontend ( invoicing-system vs root src ); keep one authoritative app.
  - Acceptance: USE_MOCK_API=false by default, NEXT_PUBLIC_API_BASE_URL used; UI flows function against backend; duplicate app archived/removed.
- Phase 3 — Testing & Quality (Week 3)
  
  - Backend integration tests for core flows and security; frontend tests for invoice/client flows.
  - Add CI gates for coverage and linting; define minimum thresholds.
  - Acceptance: Backend integration tests for auth, invoice CRUD, payments; coverage thresholds enforced in CI; frontend unit and component tests for main flows.
- Phase 4 — Performance & Observability (Week 4)
  
  - Enable metrics via Spring Actuator/Micrometer; define performance baselines.
  - Add synthetic tests (k6) to exercise key endpoints and collect latency.
  - Acceptance: /actuator metrics exposed; k6 scripts in repo; baseline report checked into docs.
- Phase 5 — Deployment Readiness (Week 4)
  
  - Create Dockerfiles and Docker Compose for full stack; add cloud deployment notes.
  - Acceptance: docker-compose up runs API + DB + frontend; deployment docs including environment, secrets, and rollout steps.
Backend Enhancements

- Payment Domain
  
  - Entity: Payment { id, invoiceId, amount, method, status, receivedAt, reference } .
  - Repository: PaymentRepository with findByInvoiceId .
  - Service: PaymentService to record, update, list payments; validate against invoice totals.
  - Endpoints:
    - POST /api/payments (record payment)
    - GET /api/payments/invoice/{invoiceId} (list payments for invoice)
    - PUT /api/payments/{id} (update payment)
  - Invariants:
    - sum(payments) <= invoice.total
    - Payment status transitions: PENDING -> COMPLETED -> REVERSED with audit.
  - Acceptance: Overpayment prevented, partial payments tracked, reversal supported.
- Invoice Balance & Lifecycle
  
  - Invoice fields: subtotal , tax , total , amountPaid , balance .
  - Methods: applyPayment(payment) , recalculateTotals() .
  - Lifecycle transitions (allowed):
    - DRAFT -> SENT -> PARTIALLY_PAID -> PAID -> CANCELLED
    - OVERDUE computed state if dueDate passed and balance > 0 .
  - Enforcement: Reject invalid jumps (e.g., DRAFT -> PAID without payments).
  - Acceptance: Transition rules enforced; balance updates correctly on payments.
- CQRS & Validation
  
  - Keep CreateInvoiceCommand , UpdateInvoiceCommand , UpdateInvoiceStatusCommand ; add RecordPaymentCommand .
  - Add validation: invoice item amount calculation centralized; DTO validation via @Valid .
  - Acceptance: Commands/queries remain separated; DTO validation covers required fields.
- Security & Roles
  
  - Review role restrictions: DELETE invoice admin-only; ensure payment endpoints require authenticated users; audit via @PreAuthorize .
  - Acceptance: Proper authorization on sensitive endpoints with tests.
Frontend Integration (MVVM)

- API Client
  
  - Default to backend: USE_MOCK_API=false .
  - Read base URL from NEXT_PUBLIC_API_BASE_URL .
  - Add payment API methods: recordPayment , listPaymentsByInvoice .
  - Error handling consistent, token persisted via AuthViewModel .
- UI & ViewModels
  
  - InvoiceViewModel : expose payInvoice (partial and full payment).
  - Update invoice pages to show balance , amountPaid , payment history.
  - Disable actions when invalid (e.g., no payments for PAID invoices).
  - Acceptance: User can record payments; UI reflects lifecycle and balances.
- Resolve Duplication
  
  - Keep authoritative frontend at invoicing-system/ .
  - Migrate or archive root src/ (e.g., move to legacy-frontend/ with note).
  - Acceptance: Single frontend uses backend; no duplicate code paths.
Testing & CI

- Backend Integration Tests
  
  - AuthControllerIntegrationTest : login/register with JWT issued.
  - InvoiceControllerIntegrationTest : create/update/status transitions; totals recompute.
  - PaymentControllerIntegrationTest : record payment, prevent overpayment, list payments; lifecycle moves to PARTIALLY_PAID/PAID .
  - SecurityIntegrationTest : auth required for non-permitted endpoints; role gating.
  - Acceptance: Tests pass in H2 profile; coverage ≥ 80% for application/infrastructure.
- Frontend Tests
  
  - Add invoice flow tests (list, view, create, update status).
  - Add payment UI tests (record payment, update balance).
  - Acceptance: Vitest coverage ≥ 70% for viewmodels/components; CI-green.
- CI Pipeline
  
  - Lint, unit tests, integration tests; coverage gates.
  - Build front and back; artifact outputs.
  - Acceptance: CI fails under thresholds; badges in README.
Performance & Observability

- Metrics
  
  - Enable /actuator/metrics , health , prometheus .
  - Instrument endpoints: timers for invoice and payment operations.
  - Acceptance: Metrics visible; sample scrape working locally.
- Load Testing
  
  - k6 scripts simulating: login, invoice list, create invoice, record payment.
  - Baselines: p95 latency (<200ms for reads, <400ms for writes), error rate <1%.
  - Acceptance: Baseline report committed; improvements tracked over time.
Deployment

- Containers
  
  - Dockerfile for backend (JDK build + JRE run), frontend (Next.js build).
  - docker-compose.yml with api , db (Postgres), frontend .
  - Acceptance: docker-compose up serves app locally.
- Cloud Guidance
  
  - Provide deployment docs for AWS (ECS/ECR + RDS) and Netlify/Vercel for frontend.
  - Secrets via environment or secret manager.
  - Acceptance: Step-by-step docs with env examples and health checks.
Documentation Updates

- Architecture
  
  - Update architecture-diagram.md with Payment flows and lifecycle.
  - Document DDD aggregates: Invoice aggregate, Payment as entity tied to Invoice .
  - Acceptance: Diagrams match implementation; references included.
- Requirements Mapping
  
  - Create section mapping implementation to requirements:
    - DDD/CQRS compliance.
    - Security and roles.
    - Functional (Invoices, Payments, Clients).
    - Testing thresholds and CI.
    - Performance metrics and targets.
    - AI tool usage process.
- AI Tool Utilization
  
  - Define usage policy per -4.3 AI Tool Utilization :
    - Use AI to scaffold boilerplate, generate tests, and assist code reviews.
    - Require human verification for security-sensitive code and domain logic.
    - Track AI-generated code in PR template.
  - Acceptance: Policy added to repository docs; PR template updated.
Acceptance Criteria Summary

- Backend: Payment domain complete with invariants; invoice lifecycle enforced; tests present.
- Frontend: Connected to backend; payment flows available; duplication resolved.
- Quality: CI with coverage gates; performance baseline documented; metrics enabled.
- Deployment: Dockerized; compose works locally; cloud deployment guide available.
- Docs: Architecture and requirement mapping updated; AI tool policy defined.