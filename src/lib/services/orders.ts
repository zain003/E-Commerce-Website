import { prisma } from "@/lib/prisma";
import { ApiResponse, HydratedOrder, PaginatedResult } from "@/types";
import { createOrderFromPaymentIntent } from "./order-creation";

/**
 * Retrieves a full hydrated order by its unique orderNumber or stripePaymentId.
 * Enforces access control:
 * - Allowed if authenticated userId matches order.userId.
 * - Allowed if guestEmail matches order.guestEmail or order.user.email (case-insensitive).
 * - Allowed if valid paymentIntentId matches order.stripePaymentId (proof of checkout).
 * - Otherwise returns 403 FORBIDDEN.
 */
export async function getOrderByNumber(
  orderNumber: string,
  guestEmail?: string,
  userId?: string,
  paymentIntentId?: string
): Promise<ApiResponse<HydratedOrder>> {
  const trimmedOrderNumber = orderNumber?.trim();
  if (!trimmedOrderNumber) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Order number is required",
      },
      timestamp: new Date().toISOString(),
    };
  }

  try {
    let order = await prisma.order.findUnique({
      where: trimmedOrderNumber.startsWith("pi_")
        ? { stripePaymentId: trimmedOrderNumber }
        : { orderNumber: trimmedOrderNumber },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        user: true,
      },
    });

    // If order was not found in DB yet, but a Stripe PaymentIntent ID was provided, attempt lazy sync/creation
    if (!order) {
      const targetPi = trimmedOrderNumber.startsWith("pi_")
        ? trimmedOrderNumber
        : paymentIntentId;

      if (targetPi && targetPi.startsWith("pi_")) {
        try {
          const syncedOrder = await createOrderFromPaymentIntent(targetPi);
          if (syncedOrder) {
            order = syncedOrder as any;
          }
        } catch (syncErr) {
          console.warn("[OrdersService] On-demand order creation fallback error:", syncErr);
        }
      }
    }

    if (!order) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Order ${trimmedOrderNumber} not found`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Access control evaluation
    let hasAccess = false;

    // 1. Authenticated user ownership check
    if (userId && order.userId && order.userId === userId) {
      hasAccess = true;
    }

    // 2. Guest/Email lookup check
    if (!hasAccess && guestEmail && guestEmail.trim() !== "") {
      const normalizedQueryEmail = guestEmail.trim().toLowerCase();
      const orderGuestEmail = order.guestEmail?.trim().toLowerCase();
      const orderUserEmail = order.user?.email?.trim().toLowerCase();

      if (
        (orderGuestEmail && orderGuestEmail === normalizedQueryEmail) ||
        (orderUserEmail && orderUserEmail === normalizedQueryEmail)
      ) {
        hasAccess = true;
      }
    }

    // 3. PaymentIntent proof: user presenting matching Stripe PaymentIntent ID has proven checkout payment
    if (!hasAccess && (paymentIntentId || trimmedOrderNumber.startsWith("pi_"))) {
      const targetPi =
        paymentIntentId ||
        (trimmedOrderNumber.startsWith("pi_") ? trimmedOrderNumber : undefined);
      if (targetPi && order.stripePaymentId === targetPi) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to view this order",
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Omit sensitive user relation details from HydratedOrder payload
    const { user: _user, ...hydratedOrder } = order;

    return {
      success: true,
      data: hydratedOrder as unknown as HydratedOrder,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[OrdersService] Failed to fetch order ${trimmedOrderNumber}:`, error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve order receipt",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Retrieves paginated orders for an authenticated customer, sorted descending by createdAt.
 */
export async function getUserOrders(
  userId: string,
  page = 1,
  limit = 10
): Promise<ApiResponse<PaginatedResult<HydratedOrder>>> {
  const trimmedUserId = userId?.trim();
  if (!trimmedUserId) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "User ID is required",
      },
      timestamp: new Date().toISOString(),
    };
  }

  const safePage = Math.max(1, Math.floor(Number(page) || 1));
  const safeLimit = Math.max(1, Math.min(50, Math.floor(Number(limit) || 10)));
  const skip = (safePage - 1) * safeLimit;

  try {
    const [items, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: { userId: trimmedUserId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: safeLimit,
      }),
      prisma.order.count({
        where: { userId: trimmedUserId },
      }),
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    return {
      success: true,
      data: {
        items: items as unknown as HydratedOrder[],
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[OrdersService] Failed to retrieve orders for user ${trimmedUserId}:`, error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve order history",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
