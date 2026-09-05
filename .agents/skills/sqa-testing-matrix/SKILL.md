---
name: sqa-testing-matrix
description: >-
  Provides end-to-end SQA testing instructions, test setup, multi-layer verification procedures
  (Vitest, React Testing Library Fake DOM, API Route Handlers, Prisma DB constraints),
  and test report generation for feature test reports.
---

# SQA Multi-Layer Testing Skill

## Testing Layers

1. **Frontend Fake DOM (`tests/ui/*.test.tsx`)**:
   - Simulated DOM with `jsdom` + `@testing-library/react` + `@testing-library/user-event`.
   - Tests component rendering across states (empty, loading, populated, error).
   - Simulates user clicks, typing, keyboard navigation, and ARIA accessibility.
2. **API Route Endpoints (`tests/api/*.test.ts`)**:
   - Tests Next.js `POST`, `GET`, `PATCH`, `DELETE` route handlers.
   - Verifies HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`).
   - Validates JSON envelope shape (`ApiResponse<T>`) and Zod error formatting.
3. **Backend & Business Logic (`tests/unit/*.test.ts`)**:
   - Pure calculation functions (discounts, subtotals, shipping tiers, rating averages).
4. **Database & Integration (`tests/integration/*.test.ts`)**:
   - Prisma transactions, foreign keys, cascade rules, and atomic rollback verification.

---

## Running SQA Test Suites

```bash
# Run all tests
npm test

# Run specific UI / Fake DOM test
npx vitest run tests/ui/cart-drawer.test.tsx

# Run specific API route test
npx vitest run tests/api/cart-guest.test.ts

# Run with coverage
npx vitest run --coverage
```

---

## Test Report Format (`feature-test-reports/FEAT-XXX-test-report.md`)

When verifying a feature, generate a markdown report with the following structure:

```markdown
# SQA Test Report: [FEAT-XXX] — [Feature Name]
**Date**: [YYYY-MM-DD]  
**Target Layer**: [BE / FE / INT / Full-Stack]  
**Verdict**: **PASSED (100%)**

## 1. Traceability Matrix
| Acceptance Criterion | Automated Test File | Test Case Name | Result |
|---|---|---|---|
| [AC-1 description] | `tests/ui/...` | `it("...")` | PASS |
| [AC-2 description] | `tests/api/...` | `it("...")` | PASS |

## 2. Test Execution Summary
- **Frontend / Fake DOM**: X Passed, 0 Failed
- **API & Endpoint**: X Passed, 0 Failed
- **Backend / Unit Logic**: X Passed, 0 Failed
- **Database / Integration**: X Passed, 0 Failed

## 3. Edge Case & Boundary Verification
- [x] Null / empty state handled cleanly
- [x] Unauthorized role returns 401/403
- [x] Malformed input caught by Zod schema

## 4. Final SQA Sign-off
- [x] Zero failing tests
- [x] Zero console warnings / errors
- [x] TypeScript build clean (`npx tsc --noEmit`)
```
