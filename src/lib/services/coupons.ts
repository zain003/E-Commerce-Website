import { prisma } from "@/lib/prisma";
import type {
  ApiResponse,
  DiscountType,
  ValidateCouponDto,
  CouponValidationResult,
} from "@/types";

/**
 * Pure helper function to compute discount deduction and new cart total.
 */
export function calculateDiscount(
  cartSubtotal: number,
  discountType: DiscountType,
  discountValue: number
): { discountAmount: number; newTotal: number } {
  if (cartSubtotal <= 0) {
    return { discountAmount: 0, newTotal: 0 };
  }

  let rawDiscount = 0;

  if (discountType === "PERCENTAGE") {
    rawDiscount = (cartSubtotal * discountValue) / 100;
  } else {
    rawDiscount = discountValue;
  }

  // Discount cannot exceed subtotal and cannot be negative
  const clampedDiscount = Math.min(cartSubtotal, Math.max(0, rawDiscount));
  const discountAmount = Math.round(clampedDiscount * 100) / 100;
  const newTotal = Math.round(Math.max(0, cartSubtotal - discountAmount) * 100) / 100;

  return { discountAmount, newTotal };
}

/**
 * Validates promotional coupon codes against expiration dates, minimum spend,
 * active status, and usage limits.
 */
export async function validateCoupon(
  dto: ValidateCouponDto
): Promise<ApiResponse<CouponValidationResult>> {
  try {
    const normalizedCode = dto.code.trim();

    if (!normalizedCode) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Coupon code cannot be empty",
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 1. Case-insensitive coupon lookup
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: {
          equals: normalizedCode,
          mode: "insensitive",
        },
      },
    });

    if (!coupon) {
      return {
        success: false,
        error: {
          code: "COUPON_NOT_FOUND",
          message: `Coupon code "${dto.code}" not found`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Active status check
    if (!coupon.isActive) {
      return {
        success: false,
        error: {
          code: "COUPON_INACTIVE",
          message: "This coupon is no longer active",
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Expiration check
    if (coupon.expiresAt && coupon.expiresAt <= new Date()) {
      return {
        success: false,
        error: {
          code: "COUPON_EXPIRED",
          message: "This coupon has expired",
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 4. Max uses check
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return {
        success: false,
        error: {
          code: "COUPON_MAX_USES_REACHED",
          message: "This coupon has reached its maximum usage limit",
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 5. Minimum spend requirement check
    const minSpendValue = coupon.minSpend !== null ? Number(coupon.minSpend) : null;
    if (minSpendValue !== null && dto.cartSubtotal < minSpendValue) {
      return {
        success: false,
        error: {
          code: "MINIMUM_SPEND_NOT_MET",
          message: `Minimum spend of $${minSpendValue.toFixed(2)} required for this coupon`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 6. Compute discount
    const discountValueNum = Number(coupon.discountValue);
    const { discountAmount, newTotal } = calculateDiscount(
      dto.cartSubtotal,
      coupon.discountType as DiscountType,
      discountValueNum
    );

    return {
      success: true,
      data: {
        valid: true,
        code: coupon.code,
        discountType: coupon.discountType as DiscountType,
        discountValue: discountValueNum,
        discountAmount,
        newTotal,
        minSpend: minSpendValue,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[validateCoupon] Error validating coupon:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to validate coupon",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Atomically increments a coupon's usedCount on order completion.
 */
export async function incrementCouponUsage(code: string): Promise<void> {
  try {
    const normalizedCode = code.trim();
    await prisma.coupon.updateMany({
      where: {
        code: {
          equals: normalizedCode,
          mode: "insensitive",
        },
      },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error(`[incrementCouponUsage] Error incrementing usage for "${code}":`, error);
  }
}
