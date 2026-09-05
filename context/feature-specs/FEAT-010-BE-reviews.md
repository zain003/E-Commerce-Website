# FEAT-010-BE — Product Reviews Service
**Priority**: P1 (Growth Phase)  
**Layer**: Backend Service & Reviews API

## Goal
Provide product review submission (with verified purchaser check), rating aggregation (average and distribution), and review listing.

## Depends on / Context pack / Consumes
- **Depends on**: `000-shared-contracts.md`
- **Context pack**:
```typescript
import { Review, User, ApiResponse, PaginatedResult } from "@/types";

export interface CreateReviewDto {
  productId: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
}
```

## Provides / Exposes
```typescript
export async function getProductReviews(productId: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResult<Review & { user: Pick<User, "name"> }>>>;
export async function getProductReviewSummary(productId: string): Promise<ApiResponse<ProductReviewSummary>>;
export async function createProductReview(dto: CreateReviewDto, userId: string): Promise<ApiResponse<Review>>;

// Route Handlers:
// GET  /api/products/:id/reviews
// GET  /api/products/:id/reviews/summary
// POST /api/products/:id/reviews -> createProductReview
```

## Scope (In)
- Validate review rating integer (1-5) and comment length (min 10 chars).
- Verify user has completed an order containing this product before allowing review.
- Compute average rating rounded to 1 decimal place and count per star rating.
- Limit users to 1 review per product.

## Scope (Out)
- AI review summarization (Phase 2 LLM integration).

## Tech / Files to Touch
- `src/lib/services/reviews.ts`
- `src/lib/validators/review.ts`
- `src/app/api/products/[id]/reviews/route.ts`
- `src/app/api/products/[id]/reviews/summary/route.ts`

## Tests to Write FIRST
1. `tests/unit/review-rating-calc.test.ts`: Computes average rating and distribution accurately.
2. `tests/api/review-verified-buyer.test.ts`: Prevents user without completed order from posting review.
3. `tests/api/review-rating-bounds.test.ts`: Rejects rating < 1 or > 5 with HTTP `400`.

## Implementation Steps
1. Create review validator schema in `src/lib/validators/review.ts`.
2. Implement `createProductReview` checking purchase history.
3. Implement `getProductReviews` and `getProductReviewSummary`.
4. Add API routes in `src/app/api/products/[id]/reviews/`.

## Acceptance Criteria
- [ ] Rating outside 1-5 returns HTTP `400`.
- [ ] Submitting review without verified purchase returns HTTP `403 ONLY_VERIFIED_BUYERS`.
- [ ] Multiple reviews by same user on same product return HTTP `409 ALREADY_REVIEWED`.
- [ ] Product reviews list returns reviewer name, rating, and creation date.

## Definition of Done
- [ ] Unit & API tests pass 100%.
- [ ] Clean type checks.

## Edge Cases to Handle
- Product with 0 reviews returns `averageRating: 0` and `totalReviews: 0`.

## Pre-flight Check
- Confirm `Review` model is active in Prisma.

## What's Next
- `FEAT-010-FE-reviews.md` (Reviews & Rating UI).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-010-BE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
