# Test Report: FEAT-004 — Cart Service & Session Management

**Feature ID:** `FEAT-004` (`FEAT-004-BE`)  
**Spec References:**  
- [`context/feature-specs/FEAT-004-BE-cart.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/FEAT-004-BE-cart.md)  
- [`context/feature-specs/000-shared-contracts.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/000-shared-contracts.md)  
**Date Tested:** `2026-09-13`  
**SQA Status:** `PASSED (100%)`  
**Tester:** `SQA Automation Engineer (Pair Programming Agent)`  

---

## 1. Executive Summary

| Layer | Test Suites | Total Tests | Passed | Failed | Pass Rate | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Cart Calculator (Unit)** | 1 | 10 | 10 | 0 | 100% | **PASSED** |
| **Cart Service & Logic (Unit)** | 1 | 8 | 8 | 0 | 100% | **PASSED** |
| **Guest Cart & Cookie Session (API)** | 1 | 4 | 4 | 0 | 100% | **PASSED** |
| **Stock Limit & Boundaries (API)** | 1 | 6 | 6 | 0 | 100% | **PASSED** |
| **Cart Route Handlers (API)** | 1 | 8 | 8 | 0 | 100% | **PASSED** |
| **Total (FEAT-004 Scope)** | **5** | **36** | **36** | **0** | **100%** | **PASSED** |
| **Repository-Wide Total** | **31** | **169** | **169** | **0** | **100%** | **PASSED** |

> **SQA Quality Gate:** 100% test pass rate across all 31 repository test suites (169 tests total). Next.js 16 build (`npm run build`) and TypeScript validation (`npx tsc --noEmit`) complete with zero errors.

---

## 2. Test Environment & Tools

- **Framework & Runtime:** Next.js 16.3.4 (App Router, Turbopack), React 19.2.8, Node.js v22
- **Test Runner:** Vitest v5.0.0
- **DOM Engine:** jsdom v29.1.1
- **Database & Persistence:** PostgreSQL + Prisma ORM v6.4.1 (`Cart`, `CartItem`, `ProductVariant`, `Product`)
- **Validation Engine:** Zod v4.5.4 (`addToCartSchema`, `updateCartItemSchema`, `mergeCartSchema`)
- **Session & Cookies:** HTTP-only cookies (`guest_cart_token`), NextAuth JWT session callback

---

## 3. Acceptance Criteria Traceability Matrix

### Backend Acceptance Criteria (`FEAT-004-BE`)
| AC ID | Acceptance Criterion | Test File & Test Name | SQA Verdict |
| :--- | :--- | :--- | :---: |
| **BE-AC-1** | Adding an item generates an HTTP-only `guest_cart_token` cookie if user is not authenticated | `tests/api/cart-guest.test.ts` > `generates an HTTP-only guest_cart_token cookie on first cart addition for guest` | `PASS` |
| **BE-AC-2** | Attempting to add quantity greater than available variant stock returns HTTP 400 with code `INSUFFICIENT_STOCK` | `tests/api/cart-stock-limit.test.ts` > `returns 400 INSUFFICIENT_STOCK when requested quantity exceeds available stock on fresh add`<br>`tests/api/cart-stock-limit.test.ts` > `returns 400 INSUFFICIENT_STOCK when cumulative quantity exceeds available stock` | `PASS` |
| **BE-AC-3** | Removing an item updates the subtotal and total item count accordingly | `tests/unit/cart-service.test.ts` > `removes item and recalculates subtotal and total itemCount`<br>`tests/api/cart-routes.test.ts` > `DELETE /api/cart/items/[id] returns 200 with updated cart after successful deletion` | `PASS` |
| **BE-AC-4** | Merging a guest cart transfers unique items and sums quantities for duplicate variants | `tests/unit/cart-service.test.ts` > `transfers unique items and sums quantities for duplicate variants`<br>`tests/api/cart-routes.test.ts` > `POST /api/cart/merge merges guest cart and clears guest_cart_token cookie on success` | `PASS` |
| **BE-AC-5** | Adding quantity 0 or negative numbers returns HTTP 400 | `tests/api/cart-stock-limit.test.ts` > `returns 400 VALIDATION_ERROR when quantity is 0 on POST /api/cart/items`<br>`tests/api/cart-stock-limit.test.ts` > `returns 400 VALIDATION_ERROR when quantity is negative on POST /api/cart/items` | `PASS` |
| **BE-AC-6** | Stale cart items referencing deleted or archived products are automatically pruned | `tests/unit/cart-service.test.ts` > `fetches user cart and prunes stale items referencing archived products` | `PASS` |
| **BE-AC-7** | Reusing existing guest cookie token does not overwrite or recreate cookies | `tests/api/cart-guest.test.ts` > `reuses existing guest_cart_token cookie without generating a new cookie` | `PASS` |
| **BE-AC-8** | Ownership invariant: User B cannot modify or delete User A's cart items (returns 403 FORBIDDEN) | `tests/unit/cart-service.test.ts` > `enforces ownership: blocks User B from modifying User A's cart item`<br>`tests/unit/cart-service.test.ts` > `enforces ownership: blocks User B from removing User A's cart item`<br>`tests/api/cart-routes.test.ts` > `returns 403 FORBIDDEN when user does not own the cart item` | `PASS` |
| **BE-AC-9** | Unit totals and subtotal calculation with decimal precision | `tests/unit/cart-calculator.test.ts` > `correctly aggregates subtotal and itemCount across multiple items with proper decimal rounding` | `PASS` |

---

## 4. Edge Cases & Security Checks

- **Zero & Negative Numbers:** Adding 0 or negative quantities rejected with HTTP 400 `VALIDATION_ERROR`.
- **Nonexistent Resources:** Adding nonexistent variant ID or modifying nonexistent cart item returns HTTP 404 `NOT_FOUND`.
- **Archived Products:** Adding archived products or querying carts with archived variants triggers rejection or automatic pruning.
- **Cross-Tenant Access Control:** Modifying or deleting cart items belonging to another user's cart strictly returns HTTP 403 `FORBIDDEN`.
- **Unauthenticated Merging:** `POST /api/cart/merge` requires active authentication; unauthenticated calls return HTTP 401 `UNAUTHORIZED`.
- **Atomic Transaction Integrity:** Guest cart merging, item quantity updates, item deletions, and guest cart row cleanup execute within an atomic `prisma.$transaction`.

---

## 5. Defects Found & Resolved

1. **Defect:** Zod v4 number schema incompatibility (`required_error` option deprecated in Zod v4).  
   **Root Cause:** Legacy Zod v3 error configuration syntax in `src/lib/validators/cart.ts`.  
   **Resolution:** Replaced with standard Zod v4 chain `z.number().int().min(1)` and verified with `npx tsc --noEmit`.

---

## 6. Final SQA Verdict

### **PASSED (100%)**
All 36 automated tests designed for `FEAT-004-BE` pass with 100% success rate. The repository-wide test suite passes 169 tests across 31 test files. Next.js 16 production build compiles with zero TypeScript or route errors.
