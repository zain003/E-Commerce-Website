# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase
- Phase 1 — MVP (In Progress)

## Current Goal
- Complete Module 4: Cart Service & Session (`FEAT-004`)

## Completed
- Next.js 16 (App Router + Turbopack + Tailwind v4 + TypeScript) project initialization.
- Full feature specification suite generated in `context/feature-specs/` (40 spec & tracker files).
- `000-shared-contracts.md` with complete Prisma schema, type definitions, and RBAC patterns.
- `INDEX.md` matrix and `DEVIATIONS.md` tracker created.
- `FEAT-001-BE-auth.md`: Credentials authentication, user registration, profile retrieval, and address CRUD APIs (`/api/auth/register`, `/api/account/profile`, `/api/account/addresses`, `/api/account/addresses/[id]`).
- Multi-layer SQA test suite for Auth BE: 23 passing tests across 4 test suites.
- `FEAT-001-FE-auth.md`: Login (`/login`), Registration (`/register`), Account Profile (`/account/profile`), and Saved Addresses (`/account/addresses`) with accessible forms, React Hook Form + Zod, Tailwind v4 design tokens, AddressCard, modal dialog, and Fake DOM UI tests.
- Multi-layer SQA test suite for Auth FE: 19 passing tests across 3 UI test suites (42 tests total passed across all layers).
- `FEAT-001-VERIFY-auth.md`: Authentication Full-Stack Verification & End-to-End Sign-off. Verified all 8 acceptance criteria and SQA DoD items. All 42 automated tests pass with 0 failures, `tsc --noEmit` and `npm run build` succeed cleanly with zero errors.
- Verified test report finalized: `feature-test-reports/FEAT-001-test-report.md`.
- `FEAT-002-BE-products.md`: Product Catalog and Category Read API with Next.js 16 `"use cache"` and `cacheLife("hours")`, slug lookup with relation graph (`category`, `variants`), featured products query, categories query, and Route Handlers (`/api/categories`, `/api/products/featured`, `/api/products/[slug]`).
- Multi-layer SQA test suite for Products BE: 18 passing tests across 5 test suites.
- `FEAT-002-FE-products.md`: Product Detail & Catalog UI with `PriceTag` (robust Prisma Decimal formatting & price deltas), `ProductCard` (Next.js Image with fill/sizes, clean truncation, placeholder fallback), `ProductGallery` (active preview & thumbnail transitions), `VariantSelector` (dynamic total price, out-of-stock disabling, stock indicators), `ProductDetailView` (sticky mobile action bar, full-width CTA), Homepage (`src/app/(shop)/page.tsx`), Product Detail Page (`src/app/(shop)/products/[slug]/page.tsx`), and Storefront layout (`src/app/(shop)/layout.tsx`) with mobile bottom navigation bar.
- Multi-layer SQA test suite for Products FE: 21 passing tests across 4 UI test suites (`product-card.test.tsx`, `product-gallery.test.tsx`, `variant-selector.test.tsx`, `product-detail-view.test.tsx`). Repository-wide test suite: 81 passing tests across 16 test suites with 100% success.
- `FEAT-002-VERIFY-products.md`: Product Catalog Full-Stack Verification Pass. Executed multi-layer SQA verification suites: Fake DOM UI (40 tests across 7 suites), API Endpoints (24 tests across 6 suites), Backend & Unit (17 tests across 3 suites) with 81 total repository tests passing (100% success rate, 0 failures, 0 skipped). All 8 acceptance criteria from `FEAT-002-VERIFY-products.md` verified. `npx tsc --noEmit` (0 errors) and Next.js 16 production build (`npm run build`) succeeded cleanly.
- Verified test report finalized: `feature-test-reports/FEAT-002-test-report.md`.
- `FEAT-003-BE-search.md`: Dynamic Search & Filter Engine backend. Implemented Zod query parameter validation (`searchQuerySchema`, `parseSearchParams`) with safe fallback for invalid/negative page parameters (`page=1, limit=12`) and inverted price validation; Prisma dynamic where clause with case-insensitive `contains` text search across name/description, decoded category slugs, price bounds, in-stock variant filtering, and unconditional exclusion of archived products (`isArchived: false`); multi-strategy sorting (`price_asc`, `price_desc`, `newest`, `featured`); atomic pagination with `prisma.$transaction([findMany, count])`; and Next.js Route Handler `GET /api/search` conforming to `ApiResponse<PaginatedResult<Product>>`.
- Multi-layer SQA test suite for Search BE: 26 passing tests across 4 test suites (`search-validator.test.ts`, `search-filter.test.ts`, `search-sorting.test.ts`, `search-route.test.ts`). Repository-wide test suite: 107 passing tests across 20 test suites with 100% success rate. `npx tsc --noEmit` and `npm run build` pass with zero errors.
- `FEAT-003-FE-search.md`: Interactive Search & Filter Catalog UI. Implemented debounced `SearchBar` (300ms debounce with instant clear button, search icon, accessible label, and Enter key submission), `SortDropdown` (accessible sort selector supporting `newest`, `price_asc`, `price_desc`, `featured`), `FilterSidebar` (desktop filter panel with category selection, price range min/max inputs with "$" prefix, in-stock checkbox, and clear CTA), `FilterDrawer` (mobile bottom sheet modal with accessible trigger button, active filter badge count, and sticky bottom action bar), `ActiveFilters` (removable filter pills with single-click removal and "Clear all" button), `CatalogView` (interactive client coordinator with loading skeleton pulse cards during transitions, accessible empty state with friendly copy and reset CTA, and accessible pagination bar), and Next.js 16 Server Component `ProductsPage` (`src/app/(shop)/products/page.tsx`) with async `searchParams` and cached category/search pre-fetching. Updated storefront layout navigation links (`src/app/(shop)/layout.tsx`) to direct catalog and search icons to `/products`.
- Multi-layer SQA test suite for Search FE: 26 passing tests across 6 UI test suites (`search-bar.test.tsx`, `filter-sidebar.test.tsx`, `active-filters.test.tsx`, `sort-dropdown.test.tsx`, `filter-drawer.test.tsx`, `catalog-view.test.tsx`). Repository-wide test suite: 133 passing tests across 26 test suites with 100% success rate. `npx tsc --noEmit` and `npm run build` pass with zero errors.
- `FEAT-003-VERIFY-search.md`: Search & Filter Full-Stack Verification Pass. Verified all 8 acceptance criteria from `FEAT-003-VERIFY-search.md` across Frontend Fake DOM (26 tests across 6 suites), API Endpoints (6 tests across 1 suite), and Backend/Unit logic (20 tests across 3 suites) with 133 total repository tests passing (100% success rate, 0 failures, 0 skipped). `npx tsc --noEmit` and Next.js 16 production build (`npm run build`) succeeded cleanly with zero errors.
- Verified test report finalized: `feature-test-reports/FEAT-003-test-report.md`.

## In Progress
- Transitioning to Module 4: Cart Service & Session (`FEAT-004-BE-cart.md`).

## Next Up
- `FEAT-004-BE-cart.md` (Cart service, guest token cookie sessions, stock limit validation, and cart CRUD API).

## Open Questions
- None currently blocking.

## Architecture Decisions
- Next.js 16 App Router with `"use cache"` and explicit `cacheLife` profiles for catalog reads.
- Idempotent Stripe webhook order creation in atomic Prisma transactions.
- Multi-layer SQA testing strategy (Fake DOM, API routes, Unit, DB constraints).
- Accessible forms strictly paired with `<label>` and dynamic `aria-invalid` attributes.

## Session Notes
- Specifications are self-contained and ready for fresh LLM coding sessions.
