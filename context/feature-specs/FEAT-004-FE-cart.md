# FEAT-004-FE — Cart Drawer & Client State
**Priority**: P0 (Launch-Blocking)  
**Layer**: Frontend UI & Zustand Store

## Goal
Implement a responsive slide-out Cart Drawer, Cart Item quantity controls, optimistic updates via Zustand, and a dedicated `/cart` page.

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-004-BE-cart.md`
- **Context pack**:
```typescript
import { HydratedCart, HydratedCartItem, AddToCartDto, UpdateCartItemDto } from "./FEAT-004-BE-cart";
import { ApiResponse } from "@/types";
```
- **Consumes**:
  - `GET /api/cart`
  - `POST /api/cart/items` -> `addToCart(dto: AddToCartDto)`
  - `PATCH /api/cart/items/:id` -> `updateCartItem(id, dto: UpdateCartItemDto)`
  - `DELETE /api/cart/items/:id` -> `removeCartItem(id)`

## Scope (In)
- Slide-out Cart Drawer accessible from header badge button.
- Zustand store (`useCartStore`) managing optimistic updates and cart drawer open/close state.
- `CartItem` row component with increment/decrement stepper and delete button.
- Cart order summary (subtotal, estimated shipping notice, Checkout CTA button).
- Full `/cart` page view for desktop/mobile navigation.

## Scope (Out)
- Multi-step checkout form (handled in `FEAT-005-FE-checkout.md`).

## Tech / Files to Touch
- `src/store/cart-store.ts`
- `src/components/cart/cart-drawer.tsx`
- `src/components/cart/cart-item.tsx`
- `src/components/cart/cart-summary.tsx`
- `src/components/layout/header-cart-button.tsx`
- `src/app/(shop)/cart/page.tsx`

## Tests to Write FIRST
1. `tests/ui/cart-drawer.test.tsx`: Opens drawer when header cart icon is clicked; closes on backdrop click.
2. `tests/ui/cart-item-actions.test.tsx`: Optimistically increments quantity and updates subtotal text.
3. `tests/ui/cart-empty-state.test.tsx`: Displays "Your cart is empty" and "Start Shopping" button when 0 items.

## Implementation Steps
1. Create `useCartStore` with Zustand for state handling and API sync.
2. Build `CartItem` component with quantity stepper and removal animation.
3. Build `CartDrawer` using accessible dialog/sheet component with focus trap.
4. Build `HeaderCartButton` with animated item count badge.
5. Assemble `/cart` page sharing the cart summary components.

## Acceptance Criteria
- [ ] Clicking "Add to Cart" on any product opens the Cart Drawer automatically and shows the newly added item.
- [ ] Changing quantity updates displayed subtotal instantly; rolls back with toast notification if API fails.
- [ ] Header cart badge displays the exact total item count.
- [ ] Empty cart displays clean message and primary button routing to `/products`.

## Definition of Done
- [ ] All Fake DOM tests pass 100%.
- [ ] Zero accessibility issues; keyboard navigable.

## Edge Cases to Handle
- Rapid clicking on "+" is debounced to avoid out-of-order race conditions.
- Disabling increment button when item quantity reaches available stock.

## Pre-flight Check
- Confirm `FEAT-004-BE-cart.md` endpoints respond with expected payload structure.

## What's Next
- `FEAT-004-VERIFY-cart.md` (Cart Verification Pass).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-004-FE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
