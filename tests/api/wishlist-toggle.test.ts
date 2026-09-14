import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { POST as toggleWishlistRoute } from "@/app/api/account/wishlist/toggle/route";
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
    wishlistItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("POST /api/account/wishlist/toggle (API)", () => {
  const mockUserSession = {
    user: {
      id: "usr_123",
      email: "user@example.com",
      name: "Test User",
      role: "CUSTOMER" as const,
    },
    expires: "9999-12-31",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);
  });

  it("toggles non-wishlisted product: adds to database and returns isWishlisted: true", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue({
      id: "prod_1",
      name: "Minimalist Linen Shirt",
    } as any);

    // Not yet wishlisted
    vi.mocked(prisma.wishlistItem.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.wishlistItem.create).mockResolvedValue({
      id: "wish_1",
      userId: "usr_123",
      productId: "prod_1",
      createdAt: new Date(),
    } as any);

    const req = new NextRequest("http://localhost:3000/api/account/wishlist/toggle", {
      method: "POST",
      body: JSON.stringify({ productId: "prod_1" }),
    });

    const res = await toggleWishlistRoute(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({
      isWishlisted: true,
      productId: "prod_1",
    });

    expect(prisma.wishlistItem.create).toHaveBeenCalledWith({
      data: {
        userId: "usr_123",
        productId: "prod_1",
      },
    });
  });

  it("toggles already-wishlisted product: removes from database and returns isWishlisted: false", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue({
      id: "prod_1",
      name: "Minimalist Linen Shirt",
    } as any);

    // Already wishlisted
    vi.mocked(prisma.wishlistItem.findUnique).mockResolvedValue({
      id: "wish_1",
      userId: "usr_123",
      productId: "prod_1",
      createdAt: new Date(),
    } as any);

    vi.mocked(prisma.wishlistItem.delete).mockResolvedValue({
      id: "wish_1",
      userId: "usr_123",
      productId: "prod_1",
      createdAt: new Date(),
    } as any);

    const req = new NextRequest("http://localhost:3000/api/account/wishlist/toggle", {
      method: "POST",
      body: JSON.stringify({ productId: "prod_1" }),
    });

    const res = await toggleWishlistRoute(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({
      isWishlisted: false,
      productId: "prod_1",
    });

    expect(prisma.wishlistItem.delete).toHaveBeenCalledWith({
      where: {
        id: "wish_1",
      },
    });
  });

  it("returns HTTP 404 NOT_FOUND when product does not exist", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/account/wishlist/toggle", {
      method: "POST",
      body: JSON.stringify({ productId: "nonexistent_prod" }),
    });

    const res = await toggleWishlistRoute(req);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error?.code).toBe("NOT_FOUND");
    expect(prisma.wishlistItem.create).not.toHaveBeenCalled();
    expect(prisma.wishlistItem.delete).not.toHaveBeenCalled();
  });

  it("returns HTTP 400 VALIDATION_ERROR when productId is missing or empty", async () => {
    const req = new NextRequest("http://localhost:3000/api/account/wishlist/toggle", {
      method: "POST",
      body: JSON.stringify({ productId: "" }),
    });

    const res = await toggleWishlistRoute(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error?.code).toBe("VALIDATION_ERROR");
  });

  it("returns HTTP 400 BAD_REQUEST when JSON payload is malformed", async () => {
    const req = new NextRequest("http://localhost:3000/api/account/wishlist/toggle", {
      method: "POST",
      body: "{malformed_json",
    });

    const res = await toggleWishlistRoute(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error?.code).toBe("BAD_REQUEST");
  });
});
