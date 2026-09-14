# ISSUE-010: Coupon Discounts Are Disconnected from Checkout, Stripe Payment Intents, and Order Creation

## Summary
Coupons applied in the Cart UI (`useCartStore`) are not forwarded to the checkout validation service or Stripe PaymentIntent creation. `getCheckoutPreview` hardcodes `discountTotal = 0.0`, resulting in Stripe charging the customer the full, undiscounted price, and the Stripe webhook creating an `Order` with `discountTotal = 0.0`. In addition, coupon usage counts are never incremented.

## Location / Flow
Cart to Checkout → Stripe Payment → Webhook Order Creation (`src/components/checkout/checkout-wizard.tsx`, `src/lib/services/checkout.ts`, `src/lib/services/payments.ts`, `src/lib/services/order-creation.ts`).

## Steps to Reproduce
1. Add an item (e.g. $50.00) to the cart.
2. In the cart drawer, enter a valid coupon code (e.g. 20% off).
3. Observe the cart UI correctly displays the -$10.00 discount and updates the estimated total to $40.00 + shipping.
4. Click "Proceed to Checkout".
5. In Step 3 (Review & Payment), click "Proceed to Payment" to initialize Stripe Elements.
6. Inspect the network request to `/api/payments/create-intent`: the payload does not send `couponCode`.
7. Inspect the Stripe PaymentIntent amount created: the amount is computed using `preview.subtotal + preview.shippingFee - 0.0` ($50.00 + shipping), charging the customer the undiscounted amount.
8. Complete payment: the Stripe webhook creates an `Order` with `discountTotal: 0.0` and full undiscounted total.

## Expected Behavior
Per `context/project-overview.md` (Phase 2 — Growth: "Coupons & Discounts (`FEAT-012`): Percentage and fixed discounts, minimum spend validation, promo input") and `context/architecture.md` (Architectural Invariant 3: "Prices Verified Server-Side"):
- The applied coupon code should be included in `CheckoutSessionDto`.
- The checkout validation service (`validateCheckoutSession` & `getCheckoutPreview`) must validate the coupon server-side and calculate the exact discount amount.
- Stripe PaymentIntent must charge the net discounted total (`subtotal + shippingFee - discountTotal`).
- Upon successful payment, the Stripe webhook must save `discountTotal` on the `Order` record and call `incrementCouponUsage`.

## Actual Behavior
- `CheckoutSessionDto` and `checkoutSessionSchema` do not accept a `couponCode` parameter.
- `src/lib/services/checkout.ts` line 82 hardcodes:
  ```typescript
  const discountTotal = 0.0;
  ```
- `createPaymentIntent` uses this zero discount, creating a PaymentIntent for the full undiscounted amount.
- `order-creation.ts` line 155 hardcodes `discountTotal: 0.0`.
- The customer is charged full price despite being shown a discounted total in the client UI.

## Severity
Critical

## Scope
- **In Scope:**
  1. Adding optional `couponCode: z.string().optional()` to `checkoutSessionSchema` in `src/lib/validators/checkout.ts`.
  2. Passing `couponCode` from `CheckoutWizard` (from `useCartStore.appliedCoupon?.code`) to `/api/checkout/validate` and `/api/payments/create-intent`.
  3. Updating `getCheckoutPreview` and `validateCheckoutSession` in `src/lib/services/checkout.ts` to validate coupon and compute server-side `discountTotal`.
  4. Updating `order-creation.ts` to persist `discountTotal`, store coupon reference, and call `incrementCouponUsage`.
- **Out of Scope:** Implementing multi-coupon stacking or complex bundle logic.

## Acceptance Criteria
- [ ] `CheckoutSessionDto` accepts an optional `couponCode`.
- [ ] Server validates the coupon against database rules (min spend, expiry, usage limits).
- [ ] Stripe PaymentIntent amount in cents reflects the discounted order total.
- [ ] The generated `Order` in database contains the accurate `discountTotal`.
- [ ] Coupon usage count is atomically incremented upon confirmed payment.

## Related Feature ID
FEAT-005 — Checkout & Shipping, FEAT-006 — Stripe Payments, FEAT-012 — Coupons & Discounts

## Notes
Charging a customer more than what was displayed on the order review screen is a severe financial defect and compliance violation under FTC and PCI consumer protection guidelines.
