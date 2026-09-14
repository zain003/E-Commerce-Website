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
      findFirst: vi.fn(),
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

describe("POST /api/products/[id]/reviews — Verified Buyer & Permissions", () => {
  const mockUserSession = {
    user: {
      id: "usr_buyer_1",
      email: "buyer@example.com",
      name: "Alice Buyer",
      role: "CUSTOMER" as const,
    },
    expires: "9999-12-31",
  };

  const validPayload = {
    rating: 5,
    title: "Exceptional quality",
    comment: "This product exceeded all expectations. Very durable and well-crafted.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 UNAUTHORIZED when session is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/products/prod_1/reviews", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });

    const res = await createReviewRoute(req, {
      params: Promise.resolve({ id: "prod_1" }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 404 NOT_FOUND when product does not exist", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockUserSession);
    vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/products/prod_nonexistent/reviews", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });

    const res = await createReviewRoute(req, {
      params: Promise.resolve({ id: "prod_nonexistent" }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("returns 403 ONLY_VERIFIED_BUYERS when user has no completed purchase of this product", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockUserSession);
    vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "prod_1" } as any);
    // No order found
    vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/products/prod_1/reviews", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });

    const res = await createReviewRoute(req, {
      params: Promise.resolve({ id: "prod_1" }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("ONLY_VERIFIED_BUYERS");
  });

  it("returns 409 ALREADY_REVIEWED when user has already submitted a review for this product", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockUserSession);
    vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "prod_1" } as any);
    // Verified purchase exists
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: "ord_100" } as any);
    // But review already exists
    vi.mocked(prisma.review.findFirst).mockResolvedValue({
      id: "rev_existing",
      userId: "usr_buyer_1",
      productId: "prod_1",
    } as any);

    const req = new NextRequest("http://localhost:3000/api/products/prod_1/reviews", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });

    const res = await createReviewRoute(req, {
      params: Promise.resolve({ id: "prod_1" }),
    });

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("ALREADY_REVIEWED");
  });

  it("creates review and returns 201 when user is a verified purchaser and has not yet reviewed", async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockUserSession);
    vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "prod_1" } as any);
    vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: "ord_100" } as any);
    vi.mocked(prisma.review.findFirst).mockResolvedValue(null);

    const createdReview = {
      id: "rev_new_123",
      userId: "usr_buyer_1",
      productId: "prod_1",
      rating: 5,
      title: "Exceptional quality",
      comment: "This product exceeded all expectations. Very durable and well-crafted.",
      createdAt: new Date("2026-03-01"),
    };
    vi.mocked(prisma.review.create).mockResolvedValue(createdReview as any);

    const req = new NextRequest("http://localhost:3000/api/products/prod_1/reviews", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });

    const res = await createReviewRoute(req, {
      params: Promise.resolve({ id: "prod_1" }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("rev_new_123");
    expect(body.data.rating).toBe(5);
    expect(body.data.comment).toContain("exceeded all expectations");
    expect(prisma.review.create).toHaveBeenCalledWith({
      data: {
        userId: "usr_buyer_1",
        productId: "prod_1",
        rating: 5,
        title: "Exceptional quality",
        comment: "This product exceeded all expectations. Very durable and well-crafted.",
      },
    });
  });
});
