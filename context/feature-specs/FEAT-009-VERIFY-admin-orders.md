# FEAT-009-VERIFY — Admin Orders Verification Pass
**Files being verified**: `FEAT-009-BE-admin-orders.md`, `FEAT-009-FE-admin-orders.md`

## 1. Test Suite Execution & SQA Matrix
Run all automated test suites across layers:
- **Frontend / Fake DOM**: `npm run test:ui -- tests/ui/admin-metrics-cards.test.tsx tests/ui/admin-order-table.test.tsx tests/ui/admin-status-dropdown.test.tsx`
- **API Endpoints**: `npm run test:api -- tests/api/admin-orders-auth.test.ts tests/api/admin-order-status-transition.test.ts`
- **Backend & Unit**: `npm run test:unit -- tests/unit/admin-metrics-calc.test.ts`

## 2. Acceptance Criteria Checklist
- [ ] Admin can retrieve paginated orders filtered by status.
- [ ] Updating order status updates `updatedAt` timestamp and returns updated order.
- [ ] Invalid order status transitions return HTTP `400 INVALID_STATUS_TRANSITION`.
- [ ] Store metrics accurately sum paid order subtotals.
- [ ] Admin dashboard displays revenue, total orders, and active processing count cards.
- [ ] Changing order status via dropdown immediately reflects in the table status badge.
- [ ] Clicking an order row opens the order details drawer.
- [ ] Non-admin users are restricted from viewing the dashboard.

## 3. SQA Definition of Done Checklist
- [ ] All tests passing 100%.
- [ ] SQA Test Report written and saved to `feature-test-reports/FEAT-009-test-report.md`.
- [ ] `context/feature-specs/INDEX.md` status updated for FEAT-009.

## 4. Failure Protocol
If any check fails, diagnose root cause, fix defect, and re-run all test suites.
