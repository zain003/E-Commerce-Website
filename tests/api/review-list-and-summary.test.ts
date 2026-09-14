import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getProductReviewsRoute } from "@/app/api/products/[slug]/reviews/route";
import { GET as getProductReviewSummaryRoute } from "@/app/api/products/[slug]/reviews/summary/route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findFirst: vi.fn(),
    },
    review: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("Product Reviews Listing & Summary (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/products/[id]/reviews", () => {
    it("returns paginated reviews list with reviewer name, rating, comment, and creation date", async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: "prod_1" } as any);
      vi.mocked(prisma.review.count).mockResolvedValue(1);

      const mockReviewDate = new Date("2026-03-01T12:00:00Z");
      const mockReviews = [
        {
          id: "rev_1",
          userId: "usr_1",
          productId: "prod_1",
          rating: 5,
          title: "Great Product",
          comment: "Loved the material and fast shipping.",
          createdAt: mockReviewDate,
          user: {
            name: "John Doe",
          },
        },
      ];
      vi.mocked(prisma.review.findMany).mockResolvedValue(mockReviews as any);

      const req = new NextRequest("http://localhost:3000/api/products/prod_1/reviews?page=1&limit=10");
      const res = await getProductReviewsRoute(req, {
        params: Promise.resolve({ id: "prod_1" }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.total).toBe(1);
      expect(body.data.page).toBe(1);
      expect(body.data.limit).toBe(10);
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].user.name).toBe("John Doe");
      expect(body.data.items[0].rating).toBe(5);
      expect(body.data.items[0].comment).toContain("Loved the material");
    });

    it("returns empty list when product has no reviews", async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: "prod_2" } as any);
      vi.mocked(prisma.review.count).mockResolvedValue(0);
      vi.mocked(prisma.review.findMany).mockResolvedValue([]);

      const req = new NextRequest("http://localhost:3000/api/products/prod_2/reviews");
      const res = await getProductReviewsRoute(req, {
        params: Promise.resolve({ id: "prod_2" }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.total).toBe(0);
      expect(body.data.items).toEqual([]);
    });

    it("returns 400 VALIDATION_ERROR when pagination parameters are negative", async () => {
      const req = new NextRequest("http://localhost:3000/api/products/prod_1/reviews?page=-1");
      const res = await getProductReviewsRoute(req, {
        params: Promise.resolve({ id: "prod_1" }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/products/[id]/reviews/summary", () => {
    it("computes and returns rating summary with average rating and star distribution", async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: "prod_1" } as any);
      vi.mocked(prisma.review.findMany).mockResolvedValue([
        { rating: 5 },
        { rating: 5 },
        { rating: 4 },
      ] as any);

      const req = new NextRequest("http://localhost:3000/api/products/prod_1/reviews/summary");
      const res = await getProductReviewSummaryRoute(req, {
        params: Promise.resolve({ id: "prod_1" }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.averageRating).toBe(4.7);
      expect(body.data.totalReviews).toBe(3);
      expect(body.data.ratingDistribution[5]).toBe(2);
      expect(body.data.ratingDistribution[4]).toBe(1);
      expect(body.data.ratingDistribution[3]).toBe(0);
    });

    it("returns 0 average rating and 0 total reviews when product has 0 reviews", async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue({ id: "prod_empty" } as any);
      vi.mocked(prisma.review.findMany).mockResolvedValue([]);

      const req = new NextRequest("http://localhost:3000/api/products/prod_empty/reviews/summary");
      const res = await getProductReviewSummaryRoute(req, {
        params: Promise.resolve({ id: "prod_empty" }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.averageRating).toBe(0);
      expect(body.data.totalReviews).toBe(0);
      expect(body.data.ratingDistribution).toEqual({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      });
    });
  });
});
