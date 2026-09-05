# FEAT-006-BE — Stripe Payment Intents API
**Priority**: P0 (Launch-Blocking)  
**Layer**: Backend Payment Service & Stripe SDK

## Goal
Generate server-side Stripe PaymentIntents with server-verified order totals, customer metadata, and idempotency keys.

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-005-BE-checkout.md`
- **Context pack**:
```typescript
import { CheckoutSessionDto } from "./FEAT-005-BE-checkout";
import { ApiResponse } from "@/types";

export interface CreatePaymentIntentDto {
  checkoutSession: CheckoutSessionDto;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}
```

## Provides / Exposes
```typescript
export async function createPaymentIntent(
  dto: CreatePaymentIntentDto,
  guestToken?: string,
  userId?: string
): Promise<ApiResponse<PaymentIntentResponse>>;

// Route Handlers:
// POST /api/payments/create-intent -> createPaymentIntent
```

## Scope (In)
- Calculate final total in cents (integer) on server side directly from verified database cart prices and shipping tier.
- Create Stripe `PaymentIntent` with currency (`usd`), `metadata` (`cartId`, `userId`, `shippingAddress`), and `idempotencyKey`.
- Return `clientSecret` securely to the client.

## Scope (Out)
- Webhook asynchronous order creation (handled in `FEAT-006-INT-stripe-webhook.md`).
- Stripe Elements credit card UI (handled in `FEAT-006-FE-payments.md`).

## Tech / Files to Touch
- `src/lib/payments/stripe.ts`
- `src/lib/services/payments.ts`
- `src/app/api/payments/create-intent/route.ts`

## Tests to Write FIRST
1. `tests/unit/stripe-amount-calculation.test.ts`: Converts dollar amounts accurately to integer cents without floating point drift.
2. `tests/api/payment-intent-creation.test.ts`: Returns `clientSecret` and attaches correct metadata to PaymentIntent.
3. `tests/api/payment-intent-empty-cart.test.ts`: Rejects intent creation if cart has 0 items.

## Implementation Steps
1. Initialize Stripe Node SDK in `src/lib/payments/stripe.ts` using `STRIPE_SECRET_KEY`.
2. Implement `createPaymentIntent` service computing total in cents and attaching metadata.
3. Add route handler `POST /api/payments/create-intent` with session and cart validation.

## Acceptance Criteria
- [ ] PaymentIntent amount matches exactly `(subtotal + shippingFee - discountTotal) * 100` cents.
- [ ] Stripe `clientSecret` is returned to client, but `STRIPE_SECRET_KEY` is never exposed.
- [ ] Metadata on Stripe PaymentIntent includes `cartId`, `shippingAddress`, and `guestEmail` (or `userId`).

## Definition of Done
- [ ] Unit & API tests pass 100%.
- [ ] Secrets validated through environment schema.

## Edge Cases to Handle
- Cart items with zero total amount handled or rejected.
- Stripe API outage throws handled `503 SERVICE_UNAVAILABLE` error envelope.

## Pre-flight Check
- Confirm `FEAT-005-VERIFY-checkout.md` has passed.

## What's Next
- `FEAT-006-INT-stripe-webhook.md` (Stripe Webhooks & Atomic Order Creation).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-006-BE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
