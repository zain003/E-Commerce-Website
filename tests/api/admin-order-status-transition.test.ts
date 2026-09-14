import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { PATCH } from "@/app/api/admin/orders/[id]/status/route";
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
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("PATCH /api/admin/orders/[id]/status (API)", () => {
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

  const baseOrder = {
    id: "ord_100",
    orderNumber: "ORD-100",
    userId: "usr_customer_1",
    guestEmail: null,
    status: "PROCESSING" as const,
    paymentStatus: "PAID" as const,
    stripePaymentId: "pi_100",
    subtotal: new Decimal("80.00"),
    discountTotal: new Decimal("0.00"),
    shippingFee: new Decimal("5.00"),
    total: new Decimal("85.00"),
    shippingAddress: {
      fullName: "Jane Doe",
      street: "123 Elm St",
      city: "Portland",
      state: "OR",
      postalCode: "97201",
      country: "USA",
      phone: "555-1234",
    },
    items: [],
    user: {
      id: "usr_customer_1",
      name: "Jane Doe",
      email: "jane@example.com",
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  it("updates order status from PROCESSING to SHIPPED successfully", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(baseOrder as any);

    const updatedDate = new Date("2026-09-14T12:00:00Z");
    const updatedOrder = {
      ...baseOrder,
      status: "SHIPPED",
      updatedAt: updatedDate,
    };
    vi.mocked(prisma.order.update).mockResolvedValue(updatedOrder as any);

    const req = new NextRequest("http://localhost:3000/api/admin/orders/ord_100/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "SHIPPED" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "ord_100" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("SHIPPED");
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ord_100" },
        data: expect.objectContaining({
          status: "SHIPPED",
        }),
      })
    );
  });

  it("updates order status from SHIPPED to DELIVERED successfully", async () => {
    const shippedOrder = { ...baseOrder, status: "SHIPPED" as const };
    vi.mocked(prisma.order.findUnique).mockResolvedValue(shippedOrder as any);

    const deliveredOrder = { ...shippedOrder, status: "DELIVERED" as const };
    vi.mocked(prisma.order.update).mockResolvedValue(deliveredOrder as any);

    const req = new NextRequest("http://localhost:3000/api/admin/orders/ord_100/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "DELIVERED" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "ord_100" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("DELIVERED");
  });

  it("cancelling a PAID order marks paymentStatus as REFUNDED", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(baseOrder as any);

    const cancelledOrder = {
      ...baseOrder,
      status: "CANCELLED" as const,
      paymentStatus: "REFUNDED" as const,
    };
    vi.mocked(prisma.order.update).mockResolvedValue(cancelledOrder as any);

    const req = new NextRequest("http://localhost:3000/api/admin/orders/ord_100/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "CANCELLED" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "ord_100" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("CANCELLED");
    expect(body.data.paymentStatus).toBe("REFUNDED");
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ord_100" },
        data: expect.objectContaining({
          status: "CANCELLED",
          paymentStatus: "REFUNDED",
        }),
      })
    );
  });

  it("rejects invalid status transition from CANCELLED to DELIVERED with 400 INVALID_STATUS_TRANSITION", async () => {
    const cancelledOrder = { ...baseOrder, status: "CANCELLED" as const };
    vi.mocked(prisma.order.findUnique).mockResolvedValue(cancelledOrder as any);

    const req = new NextRequest("http://localhost:3000/api/admin/orders/ord_100/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "DELIVERED" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "ord_100" }) });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_STATUS_TRANSITION");
    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  it("rejects invalid status transition from DELIVERED to PROCESSING with 400 INVALID_STATUS_TRANSITION", async () => {
    const deliveredOrder = { ...baseOrder, status: "DELIVERED" as const };
    vi.mocked(prisma.order.findUnique).mockResolvedValue(deliveredOrder as any);

    const req = new NextRequest("http://localhost:3000/api/admin/orders/ord_100/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "PROCESSING" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "ord_100" }) });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_STATUS_TRANSITION");
    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  it("rejects transitioning to identical status with 400 INVALID_STATUS_TRANSITION", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(baseOrder as any);

    const req = new NextRequest("http://localhost:3000/api/admin/orders/ord_100/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "PROCESSING" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "ord_100" }) });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_STATUS_TRANSITION");
    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  it("returns 404 NOT_FOUND when updating status for nonexistent order ID", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/admin/orders/nonexistent_id/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "SHIPPED" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "nonexistent_id" }) });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("NOT_FOUND");
    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  it("returns 400 VALIDATION_ERROR when status is missing or invalid enum", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/orders/ord_100/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "INVALID_STATUS" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "ord_100" }) });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 VALIDATION_ERROR when request body is malformed JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/orders/ord_100/status", {
      method: "PATCH",
      body: "not json",
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "ord_100" }) });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});
