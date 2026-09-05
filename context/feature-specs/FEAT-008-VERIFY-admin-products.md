# FEAT-008-VERIFY — Admin Products Verification Pass
**Files being verified**: `FEAT-008-BE-admin-products.md`, `FEAT-008-FE-admin-products.md`

## 1. Test Suite Execution & SQA Matrix
Run all automated test suites across layers:
- **Frontend / Fake DOM**: `npm run test:ui -- tests/ui/admin-product-table.test.tsx tests/ui/admin-product-form.test.tsx tests/ui/admin-stock-edit.test.tsx`
- **API Endpoints**: `npm run test:api -- tests/api/admin-auth-guard.test.ts tests/api/admin-product-crud.test.ts`
- **Backend & Unit**: `npm run test:unit -- tests/unit/admin-product-validator.test.ts`

## 2. Acceptance Criteria Checklist
- [ ] Requests without `role: ADMIN` receive HTTP `403 FORBIDDEN`.
- [ ] Creating product with duplicate slug returns HTTP `409 CONFLICT`.
- [ ] Stock adjustments update the `ProductVariant.stock` column immediately.
- [ ] Cache tag `products` is invalidated on every product create or update.
- [ ] Admin products table shows thumbnail, product name, category, total stock, and status.
- [ ] Creating product with empty fields triggers inline field-level validation messages.
- [ ] Changing inline stock value immediately persists to database.
- [ ] Non-admin users are redirected to login or unauthorized page.

## 3. SQA Definition of Done Checklist
- [ ] All tests passing 100%.
- [ ] SQA Test Report written and saved to `feature-test-reports/FEAT-008-test-report.md`.
- [ ] `context/feature-specs/INDEX.md` status updated for FEAT-008.

## 4. Failure Protocol
If any failure occurs, diagnose root cause, resolve immediately, and re-run all test suites.
