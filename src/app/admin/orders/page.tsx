import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminOrders, getAdminMetrics } from "@/lib/services/admin-orders";
import { AdminOrdersManager } from "@/components/admin/admin-orders-manager";
import { AdminNav } from "@/components/admin/admin-nav";
import { serializeData } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export const metadata: Metadata = {
  title: "Orders — Admin Portal",
  description: "Manage customer orders, track fulfillment, and update statuses.",
};

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
    limit?: string;
  }>;
}

export const instant = false;

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/admin/orders");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const resolvedParams = await searchParams;
  const statusParam = resolvedParams.status as OrderStatus | "ALL" | undefined;
  const status: OrderStatus | "ALL" =
    statusParam &&
    [
      "ALL",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "PENDING_PAYMENT",
    ].includes(statusParam)
      ? statusParam
      : "ALL";

  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10) || 1);
  const limit = Math.max(1, parseInt(resolvedParams.limit || "10", 10) || 10);

  const [ordersResult, metricsResult] = await Promise.all([
    getAdminOrders(status, page, limit),
    getAdminMetrics(),
  ]);

  const ordersData =
    ordersResult.success && ordersResult.data
      ? serializeData(ordersResult.data)
      : { items: [], total: 0, page: 1, limit, totalPages: 1 };

  const metricsData =
    metricsResult.success && metricsResult.data
      ? serializeData(metricsResult.data)
      : { totalRevenue: 0, totalOrders: 0, processingOrders: 0, deliveredOrders: 0 };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <AdminNav />
      <AdminOrdersManager
        initialOrders={ordersData.items}
        metrics={metricsData}
        total={ordersData.total}
        page={ordersData.page}
        limit={ordersData.limit}
        totalPages={ordersData.totalPages}
        initialStatus={status}
      />
    </div>
  );
}
