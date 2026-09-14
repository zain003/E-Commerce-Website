import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as checkoutPreviewRoute } from "@/app/api/checkout/preview/route";
import * as cartService from "@/lib/services/cart";
import * as couponService from "@/lib/services/coupons";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/payments/stripe";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { validateCheckoutSession } from "@/lib/services/checkout";
import { handleStripeWebhook } from "@/lib/services/order-creation";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/payments/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

vi.mock("@/lib/services/cart", () => ({
  getCart: vi.fn(),
}));

vi.mock("@/lib/services/coupons", () => ({
  validateCoupon: vi.fn(),
  incrementCouponUsage: vi.fn(),
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
    order: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    coupon: {
      update: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

describe("Checkout Coupon Discount Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
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

  it("applies coupon discount to checkout preview route", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const item = createMockItem("1", 100.0, 1, 10);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: {
        id: "cart_1",
        userId: null,
        guestToken: "guest-token-123",
        items: [item],
        subtotal: 100.0,
        itemCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      timestamp: new Date().toISOString(),
    });

    vi.mocked(prisma.productVariant.findMany).mockResolvedValue([item.variant as any]);
    vi.mocked(couponService.validateCoupon).mockResolvedValue({
      success: true,
      data: {
        valid: true,
        code: "SAVE20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minSpend: 50,
        discountAmount: 20.0,
        newTotal: 80.0,
      },
      timestamp: new Date().toISOString(),
    });

    const req = new NextRequest("http://localhost:3000/api/checkout/preview?method=STANDARD&coupon=SAVE20");
    const res = await checkoutPreviewRoute(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data?.subtotal).toBe(100.0);
    expect(json.data?.discountTotal).toBe(20.0);
    expect(json.data?.shippingFee).toBe(0.0); // Subtotal 100 >= 100 -> free standard shipping
    expect(json.data?.total).toBe(80.0);
  });

  it("calculates discountTotal during validateCheckoutSession", async () => {
    const item = createMockItem("1", 100.0, 1, 10);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: {
        id: "cart_1",
        userId: null,
        guestToken: "guest-token-123",
        items: [item],
        subtotal: 100.0,
        itemCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      timestamp: new Date().toISOString(),
    });

    vi.mocked(prisma.productVariant.findMany).mockResolvedValue([item.variant as any]);
    vi.mocked(couponService.validateCoupon).mockResolvedValue({
      success: true,
      data: {
        valid: true,
        code: "SAVE20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minSpend: 50,
        discountAmount: 20.0,
        newTotal: 80.0,
      },
      timestamp: new Date().toISOString(),
    });

    const result = await validateCheckoutSession({
      guestEmail: "buyer@example.com",
      shippingAddress: {
        fullName: "Jane Doe",
        street: "123 Main St",
        city: "Seattle",
        state: "WA",
        postalCode: "98101",
        country: "USA",
        phone: "555-123-4567",
      },
      shippingMethodId: "STANDARD",
      couponCode: "SAVE20",
    });

    expect(result.success).toBe(true);
    expect(result.data?.valid).toBe(true);
    expect(result.data?.preview.discountTotal).toBe(20.0);
    expect(result.data?.preview.total).toBe(80.0);
  });

  it("persists discountTotal and calls incrementCouponUsage upon order creation", async () => {
    const item = createMockItem("1", 100.0, 1, 10);
    const mockCart = {
      id: "cart_1",
      userId: null,
      guestToken: "guest-token-123",
      items: [item],
    };

    const mockOrder = {
      id: "ord_1",
      orderNumber: "ORD-12345678-ABCD",
      userId: null,
      guestEmail: "buyer@example.com",
      status: "PROCESSING",
      paymentStatus: "PAID",
      subtotal: 100.0,
      discountTotal: 20.0,
      shippingFee: 0,
      total: 80.0,
      stripePaymentId: "pi_123",
      shippingAddress: {},
      shippingMethod: "STANDARD",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    const txOrderCreate = vi.fn().mockResolvedValue(mockOrder);
    const txCartFindUnique = vi.fn().mockResolvedValue(mockCart);
    const txVariantUpdate = vi.fn().mockResolvedValue(item.variant);
    const txCartItemDeleteMany = vi.fn().mockResolvedValue({ count: 1 });
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

    const paymentIntent: any = {
      id: "pi_123",
      amount: 8000,
      status: "succeeded",
      metadata: {
        userId: "",
        guestEmail: "buyer@example.com",
        cartId: "cart_1",
        shippingMethodId: "STANDARD",
        subtotal: "100.00",
        shippingFee: "0.00",
        discountTotal: "20.00",
        couponCode: "SAVE20",
        shippingAddress: JSON.stringify({
          fullName: "Jane Doe",
          street: "123 Main St",
          city: "Seattle",
          state: "WA",
          postalCode: "98101",
          country: "USA",
          phone: "555-123-4567",
        }),
      },
    };

    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      id: "evt_123",
      type: "payment_intent.succeeded",
      data: {
        object: paymentIntent,
      },
    } as any);

    const result = await handleStripeWebhook("raw_payload", "valid_sig");

    expect(result.received).toBe(true);
    expect(result.orderId).toBe("ord_1");
    expect(txOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          discountTotal: 20.0,
          total: 80.0,
        }),
      })
    );
    expect(couponService.incrementCouponUsage).toHaveBeenCalledWith("SAVE20");
  });
});
