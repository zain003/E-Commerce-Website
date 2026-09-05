# FEAT-011-FE — Wishlist UI & Quick-Add
**Priority**: P1 (Growth Phase)  
**Layer**: Frontend UI & Wishlist Views

## Goal
Add wishlist heart icon toggle on Product Cards and PDP, and build the dedicated `/account/wishlist` page with direct "Move to Cart" action.

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-011-BE-wishlist.md`
- **Context pack**:
```typescript
import { HydratedWishlistItem, ToggleWishlistResponse } from "./FEAT-011-BE-wishlist";
import { ApiResponse } from "@/types";
```
- **Consumes**:
  - `GET /api/account/wishlist` -> `getWishlist()`
  - `POST /api/account/wishlist/toggle` -> `toggleWishlistItem(productId)`

## Scope (In)
- Heart icon button on `ProductCard` and Product Detail Page with active/inactive fill animations.
- Dedicated `/account/wishlist` page displaying wishlisted item cards.
- "Move to Cart" button on wishlist cards that adds default variant to cart and removes from wishlist.
- Global toast notifications on wishlist toggle.

## Scope (Out)
- Wishlist email notification alerts (Phase 3).

## Tech / Files to Touch
- `src/app/account/wishlist/page.tsx`
- `src/components/wishlist/wishlist-button.tsx`
- `src/components/wishlist/wishlist-card.tsx`
- `src/components/product/product-card.tsx`

## Tests to Write FIRST
1. `tests/ui/wishlist-button.test.tsx`: Toggles filled heart state and calls toggle API endpoint.
2. `tests/ui/wishlist-page.test.tsx`: Renders saved items list and empty state message when 0 items.
3. `tests/ui/wishlist-move-to-cart.test.tsx`: Clicking Move to Cart triggers cart addition.

## Implementation Steps
1. Create `WishlistButton` with Lucide `Heart` icon and micro-bounce animation.
2. Embed `WishlistButton` in `ProductCard` and PDP.
3. Build `WishlistCard` with remove button and Move to Cart CTA.
4. Assemble `/account/wishlist` page.

## Acceptance Criteria
- [ ] Clicking heart icon toggles icon state immediately and sends API request.
- [ ] If user is not authenticated, clicking heart prompts login modal or redirect.
- [ ] Moving an item to cart adds item and removes it from the wishlist view.
- [ ] Empty wishlist renders friendly prompt with "Browse Products" button.

## Definition of Done
- [ ] All Fake DOM tests pass 100%.
- [ ] Accessible ARIA button labels (`aria-label="Add to wishlist"` / `aria-label="Remove from wishlist"`).

## Edge Cases to Handle
- Wishlisted item that went out of stock shows "Out of Stock" disabled button.

## Pre-flight Check
- Confirm `FEAT-011-BE-wishlist.md` API endpoints are functional.

## What's Next
- `FEAT-011-VERIFY-wishlist.md` (Wishlist Verification Pass).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-011-FE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
