import { prisma } from "@/lib/prisma";
import { ApiResponse, HydratedOrder, PaginatedResult } from "@/types";

/**
 * Retrieves a full hydrated order by its unique orderNumber.
 * Enforces access control:
 * - Allowed if authenticated userId matches order.userId.
 * - Allowed if guestEmail matches order.guestEmail or order.user.email (case-insensitive).
 * - Otherwise returns 403 FORBIDDEN.
 */
export async function getOrderByNumber(
  orderNumber: string,
  guestEmail?: string,
  userId?: string
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
    const order = await prisma.order.findUnique({
      where: { orderNumber: trimmedOrderNumber },
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
