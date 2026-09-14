import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminDashboardPage from "@/app/admin/dashboard/page";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getAdminMetrics, getAdminOrders } from "@/lib/services/admin-orders";
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
  usePathname: () => "/admin/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/services/admin-orders", () => ({
  getAdminMetrics: vi.fn(),
  getAdminOrders: vi.fn(),
}));

describe("AdminDashboardPage (Server Component)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated user to /login?callbackUrl=/admin/dashboard", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    try {
      await AdminDashboardPage();
    } catch {
      // redirect throws in Next.js
    }

    expect(redirect).toHaveBeenCalledWith("/login?callbackUrl=/admin/dashboard");
  });

  it("redirects non-admin authenticated user to /unauthorized", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user_customer", email: "customer@example.com", role: "CUSTOMER" },
    });

    try {
      await AdminDashboardPage();
    } catch {
      // redirect throws in Next.js
    }

    expect(redirect).toHaveBeenCalledWith("/unauthorized");
  });

  it("renders admin dashboard with KPI metric cards and quick links when authenticated as ADMIN", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user_admin", email: "admin@example.com", role: "ADMIN" },
    });

    vi.mocked(getAdminMetrics).mockResolvedValueOnce({
      success: true,
      data: {
        totalRevenue: 25400.5,
        totalOrders: 310,
        processingOrders: 14,
        deliveredOrders: 280,
      },
      timestamp: new Date().toISOString(),
    });

    vi.mocked(getAdminOrders).mockResolvedValueOnce({
      success: true,
      data: {
        items: [
          {
            id: "ord_dash_1",
            orderNumber: "ORD-DASH-001",
            userId: "usr_1",
            user: { id: "usr_1", name: "Jane Smith", email: "jane@example.com" },
            guestEmail: null,
            status: "PROCESSING",
            paymentStatus: "PAID",
            stripePaymentId: "pi_dash_1",
            subtotal: new Decimal("150.00"),
            discountTotal: new Decimal("0.00"),
            shippingFee: new Decimal("0.00"),
            total: new Decimal("150.00"),
            shippingAddress: {
              name: "Jane Smith",
              street: "123 Market St",
              city: "Seattle",
              state: "WA",
              postalCode: "98101",
              country: "US",
            },
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
        ],
        total: 1,
        page: 1,
        limit: 5,
        totalPages: 1,
      },
      timestamp: new Date().toISOString(),
    });

    const pageComponent = await AdminDashboardPage();
    render(pageComponent);

    expect(screen.getByRole("heading", { name: /dashboard/i })).toBeTruthy();
    expect(screen.getByText("Total Revenue")).toBeTruthy();
    expect(screen.getByText("$25,400.50")).toBeTruthy();
    expect(screen.getByText("Recent Orders")).toBeTruthy();
    expect(screen.getByText("ORD-DASH-001")).toBeTruthy();
  });
});
