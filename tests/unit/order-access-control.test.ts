import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOrderByNumber, getUserOrders } from "@/lib/services/orders";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("Order Access Control & Query Service (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDate = new Date("2026-09-13T12:00:00Z");

  const mockProduct = {
    id: "prod_1",
    name: "Classic Crewneck",
    slug: "classic-crewneck",
    description: "Comfortable cotton crewneck",
    basePrice: new Decimal("45.00"),
    categoryId: "cat_apparel",
    images: ["/crewneck.jpg"],
    featured: true,
    isArchived: false,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockVariant = {
    id: "var_1",
    productId: "prod_1",
    sku: "CRW-BLK-M",
    name: "Medium / Black",
    priceDelta: new Decimal("0.00"),
    stock: 25,
    product: mockProduct,
  };

  const mockOrderItem = {
    id: "item_1",
    orderId: "ord_1",
    variantId: "var_1",
    unitPrice: new Decimal("45.00"),
    quantity: 2,
    variant: mockVariant,
  };

  const mockOrderUserA = {
    id: "ord_1",
    orderNumber: "ORD-USER-A",
    userId: "usr_a",
    guestEmail: null,
    status: "PROCESSING" as const,
    paymentStatus: "PAID" as const,
    stripePaymentId: "pi_user_a",
    subtotal: new Decimal("90.00"),
    discountTotal: new Decimal("0.00"),
    shippingFee: new Decimal("5.00"),
    total: new Decimal("95.00"),
    shippingAddress: {
      fullName: "Alice Smith",
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
      country: "USA",
      phone: "555-0100",
    },
    items: [mockOrderItem],
    user: {
      id: "usr_a",
      email: "alice@example.com",
      name: "Alice",
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockOrderGuest = {
    id: "ord_2",
    orderNumber: "ORD-GUEST-1",
    userId: null,
    guestEmail: "guest@example.com",
    status: "PROCESSING" as const,
    paymentStatus: "PAID" as const,
    stripePaymentId: "pi_guest_1",
    subtotal: new Decimal("45.00"),
    discountTotal: new Decimal("0.00"),
    shippingFee: new Decimal("5.00"),
    total: new Decimal("50.00"),
    shippingAddress: {
      fullName: "Bob Guest",
      street: "456 Elm St",
      city: "Shelbyville",
      state: "IL",
      postalCode: "62702",
      country: "USA",
      phone: "555-0200",
    },
    items: [mockOrderItem],
    user: null,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  describe("getOrderByNumber", () => {
    it("returns BAD_REQUEST if orderNumber is missing or whitespace", async () => {
      const res = await getOrderByNumber("   ");
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("BAD_REQUEST");
    });

    it("returns NOT_FOUND if order does not exist in database", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

      const res = await getOrderByNumber("ORD-NONEXISTENT");
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("NOT_FOUND");
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { orderNumber: "ORD-NONEXISTENT" },
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
    });

    it("prevents User B from querying User A's order without matching email (403 FORBIDDEN)", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrderUserA as any);

      // User B logged in, no guestEmail provided
      const res = await getOrderByNumber("ORD-USER-A", undefined, "usr_b");
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("FORBIDDEN");
    });

    it("prevents unauthenticated query without matching guestEmail from accessing User A's order", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrderUserA as any);

      const res = await getOrderByNumber("ORD-USER-A", "wrong@example.com", undefined);
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("FORBIDDEN");
    });

    it("allows User A to access own order with matching userId", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrderUserA as any);

      const res = await getOrderByNumber("ORD-USER-A", undefined, "usr_a");
      expect(res.success).toBe(true);
      expect(res.data?.orderNumber).toBe("ORD-USER-A");
      expect(res.data?.items).toHaveLength(1);
      expect(res.data?.items[0].variant.product.name).toBe("Classic Crewneck");
    });

    it("allows access to user order if guestEmail matches user account email (case-insensitive)", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrderUserA as any);

      const res = await getOrderByNumber("ORD-USER-A", "ALICE@EXAMPLE.COM");
      expect(res.success).toBe(true);
      expect(res.data?.orderNumber).toBe("ORD-USER-A");
    });

    it("allows access to guest order if guestEmail matches order.guestEmail (case-insensitive)", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrderGuest as any);

      const res = await getOrderByNumber("ORD-GUEST-1", "GUEST@EXAMPLE.COM");
      expect(res.success).toBe(true);
      expect(res.data?.orderNumber).toBe("ORD-GUEST-1");
      expect(res.data?.items).toHaveLength(1);
    });

    it("blocks access to guest order if wrong guestEmail is provided", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrderGuest as any);

      const res = await getOrderByNumber("ORD-GUEST-1", "hacker@example.com");
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("FORBIDDEN");
    });

    it("blocks unauthenticated access to guest order when no guestEmail is provided", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrderGuest as any);

      const res = await getOrderByNumber("ORD-GUEST-1");
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("FORBIDDEN");
    });
  });

  describe("getUserOrders", () => {
    it("returns BAD_REQUEST if userId is empty", async () => {
      const res = await getUserOrders("");
      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("BAD_REQUEST");
    });

    it("returns paginated orders sorted in descending order of createdAt", async () => {
      const orders = [
        {
          ...mockOrderUserA,
          id: "ord_newest",
          createdAt: new Date("2026-09-13T14:00:00Z"),
        },
        {
          ...mockOrderUserA,
          id: "ord_older",
          createdAt: new Date("2026-09-13T10:00:00Z"),
        },
      ];

      vi.mocked(prisma.$transaction).mockResolvedValue([orders, 2] as any);

      const res = await getUserOrders("usr_a", 1, 10);
      expect(res.success).toBe(true);
      expect(res.data?.items).toHaveLength(2);
      expect(res.data?.total).toBe(2);
      expect(res.data?.page).toBe(1);
      expect(res.data?.limit).toBe(10);
      expect(res.data?.totalPages).toBe(1);

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("calculates pagination correctly with custom page and limit", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([[mockOrderUserA], 15] as any);

      const res = await getUserOrders("usr_a", 2, 5);
      expect(res.success).toBe(true);
      expect(res.data?.total).toBe(15);
      expect(res.data?.page).toBe(2);
      expect(res.data?.limit).toBe(5);
      expect(res.data?.totalPages).toBe(3);
    });

    it("returns empty result when user has 0 orders", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([[], 0] as any);

      const res = await getUserOrders("usr_new", 1, 10);
      expect(res.success).toBe(true);
      expect(res.data?.items).toEqual([]);
      expect(res.data?.total).toBe(0);
      expect(res.data?.totalPages).toBe(0);
    });
  });
});
