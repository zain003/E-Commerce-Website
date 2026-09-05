# FEAT-002-VERIFY — Product Catalog Verification Pass
**Files being verified**: `FEAT-002-BE-products.md`, `FEAT-002-FE-products.md`

## 1. Test Suite Execution & SQA Matrix
Run all automated test suites across layers:
- **Frontend / Fake DOM**: `npm run test:ui -- tests/ui/product-card.test.tsx tests/ui/variant-selector.test.tsx tests/ui/product-gallery.test.tsx`
- **API Endpoints**: `npm run test:api -- tests/api/product-detail.test.ts`
- **Backend & Unit**: `npm run test:unit -- tests/unit/product-service.test.ts tests/unit/category-service.test.ts`

## 2. Acceptance Criteria Checklist
- [ ] Querying an existing product slug returns product details with all active variants.
- [ ] Querying a nonexistent slug returns `null` or HTTP `404`.
- [ ] All data read functions employ `"use cache"` and `cacheLife` directive.
- [ ] Archived products (`isArchived: true`) are excluded from customer-facing catalog queries.
- [ ] Product Card displays formatted price (e.g. `$49.99`) and links to correct slug URL.
- [ ] Selecting a variant with price delta updates the displayed total price immediately.
- [ ] Out of stock variants show "Out of Stock" badge and disable selection.
- [ ] Mobile view renders sticky action bar at bottom of viewport on product detail page.

## 3. SQA Definition of Done Checklist
- [ ] All Fake DOM and API tests pass 100%.
- [ ] Next.js 16 build (`npm run build`) completes with zero errors.
- [ ] SQA Test Report written and saved to `feature-test-reports/FEAT-002-test-report.md`.
- [ ] `context/feature-specs/INDEX.md` status updated for FEAT-002.

## 4. Failure Protocol
If anything fails: do NOT mark complete. Fix the defect in code or spec and re-run until 100% pass.
