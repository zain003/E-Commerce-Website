import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as createPaymentIntentRoute } from "@/app/api/payments/create-intent/route";
import * as cartService from "@/lib/services/cart";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { stripe } from "@/lib/payments/stripe";

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

vi.mock("@/lib/payments/stripe", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/payments/stripe")>();
  return {
    ...actual,
    stripe: {
      paymentIntents: {
        create: vi.fn(),
      },
    },
  };
});

describe("Payment Intent Empty Cart & Stock Boundary (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validAddress = {
    fullName: "Taylor Swift",
    street: "13 Cornelia Street",
    city: "New York",
    state: "NY",
    postalCode: "10014",
    country: "United States",
    phone: "+1 212 555 0199",
  };

  it("rejects intent creation with HTTP 400 CART_EMPTY when cart items array is empty", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: {
        id: "cart_empty",
        userId: null,
        guestToken: "guest-token-123",
        items: [],
        subtotal: 0,
        itemCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      timestamp: new Date().toISOString(),
    });

    const payload = {
      checkoutSession: {
        shippingAddress: validAddress,
        shippingMethodId: "STANDARD",
        guestEmail: "guest@example.com",
      },
    };

    const req = new NextRequest("http://localhost:3000/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await createPaymentIntentRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error?.code).toBe("CART_EMPTY");
    expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
  });

  it("rejects intent creation with HTTP 400 CART_EMPTY when getCart returns not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: false,
      error: { code: "CART_EMPTY", message: "Cart is empty" },
      timestamp: new Date().toISOString(),
    });

    const payload = {
      checkoutSession: {
        shippingAddress: validAddress,
        shippingMethodId: "STANDARD",
        guestEmail: "guest@example.com",
      },
    };

    const req = new NextRequest("http://localhost:3000/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await createPaymentIntentRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error?.code).toBe("CART_EMPTY");
    expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
  });

  it("rejects intent creation with HTTP 400 STOCK_CHANGED when item inventory has depleted", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const cartItem = {
      id: "item_1",
      cartId: "cart_1",
      variantId: "var_out_of_stock",
      quantity: 5,
      createdAt: new Date(),
      variant: {
        id: "var_out_of_stock",
        productId: "prod_1",
        sku: "SKU-999",
        name: "Vintage Jacket",
        priceDelta: 0,
        stock: 2, // Stock is 2, but cart has 5
        product: {
          id: "prod_1",
          name: "Vintage Denim",
          slug: "vintage-denim",
          description: "Jacket",
          basePrice: 120.0,
          categoryId: "cat_1",
          images: ["/jacket.png"],
          featured: false,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    };

    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: {
        id: "cart_1",
        userId: null,
        guestToken: "guest-token-123",
        items: [cartItem],
        subtotal: 600.0,
        itemCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      timestamp: new Date().toISOString(),
    });

    vi.mocked(prisma.productVariant.findMany).mockResolvedValue([cartItem.variant as any]);

    const payload = {
      checkoutSession: {
        shippingAddress: validAddress,
        shippingMethodId: "STANDARD",
        guestEmail: "guest@example.com",
      },
    };

    const req = new NextRequest("http://localhost:3000/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await createPaymentIntentRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error?.code).toBe("STOCK_CHANGED");
    expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
  });
});
