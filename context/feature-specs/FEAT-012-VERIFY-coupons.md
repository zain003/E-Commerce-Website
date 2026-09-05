# FEAT-012-VERIFY — Coupons Verification Pass
**Files being verified**: `FEAT-012-BE-coupons.md`, `FEAT-012-FE-coupons.md`

## 1. Test Suite Execution & SQA Matrix
Run all automated test suites across layers:
- **Frontend / Fake DOM**: `npm run test:ui -- tests/ui/coupon-input.test.tsx tests/ui/coupon-applied-badge.test.tsx tests/ui/coupon-error-message.test.tsx`
- **API Endpoints**: `npm run test:api -- tests/api/coupon-expiry.test.ts tests/api/coupon-min-spend.test.ts`
- **Backend & Unit**: `npm run test:unit -- tests/unit/coupon-discount-calc.test.ts`

## 2. Acceptance Criteria Checklist
- [ ] Valid percentage coupon correctly deducts percentage from subtotal.
- [ ] Expired coupon returns HTTP `400` with code `"COUPON_EXPIRED"`.
- [ ] Cart subtotal below `minSpend` returns HTTP `400` with code `"MINIMUM_SPEND_NOT_MET"`.
- [ ] Usage limit exhausted returns HTTP `400` with code `"COUPON_MAX_USES_REACHED"`.
- [ ] Entering valid code displays applied coupon badge with discount amount deducted from total.
- [ ] Submitting invalid code displays inline error alert without altering subtotal.
- [ ] Clicking remove on the coupon badge removes discount and restores original total.

## 3. SQA Definition of Done Checklist
- [ ] All tests passing 100%.
- [ ] SQA Test Report written and saved to `feature-test-reports/FEAT-012-test-report.md`.
- [ ] `context/feature-specs/INDEX.md` status updated for FEAT-012.

## 4. Failure Protocol
If any failure occurs, diagnose root cause, resolve immediately, and re-run all test suites.
