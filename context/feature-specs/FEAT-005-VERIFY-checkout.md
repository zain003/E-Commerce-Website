# FEAT-005-VERIFY — Checkout Verification Pass
**Files being verified**: `FEAT-005-BE-checkout.md`, `FEAT-005-FE-checkout.md`

## 1. Test Suite Execution & SQA Matrix
Run all automated test suites across layers:
- **Frontend / Fake DOM**: `npm run test:ui -- tests/ui/checkout-address-step.test.tsx tests/ui/shipping-method-selector.test.tsx tests/ui/checkout-navigation.test.tsx`
- **API Endpoints**: `npm run test:api -- tests/api/checkout-validation.test.ts tests/api/checkout-empty-cart.test.ts`
- **Backend & Unit**: `npm run test:unit -- tests/unit/shipping-calculator.test.ts`

## 2. Acceptance Criteria Checklist
- [x] Attempting checkout with an empty cart returns HTTP `400` with code `"CART_EMPTY"`.
- [x] Free shipping applies automatically when subtotal reaches or exceeds $100.00.
- [x] Express shipping adds exactly $15.00 to total calculation.
- [x] Invalid phone number format fails validation with HTTP `400`.
- [x] User cannot advance from Step 1 without providing valid shipping address and email.
- [x] Selecting different shipping options immediately updates the displayed order total.
- [x] Back button in wizard preserves previously entered address data.
- [x] Clear security trust badges visible throughout checkout.

## 3. SQA Definition of Done Checklist
- [x] All tests passing 100%.
- [x] SQA Test Report written and saved to `feature-test-reports/FEAT-005-test-report.md`.
- [x] `context/feature-specs/INDEX.md` status updated for FEAT-005.

## 4. Failure Protocol
Fix any identified failures before proceeding to payment integration. (0 failures identified — 100% pass).
