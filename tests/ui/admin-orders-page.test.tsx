import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminOrdersPage from "@/app/admin/orders/page";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getAdminOrders, getAdminMetrics } from "@/lib/services/admin-orders";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/orders",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/services/admin-orders", () => ({
  getAdminOrders: vi.fn(),
  getAdminMetrics: vi.fn(),
}));

describe("AdminOrdersPage (Server Component)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated user to /login?callbackUrl=/admin/orders", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    try {
      await AdminOrdersPage({
        searchParams: Promise.resolve({}),
      });
    } catch {
      // redirect throws in Next.js
    }

    expect(redirect).toHaveBeenCalledWith("/login?callbackUrl=/admin/orders");
  });

  it("redirects non-admin authenticated user to /unauthorized", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user_customer", email: "customer@example.com", role: "CUSTOMER" },
    });

    try {
      await AdminOrdersPage({
        searchParams: Promise.resolve({}),
      });
    } catch {
      // redirect throws in Next.js
    }

    expect(redirect).toHaveBeenCalledWith("/unauthorized");
  });

  it("renders orders page with metrics and orders table when authenticated as ADMIN", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user_admin", email: "admin@example.com", role: "ADMIN" },
    });

    vi.mocked(getAdminMetrics).mockResolvedValueOnce({
      success: true,
      data: {
        totalRevenue: 5000,
        totalOrders: 20,
        processingOrders: 4,
        deliveredOrders: 15,
      },
      timestamp: new Date().toISOString(),
    });

    vi.mocked(getAdminOrders).mockResolvedValueOnce({
      success: true,
      data: {
        items: [
          {
            id: "ord_server_1",
            orderNumber: "ORD-9999-001",
            userId: "usr_1",
            user: { id: "usr_1", name: "John Doe", email: "john@example.com" },
            guestEmail: null,
            status: "PROCESSING",
            paymentStatus: "PAID",
            stripePaymentId: "pi_111",
            subtotal: new Decimal("100.00"),
            discountTotal: new Decimal("0.00"),
            shippingFee: new Decimal("5.00"),
            total: new Decimal("105.00"),
            shippingAddress: {
              name: "John Doe",
              street: "123 Main St",
              city: "Austin",
              state: "TX",
              postalCode: "78701",
              country: "US",
            },
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
      timestamp: new Date().toISOString(),
    });

    const pageComponent = await AdminOrdersPage({
      searchParams: Promise.resolve({}),
    });

    render(pageComponent);

    expect(screen.getByRole("heading", { name: /orders/i })).toBeTruthy();
    expect(screen.getByText("Total Revenue")).toBeTruthy();
    expect(screen.getByText("ORD-9999-001")).toBeTruthy();
    expect(screen.getByText("John Doe")).toBeTruthy();
  });
});
