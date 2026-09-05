# FEAT-006-INT — Stripe Webhook Processing
**Priority**: P0 (Launch-Blocking)  
**Layer**: Integration / Webhook Handler & Atomic DB Transactions

## Goal
Handle Stripe webhook events (`payment_intent.succeeded`, `payment_intent.payment_failed`) with signature verification, idempotent order creation, inventory decrementing, and cart cleanup in an atomic transaction.

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-006-BE-payments.md`
- **Context pack**:
```typescript
import { Order, OrderStatus, PaymentStatus } from "@/types";

export interface StripeWebhookResult {
  received: boolean;
  orderId?: string;
}
```
- **Consumes**:
  - `Stripe.Event` from Stripe SDK
  - Prisma `$transaction` for Order + OrderItems + Variant stock decrement + Cart deletion.

## Provides / Exposes
```typescript
export async function handleStripeWebhook(
  rawBody: string | Buffer,
  signature: string
): Promise<StripeWebhookResult>;

// Route Handler:
// POST /api/webhooks/stripe
```

## Scope (In)
- Stripe cryptographic signature verification via `stripe.webhooks.constructEvent`.
- Idempotency check: if `stripePaymentId` already exists in `Order` table, return 200 without duplicate processing.
- Atomic Prisma transaction:
  1. Create `Order` and `OrderItem` records.
  2. Decrement stock on `ProductVariant` records.
  3. Clear or delete the associated `Cart` and `CartItem` records.
- Handle `payment_intent.payment_failed` logging.

## Scope (Out)
- Client-side payment confirmation screen (covered in `FEAT-007-FE-orders.md`).
- Email receipt dispatch (Phase 2).

## Tech / Files to Touch
- `src/lib/services/order-creation.ts`
- `src/app/api/webhooks/stripe/route.ts`

## Tests to Write FIRST
1. `tests/integration/stripe-webhook-signature.test.ts`: Rejects missing/invalid signatures with HTTP `400`.
2. `tests/integration/stripe-webhook-idempotency.test.ts`: Duplicate webhook payload triggers 0 extra orders.
3. `tests/integration/atomic-stock-decrement.test.ts`: Decrements stock correctly; creates Order and deletes Cart.

## Implementation Steps
1. Create raw body reader route in `src/app/api/webhooks/stripe/route.ts` using Next.js route handler config.
2. Implement signature validation with `STRIPE_WEBHOOK_SECRET`.
3. Build atomic order creation service in `src/lib/services/order-creation.ts`.
4. Decrement inventory and clear cart within `prisma.$transaction`.

## Acceptance Criteria
- [ ] Invalid webhook signature returns HTTP `400` with `"WEBHOOK_SIGNATURE_VERIFICATION_FAILED"`.
- [ ] Successfully processed `payment_intent.succeeded` event creates `Order` with `status: PROCESSING` and `paymentStatus: PAID`.
- [ ] ProductVariant stock is reduced by the exact purchased item quantities.
- [ ] Duplicate delivery of the same webhook returns HTTP `200` without creating redundant orders.

## Definition of Done
- [ ] Integration tests pass 100% with mock Stripe fixtures.
- [ ] Zero unhandled promise rejections.

## Edge Cases to Handle
- Out of stock during payment processing marks order as review-required and alerts admin.
- Webhook payload missing metadata logs detailed error before gracefully handling.

## Pre-flight Check
- Confirm `FEAT-006-BE-payments.md` creates valid metadata on PaymentIntents.

## What's Next
- `FEAT-006-FE-payments.md` (Stripe Elements UI).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-006-INT] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
