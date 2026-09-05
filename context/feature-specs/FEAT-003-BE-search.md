# FEAT-003-BE — Search & Filter Engine
**Priority**: P0 (Launch-Blocking)  
**Layer**: Backend Dynamic Queries & Search API

## Goal
Provide dynamic product searching, multi-criteria filtering (category, price range, stock, sorting), and pagination via Prisma queries.

## Depends on / Context pack / Consumes
- **Depends on**: `000-shared-contracts.md`
- **Context pack**:
```typescript
import { Product, PaginatedResult } from "@/types";

export interface SearchFilterParams {
  query?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "featured";
  page?: number;
  limit?: number;
}
```

## Provides / Exposes
```typescript
export async function searchProducts(params: SearchFilterParams): Promise<PaginatedResult<Product>>;

// Route Handlers:
// GET /api/search?q=...&category=...&minPrice=...&maxPrice=...&sort=...&page=...
```

## Scope (In)
- Text matching on `name` and `description` (case-insensitive ILIKE/contains).
- Filtering by category slug, minimum price, maximum price, and in-stock variants.
- Sorting options: `price_asc`, `price_desc`, `newest` (`createdAt DESC`), `featured`.
- Pagination with `page`, `limit` (default 12), and computed `totalPages`.

## Scope (Out)
- Semantic vector embeddings search (Phase 2).
- Client search input debouncing (handled in `FEAT-003-FE-search.md`).

## Tech / Files to Touch
- `src/lib/services/search.ts`
- `src/app/api/search/route.ts`
- `src/lib/validators/search.ts`

## Tests to Write FIRST
1. `tests/unit/search-filter.test.ts`: Filters products within specified `minPrice` and `maxPrice`.
2. `tests/api/search-route.test.ts`: Returns paginated results matching `q` query string.
3. `tests/unit/search-sorting.test.ts`: Sorts items correctly for `price_asc` and `newest`.

## Implementation Steps
1. Create query parameter Zod parser in `src/lib/validators/search.ts`.
2. Build Prisma dynamic `where` clause builder in `src/lib/services/search.ts`.
3. Calculate `skip` and `take` for pagination; fetch items and total count atomically.
4. Implement `GET /api/search` route handler returning `PaginatedResult<Product>`.

## Acceptance Criteria
- [ ] Querying with `q="shirt"` returns only products whose name or description contains "shirt".
- [ ] Applying `minPrice=20` and `maxPrice=50` returns only products where `basePrice` is between 20 and 50.
- [ ] Sorting by `price_asc` returns products in non-decreasing order of `basePrice`.
- [ ] Invalid/negative page parameters fallback safely to `page=1, limit=12`.

## Definition of Done
- [ ] Unit & API tests pass 100%.
- [ ] Clean type safety without any unchecked query cast.

## Edge Cases to Handle
- Empty search string returns full filtered catalog without throwing errors.
- `maxPrice < minPrice` automatically swapped or rejected with `400`.

## Pre-flight Check
- Confirm `000-shared-contracts.md` schema and `Product` model are present.

## What's Next
- `FEAT-003-FE-search.md` (Search Bar & Filter UI).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-003-BE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
