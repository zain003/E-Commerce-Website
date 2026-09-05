# FEAT-002-BE — Products & Category API
**Priority**: P0 (Launch-Blocking)  
**Layer**: Backend Service & Next.js 16 Cache Components

## Goal
Implement server-side product and category retrieval utilizing Next.js 16 `"use cache"` and `cacheLife` profiles with Prisma.

## Depends on / Context pack / Consumes
- **Depends on**: `000-shared-contracts.md`
- **Context pack**:
```typescript
import { Product, ProductVariant, Category, ApiResponse } from "@/types";

export interface ProductDetail extends Product {
  category: Category;
  variants: ProductVariant[];
}
```

## Provides / Exposes
```typescript
export async function getCategories(): Promise<Category[]>;
export async function getFeaturedProducts(): Promise<Product[]>;
export async function getProductBySlug(slug: string): Promise<ProductDetail | null>;
export async function getProductsByCategory(categorySlug: string): Promise<Product[]>;

// Route Handlers:
// GET /api/categories -> getCategories
// GET /api/products/featured -> getFeaturedProducts
// GET /api/products/:slug -> getProductBySlug
```

## Scope (In)
- Server-side data fetching with Next.js 16 `"use cache"` directive and `cacheLife("hours")`.
- Dynamic lookup by product slug including related variants and category.
- Error handling for missing slugs (returns `null` / `404`).

## Scope (Out)
- Search queries with dynamic price/sorting filters (covered in `FEAT-003-BE-search.md`).
- Admin product mutations (covered in `FEAT-008-BE-admin-products.md`).

## Tech / Files to Touch
- `src/lib/services/products.ts`
- `src/app/api/categories/route.ts`
- `src/app/api/products/featured/route.ts`
- `src/app/api/products/[slug]/route.ts`

## Tests to Write FIRST
1. `tests/unit/product-service.test.ts`: `getProductBySlug` returns complete product with variants.
2. `tests/api/product-detail.test.ts`: Missing slug returns HTTP `404`; valid slug returns `200` with payload.
3. `tests/unit/category-service.test.ts`: `getCategories` returns active categories list.

## Implementation Steps
1. Create `src/lib/services/products.ts` with cached queries using `"use cache"` and `cacheLife("hours")`.
2. Implement `getProductBySlug` with Prisma relations `include: { category: true, variants: true }`.
3. Implement `getCategories` and `getFeaturedProducts` queries.
4. Add Route Handlers in `src/app/api/products/[slug]/route.ts` and `src/app/api/categories/route.ts`.

## Acceptance Criteria
- [ ] Querying an existing product slug returns product details with all active variants.
- [ ] Querying a nonexistent slug returns `null` or HTTP `404`.
- [ ] All data read functions employ `"use cache"` and `cacheLife` directive.
- [ ] Archived products (`isArchived: true`) are excluded from customer-facing catalog queries.

## Definition of Done
- [ ] Unit & API tests pass 100%.
- [ ] TypeScript build clean with zero `any` types.

## Edge Cases to Handle
- Product with 0 variants handled gracefully.
- Special characters in slug encoded/decoded safely.

## Pre-flight Check
- Confirm `000-shared-contracts.md` schema migrations are applied.

## What's Next
- `FEAT-002-FE-products.md` (Product Detail & Catalog UI).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-002-BE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
