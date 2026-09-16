import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminMetrics, getAdminOrders } from "@/lib/services/admin-orders";
import { MetricsCards } from "@/components/admin/metrics-cards";
import { AdminRevenueChart } from "@/components/admin/admin-revenue-chart";
import { AdminOperationalAlerts } from "@/components/admin/admin-operational-alerts";
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
  Inbox,
} from "lucide-react";

export const instant = false;

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
    <div className="space-y-8">
      {/* Hero Welcome & Quick Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-serif">
              Executive Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time sales velocity, revenue trajectories, and fulfillment operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/products">
            <Button
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl"
            >
              <Package className="h-4 w-4" />
              <span>Catalog & Stock</span>
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button
              size="sm"
              className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Fulfillment Queue</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Overview Cards with Comparative Deltas */}
      <MetricsCards metrics={metricsData} />

      {/* Visual Analytics & Operational Radar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminRevenueChart className="lg:col-span-2" />
        <AdminOperationalAlerts
          processingOrdersCount={metricsData.processingOrders}
          className="lg:col-span-1"
        />
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground font-serif">
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

        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          {recentOrdersData.items.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No recent orders recorded yet
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Customer purchases will appear in real-time as checkouts are completed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
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
                        <td className="py-3 px-4 text-center text-muted-foreground font-mono">
                          {totalItems}
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground font-mono">
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
                            className="text-[10px] font-semibold"
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
