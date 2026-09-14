import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { GET as getOrders } from "@/app/api/admin/orders/route";
import { PATCH as updateOrderStatus } from "@/app/api/admin/orders/[id]/status/route";
import { GET as getMetrics } from "@/app/api/admin/metrics/route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/services/admin-orders", () => ({
  getAdminOrders: vi.fn().mockResolvedValue({
    success: true,
    data: { items: [], total: 0, page: 1, limit: 10, totalPages: 0 },
    timestamp: new Date().toISOString(),
  }),
  updateOrderStatus: vi.fn().mockResolvedValue({
    success: true,
    data: { id: "ord_1", status: "SHIPPED" },
    timestamp: new Date().toISOString(),
  }),
  getAdminMetrics: vi.fn().mockResolvedValue({
    success: true,
    data: { totalRevenue: 100, totalOrders: 2, processingOrders: 1, deliveredOrders: 1 },
    timestamp: new Date().toISOString(),
  }),
}));

describe("Admin Orders & Metrics Auth Guards (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Unauthenticated Access (No Session)", () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(null);
    });

    it("GET /api/admin/orders returns 401 UNAUTHORIZED", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/orders");
      const res = await getOrders(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("PATCH /api/admin/orders/:id/status returns 401 UNAUTHORIZED", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/orders/ord_123/status", {
        method: "PATCH",
        body: JSON.stringify({ status: "SHIPPED" }),
      });
      const res = await updateOrderStatus(req, {
        params: Promise.resolve({ id: "ord_123" }),
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("GET /api/admin/metrics returns 401 UNAUTHORIZED", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/metrics");
      const res = await getMetrics(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("Non-Admin Customer Session (role: CUSTOMER)", () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: "usr_customer",
          email: "customer@example.com",
          name: "Customer User",
          role: "CUSTOMER",
        },
        expires: "9999-12-31",
      });
    });

    it("GET /api/admin/orders returns 403 FORBIDDEN", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/orders");
      const res = await getOrders(req);

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("FORBIDDEN");
    });

    it("PATCH /api/admin/orders/:id/status returns 403 FORBIDDEN", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/orders/ord_123/status", {
        method: "PATCH",
        body: JSON.stringify({ status: "SHIPPED" }),
      });
      const res = await updateOrderStatus(req, {
        params: Promise.resolve({ id: "ord_123" }),
      });

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("FORBIDDEN");
    });

    it("GET /api/admin/metrics returns 403 FORBIDDEN", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/metrics");
      const res = await getMetrics(req);

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("FORBIDDEN");
    });
  });
});
