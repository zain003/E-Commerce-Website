# FEAT-011-VERIFY — Wishlist Verification Pass
**Files being verified**: `FEAT-011-BE-wishlist.md`, `FEAT-011-FE-wishlist.md`

## 1. Test Suite Execution & SQA Matrix
Run all automated test suites across layers:
- **Frontend / Fake DOM**: `npm run test:ui -- tests/ui/wishlist-button.test.tsx tests/ui/wishlist-page.test.tsx tests/ui/wishlist-move-to-cart.test.tsx`
- **API Endpoints**: `npm run test:api -- tests/api/wishlist-auth.test.ts tests/api/wishlist-toggle.test.ts`
- **Backend & Unit**: `npm run test:unit -- tests/unit/wishlist-query.test.ts`

## 2. Acceptance Criteria Checklist
- [ ] Toggling a non-wishlisted product adds it to database and returns `isWishlisted: true`.
- [ ] Toggling an already-wishlisted product removes it and returns `isWishlisted: false`.
- [ ] Unauthenticated requests return HTTP `401 UNAUTHORIZED`.
- [ ] Clicking heart icon toggles icon state immediately and sends API request.
- [ ] If user is not authenticated, clicking heart prompts login modal or redirect.
- [ ] Moving an item to cart adds item and removes it from the wishlist view.
- [ ] Empty wishlist renders friendly prompt with "Browse Products" button.

## 3. SQA Definition of Done Checklist
- [ ] All tests passing 100%.
- [ ] SQA Test Report written and saved to `feature-test-reports/FEAT-011-test-report.md`.
- [ ] `context/feature-specs/INDEX.md` status updated for FEAT-011.

## 4. Failure Protocol
If any failure occurs, diagnose root cause, resolve immediately, and re-run all test suites.
