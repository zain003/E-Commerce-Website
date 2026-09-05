# FEAT-007-VERIFY — Orders Verification Pass
**Files being verified**: `FEAT-007-BE-orders.md`, `FEAT-007-FE-orders.md`

## 1. Test Suite Execution & SQA Matrix
Run all automated test suites across layers:
- **Frontend / Fake DOM**: `npm run test:ui -- tests/ui/order-receipt.test.tsx tests/ui/order-status-badge.test.tsx tests/ui/order-history-list.test.tsx`
- **API Endpoints**: `npm run test:api -- tests/api/order-detail.test.ts tests/api/account-order-history.test.ts`
- **Backend & Unit**: `npm run test:unit -- tests/unit/order-access-control.test.ts`

## 2. Acceptance Criteria Checklist
- [ ] Querying with matching `orderNumber` and valid auth session returns complete order object.
- [ ] Attempting to access an order belonging to another user without valid guest email returns HTTP `403 FORBIDDEN`.
- [ ] Customer order history returns orders sorted in descending order of `createdAt`.
- [ ] Confirmation page displays correct order number, purchased item images, quantities, and totals.
- [ ] Order status reflects accurate state with matching visual badge.
- [ ] Customer order history shows empty state with shopping button when 0 orders exist.
- [ ] Printable stylesheet formatting applies when user prints receipt.

## 3. SQA Definition of Done Checklist
- [ ] All tests passing 100%.
- [ ] SQA Test Report written and saved to `feature-test-reports/FEAT-007-test-report.md`.
- [ ] `context/feature-specs/INDEX.md` status updated for FEAT-007.

## 4. Failure Protocol
If any failure occurs, diagnose root cause, resolve immediately, and re-run all test suites.
