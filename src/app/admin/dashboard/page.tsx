import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminMetrics, getAdminOrders } from "@/lib/services/admin-orders";
import { MetricsCards } from "@/components/admin/metrics-cards";
import { AdminNav } from "@/components/admin/admin-nav";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, toNumericPrice } from "@/components/product/price-tag";
import { serializeData } from "@/lib/utils";
import {
  Package,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — Admin Portal",
  description: "Store overview, sales metrics, and recent order fulfillment.",
};

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const [metricsResult, recentOrdersResult] = await Promise.all([
    getAdminMetrics(),
    getAdminOrders("ALL", 1, 5),
  ]);

  const metricsData =
    metricsResult.success && metricsResult.data
      ? serializeData(metricsResult.data)
      : { totalRevenue: 0, totalOrders: 0, processingOrders: 0, deliveredOrders: 0 };

  const recentOrdersData =
    recentOrdersResult.success && recentOrdersResult.data
      ? serializeData(recentOrdersResult.data)
      : { items: [], total: 0, page: 1, limit: 5, totalPages: 1 };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <AdminNav />

      {/* Hero Welcome & Quick Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> Live
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Store performance metrics, sales volume, and real-time fulfillment tracker.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/products">
            <Button
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="h-4 w-4" />
              <span>Products</span>
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button
              size="sm"
              className="inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Orders</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Overview Cards */}
      <MetricsCards metrics={metricsData} />

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Recent Orders
            </h2>
            <p className="text-xs text-muted-foreground">
              Latest customer purchases awaiting or completing fulfillment.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>View all orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          {recentOrdersData.items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No recent orders recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th scope="col" className="py-3 px-4">
                      Order
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Customer
                    </th>
                    <th scope="col" className="py-3 px-4 text-center">
                      Items
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Total
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Payment
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Status
                    </th>
                    <th scope="col" className="py-3 px-4 text-right">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrdersData.items.map((order) => {
                    const customerName =
                      order.user?.name ||
                      (order.shippingAddress as any)?.name ||
                      "Guest Customer";
                    const totalItems = order.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );
                    const total = toNumericPrice(order.total);
                    const formattedDate = new Date(
                      order.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-medium text-foreground">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-foreground font-medium">
                          {customerName}
                        </td>
                        <td className="py-3 px-4 text-center text-muted-foreground">
                          {totalItems}
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {formatCurrency(total)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              order.paymentStatus === "PAID"
                                ? "success"
                                : order.paymentStatus === "REFUNDED"
                                ? "secondary"
                                : order.paymentStatus === "FAILED"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-[11px]"
                          >
                            {order.paymentStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-muted-foreground whitespace-nowrap">
                          {formattedDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
