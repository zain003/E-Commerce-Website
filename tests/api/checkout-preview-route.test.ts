import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as checkoutPreviewRoute } from "@/app/api/checkout/preview/route";
import * as cartService from "@/lib/services/cart";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/services/cart", () => ({
  getCart: vi.fn(),
}));

vi.mock("@/lib/cookies/cart-cookie", () => ({
  CART_COOKIE_NAME: "guest_cart_token",
  getGuestCartToken: vi.fn().mockResolvedValue("guest-token-123"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    productVariant: {
      findMany: vi.fn(),
    },
  },
}));

describe("Checkout Preview Route (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockItem = (id: string, price: number, quantity: number, stock: number) => ({
    id: `item_${id}`,
    cartId: "cart_1",
    variantId: `var_${id}`,
    quantity,
    createdAt: new Date(),
    variant: {
      id: `var_${id}`,
      productId: `prod_${id}`,
      sku: `SKU-${id}`,
      name: `Variant ${id}`,
      priceDelta: 0,
      stock,
      product: {
        id: `prod_${id}`,
        name: `Product ${id}`,
        slug: `product-${id}`,
        description: "Test product",
        basePrice: price,
        categoryId: "cat_1",
        images: ["/test.png"],
        featured: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  });

  it("calculates standard shipping ($5.00) when subtotal < $100", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const item = createMockItem("1", 45.0, 1, 10);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: {
        id: "cart_1",
        userId: null,
        guestToken: "guest-token-123",
        items: [item],
        subtotal: 45.0,
        itemCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      timestamp: new Date().toISOString(),
    });

    vi.mocked(prisma.productVariant.findMany).mockResolvedValue([item.variant as any]);

    const req = new NextRequest("http://localhost:3000/api/checkout/preview?method=STANDARD");
    const res = await checkoutPreviewRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.subtotal).toBe(45.0);
    expect(json.data?.shippingFee).toBe(5.0);
    expect(json.data?.total).toBe(50.0);
  });

  it("applies free standard shipping ($0.00) when subtotal >= $100", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const item = createMockItem("1", 60.0, 2, 10); // subtotal = 120.0
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: {
        id: "cart_1",
        userId: null,
        guestToken: "guest-token-123",
        items: [item],
        subtotal: 120.0,
        itemCount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      timestamp: new Date().toISOString(),
    });

    vi.mocked(prisma.productVariant.findMany).mockResolvedValue([item.variant as any]);

    const req = new NextRequest("http://localhost:3000/api/checkout/preview?method=STANDARD");
    const res = await checkoutPreviewRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.subtotal).toBe(120.0);
    expect(json.data?.shippingFee).toBe(0.0);
    expect(json.data?.total).toBe(120.0);
  });

  it("adds exactly $15.00 for express shipping regardless of subtotal", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const item = createMockItem("1", 150.0, 1, 10);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: {
        id: "cart_1",
        userId: null,
        guestToken: "guest-token-123",
        items: [item],
        subtotal: 150.0,
        itemCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      timestamp: new Date().toISOString(),
    });

    vi.mocked(prisma.productVariant.findMany).mockResolvedValue([item.variant as any]);

    const req = new NextRequest("http://localhost:3000/api/checkout/preview?method=EXPRESS");
    const res = await checkoutPreviewRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.subtotal).toBe(150.0);
    expect(json.data?.shippingFee).toBe(15.0);
    expect(json.data?.total).toBe(165.0);
  });
});
