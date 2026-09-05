# FEAT-006-VERIFY — Payments Verification Pass
**Files being verified**: `FEAT-006-BE-payments.md`, `FEAT-006-INT-stripe-webhook.md`, `FEAT-006-FE-payments.md`

## 1. Test Suite Execution & SQA Matrix
Run all automated test suites across layers:
- **Frontend / Fake DOM**: `npm run test:ui -- tests/ui/stripe-payment-form.test.tsx tests/ui/payment-processing-state.test.tsx tests/ui/payment-error-display.test.tsx`
- **Integration & Webhooks**: `npm run test:int -- tests/integration/stripe-webhook-signature.test.ts tests/integration/stripe-webhook-idempotency.test.ts tests/integration/atomic-stock-decrement.test.ts`
- **API Endpoints**: `npm run test:api -- tests/api/payment-intent-creation.test.ts tests/api/payment-intent-empty-cart.test.ts`
- **Backend & Unit**: `npm run test:unit -- tests/unit/stripe-amount-calculation.test.ts`

## 2. Acceptance Criteria Checklist
- [ ] PaymentIntent amount matches exactly `(subtotal + shippingFee - discountTotal) * 100` cents.
- [ ] Stripe `clientSecret` is returned to client, but `STRIPE_SECRET_KEY` is never exposed.
- [ ] Invalid webhook signature returns HTTP `400` with `"WEBHOOK_SIGNATURE_VERIFICATION_FAILED"`.
- [ ] Successfully processed `payment_intent.succeeded` event creates `Order` with `status: PROCESSING` and `paymentStatus: PAID`.
- [ ] ProductVariant stock is reduced by the exact purchased item quantities.
- [ ] Duplicate delivery of the same webhook returns HTTP `200` without creating redundant orders.
- [ ] PaymentElement renders cleanly within the checkout container with no horizontal overflow.
- [ ] Clicking "Pay Now" disables the button and displays a progress spinner.
- [ ] Successful payment redirects customer to the order confirmation page.

## 3. SQA Definition of Done Checklist
- [ ] All tests passing 100%.
- [ ] SQA Test Report written and saved to `feature-test-reports/FEAT-006-test-report.md`.
- [ ] `context/feature-specs/INDEX.md` status updated for FEAT-006.

## 4. Failure Protocol
If any failure occurs, diagnose root cause, resolve immediately, and re-run all test suites.
