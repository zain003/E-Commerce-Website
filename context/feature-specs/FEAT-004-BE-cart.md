# FEAT-004-BE — Cart Service & Cookie Session
**Priority**: P0 (Launch-Blocking)  
**Layer**: Backend Service & Cart Persistence

## Goal
Manage persistent cart operations for both authenticated users and guest sessions (via encrypted cookie tokens) with server-side price/stock verification.

## Depends on / Context pack / Consumes
- **Depends on**: `000-shared-contracts.md`
- **Context pack**:
```typescript
import { Cart, CartItem, ProductVariant, Product, ApiResponse } from "@/types";

export interface AddToCartDto {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface HydratedCartItem extends CartItem {
  variant: ProductVariant & { product: Product };
}

export interface HydratedCart extends Cart {
  items: HydratedCartItem[];
  subtotal: number;
  itemCount: number;
}
```

## Provides / Exposes
```typescript
export async function getCart(guestToken?: string, userId?: string): Promise<ApiResponse<HydratedCart>>;
export async function addToCart(dto: AddToCartDto, guestToken?: string, userId?: string): Promise<ApiResponse<HydratedCart>>;
export async function updateCartItem(itemId: string, dto: UpdateCartItemDto, guestToken?: string, userId?: string): Promise<ApiResponse<HydratedCart>>;
export async function removeCartItem(itemId: string, guestToken?: string, userId?: string): Promise<ApiResponse<HydratedCart>>;
export async function mergeGuestCart(guestToken: string, userId: string): Promise<ApiResponse<HydratedCart>>;

// Route Handlers:
// GET    /api/cart
// POST   /api/cart/items -> addToCart
// PATCH  /api/cart/items/:id -> updateCartItem
// DELETE /api/cart/items/:id -> removeCartItem
// POST   /api/cart/merge -> mergeGuestCart
```

## Scope (In)
- Dynamic cart creation (linked to `userId` if logged in, or `guestToken` stored in HTTP-only cookie).
- Cart item addition with stock limit enforcement.
- Quantity modification and deletion.
- Guest cart merge into user cart upon login.
- Subtotal and item count calculation on the server.

## Scope (Out)
- Client-side optimistic Zustand store (covered in `FEAT-004-FE-cart.md`).
- Payment processing (covered in `FEAT-006-BE-payments.md`).

## Tech / Files to Touch
- `src/lib/services/cart.ts`
- `src/lib/cookies/cart-cookie.ts`
- `src/app/api/cart/route.ts`
- `src/app/api/cart/items/route.ts`
- `src/app/api/cart/items/[id]/route.ts`
- `src/app/api/cart/merge/route.ts`

## Tests to Write FIRST
1. `tests/unit/cart-calculator.test.ts`: Calculates item totals and subtotal correctly.
2. `tests/api/cart-guest.test.ts`: Creates new `guestToken` cookie on first cart addition; returns updated cart.
3. `tests/api/cart-stock-limit.test.ts`: Rejects addition if requested quantity exceeds variant stock.

## Implementation Steps
1. Create guest cookie helper in `src/lib/cookies/cart-cookie.ts` using `cookies()` from `next/headers`.
2. Implement cart resolution logic in `src/lib/services/cart.ts` (resolves by user ID if logged in, else guest token).
3. Implement `addToCart` with variant existence and stock checks.
4. Implement `updateCartItem` and `removeCartItem` with cart ownership validation.
5. Implement `mergeGuestCart` to transfer items and clear guest token.

## Acceptance Criteria
- [ ] Adding an item generates an HTTP-only `guest_cart_token` cookie if user is not authenticated.
- [ ] Attempting to add quantity greater than available variant stock returns HTTP `400` with code `"INSUFFICIENT_STOCK"`.
- [ ] Removing an item updates the subtotal and total item count accordingly.
- [ ] Merging a guest cart transfers unique items and sums quantities for duplicate variants.

## Definition of Done
- [ ] Unit & API tests pass 100%.
- [ ] Zero lint/type errors.

## Edge Cases to Handle
- Adding quantity `0` or negative numbers returns HTTP `400`.
- Stale cart items referencing deleted variants are automatically pruned.

## Pre-flight Check
- Confirm `ProductVariant` and `Cart` tables are set up in Prisma.

## What's Next
- `FEAT-004-FE-cart.md` (Cart Drawer & Client State).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-004-BE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
