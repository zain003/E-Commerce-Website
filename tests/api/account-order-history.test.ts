import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/account/orders/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
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

describe("GET /api/account/orders (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDate = new Date("2026-09-13T12:00:00Z");

  const mockOrder = {
    id: "ord_1",
    orderNumber: "ORD-HIST-1",
    userId: "usr_a",
    guestEmail: null,
    status: "PROCESSING" as const,
    paymentStatus: "PAID" as const,
    stripePaymentId: "pi_1",
    subtotal: new Decimal("45.00"),
    discountTotal: new Decimal("0.00"),
    shippingFee: new Decimal("5.00"),
    total: new Decimal("50.00"),
    shippingAddress: {
      fullName: "Alice Smith",
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
      country: "USA",
      phone: "555-0100",
    },
    items: [],
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  it("returns 401 UNAUTHORIZED when session is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/account/orders");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 200 and paginated list of orders for authenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_a", email: "alice@example.com", role: "CUSTOMER", name: "Alice" },
      expires: "9999-12-31",
    });

    vi.mocked(prisma.$transaction).mockResolvedValue([[mockOrder], 1] as any);

    const req = new NextRequest("http://localhost:3000/api/account/orders");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0].orderNumber).toBe("ORD-HIST-1");
    expect(body.data.total).toBe(1);
    expect(body.data.page).toBe(1);
    expect(body.data.limit).toBe(10);
    expect(body.data.totalPages).toBe(1);
  });

  it("handles custom page and limit query params properly", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_a", email: "alice@example.com", role: "CUSTOMER", name: "Alice" },
      expires: "9999-12-31",
    });

    vi.mocked(prisma.$transaction).mockResolvedValue([[mockOrder], 25] as any);

    const req = new NextRequest("http://localhost:3000/api/account/orders?page=3&limit=5");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.page).toBe(3);
    expect(body.data.limit).toBe(5);
    expect(body.data.total).toBe(25);
    expect(body.data.totalPages).toBe(5);
  });

  it("returns 400 VALIDATION_ERROR for invalid pagination query parameters", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_a", email: "alice@example.com", role: "CUSTOMER", name: "Alice" },
      expires: "9999-12-31",
    });

    const req = new NextRequest("http://localhost:3000/api/account/orders?page=0");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns empty result when authenticated user has no orders", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_a", email: "alice@example.com", role: "CUSTOMER", name: "Alice" },
      expires: "9999-12-31",
    });

    vi.mocked(prisma.$transaction).mockResolvedValue([[], 0] as any);

    const req = new NextRequest("http://localhost:3000/api/account/orders");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.items).toEqual([]);
    expect(body.data.total).toBe(0);
    expect(body.data.totalPages).toBe(0);
  });
});
