# SQA Test Report: FEAT-011-FE — Wishlist UI & Quick-Add

## 1. Feature Metadata
- **Feature ID**: `FEAT-011-FE`
- **Feature Name**: Customer Wishlist UI & Move to Cart
- **Target Layer**: Frontend UI Components, Lucide Heart Animations, Optimistic Toggling, Dedicated `/account/wishlist` Page, and Move to Cart Flow
- **Date**: 2026-09-15
- **Author/Tester**: SQA Automation Engineer & Lead Full-Stack Agent
- **Target Specifications**: [`context/feature-specs/FEAT-011-FE-wishlist.md`](file:///c:/Users/zaina/Desktop/ecommerce/context/feature-specs/FEAT-011-FE-wishlist.md)

---

## 2. Test Environment & Stack
- **Framework**: Next.js 16.3.4 (App Router + Turbopack)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4 design tokens
- **Testing Engine**: Vitest v5.0.0
- **DOM Simulator**: jsdom v29.1.1 + React Testing Library v16.3.3
- **State Management**: Zustand v5 (`useCartStore`)
- **Icons**: Lucide React (`Heart`, `Trash2`, `ShoppingCart`)

---

## 3. Traceability Matrix

| Acceptance Criterion | Automated Test Description | Test File Location | Status |
|---|---|---|---|
| **AC-1**: Clicking heart icon toggles icon state immediately and sends API request | `toggles to wishlisted state immediately and fires API toggle request when clicked`<br>`toggles back to un-wishlisted state when clicked again` | [`tests/ui/wishlist-button.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-button.test.tsx) | **PASSED** |
| **AC-2**: Unauthenticated user clicking heart prompts login redirect | `redirects unauthenticated users to login page when clicked` | [`tests/ui/wishlist-button.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-button.test.tsx) | **PASSED** |
| **AC-3**: Moving item to cart adds item and removes it from wishlist view | `adds in-stock variant to cart and removes product from wishlist when clicking Move to Cart` | [`tests/ui/wishlist-move-to-cart.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-move-to-cart.test.tsx) | **PASSED** |
| **AC-4**: Empty wishlist renders friendly prompt with "Browse Products" button | `renders friendly empty state with 'Browse Products' button when user has 0 items` | [`tests/ui/wishlist-page.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-page.test.tsx) | **PASSED** |
| **AC-5**: Dedicated `/account/wishlist` page with session protection and item cards | `redirects unauthenticated user to /login`<br>`renders wishlist items with name, price, category, and stock indicators`<br>`removes an item from the view when the remove button is clicked` | [`tests/ui/wishlist-page.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-page.test.tsx) | **PASSED** |
| **Edge Case 1**: Out of stock wishlisted item displays disabled "Out of Stock" button | `disables button with 'Out of Stock' when product is out of stock` | [`tests/ui/wishlist-move-to-cart.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-move-to-cart.test.tsx) | **PASSED** |
| **Edge Case 2**: Optimistic toggle rollback on API failure | `reverts state if the API toggle request fails` | [`tests/ui/wishlist-button.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-button.test.tsx) | **PASSED** |
| **Accessibility**: Accessible ARIA labels and states | `renders with un-wishlisted state by default and accessible ARIA label`<br>`aria-label="Add to wishlist"` / `aria-label="Remove from wishlist"`, `aria-pressed` | [`tests/ui/wishlist-button.test.tsx`](file:///c:/Users/zaina/Desktop/ecommerce/tests/ui/wishlist-button.test.tsx) | **PASSED** |

---

## 4. Test Suite Execution Results

```
Test Files: 3 passed (3 total for FEAT-011-FE)
     Tests: 11 passed (11 total for FEAT-011-FE)
```

### Layer-by-Layer Breakdown
- **Wishlist Button UI (`tests/ui/wishlist-button.test.tsx`)**:
  - **5 passed**, 0 failed
- **Wishlist Move to Cart Flow (`tests/ui/wishlist-move-to-cart.test.tsx`)**:
  - **2 passed**, 0 failed
- **Wishlist Page & Empty States (`tests/ui/wishlist-page.test.tsx`)**:
  - **4 passed**, 0 failed
- **Product Card & PDP Regression (`tests/ui/product-card.test.tsx`, `tests/ui/product-detail-view.test.tsx`)**:
  - **11 passed**, 0 failed

---

## 5. SQA Verdict
**PASSED (100%)** — All 11 wishlist frontend test cases pass with zero failures. Strict TypeScript checks pass with zero errors (`npx tsc --noEmit` exited with 0). Ready for full-stack verification pass (`FEAT-011-VERIFY-wishlist.md`).
