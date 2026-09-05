# FEAT-010-FE — Reviews & Rating UI
**Priority**: P1 (Growth Phase)  
**Layer**: Frontend UI & Interactive Reviews

## Goal
Build star rating summary widget, customer review list, and verified purchase review submission modal/form on the Product Detail Page.

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-010-BE-reviews.md`
- **Context pack**:
```typescript
import { CreateReviewDto, ProductReviewSummary } from "./FEAT-010-BE-reviews";
import { Review, User, PaginatedResult } from "@/types";
```
- **Consumes**:
  - `GET /api/products/:id/reviews`
  - `GET /api/products/:id/reviews/summary`
  - `POST /api/products/:id/reviews` -> `createProductReview(dto)`

## Scope (In)
- Interactive star rating input (1-5 stars) and star display icons.
- Rating breakdown bar chart (showing % for 5, 4, 3, 2, 1 stars).
- Customer review list with pagination / "Load More".
- "Write a Review" dialog form with title, rating, comment, and verified buyer status check.

## Scope (Out)
- Image attachments inside reviews (Phase 3).

## Tech / Files to Touch
- `src/components/reviews/review-section.tsx`
- `src/components/reviews/star-rating.tsx`
- `src/components/reviews/rating-breakdown.tsx`
- `src/components/reviews/review-form-modal.tsx`
- `src/components/reviews/review-card.tsx`

## Tests to Write FIRST
1. `tests/ui/star-rating.test.tsx`: Clicking 4th star sets rating value to 4.
2. `tests/ui/rating-breakdown.test.tsx`: Renders percentage progress bars accurately.
3. `tests/ui/review-form.test.tsx`: Validates comment length and submits payload to API.

## Implementation Steps
1. Create accessible `StarRating` component (with keyboard focus).
2. Build `RatingBreakdown` bar summary.
3. Build `ReviewCard` displaying reviewer name, rating stars, and date.
4. Build `ReviewFormModal` with React Hook Form.
5. Embed `ReviewSection` at the bottom of the Product Detail Page.

## Acceptance Criteria
- [ ] Product page displays average star score and total review count.
- [ ] Submitting a review immediately shows the new review or success notification.
- [ ] Unauthenticated users clicking "Write a Review" are prompted to sign in.
- [ ] Star ratings are fully keyboard navigable and screen-reader accessible.

## Definition of Done
- [ ] All Fake DOM tests pass 100%.
- [ ] Responsive design verified on mobile viewports.

## Edge Cases to Handle
- Displays "No reviews yet. Be the first to review!" when total is 0.
- Disabled submit button while review is submitting.

## Pre-flight Check
- Confirm `FEAT-010-BE-reviews.md` endpoints are functional.

## What's Next
- `FEAT-010-VERIFY-reviews.md` (Reviews Verification Pass).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-010-FE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
