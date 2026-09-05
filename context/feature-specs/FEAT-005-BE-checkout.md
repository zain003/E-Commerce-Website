# FEAT-005-BE — Checkout Validation Service
**Priority**: P0 (Launch-Blocking)  
**Layer**: Backend Validation & Order Preview

## Goal
Validate shipping address, compute shipping tiers, verify cart inventory, and generate an immutable order checkout summary.

## Depends on / Context pack / Consumes
- **Depends on**: `000-shared-contracts.md`, `FEAT-004-BE-cart.md`
- **Context pack**:
```typescript
import { AddressDto } from "./FEAT-001-BE-auth";
import { HydratedCart } from "./FEAT-004-BE-cart";
import { ApiResponse } from "@/types";

export interface ShippingMethod {
  id: "STANDARD" | "EXPRESS";
  name: string;
  price: number;
  estimatedDays: string;
}

export interface CheckoutPreview {
  items: HydratedCart["items"];
  subtotal: number;
  shippingFee: number;
  discountTotal: number;
  total: number;
  availableShippingMethods: ShippingMethod[];
}

export interface CheckoutSessionDto {
  shippingAddress: AddressDto;
  shippingMethodId: "STANDARD" | "EXPRESS";
  guestEmail?: string;
}
```

## Provides / Exposes
```typescript
export async function getCheckoutPreview(shippingMethodId?: string, guestToken?: string, userId?: string): Promise<ApiResponse<CheckoutPreview>>;
export async function validateCheckoutSession(dto: CheckoutSessionDto, guestToken?: string, userId?: string): Promise<ApiResponse<{ valid: boolean; preview: CheckoutPreview }>>;

// Route Handlers:
// GET  /api/checkout/preview?method=...
// POST /api/checkout/validate -> validateCheckoutSession
```

## Scope (In)
- Validate postal code, country, phone format, and full address via Zod.
- Fixed shipping calculation rule: standard ($5.00, or Free over $100), express ($15.00).
- Re-verify inventory in real-time before generating checkout preview.
- Support guest email requirement if no user session is active.

## Scope (Out)
- Stripe payment intent creation (handled in `FEAT-006-BE-payments.md`).
- Multi-step frontend wizard (handled in `FEAT-005-FE-checkout.md`).

## Tech / Files to Touch
- `src/lib/services/checkout.ts`
- `src/lib/validators/checkout.ts`
- `src/app/api/checkout/preview/route.ts`
- `src/app/api/checkout/validate/route.ts`

## Tests to Write FIRST
1. `tests/unit/shipping-calculator.test.ts`: Standard shipping is free ($0.00) when subtotal >= $100.
2. `tests/api/checkout-validation.test.ts`: Requires `guestEmail` for unauthenticated checkout; validates phone & postal code.
3. `tests/api/checkout-empty-cart.test.ts`: Returns `400 CART_EMPTY` if cart has 0 items.

## Implementation Steps
1. Create `checkoutValidationSchema` in `src/lib/validators/checkout.ts`.
2. Implement shipping fee computation logic in `src/lib/services/checkout.ts`.
3. Implement `getCheckoutPreview` checking cart items and live stock.
4. Add route handlers `/api/checkout/preview` and `/api/checkout/validate`.

## Acceptance Criteria
- [ ] Attempting checkout with an empty cart returns HTTP `400` with code `"CART_EMPTY"`.
- [ ] Free shipping applies automatically when subtotal reaches or exceeds $100.00.
- [ ] Express shipping adds exactly $15.00 to total calculation.
- [ ] Invalid phone number format fails validation with HTTP `400`.

## Definition of Done
- [ ] Unit & API tests pass 100%.
- [ ] TypeScript check clean with 0 warnings.

## Edge Cases to Handle
- Cart items where stock changed during checkout session trigger `"STOCK_CHANGED"` error.
- Guest user without email rejected before payment intent is created.

## Pre-flight Check
- Confirm `FEAT-004-BE-cart.md` passes verification.

## What's Next
- `FEAT-005-FE-checkout.md` (Multi-Step Checkout UI).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-005-BE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
