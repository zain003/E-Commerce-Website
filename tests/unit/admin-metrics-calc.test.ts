import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAdminMetrics } from "@/lib/services/admin-orders";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      aggregate: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("Admin Metrics Calculation (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates total revenue and order counts correctly from seed data", async () => {
    // Mock aggregate for total revenue of paid orders
    vi.mocked(prisma.order.aggregate).mockResolvedValue({
      _sum: {
        subtotal: new Decimal("1250.75"),
      },
    } as any);

    // Mock count calls: total, processing, delivered
    vi.mocked(prisma.order.count)
      .mockResolvedValueOnce(45) // total orders
      .mockResolvedValueOnce(12) // processing orders
      .mockResolvedValueOnce(28); // delivered orders

    const result = await getAdminMetrics();

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.totalRevenue).toBe(1250.75);
    expect(result.data?.totalOrders).toBe(45);
    expect(result.data?.processingOrders).toBe(12);
    expect(result.data?.deliveredOrders).toBe(28);

    expect(prisma.order.aggregate).toHaveBeenCalledWith({
      where: {
        paymentStatus: "PAID",
      },
      _sum: {
        subtotal: true,
      },
    });

    expect(prisma.order.count).toHaveBeenCalledTimes(3);
    expect(prisma.order.count).toHaveBeenNthCalledWith(1);
    expect(prisma.order.count).toHaveBeenNthCalledWith(2, {
      where: { status: "PROCESSING" },
    });
    expect(prisma.order.count).toHaveBeenNthCalledWith(3, {
      where: { status: "DELIVERED" },
    });
  });

  it("handles empty database state with zero revenue and zero counts gracefully", async () => {
    vi.mocked(prisma.order.aggregate).mockResolvedValue({
      _sum: {
        subtotal: null,
      },
    } as any);

    vi.mocked(prisma.order.count)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const result = await getAdminMetrics();

    expect(result.success).toBe(true);
    expect(result.data?.totalRevenue).toBe(0);
    expect(result.data?.totalOrders).toBe(0);
    expect(result.data?.processingOrders).toBe(0);
    expect(result.data?.deliveredOrders).toBe(0);
  });

  it("handles database aggregation errors gracefully", async () => {
    vi.mocked(prisma.order.aggregate).mockRejectedValue(new Error("DB Connection Error"));

    const result = await getAdminMetrics();

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INTERNAL_SERVER_ERROR");
  });
});
