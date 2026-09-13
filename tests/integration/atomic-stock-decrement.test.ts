import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleStripeWebhook } from "@/lib/services/order-creation";
import { stripe } from "@/lib/payments/stripe";
import { prisma } from "@/lib/prisma";

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
        update: vi.fn(),
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

describe("Atomic Stock Decrement & Order Creation (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  });

  const mockShippingAddress = {
    fullName: "Grace Hopper",
    street: "1 Navy Way",
    city: "Arlington",
    state: "VA",
    postalCode: "22202",
    country: "United States",
    phone: "+1 703 555 0123",
  };

  const mockCart = {
    id: "cart_xyz",
    userId: "user_grace",
    guestToken: null,
    items: [
      {
        id: "item_1",
        cartId: "cart_xyz",
        variantId: "var_shirt_m",
        quantity: 3,
        variant: {
          id: "var_shirt_m",
          stock: 20,
          priceDelta: 5.0,
          product: {
            id: "prod_shirt",
            basePrice: 30.0,
          },
        },
      },
      {
        id: "item_2",
        cartId: "cart_xyz",
        variantId: "var_hat_blue",
        quantity: 1,
        variant: {
          id: "var_hat_blue",
          stock: 5,
          priceDelta: 0.0,
          product: {
            id: "prod_hat",
            basePrice: 15.0,
          },
        },
      },
    ],
  };

  const mockPaymentIntent = {
    id: "pi_atomic_456",
    amount: 12000,
    currency: "usd",
    metadata: {
      cartId: "cart_xyz",
      userId: "user_grace",
      guestEmail: "",
      shippingMethodId: "STANDARD",
      shippingAddress: JSON.stringify(mockShippingAddress),
    },
  };

  it("creates Order with status: PROCESSING and paymentStatus: PAID, decrements variant stock, and deletes cart", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      id: "evt_pi_atomic",
      type: "payment_intent.succeeded",
      data: { object: mockPaymentIntent },
    } as any);

    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    const mockCreatedOrder = {
      id: "ord_atomic_456",
      orderNumber: "ORD-ATOMIC-456",
      status: "PROCESSING",
      paymentStatus: "PAID",
      subtotal: 120.0,
      shippingFee: 0.0,
      total: 120.0,
    };

    const txCartFindUnique = vi.fn().mockResolvedValue(mockCart);
    const txOrderCreate = vi.fn().mockResolvedValue(mockCreatedOrder);
    const txVariantUpdate = vi.fn().mockResolvedValue({ id: "var_updated" });
    const txCartItemDeleteMany = vi.fn().mockResolvedValue({ count: 2 });
    const txCartDelete = vi.fn().mockResolvedValue(mockCart);

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      const tx = {
        cart: {
          findUnique: txCartFindUnique,
          delete: txCartDelete,
        },
        cartItem: {
          deleteMany: txCartItemDeleteMany,
        },
        order: {
          create: txOrderCreate,
        },
        productVariant: {
          update: txVariantUpdate,
        },
      };
      return await callback(tx);
    });

    const result = await handleStripeWebhook("raw_payload", "valid_signature");

    expect(result.received).toBe(true);
    expect(result.orderId).toBe("ord_atomic_456");

    // Verify Order creation parameters
    expect(txOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PROCESSING",
          paymentStatus: "PAID",
          stripePaymentId: "pi_atomic_456",
          userId: "user_grace",
          items: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                variantId: "var_shirt_m",
                quantity: 3,
                unitPrice: 35.0,
              }),
              expect.objectContaining({
                variantId: "var_hat_blue",
                quantity: 1,
                unitPrice: 15.0,
              }),
            ]),
          }),
        }),
      })
    );

    // Verify exact stock decrements
    expect(txVariantUpdate).toHaveBeenCalledWith({
      where: { id: "var_shirt_m" },
      data: { stock: { decrement: 3 } },
    });
    expect(txVariantUpdate).toHaveBeenCalledWith({
      where: { id: "var_hat_blue" },
      data: { stock: { decrement: 1 } },
    });

    // Verify cart and items deletion
    expect(txCartItemDeleteMany).toHaveBeenCalledWith({
      where: { cartId: "cart_xyz" },
    });
    expect(txCartDelete).toHaveBeenCalledWith({
      where: { id: "cart_xyz" },
    });
  });

  it("rolls back transaction cleanly when an error occurs during stock decrement", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      id: "evt_pi_fail",
      type: "payment_intent.succeeded",
      data: { object: mockPaymentIntent },
    } as any);

    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    vi.mocked(prisma.$transaction).mockRejectedValueOnce(
      new Error("Database connection lost during stock decrement")
    );

    await expect(
      handleStripeWebhook("raw_payload", "valid_signature")
    ).rejects.toThrow("Database connection lost during stock decrement");
  });

  it("logs admin alert when variant stock is insufficient while proceeding with order creation", async () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const lowStockCart = {
      ...mockCart,
      items: [
        {
          ...mockCart.items[0],
          quantity: 25, // Cart quantity 25 exceeds variant stock 20
        },
      ],
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      id: "evt_pi_low_stock",
      type: "payment_intent.succeeded",
      data: { object: mockPaymentIntent },
    } as any);

    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      const tx = {
        cart: {
          findUnique: vi.fn().mockResolvedValue(lowStockCart),
          delete: vi.fn().mockResolvedValue(lowStockCart),
        },
        cartItem: {
          deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        order: {
          create: vi.fn().mockResolvedValue({
            id: "ord_low_stock",
            status: "PROCESSING",
            paymentStatus: "PAID",
          }),
        },
        productVariant: {
          update: vi.fn().mockResolvedValue({ id: "var_shirt_m", stock: -5 }),
        },
      };
      return await callback(tx);
    });

    const result = await handleStripeWebhook("raw_payload", "valid_signature");

    expect(result.received).toBe(true);
    expect(result.orderId).toBe("ord_low_stock");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[ADMIN ALERT] Stock deficit detected")
    );

    consoleWarnSpy.mockRestore();
  });

  it("handles missing metadata gracefully without unhandled promise rejection", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const paymentIntentNoMetadata = {
      id: "pi_no_meta_789",
      amount: 5000,
      metadata: {}, // Missing cartId
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      id: "evt_no_meta",
      type: "payment_intent.succeeded",
      data: { object: paymentIntentNoMetadata },
    } as any);

    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    const result = await handleStripeWebhook("raw_payload", "valid_signature");

    expect(result.received).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("[StripeWebhook] PaymentIntent missing required metadata:"),
      "pi_no_meta_789",
      {}
    );

    consoleErrorSpy.mockRestore();
  });

  it("handles payment_intent.payment_failed by logging error and setting paymentStatus to FAILED if order exists", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const failedPaymentIntent = {
      id: "pi_failed_111",
      last_payment_error: {
        message: "Your card was declined.",
      },
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      id: "evt_failed",
      type: "payment_intent.payment_failed",
      data: { object: failedPaymentIntent },
    } as any);

    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: "ord_existing_fail",
      stripePaymentId: "pi_failed_111",
      paymentStatus: "PENDING",
    } as any);

    vi.mocked(prisma.order.update).mockResolvedValue({
      id: "ord_existing_fail",
      paymentStatus: "FAILED",
    } as any);

    const result = await handleStripeWebhook("raw_payload", "valid_signature");

    expect(result.received).toBe(true);
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: "ord_existing_fail" },
      data: { paymentStatus: "FAILED" },
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("[StripeWebhook] Payment failed for PaymentIntent:"),
      "pi_failed_111",
      "Your card was declined."
    );

    consoleErrorSpy.mockRestore();
  });
});
