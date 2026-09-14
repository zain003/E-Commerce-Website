import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewFormModal } from "@/components/reviews/review-form-modal";

describe("ReviewFormModal UI Component", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("renders modal form with star rating selector, title, and comment textarea", () => {
    render(
      <ReviewFormModal
        isOpen={true}
        onClose={mockOnClose}
        productId="prod-123"
        productName="Classic Cotton T-Shirt"
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/write a review/i)).toBeTruthy();
    expect(screen.getByText(/classic cotton t-shirt/i)).toBeTruthy();
    expect(screen.getByLabelText(/review title/i)).toBeTruthy();
    expect(screen.getByLabelText(/your review/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /submit review/i })).toBeTruthy();
  });

  it("displays validation error when comment has fewer than 10 characters", async () => {
    const user = userEvent.setup();

    render(
      <ReviewFormModal
        isOpen={true}
        onClose={mockOnClose}
        productId="prod-123"
        productName="Classic Cotton T-Shirt"
        onSuccess={mockOnSuccess}
      />
    );

    const commentInput = screen.getByLabelText(/your review/i);
    await user.type(commentInput, "Too short");

    const submitBtn = screen.getByRole("button", { name: /submit review/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/comment must be at least 10 characters/i)
      ).toBeTruthy();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("submits valid review payload and triggers onSuccess callback", async () => {
    const user = userEvent.setup();

    const mockResponseReview = {
      id: "rev-new-1",
      userId: "user-1",
      productId: "prod-123",
      rating: 5,
      title: "Exceptional quality",
      comment: "This shirt exceeded all of my expectations! The fit is perfect.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        name: "Verified Shopper",
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: mockResponseReview,
      }),
    });
    global.fetch = mockFetch;

    render(
      <ReviewFormModal
        isOpen={true}
        onClose={mockOnClose}
        productId="prod-123"
        productName="Classic Cotton T-Shirt"
        onSuccess={mockOnSuccess}
      />
    );

    // Select 5 stars
    const fifthStar = screen.getByRole("radio", { name: /5 stars/i });
    await user.click(fifthStar);

    // Fill title
    const titleInput = screen.getByLabelText(/review title/i);
    await user.type(titleInput, "Exceptional quality");

    // Fill comment
    const commentInput = screen.getByLabelText(/your review/i);
    await user.type(
      commentInput,
      "This shirt exceeded all of my expectations! The fit is perfect."
    );

    const submitBtn = screen.getByRole("button", { name: /submit review/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/products/prod-123/reviews",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: 5,
            title: "Exceptional quality",
            comment:
              "This shirt exceeded all of my expectations! The fit is perfect.",
          }),
        })
      );
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockResponseReview);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("handles 403 ONLY_VERIFIED_BUYERS error with dedicated alert", async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        error: {
          code: "ONLY_VERIFIED_BUYERS",
          message:
            "Only verified buyers who completed a purchase of this product may leave a review",
        },
      }),
    });

    render(
      <ReviewFormModal
        isOpen={true}
        onClose={mockOnClose}
        productId="prod-123"
        productName="Classic Cotton T-Shirt"
        onSuccess={mockOnSuccess}
      />
    );

    const commentInput = screen.getByLabelText(/your review/i);
    await user.type(commentInput, "Great material, but I want to test buying verification.");

    const submitBtn = screen.getByRole("button", { name: /submit review/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(
          /only verified buyers who completed a purchase of this product may leave a review/i
        )
      ).toBeTruthy();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("handles 409 ALREADY_REVIEWED error with dedicated alert", async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        success: false,
        error: {
          code: "ALREADY_REVIEWED",
          message: "You have already reviewed this product",
        },
      }),
    });

    render(
      <ReviewFormModal
        isOpen={true}
        onClose={mockOnClose}
        productId="prod-123"
        productName="Classic Cotton T-Shirt"
        onSuccess={mockOnSuccess}
      />
    );

    const commentInput = screen.getByLabelText(/your review/i);
    await user.type(commentInput, "Trying to leave a second review on the same product.");

    const submitBtn = screen.getByRole("button", { name: /submit review/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/you have already reviewed this product/i)
      ).toBeTruthy();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
