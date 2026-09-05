# FEAT-006-FE — Stripe Elements Checkout UI
**Priority**: P0 (Launch-Blocking)  
**Layer**: Frontend UI & Stripe React Elements

## Goal
Integrate Stripe React Elements (`PaymentElement`) into the final checkout step, handle client-side confirmation, loading animations, and payment error states.

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-006-BE-payments.md`
- **Context pack**:
```typescript
import { PaymentIntentResponse, CreatePaymentIntentDto } from "./FEAT-006-BE-payments";
import { ApiResponse } from "@/types";
```
- **Consumes**:
  - `POST /api/payments/create-intent` -> `createPaymentIntent(dto)`
  - `@stripe/react-stripe-js` (`Elements`, `PaymentElement`, `useStripe`, `useElements`)

## Scope (In)
- Stripe `Elements` provider wrapper with light/clean appearance theme matching app design system.
- `PaymentElement` embedded form in checkout step 3.
- "Pay Now" submission button with dynamic spinner and disabled state during processing.
- Inline error messages for card declines, invalid CVC, and expiration date failures.
- Redirect to `/order-confirmation?orderNumber=...` upon successful payment completion.

## Scope (Out)
- Webhook order processing (handled in `FEAT-006-INT-stripe-webhook.md`).

## Tech / Files to Touch
- `src/components/checkout/stripe-payment-form.tsx`
- `src/components/checkout/stripe-wrapper.tsx`
- `src/app/(shop)/checkout/page.tsx`

## Tests to Write FIRST
1. `tests/ui/stripe-payment-form.test.tsx`: Renders PaymentElement container and Pay Now button.
2. `tests/ui/payment-processing-state.test.tsx`: Disables Pay button and displays loading spinner while submitting.
3. `tests/ui/payment-error-display.test.tsx`: Displays card decline message when Stripe returns error.

## Implementation Steps
1. Create `StripeWrapper` component initializing `loadStripe` with publishable key.
2. Build `StripePaymentForm` with `useStripe()` and `useElements()`.
3. Handle form submission invoking `stripe.confirmPayment({ redirect: "if_required" })`.
4. Handle success redirect and error toast notifications.

## Acceptance Criteria
- [ ] PaymentElement renders cleanly within the checkout container with no horizontal overflow.
- [ ] Clicking "Pay Now" disables the button and displays a progress spinner.
- [ ] If payment is declined, an accessible error alert appears without clearing previously completed address steps.
- [ ] Successful payment redirects customer to the order confirmation page.

## Definition of Done
- [ ] Fake DOM component tests pass 100%.
- [ ] Zero unhandled promise rejections during payment flow.

## Edge Cases to Handle
- User attempts to submit before Stripe Elements has fully loaded.
- Network disconnection during confirmation displays a retry prompt.

## Pre-flight Check
- Confirm `FEAT-006-BE-payments.md` endpoint returns valid `clientSecret`.

## What's Next
- `FEAT-006-VERIFY-payments.md` (Payments Verification Pass).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-006-FE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
