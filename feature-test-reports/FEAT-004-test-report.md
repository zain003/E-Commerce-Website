# Test Report: FEAT-004 — Cart Service, Session Management & Client UI

**Feature ID:** `FEAT-004` (`FEAT-004-BE` & `FEAT-004-FE`)  
**Spec References:**  
- [`context/feature-specs/FEAT-004-BE-cart.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/FEAT-004-BE-cart.md)  
- [`context/feature-specs/FEAT-004-FE-cart.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/FEAT-004-FE-cart.md)  
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
| **Cart Drawer UI (Fake DOM)** | 1 | 6 | 6 | 0 | 100% | **PASSED** |
| **Cart Item Actions & Optimistic (Fake DOM)** | 1 | 7 | 7 | 0 | 100% | **PASSED** |
| **Cart Empty State UI (Fake DOM)** | 1 | 3 | 3 | 0 | 100% | **PASSED** |
| **Total (FEAT-004 Scope)** | **8** | **52** | **52** | **0** | **100%** | **PASSED** |
| **Repository-Wide Total** | **34** | **186** | **186** | **0** | **100%** | **PASSED** |

> **SQA Quality Gate:** 100% test pass rate across all 34 repository test suites (186 tests total). Next.js 16 build (`npm run build`) and TypeScript validation (`npx tsc --noEmit`) complete with zero errors.

---

## 2. Test Environment & Tools

- **Framework & Runtime:** Next.js 16.3.4 (App Router, Turbopack), React 19.2.8, Node.js v22
- **Test Runner:** Vitest v5.0.0
- **DOM Engine:** jsdom v29.1.1, `@testing-library/react` v16.3.3, `@testing-library/user-event` v14.6.7
- **State Management:** Zustand v5.0.15 (`useCartStore`)
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

### Frontend Acceptance Criteria (`FEAT-004-FE`)
| AC ID | Acceptance Criterion | Test File & Test Name | SQA Verdict |
| :--- | :--- | :--- | :---: |
| **FE-AC-1** | Clicking "Add to Cart" on any product opens the Cart Drawer automatically and shows newly added item | `tests/ui/product-detail-view.test.tsx` > `calls addItem with selected variant and quantity 1 when Add to Cart is clicked`<br>`tests/ui/cart-drawer.test.tsx` > `renders slide-out dialog with accessible attributes when isOpen is true` | `PASS` |
| **FE-AC-2** | Changing quantity updates displayed subtotal instantly; rolls back with toast/notification if API fails | `tests/ui/cart-item-actions.test.tsx` > `optimistically increments quantity and updates subtotal text instantly`<br>`tests/ui/cart-item-actions.test.tsx` > `optimistically decrements quantity and updates subtotal text instantly`<br>`tests/ui/cart-item-actions.test.tsx` > `rolls back quantity and displays error message if update API fails` | `PASS` |
| **FE-AC-3** | Header cart badge displays exact total item count and opens drawer on click | `tests/ui/cart-drawer.test.tsx` > `opens drawer when HeaderCartButton is clicked`<br>`tests/ui/cart-item-actions.test.tsx` > `renders item name, variant label, price, and current quantity` | `PASS` |
| **FE-AC-4** | Empty cart displays clean message and primary button routing to `/products` | `tests/ui/cart-empty-state.test.tsx` > `renders empty cart illustration, clean message, and Start Shopping button in drawer`<br>`tests/ui/cart-empty-state.test.tsx` > `navigates to /products and closes drawer when clicking Start Shopping button`<br>`tests/ui/cart-empty-state.test.tsx` > `renders dedicated empty cart state on the full /cart page` | `PASS` |
| **FE-AC-5** | Stepper boundary limits (disabled decrement at 1, disabled increment at max stock) | `tests/ui/cart-item-actions.test.tsx` > `disables decrement button when item quantity is 1`<br>`tests/ui/cart-item-actions.test.tsx` > `disables increment button when item quantity reaches available stock` | `PASS` |
| **FE-AC-6** | Dialog dismissal via backdrop click, close button, or Escape key | `tests/ui/cart-drawer.test.tsx` > `closes drawer when close (X) button is clicked`<br>`tests/ui/cart-drawer.test.tsx` > `closes drawer when clicking backdrop overlay`<br>`tests/ui/cart-drawer.test.tsx` > `closes drawer when pressing Escape key` | `PASS` |

---

## 4. Edge Cases & Security Checks

- **Zero & Negative Numbers:** Adding 0 or negative quantities rejected with HTTP 400 `VALIDATION_ERROR`.
- **Stock Limit Boundary:** Stepper disables `+` button when quantity reaches `variant.stock`; server rejects with `INSUFFICIENT_STOCK` and UI rolls back with clear error notification.
- **Race Condition Prevention:** Optimistic quantity updates are tracked and rolled back cleanly if server mutation returns error or rejects.
- **Cross-Tenant Access Control:** Modifying or deleting cart items belonging to another user's cart strictly returns HTTP 403 `FORBIDDEN`.
- **Keyboard Navigation & ARIA:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-live="polite"` on stepper, and ESC key listener tested and passing.

---

## 5. Defects Found & Resolved

1. **Defect:** In `tests/ui/cart-item-actions.test.tsx`, `screen.getByText("2")` matched multiple elements (both header badge and item quantity stepper).  
   **Root Cause:** Ambiguous text query across multiple UI components in the drawer.  
   **Resolution:** Added `data-testid="item-quantity"` to the quantity stepper in `CartItemRow` and asserted on `screen.getByTestId("item-quantity")`.

2. **Defect:** React DOM warning for `fill` attribute passed to native `<img />` in mock `next/image`.  
   **Root Cause:** Mock destructured props without stripping `fill` boolean before spreading to `<img>`.  
   **Resolution:** Destructured `fill` explicitly in test mock to eliminate warning.

---

## 6. Final SQA Verdict

### **PASSED (100%)**
All 52 automated tests designed for `FEAT-004` (36 BE + 16 FE) pass with 100% success rate. The repository-wide test suite passes 186 tests across 34 test files. Next.js 16 production build compiles with zero TypeScript or route errors.
