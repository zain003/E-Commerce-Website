# FEAT-010-VERIFY — Reviews Verification Pass
**Files being verified**: `FEAT-010-BE-reviews.md`, `FEAT-010-FE-reviews.md`

## 1. Test Suite Execution & SQA Matrix
Run all automated test suites across layers:
- **Frontend / Fake DOM**: `npm run test:ui -- tests/ui/star-rating.test.tsx tests/ui/rating-breakdown.test.tsx tests/ui/review-form.test.tsx`
- **API Endpoints**: `npm run test:api -- tests/api/review-verified-buyer.test.ts tests/api/review-rating-bounds.test.ts`
- **Backend & Unit**: `npm run test:unit -- tests/unit/review-rating-calc.test.ts`

## 2. Acceptance Criteria Checklist
- [ ] Rating outside 1-5 returns HTTP `400`.
- [ ] Submitting review without verified purchase returns HTTP `403 ONLY_VERIFIED_BUYERS`.
- [ ] Multiple reviews by same user on same product return HTTP `409 ALREADY_REVIEWED`.
- [ ] Product reviews list returns reviewer name, rating, and creation date.
- [ ] Product page displays average star score and total review count.
- [ ] Submitting a review immediately shows the new review or success notification.
- [ ] Unauthenticated users clicking "Write a Review" are prompted to sign in.
- [ ] Star ratings are fully keyboard navigable and screen-reader accessible.

## 3. SQA Definition of Done Checklist
- [ ] All tests passing 100%.
- [ ] SQA Test Report written and saved to `feature-test-reports/FEAT-010-test-report.md`.
- [ ] `context/feature-specs/INDEX.md` status updated for FEAT-010.

## 4. Failure Protocol
If any failure occurs, diagnose root cause, resolve immediately, and re-run all test suites.
