import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAdminOrders,
  updateOrderStatus,
  ALLOWED_STATUS_TRANSITIONS,
} from "@/lib/services/admin-orders";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("Admin Orders Service (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDate = new Date("2026-09-14T10:00:00Z");

  const mockOrder = {
    id: "ord_100",
    orderNumber: "ORD-100",
    userId: "usr_cust_1",
    guestEmail: null,
    status: "PROCESSING" as const,
    paymentStatus: "PAID" as const,
    stripePaymentId: "pi_100",
    subtotal: new Decimal("100.00"),
    discountTotal: new Decimal("0.00"),
    shippingFee: new Decimal("5.00"),
    total: new Decimal("105.00"),
    shippingAddress: {
      fullName: "Test User",
      street: "123 Test St",
      city: "Test City",
      state: "TS",
      postalCode: "12345",
      country: "USA",
      phone: "555-0000",
    },
    items: [],
    user: {
      id: "usr_cust_1",
      name: "Test User",
      email: "test@example.com",
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  describe("getAdminOrders", () => {
    it("returns paginated orders with default parameters", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([[mockOrder], 1]);

      const res = await getAdminOrders();

      expect(res.success).toBe(true);
      expect(res.data?.items).toHaveLength(1);
      expect(res.data?.total).toBe(1);
      expect(res.data?.page).toBe(1);
      expect(res.data?.limit).toBe(10);
      expect(res.data?.totalPages).toBe(1);
    });

    it("handles database exceptions cleanly and returns INTERNAL_SERVER_ERROR", async () => {
      vi.mocked(prisma.$transaction).mockRejectedValue(new Error("Database offline"));

      const res = await getAdminOrders();

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  describe("updateOrderStatus", () => {
    it("returns BAD_REQUEST if orderId is whitespace or empty", async () => {
      const res = await updateOrderStatus("   ", { status: "SHIPPED" });

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("BAD_REQUEST");
    });

    it("returns NOT_FOUND if order does not exist", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

      const res = await updateOrderStatus("ord_missing", { status: "SHIPPED" });

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("NOT_FOUND");
    });

    it("validates transition against ALLOWED_STATUS_TRANSITIONS matrix", () => {
      expect(ALLOWED_STATUS_TRANSITIONS.PENDING_PAYMENT).toEqual(["PROCESSING", "CANCELLED"]);
      expect(ALLOWED_STATUS_TRANSITIONS.PROCESSING).toEqual(["SHIPPED", "CANCELLED"]);
      expect(ALLOWED_STATUS_TRANSITIONS.SHIPPED).toEqual(["DELIVERED", "CANCELLED"]);
      expect(ALLOWED_STATUS_TRANSITIONS.DELIVERED).toEqual([]);
      expect(ALLOWED_STATUS_TRANSITIONS.CANCELLED).toEqual([]);
    });

    it("handles database update error gracefully", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.order.update).mockRejectedValue(new Error("DB update failure"));

      const res = await updateOrderStatus("ord_100", { status: "SHIPPED" });

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });
});
