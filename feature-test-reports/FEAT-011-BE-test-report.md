# SQA Test Report: FEAT-011-BE — Wishlist Service & API

## 1. Feature Metadata
- **Feature ID**: `FEAT-011-BE`
- **Feature Name**: Wishlist Service & API Backend
- **Target Layer**: Backend Service, Database Query/Mutation, Zod Boundary Validation & Next.js 16 App Router Route Handlers
- **Date**: 2026-09-15
- **Author/Tester**: SQA Automation Engineer & Lead Full-Stack Agent
- **Target Specifications**: [`context/feature-specs/FEAT-011-BE-wishlist.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/FEAT-011-BE-wishlist.md)

---

## 2. Test Environment & Stack
- **Framework**: Next.js 16.3.4 (App Router + Turbopack)
- **Language**: TypeScript 5 (Strict Mode)
- **Runtime**: Node.js v22
- **Testing Engine**: Vitest v5.0.0
- **DOM Simulator**: jsdom v29.1.1
- **Database / ORM**: PostgreSQL + Prisma Client v6.4.1 (`WishlistItem` model with `@@unique([userId, productId])`)
- **Auth**: NextAuth.js v4 (Authenticated session verification)

---

## 3. Traceability Matrix

| Acceptance Criterion | Automated Test Description | Test File Location | Status |
|---|---|---|---|
| **AC-1**: Toggling non-wishlisted product adds item and returns `isWishlisted: true` | `toggles non-wishlisted product: adds to database and returns isWishlisted: true`<br>`creates wishlist item if not already present` | [`tests/api/wishlist-toggle.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/wishlist-toggle.test.ts)<br>[`tests/unit/wishlist-query.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/unit/wishlist-query.test.ts) | **PASSED** |
| **AC-2**: Toggling already-wishlisted product removes item and returns `isWishlisted: false` | `toggles already-wishlisted product: removes from database and returns isWishlisted: false`<br>`deletes wishlist item if already present` | [`tests/api/wishlist-toggle.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/wishlist-toggle.test.ts)<br>[`tests/unit/wishlist-query.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/unit/wishlist-query.test.ts) | **PASSED** |
| **AC-3**: Unauthenticated requests return HTTP 401 UNAUTHORIZED | `returns HTTP 401 UNAUTHORIZED when session is null`<br>`returns HTTP 401 UNAUTHORIZED when session has no user ID` (for both GET and POST) | [`tests/api/wishlist-auth.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/wishlist-auth.test.ts) | **PASSED** |
| **AC-4**: Retrieve wishlist enriched with product pricing and live inStock status | `returns wishlist items enriched with product and calculated inStock status (true when stock > 0)`<br>`marks product as out of stock (inStock: false) if product is archived even with variant stock`<br>`returns empty array when user has no wishlist items` | [`tests/unit/wishlist-query.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/unit/wishlist-query.test.ts) | **PASSED** |
| **Edge Case 1**: Toggling nonexistent product returns HTTP 404 NOT_FOUND | `returns HTTP 404 NOT_FOUND when product does not exist` | [`tests/api/wishlist-toggle.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/wishlist-toggle.test.ts)<br>[`tests/unit/wishlist-query.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/unit/wishlist-query.test.ts) | **PASSED** |
| **Edge Case 2**: Invalid payload returns HTTP 400 | `returns HTTP 400 VALIDATION_ERROR when productId is missing or empty`<br>`returns HTTP 400 BAD_REQUEST when JSON payload is malformed` | [`tests/api/wishlist-toggle.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/wishlist-toggle.test.ts) | **PASSED** |
| **Error Handling**: Database exception resilience | `handles database exceptions gracefully and returns INTERNAL_SERVER_ERROR`<br>`handles database exceptions during toggle gracefully` | [`tests/unit/wishlist-query.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/unit/wishlist-query.test.ts) | **PASSED** |

---

## 4. Test Suite Execution Results

```
Test Files: 3 passed (3 total for FEAT-011-BE)
     Tests: 17 passed (17 total for FEAT-011-BE)
```

### Layer-by-Layer Breakdown
- **Wishlist Auth Guards (API)**:
  - [`tests/api/wishlist-auth.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/wishlist-auth.test.ts): **4 passed**, 0 failed
- **Wishlist Toggle Operations & Errors (API)**:
  - [`tests/api/wishlist-toggle.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/api/wishlist-toggle.test.ts): **5 passed**, 0 failed
- **Wishlist Query & In-Stock Enrichment (Unit)**:
  - [`tests/unit/wishlist-query.test.ts`](file:///c:/Users/zaina/Desktop/ecommerce/tests/unit/wishlist-query.test.ts): **8 passed**, 0 failed

---

## 5. SQA Verdict
**PASSED (100%)** — All 17 wishlist backend test cases pass with zero failures. Strict TypeScript checks pass with zero errors (`npx tsc --noEmit` exited with 0). Ready for Frontend implementation (`FEAT-011-FE-wishlist.md`).
