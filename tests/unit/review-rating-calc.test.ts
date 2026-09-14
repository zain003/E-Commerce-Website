import { describe, it, expect } from "vitest";
import { calculateReviewSummary } from "@/lib/services/reviews";

describe("Review Rating Calculation (Unit)", () => {
  it("computes average rating rounded to 1 decimal place accurately", () => {
    const reviews = [
      { rating: 5 },
      { rating: 5 },
      { rating: 4 }, // sum: 14, count: 3, avg: 4.666... -> 4.7
    ];

    const result = calculateReviewSummary(reviews);

    expect(result.averageRating).toBe(4.7);
    expect(result.totalReviews).toBe(3);
  });

  it("computes exact rating distribution across 1 to 5 stars", () => {
    const reviews = [
      { rating: 5 },
      { rating: 5 },
      { rating: 4 },
      { rating: 4 },
      { rating: 4 },
      { rating: 3 },
      { rating: 2 },
      { rating: 1 },
      { rating: 5 },
    ];

    const result = calculateReviewSummary(reviews);

    expect(result.totalReviews).toBe(9);
    expect(result.ratingDistribution).toEqual({
      1: 1,
      2: 1,
      3: 1,
      4: 3,
      5: 3,
    });
  });

  it("handles edge case of 0 reviews returning averageRating: 0 and totalReviews: 0", () => {
    const result = calculateReviewSummary([]);

    expect(result.averageRating).toBe(0);
    expect(result.totalReviews).toBe(0);
    expect(result.ratingDistribution).toEqual({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    });
  });

  it("handles single review correctly without floating point precision error", () => {
    const result = calculateReviewSummary([{ rating: 4 }]);

    expect(result.averageRating).toBe(4);
    expect(result.totalReviews).toBe(1);
    expect(result.ratingDistribution[4]).toBe(1);
    expect(result.ratingDistribution[5]).toBe(0);
  });

  it("handles multiple identical ratings cleanly", () => {
    const reviews = [{ rating: 5 }, { rating: 5 }, { rating: 5 }, { rating: 5 }];

    const result = calculateReviewSummary(reviews);

    expect(result.averageRating).toBe(5);
    expect(result.totalReviews).toBe(4);
    expect(result.ratingDistribution[5]).toBe(4);
  });
});
