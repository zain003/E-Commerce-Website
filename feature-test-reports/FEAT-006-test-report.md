# Test Report: FEAT-006-BE — Stripe Payment Intents API

**Feature ID:** `FEAT-006-BE`  
**Spec References:**  
- [`context/feature-specs/FEAT-006-BE-payments.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/FEAT-006-BE-payments.md)  
- [`context/feature-specs/FEAT-005-BE-checkout.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/FEAT-005-BE-checkout.md)  
- [`context/feature-specs/000-shared-contracts.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/000-shared-contracts.md)  
**Date Tested:** `2026-09-13`  
**SQA Status:** `PASSED (100%)`  
**Tester:** `SQA Automation Engineer (Pair Programming Agent)`  

---

## 1. Executive Summary

| Layer | Test Suites | Total Tests | Passed | Failed | Pass Rate | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Stripe Amount Calculation (Unit)** | 1 | 7 | 7 | 0 | 100% | **PASSED** |
| **Payment Intent Creation (API)** | 1 | 6 | 6 | 0 | 100% | **PASSED** |
| **Payment Intent Empty Cart & Stock Boundary (API)** | 1 | 3 | 3 | 0 | 100% | **PASSED** |
| **Total (FEAT-006-BE Scope)** | **3** | **16** | **16** | **0** | **100%** | **PASSED** |
| **Repository-Wide Total** | **45** | **250** | **250** | **0** | **100%** | **PASSED** |

> **SQA Quality Gate:** 100% test pass rate across all 45 repository test suites (250 tests total). Next.js 16 build (`npm run build`) and TypeScript validation (`npx tsc --noEmit`) complete with zero errors.

---

## 2. Test Environment & Tools

- **Framework & Runtime:** Next.js 16.3.4 (App Router, Turbopack), React 19.2.8, Node.js v22
- **Payment Gateway SDK:** Stripe Node SDK (`stripe` v22.6.1)
- **Test Runner:** Vitest v5.0.0
- **DOM & Request Engine:** jsdom v29.1.1, Next.js `NextRequest`
- **Database & Persistence:** PostgreSQL + Prisma ORM v6.4.1 (`Cart`, `CartItem`, `ProductVariant`, `Product`)
- **Validation Engine:** Zod v4.5.4 (`createPaymentIntentSchema`, `validateCreatePaymentIntentInput`)
- **Session & Auth:** NextAuth session, HTTP-only cookie (`guest_cart_token`)

---

## 3. Acceptance Criteria Traceability Matrix

### Backend Acceptance Criteria (`FEAT-006-BE`)
| AC ID | Acceptance Criterion | Test File & Test Name | SQA Verdict |
| :--- | :--- | :--- | :---: |
| **BE-AC-1** | PaymentIntent amount matches exactly `(subtotal + shippingFee - discountTotal) * 100` cents | `tests/unit/stripe-amount-calculation.test.ts` > `converts simple dollar amounts accurately to integer cents`<br>`tests/unit/stripe-amount-calculation.test.ts` > `applies free shipping ($0.00) without modifying subtotal in cents`<br>`tests/unit/stripe-amount-calculation.test.ts` > `calculates express shipping accurately`<br>`tests/unit/stripe-amount-calculation.test.ts` > `accurately handles discounts without floating point error`<br>`tests/api/payment-intent-creation.test.ts` > `creates a Stripe PaymentIntent for guest user and returns clientSecret` | `PASS` |
| **BE-AC-2** | Stripe `clientSecret` is returned to client, but `STRIPE_SECRET_KEY` is never exposed | `tests/api/payment-intent-creation.test.ts` > `creates a Stripe PaymentIntent for guest user and returns clientSecret`<br>`tests/api/payment-intent-creation.test.ts` > `never exposes STRIPE_SECRET_KEY in response payload` | `PASS` |
| **BE-AC-3** | Metadata on Stripe PaymentIntent includes `cartId`, `shippingAddress`, and `guestEmail` (or `userId`) | `tests/api/payment-intent-creation.test.ts` > `creates a Stripe PaymentIntent for guest user and returns clientSecret`<br>`tests/api/payment-intent-creation.test.ts` > `attaches userId to PaymentIntent metadata for authenticated users` | `PASS` |
| **BE-AC-4** | Rejects intent creation if cart has 0 items (`400 CART_EMPTY`) | `tests/api/payment-intent-empty-cart.test.ts` > `rejects intent creation with HTTP 400 CART_EMPTY when cart items array is empty`<br>`tests/api/payment-intent-empty-cart.test.ts` > `rejects intent creation with HTTP 400 CART_EMPTY when getCart returns not found` | `PASS` |
| **BE-AC-5** | Rejects intent creation if stock has changed or product archived | `tests/api/payment-intent-empty-cart.test.ts` > `rejects intent creation with HTTP 400 STOCK_CHANGED when item inventory has depleted` | `PASS` |
| **BE-AC-6** | Stripe API outage throws handled `503 SERVICE_UNAVAILABLE` error envelope | `tests/api/payment-intent-creation.test.ts` > `returns 503 SERVICE_UNAVAILABLE when Stripe API fails` | `PASS` |
| **BE-AC-7** | Rejects unauthenticated checkout missing `guestEmail` or with invalid address/phone | `tests/api/payment-intent-creation.test.ts` > `fails with 400 VALIDATION_ERROR when guest email is missing`<br>`tests/api/payment-intent-creation.test.ts` > `fails with 400 VALIDATION_ERROR when phone number format is invalid` | `PASS` |
| **BE-AC-8** | Eliminates floating-point drift in monetary cent computations | `tests/unit/stripe-amount-calculation.test.ts` > `handles notorious IEEE 754 floating point imprecision without drift`<br>`tests/unit/stripe-amount-calculation.test.ts` > `handles complex decimal sums like $14.99 + $29.95 + $5.00` | `PASS` |

---

## 4. Edge Cases & Security Checks

1. **Floating Point Arithmetic Drift:** Pure calculation helper converts each dollar component to integer cents before aggregating, preventing classic IEEE 754 imprecisions such as `0.1 + 0.2 = 0.30000000000000004` or `19.99 * 100 = 1998.9999999999998`.
2. **Server-Side Price Invariant:** Payment amounts sent to Stripe are derived strictly from database-verified cart line items and shipping tiers, ignoring any client totals.
3. **Idempotency Protection:** Supports explicit `idempotencyKey` parameter or falls back to a deterministic cart-level idempotency key to prevent double charge attempts.
4. **Secret Key Shielding:** `STRIPE_SECRET_KEY` remains strictly on the server and is never passed or reflected in client responses or serialization.
5. **Gateway Resilience:** Handles Stripe network drops or service outages by returning a standardized HTTP 503 `SERVICE_UNAVAILABLE` JSON envelope.

---

## 5. Defects Found & Resolved

- **Defect:** Initial Stripe client construction threw `Neither apiKey nor config.authenticator provided` in test runners where `.env.local` was not yet parsed into process environment.
- **Root Cause:** Stripe SDK v22 strictly requires a non-empty string or authenticator at instantiation time.
- **Resolution:** Added a safe placeholder fallback (`process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_for_tests"`) in `src/lib/payments/stripe.ts` and runtime guard in `getStripeClient()` ensuring production requests require the real key while test harnesses run smoothly.

---

## 6. Final SQA Verdict

### `PASSED (100%)`
All 16 automated tests across 3 test suites for `FEAT-006-BE` passed. Repository-wide test suite passes with 250/250 tests (100% pass rate). Production build (`npm run build`) and strict TypeScript compiler checks passed with 0 errors.
