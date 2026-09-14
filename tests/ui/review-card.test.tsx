import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewCard } from "@/components/reviews/review-card";

describe("ReviewCard UI Component", () => {
  const mockReview = {
    id: "rev-1",
    userId: "usr-1",
    productId: "prod-1",
    rating: 5,
    title: "Best purchase ever!",
    comment: "The fabric feels incredible and fits true to size.",
    createdAt: new Date("2026-03-10T12:00:00Z"),
    updatedAt: new Date("2026-03-10T12:00:00Z"),
    user: {
      name: "Jane Doe",
    },
  };

  it("renders reviewer name, verified purchase badge, star rating, title, and comment", () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText("Jane Doe")).toBeTruthy();
    expect(screen.getByText(/verified purchase/i)).toBeTruthy();
    expect(screen.getByText("Best purchase ever!")).toBeTruthy();
    expect(
      screen.getByText("The fabric feels incredible and fits true to size.")
    ).toBeTruthy();

    const starElement = screen.getByRole("img", { name: /5 out of 5 stars/i });
    expect(starElement).toBeTruthy();
  });

  it("renders 'Anonymous Customer' fallback when reviewer name is null", () => {
    const anonymousReview = {
      ...mockReview,
      user: {
        name: null,
      },
    };

    render(<ReviewCard review={anonymousReview} />);
    expect(screen.getByText("Anonymous Customer")).toBeTruthy();
  });
});
