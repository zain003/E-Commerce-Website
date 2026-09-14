import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewSection } from "@/components/reviews/review-section";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

describe("ReviewSection UI Component", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      "/products/classic-tee"
    );
    (useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { user: { id: "user-1", name: "Alice" } },
      status: "authenticated",
    });
  });

  const mockReviews = [
    {
      id: "rev-1",
      userId: "user-1",
      productId: "prod-1",
      rating: 5,
      title: "Super soft",
      comment: "This is the best t-shirt I have ever purchased. Fits great.",
      createdAt: new Date("2026-03-01T00:00:00Z").toISOString(),
      updatedAt: new Date("2026-03-01T00:00:00Z").toISOString(),
      user: { name: "Alice" },
    },
    {
      id: "rev-2",
      userId: "user-2",
      productId: "prod-1",
      rating: 4,
      title: "Great color",
      comment: "Colors match the photos nicely. A bit long in length.",
      createdAt: new Date("2026-03-02T00:00:00Z").toISOString(),
      updatedAt: new Date("2026-03-02T00:00:00Z").toISOString(),
      user: { name: "Bob" },
    },
  ];

  const mockSummary = {
    averageRating: 4.5,
    totalReviews: 2,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 1,
      5: 1,
    },
  };

  it("fetches and renders reviews and rating summary on mount", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/reviews/summary")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockSummary }),
        });
      }
      if (url.includes("/reviews")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              items: mockReviews,
              total: 2,
              page: 1,
              limit: 5,
              totalPages: 1,
            },
          }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(
      <ReviewSection productId="prod-1" productName="Classic Cotton Tee" />
    );

    // Header & Section Title
    expect(screen.getByRole("heading", { name: /customer reviews/i })).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("Super soft")).toBeTruthy();
      expect(screen.getByText("Great color")).toBeTruthy();
      expect(screen.getByText("4.5")).toBeTruthy();
    });
  });

  it("displays 'No reviews yet. Be the first to review!' when total reviews is 0", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/reviews/summary")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              averageRating: 0,
              totalReviews: 0,
              ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            },
          }),
        });
      }
      if (url.includes("/reviews")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              items: [],
              total: 0,
              page: 1,
              limit: 5,
              totalPages: 1,
            },
          }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(
      <ReviewSection productId="prod-empty" productName="Empty Product" />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/no reviews yet\. be the first to review!/i)
      ).toBeTruthy();
    });
  });

  it("prompts unauthenticated user to sign in when clicking Write a Review", async () => {
    (useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/reviews/summary")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              averageRating: 0,
              totalReviews: 0,
              ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            items: [],
            total: 0,
            page: 1,
            limit: 5,
            totalPages: 1,
          },
        }),
      });
    });

    const user = userEvent.setup();

    render(
      <ReviewSection productId="prod-1" productName="Classic Cotton Tee" />
    );

    const writeBtn = screen.getAllByRole("button", { name: /write a review/i })[0];
    await user.click(writeBtn);

    expect(mockPush).toHaveBeenCalledWith(
      "/login?callbackUrl=%2Fproducts%2Fclassic-tee"
    );
  });

  it("opens review modal for authenticated user and updates review list after submission", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/reviews/summary")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockSummary }),
        });
      }
      if (url.includes("/reviews")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              items: mockReviews,
              total: 2,
              page: 1,
              limit: 5,
              totalPages: 1,
            },
          }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    const user = userEvent.setup();

    render(
      <ReviewSection productId="prod-1" productName="Classic Cotton Tee" />
    );

    await waitFor(() => {
      expect(screen.getByText("Super soft")).toBeTruthy();
    });

    const writeBtn = screen.getAllByRole("button", { name: /write a review/i })[0];
    await user.click(writeBtn);

    // Modal dialog opens
    expect(screen.getByRole("dialog")).toBeTruthy();

    // Now mock the POST review endpoint
    const newCreatedReview = {
      id: "rev-new-3",
      userId: "user-1",
      productId: "prod-1",
      rating: 5,
      title: "Absolutely wonderful",
      comment: "I wear this shirt everywhere I go! Incredible softness.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { name: "Alice" },
    };

    global.fetch = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "POST") {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: async () => ({ success: true, data: newCreatedReview }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });
    });

    // Fill form
    const fifthStar = screen.getByRole("radio", { name: /5 stars/i });
    await user.click(fifthStar);

    const titleInput = screen.getByLabelText(/review title/i);
    await user.type(titleInput, "Absolutely wonderful");

    const commentInput = screen.getByLabelText(/your review/i);
    await user.type(
      commentInput,
      "I wear this shirt everywhere I go! Incredible softness."
    );

    const submitBtn = screen.getByRole("button", { name: /submit review/i });
    await user.click(submitBtn);

    // Review appears immediately in list and success banner displays
    await waitFor(() => {
      expect(screen.getByText("Absolutely wonderful")).toBeTruthy();
      expect(
        screen.getByText(/thank you! your review has been published/i)
      ).toBeTruthy();
    });
  });
});
