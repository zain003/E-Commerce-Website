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

describe("Payment Intent Creation Route (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCartItem = {
    id: "item_1",
    cartId: "cart_abc",
    variantId: "var_1",
    quantity: 1,
    createdAt: new Date(),
    variant: {
      id: "var_1",
      productId: "prod_1",
      sku: "SKU-001",
      name: "Standard Tee",
      priceDelta: 0,
      stock: 15,
      product: {
        id: "prod_1",
        name: "Classic Tee",
        slug: "classic-tee",
        description: "A comfortable classic tee",
        basePrice: 45.0,
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
    id: "cart_abc",
    userId: null,
    guestToken: "guest-token-123",
    items: [mockCartItem],
    subtotal: 45.0,
    itemCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const validAddress = {
    fullName: "Taylor Swift",
    street: "13 Cornelia Street",
    city: "New York",
    state: "NY",
    postalCode: "10014",
    country: "United States",
    phone: "+1 212 555 0199",
  };

  it("creates a Stripe PaymentIntent for guest user and returns clientSecret", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: mockCart as any,
      timestamp: new Date().toISOString(),
    });
    vi.mocked(prisma.productVariant.findMany).mockResolvedValue([mockCartItem.variant as any]);

    vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
      id: "pi_test_123456",
      client_secret: "pi_test_123456_secret_abcdef",
      amount: 5000, // $45.00 + $5.00 shipping = $50.00
      currency: "usd",
      metadata: {
        cartId: "cart_abc",
        userId: "",
        guestEmail: "guest@example.com",
        shippingMethodId: "STANDARD",
      },
    } as any);

    const payload = {
      checkoutSession: {
        shippingAddress: validAddress,
        shippingMethodId: "STANDARD",
        guestEmail: "guest@example.com",
      },
      idempotencyKey: "test-idemp-key-1",
    };

    const req = new NextRequest("http://localhost:3000/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await createPaymentIntentRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.paymentIntentId).toBe("pi_test_123456");
    expect(json.data.clientSecret).toBe("pi_test_123456_secret_abcdef");
    expect(json.data.amount).toBe(5000);
    expect(json.data.currency).toBe("usd");

    // Verify Stripe was called with server-verified amount (5000 cents = $50.00) and metadata
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 5000,
        currency: "usd",
        metadata: expect.objectContaining({
          cartId: "cart_abc",
          guestEmail: "guest@example.com",
          shippingMethodId: "STANDARD",
        }),
      }),
      expect.objectContaining({
        idempotencyKey: "test-idemp-key-1",
      })
    );
  });

  it("attaches userId to PaymentIntent metadata for authenticated users", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user_456", email: "auth@example.com", name: "Auth User", role: "CUSTOMER" },
    } as any);

    const userCart = {
      ...mockCart,
      userId: "user_456",
      guestToken: null,
    };

    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: userCart as any,
      timestamp: new Date().toISOString(),
    });
    vi.mocked(prisma.productVariant.findMany).mockResolvedValue([mockCartItem.variant as any]);

    vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
      id: "pi_user_789",
      client_secret: "pi_user_789_secret_xyz",
      amount: 5000,
      currency: "usd",
      metadata: {
        cartId: "cart_abc",
        userId: "user_456",
      },
    } as any);

    const payload = {
      checkoutSession: {
        shippingAddress: validAddress,
        shippingMethodId: "STANDARD",
      },
    };

    const req = new NextRequest("http://localhost:3000/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await createPaymentIntentRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.clientSecret).toBe("pi_user_789_secret_xyz");

    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          userId: "user_456",
        }),
      }),
      expect.anything()
    );
  });

  it("returns 503 SERVICE_UNAVAILABLE when Stripe API fails", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: mockCart as any,
      timestamp: new Date().toISOString(),
    });
    vi.mocked(prisma.productVariant.findMany).mockResolvedValue([mockCartItem.variant as any]);

    // Simulate Stripe service outage
    const stripeError = new Error("Stripe network connection error");
    stripeError.name = "StripeConnectionError";
    vi.mocked(stripe.paymentIntents.create).mockRejectedValue(stripeError);

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

    expect(res.status).toBe(503);
    expect(json.success).toBe(false);
    expect(json.error?.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("fails with 400 VALIDATION_ERROR when guest email is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: mockCart as any,
      timestamp: new Date().toISOString(),
    });

    const payload = {
      checkoutSession: {
        shippingAddress: validAddress,
        shippingMethodId: "STANDARD",
        // guestEmail missing
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
    expect(json.error?.code).toBe("VALIDATION_ERROR");
  });

  it("fails with 400 VALIDATION_ERROR when phone number format is invalid", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const payload = {
      checkoutSession: {
        shippingAddress: {
          ...validAddress,
          phone: "123", // too short (fewer than 7 digits)
        },
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
    expect(json.error?.code).toBe("VALIDATION_ERROR");
  });

  it("never exposes STRIPE_SECRET_KEY in response payload", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: mockCart as any,
      timestamp: new Date().toISOString(),
    });
    vi.mocked(prisma.productVariant.findMany).mockResolvedValue([mockCartItem.variant as any]);

    vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
      id: "pi_123",
      client_secret: "pi_123_secret_xyz",
      amount: 5000,
      currency: "usd",
    } as any);

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
    const rawText = await res.text();

    expect(rawText).not.toContain(process.env.STRIPE_SECRET_KEY || "sk_test_");
  });
});
