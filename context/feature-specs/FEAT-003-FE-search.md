# FEAT-003-FE — Search & Filter UI
**Priority**: P0 (Launch-Blocking)  
**Layer**: Frontend UI & Interactive Filters

## Goal
Build an interactive search bar with debounced input, responsive filter drawer/sidebar, active filter pills, and URL query synchronization.

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-003-BE-search.md`
- **Context pack**:
```typescript
import { SearchFilterParams } from "./FEAT-003-BE-search";
import { Product, PaginatedResult } from "@/types";
```
- **Consumes**:
  - `GET /api/search` -> `searchProducts(params: SearchFilterParams)`

## Scope (In)
- Search input with 300ms debounce and clear button.
- Filter sidebar (desktop) and bottom sheet/drawer (mobile).
- Price range slider / inputs and category filter checkboxes.
- Active filter pills with single-click removal.
- Sync filter state with Next.js URL query params (`useSearchParams`, `useRouter`).

## Scope (Out)
- Search backend query logic (handled in `FEAT-003-BE-search.md`).

## Tech / Files to Touch
- `src/app/(shop)/products/page.tsx`
- `src/components/search/search-bar.tsx`
- `src/components/search/filter-sidebar.tsx`
- `src/components/search/filter-drawer.tsx`
- `src/components/search/active-filters.tsx`
- `src/components/search/sort-dropdown.tsx`

## Tests to Write FIRST
1. `tests/ui/search-bar.test.tsx`: Debounces typing and pushes new `q` param to URL.
2. `tests/ui/filter-sidebar.test.tsx`: Selecting category updates active filters.
3. `tests/ui/active-filters.test.tsx`: Clicking "x" on a filter pill removes that filter.

## Implementation Steps
1. Create `SearchBar` component with debounced URL update hook.
2. Build `FilterSidebar` and mobile `FilterDrawer` using shadcn sheet primitives.
3. Create `ActiveFilters` component displaying chips for applied filters.
4. Integrate components into `/products` catalog page with paginated results list.

## Acceptance Criteria
- [ ] Typing into search input updates URL with `?q=value` after debounce without full page reload.
- [ ] Clicking a filter pill immediately removes the filter from URL and re-triggers fetch.
- [ ] Mobile view renders accessible "Filter & Sort" trigger button that opens bottom sheet.
- [ ] Loading skeleton cards display during search state transitions.

## Definition of Done
- [ ] All Fake DOM tests pass 100%.
- [ ] Zero layout jitter or console warnings.

## Edge Cases to Handle
- Empty search results show user-friendly empty state with "Clear all filters" CTA.
- Rapid checkbox clicks handled without desyncing URL params.

## Pre-flight Check
- Confirm `FEAT-003-BE-search.md` API route is operational.

## What's Next
- `FEAT-003-VERIFY-search.md` (Search & Filter Verification).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-003-FE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
