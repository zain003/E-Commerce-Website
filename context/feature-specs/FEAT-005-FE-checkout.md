# FEAT-005-FE — Multi-Step Checkout UI
**Priority**: P0 (Launch-Blocking)  
**Layer**: Frontend UI & Flow Wizard

## Goal
Build a clean, distraction-free, mobile-first multi-step checkout flow (Contact/Address -> Shipping Method -> Order Review).

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-005-BE-checkout.md`
- **Context pack**:
```typescript
import { CheckoutPreview, CheckoutSessionDto, ShippingMethod } from "./FEAT-005-BE-checkout";
import { AddressDto } from "./FEAT-001-BE-auth";
```
- **Consumes**:
  - `GET /api/checkout/preview`
  - `POST /api/checkout/validate` -> `validateCheckoutSession(dto)`

## Scope (In)
- Multi-step progress indicator (1. Details & Address, 2. Delivery, 3. Payment).
- Address form with saved address selector for logged-in users and guest email input for guests.
- Shipping method radio selector with dynamic price updates.
- Sticky order summary with item list, subtotal, shipping fee, tax, and total.

## Scope (Out)
- Stripe credit card inputs (handled in `FEAT-006-FE-payments.md`).

## Tech / Files to Touch
- `src/app/(shop)/checkout/page.tsx`
- `src/components/checkout/checkout-wizard.tsx`
- `src/components/checkout/address-step.tsx`
- `src/components/checkout/shipping-step.tsx`
- `src/components/checkout/order-summary.tsx`

## Tests to Write FIRST
1. `tests/ui/checkout-address-step.test.tsx`: Validates required address fields before advancing to step 2.
2. `tests/ui/shipping-method-selector.test.tsx`: Selecting Express updates total in order summary.
3. `tests/ui/checkout-navigation.test.tsx`: Prevents proceeding to payment step without completing prior steps.

## Implementation Steps
1. Create `CheckoutWizard` managing active step state (1, 2, 3).
2. Build `AddressStep` with React Hook Form + Zod validator.
3. Build `ShippingStep` displaying standard/express options and estimated delivery days.
4. Build `OrderSummary` sticky sidebar/bottom drawer.
5. Connect step transitions with backend validation checks.

## Acceptance Criteria
- [ ] User cannot advance from Step 1 without providing valid shipping address and email.
- [ ] Selecting different shipping options immediately updates the displayed order total.
- [ ] Back button in wizard preserves previously entered address data.
- [ ] Clear security trust badges (e.g., "256-bit Encrypted Checkout") visible throughout checkout.

## Definition of Done
- [ ] All Fake DOM tests pass 100%.
- [ ] Form is fully accessible with keyboard tab navigation and focus indicators.

## Edge Cases to Handle
- Browser refresh restores current checkout state gracefully.
- Cart becoming empty while on checkout redirects back to `/cart`.

## Pre-flight Check
- Confirm `FEAT-005-BE-checkout.md` is complete and verified.

## What's Next
- `FEAT-005-VERIFY-checkout.md` (Checkout Verification).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-005-FE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
