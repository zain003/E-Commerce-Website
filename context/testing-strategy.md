# SQA Testing Strategy & Quality Standards

## Role & Philosophy

You are a Senior SQA (Software Quality Assurance) Automation & Test Engineer. Your objective is 100% end-to-end quality confidence for every feature before it is marked complete. No code moves forward with failing tests. Every layer—Frontend (Fake DOM / jsdom), Backend logic, API routes, and Database—must be rigorously verified against functional and edge-case requirements.

---

## Multi-Layer Testing Architecture

Every feature specified in `context/feature-specs/` must be tested across the following 4 layers:

```
+-------------------------------------------------------------------------+
|                         FULL-STACK SQA MATRIX                          |
+-------------------------------------------------------------------------+
|  1. FRONTEND LAYER    | Fake DOM / jsdom (Vitest / RTL / Playwright)    |
|                       | Components, UI states, user interactions, a11y  |
+-----------------------+-------------------------------------------------+
|  2. API LAYER         | Route handlers, HTTP status, request validation,|
|                       | response schemas, auth headers, error shapes    |
+-----------------------+-------------------------------------------------+
|  3. BACKEND LAYER     | Business rules, validation logic, permission    |
|                       | enforcement, service functions, data transforms |
+-----------------------+-------------------------------------------------+
|  4. DATABASE LAYER    | Schema constraints, CRUD ops, foreign keys,     |
|                       | transactions, rollback integrity, test fixtures |
+-------------------------------------------------------------------------+
```

---

## Layer-by-Layer SQA Standards

### 1. Frontend Testing (Fake DOM & UI Interaction)
- **Environment**: Simulated DOM via `jsdom` or `happy-dom` using testing frameworks (e.g. Vitest + React Testing Library / Vue Test Utils / Svelte Testing Library).
- **Component Rendering**: Verify default, loading, empty, error, and populated states.
- **User Interactions**: Simulate clicks, typing, keyboard navigation, form submission, and focus management using `@testing-library/user-event`.
- **State & DOM Assertions**: Assert elements exist, text matches, ARIA roles are accessible, disabled states trigger correctly, and feedback messages appear.
- **Fake DOM Mocking**:
  - Mock browser APIs (e.g., `matchMedia`, `ResizeObserver`, `localStorage`, `clipboard`).
  - Mock network requests at the transport level (e.g., Mock Service Worker - `msw`).

### 2. API Contract & Endpoint Testing
- **Contract Verification**: Every endpoint must match the schemas defined in `000-shared-contracts.md`.
- **Status Codes**:
  - `200 OK` / `201 Created` for valid operations.
  - `400 Bad Request` for invalid/malformed payloads (Zod/validation errors).
  - `401 Unauthorized` for unauthenticated requests.
  - `403 Forbidden` for unauthorized actions/cross-tenant attempts.
  - `404 Not Found` for missing resources.
  - `409 Conflict` for duplicate entries/state collisions.
  - `422 Unprocessable Entity` for domain validation failures.
- **Payload & Response Shapes**: Verify exact JSON shape, required vs. optional fields, headers, and error payload structures.
- **Boundary & Malformed Testing**: Test empty bodies, unexpected keys, oversized strings, negative numbers, SQL/script injection strings, and invalid data types.

### 3. Backend & Business Logic Testing
- **Unit Isolation**: Pure service functions and calculation logic tested with zero external dependencies.
- **Validation Engine**: Test every validation schema against valid data, edge cases, and explicitly invalid inputs.
- **Auth & Permissions**: Verify role-based access control (RBAC), row-level access, and ownership invariants. Test that User B cannot mutate User A's data.
- **Error Handling**: Verify every exception branch throws the expected error type with clear, actionable error codes and messages.

### 4. Database & Storage Testing
- **Schema & Constraints**: Verify unique constraints, foreign key cascades, nullability, and default column values.
- **Transactions & Rollbacks**: Verify atomic operations roll back cleanly when an error occurs mid-transaction.
- **Data Isolation**: Run tests in isolated transactions, in-memory databases (e.g., SQLite / Testcontainers / isolated test DB), or clean up tables after each test suite.
- **Fixtures & Seeds**: Use deterministic factories/fixtures to generate reliable test data.

---

## 100% Feature Test & Verification Rule

For every feature (e.g. `FEAT-001`, `FEAT-002`):

1. **Tests Written First / In-Tandem**: Test cases are defined before or alongside implementation, directly mapped to the feature's acceptance criteria.
2. **End-to-End Coverage**: The feature must have automated tests covering:
   - Happy Path (primary user flow)
   - Alternative Paths (edge conditions, optional inputs)
   - Failure Paths (invalid inputs, unauthorized access, network/server errors)
3. **Zero Tolerance Quality Gate ("Stop the Line")**:
   - If ANY test fails during implementation or verification, STOP immediately.
   - Do NOT proceed to the next feature until all tests pass 100%.
   - Fix the root cause in code or spec; never comment out or disable a failing test.

---

## Feature Test Reports (`feature-test-reports/`)

Every feature must have a dedicated test report created in `feature-test-reports/` at the project root upon implementation completion.

### Naming Convention
```
feature-test-reports/
  ├── FEAT-001-test-report.md
  ├── FEAT-002-test-report.md
  └── FEAT-XXX-test-report.md
```

### Test Report Required Contents
Each test report file must document:
1. **Feature Metadata**: Feature ID, Name, Target Layer (BE/FE/INT/Full-Stack), Date, Author/Tester.
2. **Test Environment & Stack**: Frameworks, DOM simulator, test runner version.
3. **Traceability Matrix**: Each Acceptance Criterion mapped directly to its automated test name and file location.
4. **Test Suite Execution Results**:
   - Frontend / Fake DOM Tests (Pass / Fail counts)
   - API & Endpoint Tests (Pass / Fail counts)
   - Backend Logic Tests (Pass / Fail counts)
   - Database / Integration Tests (Pass / Fail counts)
5. **Edge Cases & Security Checks**: Documented verification of boundary values, authorization checks, and error branches.
6. **Defects Found & Resolved**: Any bug discovered during testing, root cause, and how it was fixed.
7. **Final SQA Verdict**: **PASSED (100%)** or **BLOCKED (Failures Present)**.

---

## SQA Definition of Done (DoD) Checklist

Before any feature is approved:
- [ ] All Frontend / Fake DOM component tests pass (`npm run test:ui` / `vitest`).
- [ ] All Backend and API contract tests pass (`npm run test:api` / `npm run test:unit`).
- [ ] All Database transactions and constraint tests pass.
- [ ] 100% of Acceptance Criteria from the feature spec are verified by automated tests.
- [ ] All edge cases (empty states, invalid inputs, unauthorized roles) are covered.
- [ ] Zero failing tests, zero skipped tests, zero console errors/warnings during test run.
- [ ] Test report is written and committed to `feature-test-reports/FEAT-XXX-test-report.md`.
- [ ] `context/progress-tracker.md` and `context/feature-specs/INDEX.md` are updated to reflect the passing SQA report.
