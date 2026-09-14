import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { GET } from "@/app/api/admin/orders/route";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("GET /api/admin/orders (API Query & Pagination)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: "usr_admin",
        email: "admin@example.com",
        name: "Admin User",
        role: "ADMIN",
      },
      expires: "9999-12-31",
    });
  });

  const mockDate = new Date("2026-09-14T10:00:00Z");
  const mockOrder = {
    id: "ord_1",
    orderNumber: "ORD-001",
    userId: "usr_cust_1",
    guestEmail: null,
    status: "PROCESSING" as const,
    paymentStatus: "PAID" as const,
    stripePaymentId: "pi_1",
    subtotal: new Decimal("120.00"),
    discountTotal: new Decimal("0.00"),
    shippingFee: new Decimal("0.00"),
    total: new Decimal("120.00"),
    shippingAddress: {
      fullName: "Alice Wonderland",
      street: "1 Rabbit Hole",
      city: "Oxford",
      state: "OX",
      postalCode: "OX1",
      country: "UK",
      phone: "555-9999",
    },
    items: [],
    user: {
      id: "usr_cust_1",
      name: "Alice Wonderland",
      email: "alice@example.com",
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  it("retrieves paginated orders without status filter by default", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[mockOrder], 1]);

    const req = new NextRequest("http://localhost:3000/api/admin/orders?page=1&limit=10");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(1);
    expect(body.data.total).toBe(1);
    expect(body.data.page).toBe(1);
    expect(body.data.limit).toBe(10);
    expect(body.data.totalPages).toBe(1);

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      })
    );
    expect(prisma.order.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      })
    );
  });

  it("filters orders by status when provided", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[mockOrder], 1]);

    const req = new NextRequest("http://localhost:3000/api/admin/orders?status=PROCESSING&page=2&limit=5");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.page).toBe(2);
    expect(body.data.limit).toBe(5);

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PROCESSING" },
        skip: 5,
        take: 5,
      })
    );
    expect(prisma.order.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PROCESSING" },
      })
    );
  });

  it("treats status=ALL as no status filter", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[mockOrder], 1]);

    const req = new NextRequest("http://localhost:3000/api/admin/orders?status=ALL");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      })
    );
  });

  it("returns 400 VALIDATION_ERROR when status parameter is invalid", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/orders?status=UNKNOWN_STATUS");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 VALIDATION_ERROR when page parameter is negative or zero", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/orders?page=-1");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});
