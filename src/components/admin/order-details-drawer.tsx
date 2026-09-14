"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import {
  X,
  User,
  MapPin,
  Package,
  CreditCard,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderStatusDropdown } from "@/components/admin/order-status-dropdown";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, toNumericPrice } from "@/components/product/price-tag";
import type { AdminOrder, OrderStatus } from "@/types";

export interface OrderDetailsDrawerProps {
  isOpen: boolean;
  order: AdminOrder | null;
  onClose: () => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderDetailsDrawer({
  isOpen,
  order,
  onClose,
  onStatusChange,
}: OrderDetailsDrawerProps) {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) {
    return null;
  }

  const shippingAddress = (order.shippingAddress || {}) as {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };

  const customerName =
    order.user?.name || shippingAddress.name || "Guest Customer";
  const customerEmail = order.user?.email || order.guestEmail || "No email";

  const subtotal = toNumericPrice(order.subtotal);
  const shippingFee = toNumericPrice(order.shippingFee);
  const discountTotal = toNumericPrice(order.discountTotal);
  const total = toNumericPrice(order.total);

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-details-title"
      className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-xs transition-opacity"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative z-50 flex h-full w-full max-w-xl flex-col bg-card border-l border-border shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div>
            <div className="flex items-center gap-2.5">
              <h2
                id="order-details-title"
                className="text-lg font-bold font-mono tracking-tight text-foreground"
              >
                {order.orderNumber}
              </h2>
              <OrderStatusBadge status={order.status} />
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
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Status Transition Action */}
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fulfillment Status
                </span>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  Transition this order to its next status
                </p>
              </div>
              <OrderStatusDropdown
                orderId={order.id}
                currentStatus={order.status}
                onStatusChange={onStatusChange}
              />
            </div>
          </div>

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Information */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <User className="h-4 w-4 text-primary" />
                <span>Customer</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-foreground">{customerName}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{customerEmail}</span>
                </div>
                {order.stripePaymentId && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <CreditCard className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-mono text-[11px] truncate">
                      {order.stripePaymentId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Destination */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Shipping Destination</span>
              </div>
              <div className="space-y-1 text-sm text-foreground">
                {shippingAddress.street ? (
                  <>
                    <p className="font-medium">{shippingAddress.name || customerName}</p>
                    <p className="text-xs text-muted-foreground">{shippingAddress.street}</p>
                    <p className="text-xs text-muted-foreground">
                      {shippingAddress.city}, {shippingAddress.state}{" "}
                      {shippingAddress.postalCode}
                    </p>
                    <p className="text-xs text-muted-foreground">{shippingAddress.country}</p>
                    {shippingAddress.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{shippingAddress.phone}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No shipping address provided.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Purchased Line Items */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Package className="h-4 w-4 text-primary" />
                <span>Purchased Items ({order.items.length})</span>
              </div>
            </div>

            <div className="divide-y divide-border">
              {order.items.map((item) => {
                const productName =
                  item.variant?.product?.name || "Product Item";
                const variantName = item.variant?.name || "Default";
                const sku = item.variant?.sku;
                const unitPrice = toNumericPrice(item.unitPrice);
                const lineTotal = unitPrice * item.quantity;
                const thumbnail = item.variant?.product?.images?.[0];

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-12 w-12 shrink-0 rounded-lg bg-muted border border-border overflow-hidden flex items-center justify-center">
                        {thumbnail ? (
                          <Image
                            src={thumbnail}
                            alt={productName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground/60" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {variantName} {sku && `• SKU: ${sku}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × {formatCurrency(unitPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-foreground shrink-0 text-right">
                      {formatCurrency(lineTotal)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Payment Summary
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Fee</span>
                <span>{formatCurrency(shippingFee)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount Total</span>
                  <span>-{formatCurrency(discountTotal)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between text-base font-bold text-foreground">
                <span>Grand Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
