import { prisma } from "@/lib/prisma";
import {
  ApiResponse,
  CheckoutPreview,
  CheckoutSessionDto,
  ShippingMethod,
} from "@/types";
import { getCart } from "./cart";
import { validateCheckoutSessionInput } from "@/lib/validators/checkout";

export const STANDARD_SHIPPING_FEE = 5.0;
export const EXPRESS_SHIPPING_FEE = 15.0;
export const FREE_SHIPPING_THRESHOLD = 100.0;

/**
 * Computes the shipping fee based on cart subtotal and selected method.
 * Standard shipping is free ($0.00) when subtotal reaches or exceeds $100.00.
 */
export function calculateShippingFee(
  subtotal: number,
  methodId: "STANDARD" | "EXPRESS" = "STANDARD"
): number {
  if (methodId === "EXPRESS") {
    return EXPRESS_SHIPPING_FEE;
  }
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0.0 : STANDARD_SHIPPING_FEE;
}

/**
 * Returns the list of available shipping tiers with dynamic pricing based on subtotal.
 */
export function getAvailableShippingMethods(subtotal: number): ShippingMethod[] {
  return [
    {
      id: "STANDARD",
      name: "Standard Delivery",
      price: subtotal >= FREE_SHIPPING_THRESHOLD ? 0.0 : STANDARD_SHIPPING_FEE,
      estimatedDays: "3-5 Business Days",
    },
    {
      id: "EXPRESS",
      name: "Express Delivery",
      price: EXPRESS_SHIPPING_FEE,
      estimatedDays: "1-2 Business Days",
    },
  ];
}

/**
 * Generates an immutable order checkout preview with real-time stock verification.
 */
export async function getCheckoutPreview(
  shippingMethodId?: string,
  guestToken?: string,
  userId?: string
): Promise<ApiResponse<CheckoutPreview>> {
  try {
    const validMethod: "STANDARD" | "EXPRESS" =
      shippingMethodId === "EXPRESS" ? "EXPRESS" : "STANDARD";

    // 1. Fetch active cart
    const cartRes = await getCart(guestToken, userId);
    if (!cartRes.success || !cartRes.data || cartRes.data.items.length === 0) {
      return {
        success: false,
        error: {
          code: "CART_EMPTY",
          message: "Cart is empty. Add items before proceeding to checkout.",
        },
        timestamp: new Date().toISOString(),
      };
    }

    const cart = cartRes.data;

    // 2. Real-time live inventory verification
    const variantIds = cart.items.map((item) => item.variantId);
    const liveVariants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    const liveVariantMap = new Map(liveVariants.map((v) => [v.id, v]));

    for (const item of cart.items) {
      const live = liveVariantMap.get(item.variantId);

      if (!live || live.product.isArchived) {
        return {
          success: false,
          error: {
            code: "STOCK_CHANGED",
            message: `Item "${item.variant?.product?.name || "Product"}" is no longer available.`,
          },
          timestamp: new Date().toISOString(),
        };
      }

      if (live.stock < item.quantity) {
        return {
          success: false,
          error: {
            code: "STOCK_CHANGED",
            message: `Item "${live.product.name} - ${live.name}" has insufficient stock (${live.stock} available, requested ${item.quantity}).`,
          },
          timestamp: new Date().toISOString(),
        };
      }
    }

    // 3. Compute totals adhering strictly to Server-Side Price Invariant
    const subtotal = cart.subtotal;
    const shippingFee = calculateShippingFee(subtotal, validMethod);
    const discountTotal = 0.0;
    const total = Math.round((subtotal + shippingFee - discountTotal) * 100) / 100;
    const availableShippingMethods = getAvailableShippingMethods(subtotal);

    return {
      success: true,
      data: {
        items: cart.items,
        subtotal,
        shippingFee,
        discountTotal,
        total,
        availableShippingMethods,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[CheckoutService] Error generating preview:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate checkout preview",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Validates a checkout session payload including address format, guest email, and cart readiness.
 */
export async function validateCheckoutSession(
  dto: CheckoutSessionDto,
  guestToken?: string,
  userId?: string
): Promise<ApiResponse<{ valid: boolean; preview: CheckoutPreview }>> {
  // 1. Validate DTO against Zod schema and guest authentication state
  const validation = validateCheckoutSessionInput(dto, !userId);
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error,
      timestamp: new Date().toISOString(),
    };
  }

  // 2. Validate live cart state & inventory
  const previewRes = await getCheckoutPreview(
    validation.data.shippingMethodId,
    guestToken,
    userId
  );

  if (!previewRes.success || !previewRes.data) {
    return {
      success: false,
      error: previewRes.error,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: true,
    data: {
      valid: true,
      preview: previewRes.data,
    },
    timestamp: new Date().toISOString(),
  };
}
