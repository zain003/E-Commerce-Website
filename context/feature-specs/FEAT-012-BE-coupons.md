# FEAT-012-BE — Coupon Engine & Validation
**Priority**: P1 (Growth Phase)  
**Layer**: Backend Service & Discount Engine

## Goal
Validate promotional coupon codes (percentage and fixed amount discounts), enforce expiration dates, minimum spend requirements, and usage limits.

## Depends on / Context pack / Consumes
- **Depends on**: `000-shared-contracts.md`
- **Context pack**:
```typescript
import { Coupon, DiscountType, ApiResponse } from "@/types";

export interface ValidateCouponDto {
  code: string;
  cartSubtotal: number;
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  newTotal: number;
}
```

## Provides / Exposes
```typescript
export async function validateCoupon(dto: ValidateCouponDto): Promise<ApiResponse<CouponValidationResult>>;
export async function incrementCouponUsage(code: string): Promise<void>;

// Route Handlers:
// POST /api/coupons/validate -> validateCoupon
```

## Scope (In)
- Exact case-insensitive coupon code matching.
- Verify `isActive: true`, `expiresAt > now()`, `usedCount < maxUses`, and `cartSubtotal >= minSpend`.
- Calculate discount deduction:
  - Percentage: `(cartSubtotal * discountValue) / 100` (capped at subtotal)
  - Fixed amount: `Math.min(discountValue, cartSubtotal)`
- Atomically increment `usedCount` on successful order completion.

## Scope (Out)
- Admin coupon CRUD interface (Phase 3).

## Tech / Files to Touch
- `src/lib/services/coupons.ts`
- `src/lib/validators/coupon.ts`
- `src/app/api/coupons/validate/route.ts`

## Tests to Write FIRST
1. `tests/unit/coupon-discount-calc.test.ts`: Computes percentage and fixed amount discounts accurately.
2. `tests/api/coupon-expiry.test.ts`: Rejects expired coupons with HTTP `400 COUPON_EXPIRED`.
3. `tests/api/coupon-min-spend.test.ts`: Rejects coupon if subtotal is below required `minSpend`.

## Implementation Steps
1. Create coupon validation schema in `src/lib/validators/coupon.ts`.
2. Implement discount calculator and rule checks in `src/lib/services/coupons.ts`.
3. Build route handler `POST /api/coupons/validate`.
4. Integrate usage counter update in order finalization.

## Acceptance Criteria
- [ ] Valid percentage coupon correctly deducts percentage from subtotal.
- [ ] Expired coupon returns HTTP `400` with code `"COUPON_EXPIRED"`.
- [ ] Cart subtotal below `minSpend` returns HTTP `400` with code `"MINIMUM_SPEND_NOT_MET"`.
- [ ] Usage limit exhausted returns HTTP `400` with code `"COUPON_MAX_USES_REACHED"`.

## Definition of Done
- [ ] Unit & API tests pass 100%.
- [ ] Zero TypeScript errors.

## Edge Cases to Handle
- Discount amount exceeding subtotal clamps final price to $0.00.
- Whitespace in promo codes trimmed automatically.

## Pre-flight Check
- Confirm `Coupon` model exists in Prisma schema.

## What's Next
- `FEAT-012-FE-coupons.md` (Coupon Input & Discount Display).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-012-BE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
