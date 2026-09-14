"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Inbox,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderStatusDropdown } from "@/components/admin/order-status-dropdown";
import { formatCurrency, toNumericPrice } from "@/components/product/price-tag";
import { cn } from "@/lib/utils";
import type { AdminOrder, OrderStatus } from "@/types";

export interface OrderTableProps {
  orders: AdminOrder[];
  selectedStatus?: OrderStatus | "ALL";
  onStatusFilterChange?: (status: OrderStatus | "ALL") => void;
  onSelectOrder: (order: AdminOrder) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  onPageChange?: (newPage: number) => void;
}

const STATUS_TABS: { label: string; value: OrderStatus | "ALL"; icon: React.ElementType }[] = [
  { label: "All Orders", value: "ALL", icon: Layers },
  { label: "Processing", value: "PROCESSING", icon: Clock },
  { label: "Shipped", value: "SHIPPED", icon: Truck },
  { label: "Delivered", value: "DELIVERED", icon: CheckCircle2 },
  { label: "Cancelled", value: "CANCELLED", icon: XCircle },
  { label: "Pending Payment", value: "PENDING_PAYMENT", icon: CreditCard },
];

export function OrderTable({
  orders,
  selectedStatus = "ALL",
  onStatusFilterChange,
  onSelectOrder,
  onStatusChange,
  total = 0,
  page = 1,
  totalPages = 1,
  onPageChange,
}: OrderTableProps) {
  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-sm">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedStatus === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatusFilterChange?.(tab.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition-all cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Orders Data Table Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No orders found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              {selectedStatus === "ALL"
                ? "There are currently no customer orders in the system."
                : `No orders matching status '${selectedStatus}'.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="py-3.5 px-4">
                    Order
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Customer
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-center">
                    Items
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Total
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Payment
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Status
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Placed Date
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Quick Status
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const customerName =
                    order.user?.name ||
                    (order.shippingAddress as any)?.name ||
                    "Guest Customer";
                  const customerEmail =
                    order.user?.email || order.guestEmail || "No email";
                  const totalItems = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );
                  const total = toNumericPrice(order.total);
                  const formattedDate = new Date(order.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  );

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="group cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      {/* Order Number */}
                      <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                        {order.orderNumber}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">
                          {customerName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {customerEmail}
                        </div>
                      </td>

                      {/* Items Count */}
                      <td className="py-3.5 px-4 text-center text-muted-foreground font-medium">
                        {totalItems}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {formatCurrency(total)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4">
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

                      {/* Order Status Badge */}
                      <td className="py-3.5 px-4">
                        <OrderStatusBadge status={order.status} />
                      </td>

                      {/* Placed Date */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Quick Status Dropdown Selector */}
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <OrderStatusDropdown
                          orderId={order.id}
                          currentStatus={order.status}
                          onStatusChange={onStatusChange}
                        />
                      </td>

                      {/* View Details Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(order);
                          }}
                          aria-label={`View details for ${order.orderNumber}`}
                          className="h-8 px-2.5 text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Details</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/20">
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{orders.length}</span>{" "}
              of <span className="font-semibold text-foreground">{total}</span> orders
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Previous page"
                  disabled={page <= 1}
                  onClick={() => onPageChange?.(page - 1)}
                  className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Next page"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange?.(page + 1)}
                  className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
