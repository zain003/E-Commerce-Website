---
name: stripe-payments-integration
description: >-
  Provides procedures and security guidelines for Stripe payments, PaymentIntents,
  Stripe Elements UI, and idempotent webhook processing.
  Use when implementing checkout payments, webhook handlers, or Stripe Elements forms.
---

# Stripe Payments & Idempotency Integration Skill

## Key Integration Points

### 1. Server-Side PaymentIntent Creation
- Calculate order amount in cents on the server directly from database prices.
- Never accept client-submitted total amounts.
- Attach metadata (`cartId`, `userId` or `guestEmail`, `shippingAddress`).

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function createIntent(amountInCents: number, metadata: Record<string, string>) {
  return await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}
```

### 2. Stripe Elements Component (`FEAT-006-FE`)
- Wrap payment form with `<Elements stripe={stripePromise} options={{ clientSecret }}>`.
- Use `<PaymentElement />` and handle confirmation with `stripe.confirmPayment({ redirect: "if_required" })`.

### 3. Idempotent Webhook Handler (`FEAT-006-INT`)
- Verify Stripe signature using `stripe.webhooks.constructEvent(body, signature, secret)`.
- Prevent double execution by checking if `Order` with `stripePaymentId` already exists.
- Perform Order creation, inventory decrement, and cart deletion in a single atomic transaction.
