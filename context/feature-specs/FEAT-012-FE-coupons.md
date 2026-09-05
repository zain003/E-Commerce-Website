# FEAT-012-FE — Coupon Input & Discount Display
**Priority**: P1 (Growth Phase)  
**Layer**: Frontend UI & Price Summary

## Goal
Add promo code input field, applied discount badge/tag, and dynamic total deduction in Cart Summary and Checkout views.

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-012-BE-coupons.md`
- **Context pack**:
```typescript
import { CouponValidationResult, ValidateCouponDto } from "./FEAT-012-BE-coupons";
import { ApiResponse } from "@/types";
```
- **Consumes**:
  - `POST /api/coupons/validate` -> `validateCoupon(dto)`

## Scope (In)
- Promo code input form with "Apply" button and loading indicator.
- Applied coupon badge showing coupon code and discount percentage/amount.
- "Remove" button on applied coupon badge that resets discount.
- Inline error messages for invalid, expired, or unmet spend requirements.

## Scope (Out)
- Automatic coupon suggestion popup (Phase 3).

## Tech / Files to Touch
- `src/components/cart/coupon-input.tsx`
- `src/components/cart/cart-summary.tsx`
- `src/components/checkout/order-summary.tsx`
- `src/store/cart-store.ts`

## Tests to Write FIRST
1. `tests/ui/coupon-input.test.tsx`: Typing code and clicking Apply calls validation API.
2. `tests/ui/coupon-applied-badge.test.tsx`: Renders discount deduction and removes code on click.
3. `tests/ui/coupon-error-message.test.tsx`: Displays error message when API returns invalid code.

## Implementation Steps
1. Create `CouponInput` component with input and Apply button.
2. Update `useCartStore` to store `appliedCoupon` and `discountTotal`.
3. Integrate `CouponInput` into `CartSummary` and `OrderSummary`.
4. Display green discount deduction line item (e.g. `-$10.00`).

## Acceptance Criteria
- [ ] Entering valid code displays applied coupon badge with discount amount deducted from total.
- [ ] Submitting invalid code displays inline error alert without altering subtotal.
- [ ] Clicking remove on the coupon badge removes discount and restores original total.

## Definition of Done
- [ ] All Fake DOM tests pass 100%.
- [ ] Responsive layout verified.

## Edge Cases to Handle
- Cart items modification that drops subtotal below `minSpend` displays warning and invalidates coupon.

## Pre-flight Check
- Confirm `FEAT-012-BE-coupons.md` endpoint is available.

## What's Next
- `FEAT-012-VERIFY-coupons.md` (Coupons Verification Pass).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-012-FE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
