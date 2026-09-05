# FEAT-002-FE — Product Detail & Catalog UI
**Priority**: P0 (Launch-Blocking)  
**Layer**: Frontend UI & Server Components

## Goal
Build responsive Home, Category, and Product Detail Pages with image gallery, variant selection, price delta calculations, and stock indicators.

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-002-BE-products.md`
- **Context pack**:
```typescript
import { ProductDetail } from "./FEAT-002-BE-products";
import { Product, Category } from "@/types";
```
- **Consumes**:
  - `getFeaturedProducts()`
  - `getCategories()`
  - `getProductBySlug(slug: string)`

## Scope (In)
- Homepage (`/`) with Hero Banner, Category Badges, and Featured Products Grid.
- Product Card component with image fallback, price, and category tag.
- Product Detail Page (`/products/[slug]`) with image gallery, variant pills (size/color), dynamic price display, and stock status badge.
- Sticky "Add to Cart" mobile bar.

## Scope (Out)
- Live cart state mutation (delegated to `FEAT-004-FE-cart.md`).
- Review submission form (covered in `FEAT-010-FE-reviews.md`).

## Tech / Files to Touch
- `src/app/(shop)/page.tsx`
- `src/app/(shop)/products/[slug]/page.tsx`
- `src/components/product/product-card.tsx`
- `src/components/product/product-gallery.tsx`
- `src/components/product/variant-selector.tsx`
- `src/components/product/price-tag.tsx`

## Tests to Write FIRST
1. `tests/ui/product-card.test.tsx`: Renders product title, formatted currency price, and image.
2. `tests/ui/variant-selector.test.tsx`: Updates selected variant and price delta on click.
3. `tests/ui/product-gallery.test.tsx`: Changes active thumbnail when clicked.

## Implementation Steps
1. Create `ProductCard` component with responsive Next.js `<Image>`.
2. Build Homepage in `src/app/(shop)/page.tsx` fetching featured products and categories.
3. Implement `VariantSelector` managing selected variant state and stock indicators.
4. Implement `ProductGallery` with thumbnail strip and zoom/active preview.
5. Assemble `/products/[slug]` Server Component page with async params unwrapping (`await params`).

## Acceptance Criteria
- [ ] Product Card displays formatted price (e.g. `$49.99`) and links to correct slug URL.
- [ ] Selecting a variant with price delta updates the displayed total price immediately.
- [ ] Out of stock variants show "Out of Stock" badge and disable selection.
- [ ] Mobile view renders sticky action bar at bottom of viewport on product detail page.

## Definition of Done
- [ ] All UI component unit tests pass.
- [ ] Zero hydration warnings or layout shifts.
- [ ] Semantic HTML headings (`h1` per page) and accessible ARIA attributes.

## Edge Cases to Handle
- Product without images displays high quality placeholder.
- Long product titles truncate cleanly without breaking card grid.

## Pre-flight Check
- Confirm `FEAT-002-BE-products.md` provides valid mock/database product data.

## What's Next
- `FEAT-002-VERIFY-products.md` (Product Catalog Verification).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-002-FE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
