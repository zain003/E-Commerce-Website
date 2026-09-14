"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { HydratedOrder } from "@/types";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderStatusTracker } from "./order-status-tracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import {
  CheckCircle2,
  Printer,
  ShoppingBag,
  MapPin,
  CreditCard,
  Package,
} from "lucide-react";

export interface OrderReceiptProps {
  order: HydratedOrder;
  className?: string;
}

function formatMoney(amount: unknown): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0;
  return `$${num.toFixed(2)}`;
}

export function OrderReceipt({ order, className }: OrderReceiptProps) {
  // Clear client cart once upon rendering confirmed receipt
  React.useEffect(() => {
    try {
      useCartStore.getState().clearCart();
    } catch {
      // Ignore if store is uninitialized
    }
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formattedDate = React.useMemo(() => {
    try {
      return new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  }, [order.createdAt]);

  const shipping = (order.shippingAddress || {}) as {
    fullName?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };

  const shippingFeeNum = Number(order.shippingFee) || 0;
  const discountTotalNum = Number(order.discountTotal) || 0;

  return (
    <div className={`space-y-8 print:space-y-4 max-w-4xl mx-auto ${className || ""}`}>
      {/* Celebration Header */}
      <div className="text-center space-y-3 py-4 print:py-0">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 print:hidden shadow-xs">
          <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Thank you for your order!
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We&apos;ve received your order and are preparing it for delivery. A confirmation receipt is itemized below.
        </p>
      </div>

      {/* Main Receipt Card */}
      <Card className="border-border shadow-sm print:border-none print:shadow-none overflow-hidden">
        {/* Receipt Meta Bar */}
        <CardHeader className="bg-muted/40 p-5 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Order Reference
            </span>
            <p className="font-mono text-lg font-bold text-foreground mt-0.5 select-all">
              {order.orderNumber}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Placed on {formattedDate}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <OrderStatusBadge status={order.status} />
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-semibold text-foreground">
              <CreditCard className="h-3 w-3 text-muted-foreground" />
              {order.paymentStatus === "PAID" ? "Paid" : order.paymentStatus}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-8">
          {/* Status Progress Stepper */}
          <div className="pt-2 pb-4 border-b border-border print:hidden">
            <OrderStatusTracker status={order.status} />
          </div>

          {/* Delivery & Billing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Shipping Destination</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-0.5 pl-6">
                <p className="font-medium text-foreground">{shipping.fullName || "Customer"}</p>
                <p>{shipping.street}</p>
                <p>
                  {shipping.city ? `${shipping.city}, ` : ""}
                  {shipping.state} {shipping.postalCode}
                </p>
                <p>{shipping.country || "USA"}</p>
                {shipping.phone && <p className="pt-1 text-xs">Tel: {shipping.phone}</p>}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Package className="h-4 w-4 text-primary" />
                <span>Order Summary</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-0.5 pl-6">
                <p>Items Count: {order.items.reduce((acc, it) => acc + it.quantity, 0)}</p>
                <p>Payment: {order.paymentStatus === "PAID" ? "Credit / Debit Card (Stripe)" : "Pending"}</p>
                <p className="text-xs text-muted-foreground pt-1">
                  Status: {order.status}
                </p>
              </div>
            </div>
          </div>

          {/* Itemized Table / List */}
          <div className="space-y-3">
            <h2 className="font-semibold text-sm text-foreground">Purchased Items</h2>
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {order.items.map((item) => {
                const variant = item.variant;
                const product = variant?.product;
                const unitPrice = Number(item.unitPrice) || 0;
                const lineTotal = unitPrice * item.quantity;
                const primaryImage = product?.images?.[0];
                const productUrl = product?.slug ? `/products/${product.slug}` : null;

                return (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {productUrl ? (
                        <Link
                          href={productUrl}
                          className="relative h-14 w-14 rounded-lg border border-border bg-muted overflow-hidden shrink-0 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {primaryImage ? (
                            <Image
                              src={primaryImage}
                              alt={product?.name || "Product item"}
                              fill
                              sizes="56px"
                              className="object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <div
                              data-testid="order-item-placeholder"
                              className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground"
                            >
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </Link>
                      ) : (
                        <div className="relative h-14 w-14 rounded-lg border border-border bg-muted overflow-hidden shrink-0">
                          {primaryImage ? (
                            <Image
                              src={primaryImage}
                              alt={product?.name || "Product item"}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div
                              data-testid="order-item-placeholder"
                              className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground"
                            >
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="min-w-0">
                        {productUrl ? (
                          <Link
                            href={productUrl}
                            className="font-medium text-sm text-foreground truncate block hover:text-primary hover:underline transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                          >
                            {product?.name || "Product"}
                          </Link>
                        ) : (
                          <p className="font-medium text-sm text-foreground truncate">
                            {product?.name || "Product"}
                          </p>
                        )}
                        {variant?.name && (
                          <p className="text-xs text-muted-foreground">
                            {variant.name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Qty: {item.quantity} × {formatMoney(unitPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0 font-medium text-sm text-foreground">
                      {formatMoney(lineTotal)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Totals Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-72 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{shippingFeeNum === 0 ? "Free" : formatMoney(order.shippingFee)}</span>
              </div>
              {discountTotalNum > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount</span>
                  <span>-{formatMoney(order.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-foreground pt-2 border-t border-border">
                <span>Total Paid</span>
                <span className="text-primary">{formatMoney(order.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action CTA Bar (hidden on print) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 print:hidden">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="w-full sm:w-auto gap-2"
        >
          <Printer className="h-4 w-4" />
          <span>Print Receipt</span>
        </Button>

        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 text-sm gap-2 w-full sm:w-auto shadow-xs cursor-pointer select-none"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
