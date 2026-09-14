import { prisma } from "@/lib/prisma";
import type {
  ApiResponse,
  PaginatedResult,
  OrderStatus,
  PaymentStatus,
  AdminOrder,
  AdminOrderMetrics,
  UpdateOrderStatusDto,
} from "@/types";

/**
 * Valid state transition graph for orders.
 * Terminal states (DELIVERED, CANCELLED) cannot transition further.
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

/**
 * Fetch a paginated list of orders for back-office administration.
 * Supports filtering by OrderStatus, customer details, and hydrated line items.
 */
export async function getAdminOrders(
  status?: OrderStatus | "ALL",
  page = 1,
  limit = 10
): Promise<ApiResponse<PaginatedResult<AdminOrder>>> {
  try {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const skip = (safePage - 1) * safeLimit;

    const where = status && status !== "ALL" ? { status } : {};

    const [items, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    return {
      success: true,
      data: {
        items: items as unknown as AdminOrder[],
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[AdminOrdersService] getAdminOrders error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve orders for admin",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Transition order status with state machine invariant validation.
 * When cancelling a paid order, automatically flags paymentStatus as REFUNDED.
 */
export async function updateOrderStatus(
  orderId: string,
  dto: UpdateOrderStatusDto
): Promise<ApiResponse<AdminOrder>> {
  try {
    const trimmedId = orderId?.trim();
    if (!trimmedId) {
      return {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Order ID is required",
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 1. Fetch existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id: trimmedId },
    });

    if (!existingOrder) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Order with ID ${trimmedId} not found`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Validate status transition
    const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[existingOrder.status] || [];
    if (!allowedTransitions.includes(dto.status)) {
      return {
        success: false,
        error: {
          code: "INVALID_STATUS_TRANSITION",
          message: `Cannot transition order status from '${existingOrder.status}' to '${dto.status}'`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Prepare update payload
    const updateData: {
      status: OrderStatus;
      paymentStatus?: PaymentStatus;
      updatedAt: Date;
    } = {
      status: dto.status,
      updatedAt: new Date(),
    };

    // Edge case: when cancelling a paid order, mark paymentStatus as REFUNDED
    if (dto.status === "CANCELLED" && existingOrder.paymentStatus === "PAID") {
      updateData.paymentStatus = "REFUNDED";
      console.log(
        `[AdminOrdersService] Order ${existingOrder.orderNumber} cancelled after payment. PaymentStatus marked as REFUNDED.`
      );
    }

    // 4. Update order in database
    const updatedOrder = await prisma.order.update({
      where: { id: trimmedId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    });

    return {
      success: true,
      data: updatedOrder as unknown as AdminOrder,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[AdminOrdersService] updateOrderStatus error for ID ${orderId}:`, error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update order status",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Calculate high-level summary KPIs for the admin dashboard:
 * - totalRevenue: Sum of paid order subtotals
 * - totalOrders: Total order count
 * - processingOrders: Active orders awaiting fulfillment
 * - deliveredOrders: Completed orders
 */
export async function getAdminMetrics(): Promise<ApiResponse<AdminOrderMetrics>> {
  try {
    const [revenueAggregation, totalOrders, processingOrders, deliveredOrders] =
      await Promise.all([
        prisma.order.aggregate({
          where: {
            paymentStatus: "PAID",
          },
          _sum: {
            subtotal: true,
          },
        }),
        prisma.order.count(),
        prisma.order.count({
          where: {
            status: "PROCESSING",
          },
        }),
        prisma.order.count({
          where: {
            status: "DELIVERED",
          },
        }),
      ]);

    const totalRevenue = revenueAggregation._sum.subtotal
      ? Number(revenueAggregation._sum.subtotal)
      : 0;

    return {
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        processingOrders,
        deliveredOrders,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[AdminOrdersService] getAdminMetrics error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to calculate store metrics",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
