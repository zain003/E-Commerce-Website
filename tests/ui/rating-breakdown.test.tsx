import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RatingBreakdown } from "@/components/reviews/rating-breakdown";
import { ProductReviewSummary } from "@/types";

describe("RatingBreakdown UI Component", () => {
  const mockSummary: ProductReviewSummary = {
    averageRating: 4.4,
    totalReviews: 10,
    ratingDistribution: {
      5: 6, // 60%
      4: 2, // 20%
      3: 1, // 10%
      2: 1, // 10%
      1: 0, // 0%
    },
  };

  it("renders average rating score and total reviews count accurately", () => {
    render(<RatingBreakdown summary={mockSummary} />);

    expect(screen.getByText("4.4")).toBeTruthy();
    expect(screen.getByText(/based on 10 customer reviews/i)).toBeTruthy();
  });

  it("renders percentage progress bars with accurate aria values and widths", () => {
    render(<RatingBreakdown summary={mockSummary} />);

    // 5-star bar should have 60%
    const fiveStarProgress = screen.getByLabelText(/5 star reviews: 60%/i);
    expect(fiveStarProgress).toBeTruthy();
    expect(fiveStarProgress.getAttribute("aria-valuenow")).toBe("60");

    // 4-star bar should have 20%
    const fourStarProgress = screen.getByLabelText(/4 star reviews: 20%/i);
    expect(fourStarProgress).toBeTruthy();
    expect(fourStarProgress.getAttribute("aria-valuenow")).toBe("20");

    // 1-star bar should have 0%
    const oneStarProgress = screen.getByLabelText(/1 star reviews: 0%/i);
    expect(oneStarProgress).toBeTruthy();
    expect(oneStarProgress.getAttribute("aria-valuenow")).toBe("0");
  });

  it("handles zero reviews gracefully with 0.0 rating and empty state notice", () => {
    const emptySummary: ProductReviewSummary = {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };

    render(<RatingBreakdown summary={emptySummary} />);

    expect(screen.getByText("0.0")).toBeTruthy();
    expect(screen.getByText(/no reviews yet/i)).toBeTruthy();

    const fiveStarProgress = screen.getByLabelText(/5 star reviews: 0%/i);
    expect(fiveStarProgress.getAttribute("aria-valuenow")).toBe("0");
  });

  it("calls onWriteReviewClick when Write a Review button is clicked", async () => {
    const user = userEvent.setup();
    const handleWriteClick = vi.fn();

    render(
      <RatingBreakdown
        summary={mockSummary}
        onWriteReviewClick={handleWriteClick}
      />
    );

    const writeButton = screen.getByRole("button", { name: /write a review/i });
    expect(writeButton).toBeTruthy();

    await user.click(writeButton);
    expect(handleWriteClick).toHaveBeenCalledTimes(1);
  });
});
