import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { POST as createReviewRoute } from "@/app/api/products/[slug]/reviews/route";
import { prisma } from "@/lib/prisma";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
    },
    order: {
      findFirst: vi.fn(),
    },
    review: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("POST /api/products/[id]/reviews — Rating Bounds & Validation", () => {
  const mockUserSession = {
    user: {
      id: "usr_buyer_1",
      email: "buyer@example.com",
      name: "Alice Buyer",
      role: "CUSTOMER" as const,
    },
    expires: "9999-12-31",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockUserSession);
    vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "prod_1" } as any);
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: "ord_100" } as any);
    vi.mocked(prisma.review.findFirst).mockResolvedValue(null);
  });

  it("returns 400 VALIDATION_ERROR when rating is less than 1", async () => {
    const req = new NextRequest("http://localhost:3000/api/products/prod_1/reviews", {
      method: "POST",
      body: JSON.stringify({
        rating: 0,
        comment: "This is a valid comment with more than 10 characters.",
      }),
    });

    const res = await createReviewRoute(req, {
      params: Promise.resolve({ id: "prod_1" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toHaveProperty("rating");
  });

  it("returns 400 VALIDATION_ERROR when rating is greater than 5", async () => {
    const req = new NextRequest("http://localhost:3000/api/products/prod_1/reviews", {
      method: "POST",
      body: JSON.stringify({
        rating: 6,
        comment: "This is a valid comment with more than 10 characters.",
      }),
    });

    const res = await createReviewRoute(req, {
      params: Promise.resolve({ id: "prod_1" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toHaveProperty("rating");
  });

  it("returns 400 VALIDATION_ERROR when rating is a decimal fraction (non-integer)", async () => {
    const req = new NextRequest("http://localhost:3000/api/products/prod_1/reviews", {
      method: "POST",
      body: JSON.stringify({
        rating: 3.5,
        comment: "This is a valid comment with more than 10 characters.",
      }),
    });

    const res = await createReviewRoute(req, {
      params: Promise.resolve({ id: "prod_1" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toHaveProperty("rating");
  });

  it("returns 400 VALIDATION_ERROR when comment is shorter than 10 characters", async () => {
    const req = new NextRequest("http://localhost:3000/api/products/prod_1/reviews", {
      method: "POST",
      body: JSON.stringify({
        rating: 4,
        comment: "Too short", // 9 characters
      }),
    });

    const res = await createReviewRoute(req, {
      params: Promise.resolve({ id: "prod_1" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toHaveProperty("comment");
  });

  it("returns 400 BAD_REQUEST when body is invalid JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/products/prod_1/reviews", {
      method: "POST",
      body: "invalid-json-string{",
    });

    const res = await createReviewRoute(req, {
      params: Promise.resolve({ id: "prod_1" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("BAD_REQUEST");
  });

  it("accepts boundary rating = 1 and exactly 10-char comment", async () => {
    vi.mocked(prisma.review.create).mockResolvedValue({
      id: "rev_b1",
      userId: "usr_buyer_1",
      productId: "prod_1",
      rating: 1,
      comment: "1234567890",
      createdAt: new Date(),
    } as any);

    const req = new NextRequest("http://localhost:3000/api/products/prod_1/reviews", {
      method: "POST",
      body: JSON.stringify({
        rating: 1,
        comment: "1234567890",
      }),
    });

    const res = await createReviewRoute(req, {
      params: Promise.resolve({ id: "prod_1" }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.rating).toBe(1);
  });
});
