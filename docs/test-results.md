# Test Cases and Validation Results

## Overview
- The backend includes unit and integration tests targeting controllers, services, and domain flows (invoice lifecycle, payment application, balance checks).
- Tests run against an H2 in-memory database under the `test` profile (`application-test.yml`) with `ddl-auto: create-drop` for isolation.

## Representative Test Suites
- `InvoicePaymentIntegrationTest`: Ensures recording payments updates invoice status and amounts; validates repository state.
- `InvoiceBalanceIntegrationTest`: Verifies balance calculations across invoice and payment aggregates.
- `InvoiceLifecycleIntegrationTest`: Exercises create → update → cancel → reinstate flows and checks transitions.
- `ClientControllerTest`, `InvoiceControllerTest`, `PaymentControllerTest`: REST-level tests including status codes and payload validation.

## How to Run Locally
```powershell
# Use bundled Maven if `mvn` is not on PATH
C:\Users\tanne\Gauntlet\Invoice\invoicing-api\apache-maven-3.9.4\bin\mvn.cmd -DskipTests=false -DskipITs=false clean verify
```

## Expected Output
- Successful build produces summary similar to:
```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Results:
[INFO] Tests run: 45, Failures: 0, Errors: 0, Skipped: 0
[INFO] -------------------------------------------------------
[INFO] BUILD SUCCESS
```

## Notes
- If you see compilation errors in MapStruct-generated classes, perform a clean build to regenerate sources.
- Ensure no dev servers lock the `target/` directory; stop them and retry if you encounter access errors on Windows.

## Latest Run Results (2025-11-10)

Backend (Maven Surefire)
- Command: `mvn -DskipTests=false -DskipITs=false clean verify`
- Summary: `Tests run: 104, Failures: 18, Errors: 16, Skipped: 1`
- Representative failures and errors:
  - `PaymentServiceImplTest` — multiple NullPointerExceptions and IllegalArgumentExceptions
    - NPE: `currentTotalPaid` null during payment recording; consider defaulting to `BigDecimal.ZERO`
    - NPE: `eventPublisher` null on reversed payment path; inject a mock or guard null
    - IllegalArgument: reversal amount exceeds amount paid; verify test setup vs domain rules
  - `InvoiceTest.testCalculateTotals` — assertion mismatch `expected: <25.00> but was: <25.000>`
    - Prefer `BigDecimal#compareTo` or formatting for equality
  - Integration tests receiving `401 Unauthorized` (e.g., `InvoiceBalanceIntegrationTest`, `PerformanceTest`)
    - Likely due to security filters active under `test` profile; options:
      - Disable security in `application-test.yml` (permitAll or mock security)
      - Inject test auth tokens/headers into WebMvc/WebTestClient requests
  - Controller tests with `NestedServletException` wrapping domain `ResourceNotFoundException`
    - Validate repository mocks and test data setup to ensure required entities exist

Artifacts
- Full logs saved at `invoicing-api/test-output.txt`
- Per-test reports in `invoicing-api/target/surefire-reports`

Frontend (Vitest)
- Command: `npm run test`
- Summary: No test files executed; `4 unhandled errors`
  - Error: `[vitest-pool]: Timeout starting forks runner`
  - Message: `Tests closed successfully but something prevents Vite server from exiting`
- Suggested fixes:
  - Add test files under `src/test` or `tests/e2e` for Vitest to discover
  - Run with `vitest --reporter=hanging-process` to identify hanging processes
  - Ensure Node and Vitest versions align; try `vitest --pool=threads` or `--pool=forks`

## Action Plan to Stabilize Tests
- Payments domain: initialize monetary fields to `BigDecimal.ZERO` and guard event publishing
- Invoice totals: assert via `compareTo` or format numbers consistently
- Security in tests: disable or mock authentication for test profile, or supply auth in tests
- Controller tests: seed repositories consistently or mock repository responses
- Frontend: author unit tests for key components and viewmodels, configure Vitest pool appropriately