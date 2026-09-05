# FEAT-004-VERIFY — Cart Verification Pass
**Files being verified**: `FEAT-004-BE-cart.md`, `FEAT-004-FE-cart.md`

## 1. Test Suite Execution & SQA Matrix
Run all automated test suites across layers:
- **Frontend / Fake DOM**: `npm run test:ui -- tests/ui/cart-drawer.test.tsx tests/ui/cart-item-actions.test.tsx tests/ui/cart-empty-state.test.tsx`
- **API Endpoints**: `npm run test:api -- tests/api/cart-guest.test.ts tests/api/cart-stock-limit.test.ts`
- **Backend & Unit**: `npm run test:unit -- tests/unit/cart-calculator.test.ts`

## 2. Acceptance Criteria Checklist
- [ ] Adding an item generates an HTTP-only `guest_cart_token` cookie if user is not authenticated.
- [ ] Attempting to add quantity greater than available variant stock returns HTTP `400` with code `"INSUFFICIENT_STOCK"`.
- [ ] Removing an item updates the subtotal and total item count accordingly.
- [ ] Merging a guest cart transfers unique items and sums quantities for duplicate variants.
- [ ] Clicking "Add to Cart" on any product opens the Cart Drawer automatically and shows the newly added item.
- [ ] Changing quantity updates displayed subtotal instantly; rolls back with toast notification if API fails.
- [ ] Header cart badge displays the exact total item count.
- [ ] Empty cart displays clean message and primary button routing to `/products`.

## 3. SQA Definition of Done Checklist
- [ ] All tests passing 100%.
- [ ] SQA Test Report written and saved to `feature-test-reports/FEAT-004-test-report.md`.
- [ ] `context/feature-specs/INDEX.md` status updated for FEAT-004.

## 4. Failure Protocol
If any failure occurs, diagnose root cause, resolve immediately, and re-run all test suites.
