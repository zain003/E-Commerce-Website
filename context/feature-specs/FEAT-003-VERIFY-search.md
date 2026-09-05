# FEAT-003-VERIFY — Search & Filter Verification Pass
**Files being verified**: `FEAT-003-BE-search.md`, `FEAT-003-FE-search.md`

## 1. Test Suite Execution & SQA Matrix
Run all automated test suites across layers:
- **Frontend / Fake DOM**: `npm run test:ui -- tests/ui/search-bar.test.tsx tests/ui/filter-sidebar.test.tsx tests/ui/active-filters.test.tsx`
- **API Endpoints**: `npm run test:api -- tests/api/search-route.test.ts`
- **Backend & Unit**: `npm run test:unit -- tests/unit/search-filter.test.ts tests/unit/search-sorting.test.ts`

## 2. Acceptance Criteria Checklist
- [ ] Querying with `q="shirt"` returns only products whose name or description contains "shirt".
- [ ] Applying `minPrice=20` and `maxPrice=50` returns only products where `basePrice` is between 20 and 50.
- [ ] Sorting by `price_asc` returns products in non-decreasing order of `basePrice`.
- [ ] Invalid/negative page parameters fallback safely to `page=1, limit=12`.
- [ ] Typing into search input updates URL with `?q=value` after debounce without full page reload.
- [ ] Clicking a filter pill immediately removes the filter from URL and re-triggers fetch.
- [ ] Mobile view renders accessible "Filter & Sort" trigger button that opens bottom sheet.
- [ ] Loading skeleton cards display during search state transitions.

## 3. SQA Definition of Done Checklist
- [ ] 100% tests passing across all layers.
- [ ] SQA Test Report written and saved to `feature-test-reports/FEAT-003-test-report.md`.
- [ ] `context/feature-specs/INDEX.md` status updated for FEAT-003.

## 4. Failure Protocol
If any check fails, fix the defect immediately before marking complete.
