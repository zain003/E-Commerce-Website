import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/webhooks/stripe/route";
import { handleStripeWebhook } from "@/lib/services/order-creation";
import { stripe } from "@/lib/payments/stripe";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("@/lib/payments/stripe", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/payments/stripe")>();
  return {
    ...actual,
    stripe: {
      webhooks: {
        constructEvent: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      order: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      cart: {
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
      cartItem: {
        deleteMany: vi.fn(),
      },
      productVariant: {
        update: vi.fn(),
      },
      $transaction: vi.fn(),
    },
  };
});

describe("Stripe Webhook Idempotency (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  });

  const mockShippingAddress = {
    fullName: "Ada Lovelace",
    street: "12 Babbage Way",
    city: "London",
    state: "UK",
    postalCode: "SW1A 1AA",
    country: "United Kingdom",
    phone: "+44 20 7946 0919",
  };

  const mockPaymentIntent = {
    id: "pi_idempotency_123",
    amount: 5000,
    currency: "usd",
    metadata: {
      cartId: "cart_abc",
      userId: "user_123",
      guestEmail: "",
      shippingMethodId: "STANDARD",
      shippingAddress: JSON.stringify(mockShippingAddress),
    },
  };

  const mockEvent = {
    id: "evt_pi_123",
    type: "payment_intent.succeeded",
    data: {
      object: mockPaymentIntent,
    },
  };

  it("duplicate delivery of same payment_intent.succeeded returns HTTP 200 without creating duplicate orders", async () => {
    // 1. First invocation: existing order not found, transaction creates order
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as any);
    vi.mocked(prisma.order.findUnique).mockResolvedValueOnce(null);

    const mockCart = {
      id: "cart_abc",
      userId: "user_123",
      guestToken: null,
      items: [
        {
          id: "item_1",
          cartId: "cart_abc",
          variantId: "var_1",
          quantity: 2,
          variant: {
            id: "var_1",
            stock: 10,
            priceDelta: 0,
            product: {
              id: "prod_1",
              basePrice: 25.0,
            },
          },
        },
      ],
    };

    const mockCreatedOrder = {
      id: "ord_new_123",
      orderNumber: "ORD-TEST-123",
      userId: "user_123",
      guestEmail: null,
      status: "PROCESSING",
      paymentStatus: "PAID",
      stripePaymentId: "pi_idempotency_123",
      subtotal: 50.0,
      shippingFee: 0.0,
      discountTotal: 0.0,
      total: 50.0,
      shippingAddress: mockShippingAddress,
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      const tx = {
        cart: {
          findUnique: vi.fn().mockResolvedValue(mockCart),
          delete: vi.fn().mockResolvedValue(mockCart),
        },
        cartItem: {
          deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        order: {
          create: vi.fn().mockResolvedValue(mockCreatedOrder),
        },
        productVariant: {
          update: vi.fn().mockResolvedValue({ id: "var_1", stock: 8 }),
        },
      };
      return await callback(tx);
    });

    const firstReq = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify(mockEvent),
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=123,v1=valid",
      },
    });

    const firstRes = await POST(firstReq);
    const firstData = await firstRes.json();

    expect(firstRes.status).toBe(200);
    expect(firstData.received).toBe(true);
    expect(firstData.orderId).toBe("ord_new_123");
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);

    // 2. Second invocation: existing order IS found
    vi.mocked(prisma.order.findUnique).mockResolvedValueOnce(mockCreatedOrder as any);

    const secondReq = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify(mockEvent),
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=123,v1=valid",
      },
    });

    const secondRes = await POST(secondReq);
    const secondData = await secondRes.json();

    expect(secondRes.status).toBe(200);
    expect(secondData.received).toBe(true);
    expect(secondData.orderId).toBe("ord_new_123");
    // $transaction was NOT called again on second delivery
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("handles race condition with unique constraint violation gracefully and returns existing order", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as any);
    // Initial findUnique returns null simulating concurrent arrival before commit
    vi.mocked(prisma.order.findUnique)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "ord_concurrent_123",
        orderNumber: "ORD-CONCURRENT-123",
        stripePaymentId: "pi_idempotency_123",
      } as any);

    // Transaction fails with P2002 unique constraint on stripePaymentId
    const uniqueConstraintError = new Error("Unique constraint failed on the fields: (`stripePaymentId`)");
    (uniqueConstraintError as any).code = "P2002";

    vi.mocked(prisma.$transaction).mockRejectedValueOnce(uniqueConstraintError);

    const result = await handleStripeWebhook("rawBody", "sig_valid");

    expect(result.received).toBe(true);
    expect(result.orderId).toBe("ord_concurrent_123");
  });
});
