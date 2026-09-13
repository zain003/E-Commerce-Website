import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as checkoutValidateRoute } from "@/app/api/checkout/validate/route";
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

describe("Checkout Validation Service (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCartItem = {
    id: "item_1",
    cartId: "cart_1",
    variantId: "var_1",
    quantity: 2,
    createdAt: new Date(),
    variant: {
      id: "var_1",
      productId: "prod_1",
      sku: "SKU-001",
      name: "Medium / Black",
      priceDelta: 0,
      stock: 10,
      product: {
        id: "prod_1",
        name: "Classic Tee",
        slug: "classic-tee",
        description: "A comfortable tee",
        basePrice: 40.0,
        categoryId: "cat_1",
        images: ["/tee.png"],
        featured: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  };

  const mockCart = {
    id: "cart_1",
    userId: null,
    guestToken: "guest-token-123",
    items: [mockCartItem],
    subtotal: 80.0,
    itemCount: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const validAddress = {
    fullName: "Alex Smith",
    street: "742 Evergreen Terrace",
    city: "Springfield",
    state: "OR",
    postalCode: "97477",
    country: "United States",
    phone: "+1 541 555 0133",
  };

  it("fails with HTTP 400 when guest checkout omits guestEmail", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: mockCart as any,
      timestamp: new Date().toISOString(),
    });

    const payload = {
      shippingAddress: validAddress,
      shippingMethodId: "STANDARD",
      // guestEmail is omitted
    };

    const req = new NextRequest("http://localhost:3000/api/checkout/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await checkoutValidateRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error?.details?.guestEmail).toBeDefined();
  });

  it("fails with HTTP 400 when phone number format is invalid", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: mockCart as any,
      timestamp: new Date().toISOString(),
    });

    const payload = {
      shippingAddress: {
        ...validAddress,
        phone: "invalid-phone",
      },
      shippingMethodId: "STANDARD",
      guestEmail: "alex@example.com",
    };

    const req = new NextRequest("http://localhost:3000/api/checkout/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await checkoutValidateRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error?.details?.["shippingAddress.phone"] || json.error?.details?.phone).toBeDefined();
  });

  it("fails with HTTP 400 when postal code format is invalid", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: mockCart as any,
      timestamp: new Date().toISOString(),
    });

    const payload = {
      shippingAddress: {
        ...validAddress,
        postalCode: "1", // too short
      },
      shippingMethodId: "STANDARD",
      guestEmail: "alex@example.com",
    };

    const req = new NextRequest("http://localhost:3000/api/checkout/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await checkoutValidateRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(
      json.error?.details?.["shippingAddress.postalCode"] || json.error?.details?.postalCode
    ).toBeDefined();
  });

  it("returns HTTP 400 STOCK_CHANGED when item inventory has decreased below cart quantity", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: mockCart as any,
      timestamp: new Date().toISOString(),
    });

    // Mock live inventory in DB: stock is now only 1, but cart requested 2
    vi.mocked(prisma.productVariant.findMany).mockResolvedValue([
      {
        id: "var_1",
        productId: "prod_1",
        sku: "SKU-001",
        name: "Medium / Black",
        priceDelta: 0 as any,
        stock: 1, // Only 1 in stock!
        product: {
          id: "prod_1",
          name: "Classic Tee",
          slug: "classic-tee",
          description: "A comfortable tee",
          basePrice: 40.0 as any,
          categoryId: "cat_1",
          images: ["/tee.png"],
          featured: false,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any,
    ]);

    const payload = {
      shippingAddress: validAddress,
      shippingMethodId: "STANDARD",
      guestEmail: "alex@example.com",
    };

    const req = new NextRequest("http://localhost:3000/api/checkout/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await checkoutValidateRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error?.code).toBe("STOCK_CHANGED");
    expect(json.error?.message).toMatch(/stock/i);
  });

  it("returns HTTP 200 with preview and valid: true for valid checkout session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: mockCart as any,
      timestamp: new Date().toISOString(),
    });

    // Mock live inventory: ample stock
    vi.mocked(prisma.productVariant.findMany).mockResolvedValue([
      {
        id: "var_1",
        productId: "prod_1",
        sku: "SKU-001",
        name: "Medium / Black",
        priceDelta: 0 as any,
        stock: 10,
        product: {
          id: "prod_1",
          name: "Classic Tee",
          slug: "classic-tee",
          description: "A comfortable tee",
          basePrice: 40.0 as any,
          categoryId: "cat_1",
          images: ["/tee.png"],
          featured: false,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any,
    ]);

    const payload = {
      shippingAddress: validAddress,
      shippingMethodId: "STANDARD",
      guestEmail: "alex@example.com",
    };

    const req = new NextRequest("http://localhost:3000/api/checkout/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await checkoutValidateRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.valid).toBe(true);
    expect(json.data?.preview).toBeDefined();
    expect(json.data?.preview.subtotal).toBe(80.0);
    expect(json.data?.preview.shippingFee).toBe(5.0); // subtotal < 100
    expect(json.data?.preview.total).toBe(85.0);
    expect(json.data?.preview.availableShippingMethods).toHaveLength(2);
  });
});
