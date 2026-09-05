# FEAT-011-BE — Wishlist Service
**Priority**: P1 (Growth Phase)  
**Layer**: Backend Service & Wishlist API

## Goal
Manage authenticated customer wishlist items (toggle add/remove, retrieve full wishlist with live product pricing and stock status).

## Depends on / Context pack / Consumes
- **Depends on**: `000-shared-contracts.md`
- **Context pack**:
```typescript
import { WishlistItem, Product, ApiResponse } from "@/types";

export interface HydratedWishlistItem extends WishlistItem {
  product: Product & { inStock: boolean };
}

export interface ToggleWishlistResponse {
  isWishlisted: boolean;
  productId: string;
}
```

## Provides / Exposes
```typescript
export async function getWishlist(userId: string): Promise<ApiResponse<HydratedWishlistItem[]>>;
export async function toggleWishlistItem(productId: string, userId: string): Promise<ApiResponse<ToggleWishlistResponse>>;

// Route Handlers:
// GET  /api/account/wishlist -> getWishlist
// POST /api/account/wishlist/toggle -> toggleWishlistItem
```

## Scope (In)
- Enforce active customer authentication via `requireAuth()`.
- Idempotent toggle operation: if item exists in wishlist -> remove it; otherwise -> create it.
- Retrieve full user wishlist enriched with product details and stock status.

## Scope (Out)
- Wishlist sharing links (Phase 3).

## Tech / Files to Touch
- `src/lib/services/wishlist.ts`
- `src/app/api/account/wishlist/route.ts`
- `src/app/api/account/wishlist/toggle/route.ts`

## Tests to Write FIRST
1. `tests/api/wishlist-auth.test.ts`: Requires authenticated session; returns 401 for guests.
2. `tests/api/wishlist-toggle.test.ts`: Toggling adds item, toggling second time removes item.
3. `tests/unit/wishlist-query.test.ts`: Returns wishlist enriched with product pricing and stock.

## Implementation Steps
1. Implement `toggleWishlistItem` in `src/lib/services/wishlist.ts` with Prisma findUnique + create/delete.
2. Implement `getWishlist` with product relations.
3. Build API route handlers in `src/app/api/account/wishlist/`.

## Acceptance Criteria
- [ ] Toggling a non-wishlisted product adds it to database and returns `isWishlisted: true`.
- [ ] Toggling an already-wishlisted product removes it and returns `isWishlisted: false`.
- [ ] Unauthenticated requests return HTTP `401 UNAUTHORIZED`.

## Definition of Done
- [ ] Unit & API tests pass 100%.
- [ ] Zero TypeScript errors.

## Edge Cases to Handle
- Toggling nonexistent `productId` returns HTTP `404 NOT_FOUND`.

## Pre-flight Check
- Confirm `WishlistItem` Prisma model and unique constraint `@@unique([userId, productId])` are active.

## What's Next
- `FEAT-011-FE-wishlist.md` (Wishlist UI & Quick-Add).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-011-BE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
