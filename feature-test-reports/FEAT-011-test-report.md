# SQA Verification Test Report: FEAT-011 — Customer Wishlist

## 1. Feature Metadata
- **Feature ID**: `FEAT-011` (Full-Stack Verification: `FEAT-011-BE`, `FEAT-011-FE`, `FEAT-011-VERIFY`)
- **Feature Name**: Customer Wishlist & Move to Cart
- **Target Layer**: Full-Stack (Next.js 16 App Router API Handlers, Prisma ORM, Zod Validation, React 19 Frontend Components, Fake DOM UI)
- **Execution Date**: 2026-09-15
- **Author / SQA Engineer**: Antigravity SQA Automation Agent
- **Status**: PASSED (100% End-to-End Verification)

---

## 2. Test Environment & Stack
- **Test Runner**: Vitest v5.0.0
- **DOM Simulator**: `jsdom` (with `@testing-library/react` and `@testing-library/user-event`)
- **Runtime Framework**: Next.js 16.3.4 (App Router, Turbopack, React 19.2)
- **Database & ORM**: PostgreSQL via Prisma ORM 6 (`WishlistItem` model with `@@unique([userId, productId])`)
- **Language**: TypeScript 5 (Strict Mode enabled, zero `any` declarations)
- **Styling**: Tailwind CSS v4 design tokens

---

## 3. Traceability Matrix

| Acceptance Criterion | Automated Test Description | Test File Location | Status |
|---|---|---|---|
| **AC-1**: Toggling non-wishlisted product adds item to database and returns `isWishlisted: true` | `toggles non-wishlisted product: adds to database and returns isWishlisted: true`<br>`creates wishlist item if not already present` | [`tests/api/wishlist-toggle.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/wishlist-toggle.test.ts)<br>[`tests/unit/wishlist-query.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/unit/wishlist-query.test.ts) | ✅ PASS |
| **AC-2**: Toggling already-wishlisted product removes item from database and returns `isWishlisted: false` | `toggles already-wishlisted product: removes from database and returns isWishlisted: false`<br>`deletes wishlist item if already present` | [`tests/api/wishlist-toggle.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/wishlist-toggle.test.ts)<br>[`tests/unit/wishlist-query.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/unit/wishlist-query.test.ts) | ✅ PASS |
| **AC-3**: Unauthenticated requests return HTTP `401 UNAUTHORIZED` | `returns HTTP 401 UNAUTHORIZED when session is null`<br>`returns HTTP 401 UNAUTHORIZED when session has no user ID` (for both GET and POST) | [`tests/api/wishlist-auth.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/wishlist-auth.test.ts) | ✅ PASS |
| **AC-4**: Clicking heart icon toggles icon state immediately and sends API request | `toggles to wishlisted state immediately and fires API toggle request when clicked`<br>`toggles back to un-wishlisted state when clicked again` | [`tests/ui/wishlist-button.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-button.test.tsx) | ✅ PASS |
| **AC-5**: If user is not authenticated, clicking heart prompts login redirect | `redirects unauthenticated users to login page when clicked` | [`tests/ui/wishlist-button.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-button.test.tsx) | ✅ PASS |
| **AC-6**: Moving an item to cart adds item and removes it from the wishlist view | `adds in-stock variant to cart and removes product from wishlist when clicking Move to Cart` | [`tests/ui/wishlist-move-to-cart.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-move-to-cart.test.tsx) | ✅ PASS |
| **AC-7**: Empty wishlist renders friendly prompt with "Browse Products" button | `renders friendly empty state with 'Browse Products' button when user has 0 items` | [`tests/ui/wishlist-page.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-page.test.tsx) | ✅ PASS |
| **AC-8**: Dedicated `/account/wishlist` page with item cards, removal, and session protection | `redirects unauthenticated user to /login`<br>`renders wishlist items with name, price, category, and stock indicators`<br>`removes an item from the view when the remove button is clicked` | [`tests/ui/wishlist-page.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-page.test.tsx) | ✅ PASS |

---

## 4. Test Suite Execution Results

### Layer-by-Layer Verification Summary
- **Frontend / Fake DOM UI Tests**: 11 passed across 3 test suites
  - [`tests/ui/wishlist-button.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-button.test.tsx): 5 passed (100%)
  - [`tests/ui/wishlist-move-to-cart.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-move-to-cart.test.tsx): 2 passed (100%)
  - [`tests/ui/wishlist-page.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-page.test.tsx): 4 passed (100%)
- **API Endpoint Tests**: 9 passed across 2 test suites
  - [`tests/api/wishlist-auth.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/wishlist-auth.test.ts): 4 passed (100%)
  - [`tests/api/wishlist-toggle.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/wishlist-toggle.test.ts): 5 passed (100%)
- **Backend & Unit Logic Tests**: 8 passed across 1 test suite
  - [`tests/unit/wishlist-query.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/unit/wishlist-query.test.ts): 8 passed (100%)

**Module 11 Total**: **28 passing tests across 6 test suites (100% Pass Rate, 0 Failures)**.  
**Repository-Wide Total**: **528 passing tests across 93 test suites (100% Pass Rate, 0 Failures, 0 Skipped)**.

---

## 5. Security & Edge Case Verification
1. **Authentication Guards**: All wishlist routes enforce authenticated sessions. Guests attempting mutations receive HTTP 401 `UNAUTHORIZED`.
2. **Idempotent Toggle**: Compound unique index `@@unique([userId, productId])` guarantees no duplicate entries. Toggling an existing item deletes it; toggling an absent item creates it.
3. **Nonexistent Product Handling**: Attempting to toggle a non-existent product ID yields HTTP 404 `NOT_FOUND`.
4. **Out-of-Stock Handling**: Wishlist cards dynamically detect stock status (`variants.some(v => v.stock > 0)` and `!product.isArchived`), cleanly disabling the "Move to Cart" button with "Out of Stock" text for unavailable items.
5. **Optimistic UI with Rollback**: `WishlistButton` updates state immediately on user click and gracefully reverts if the network/API request fails.
6. **SSR & Prerender Safety**: Custom safe session hooks ensure clean static prerendering during `next build` without crashing on undefined context.

---

## 6. SQA Definition of Done Sign-off
- [x] All 7 acceptance criteria verified with automated test suites.
- [x] Zero regressions across all 93 test files in the repository.
- [x] Strict TypeScript check (`npx tsc --noEmit`) passes with 0 errors.
- [x] Next.js 16 production build (`npm run build`) succeeded with 0 errors across all 37 routes.
- [x] Verified test report finalized: `feature-test-reports/FEAT-011-test-report.md`.
- [x] `context/feature-specs/INDEX.md` and `context/progress-tracker.md` updated.
