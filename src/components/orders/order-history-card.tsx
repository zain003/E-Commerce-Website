"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { HydratedOrder } from "@/types";
import { OrderStatusBadge } from "./order-status-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MapPin, Receipt, ExternalLink, Package, Star } from "lucide-react";

export interface OrderHistoryCardProps {
  order: HydratedOrder;
  className?: string;
}

function formatMoney(amount: unknown): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0;
  return `$${num.toFixed(2)}`;
}

export function OrderHistoryCard({ order, className }: OrderHistoryCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const formattedDate = React.useMemo(() => {
    try {
      return new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  }, [order.createdAt]);

  const totalItemsCount = React.useMemo(() => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [order.items]);

  const shipping = (order.shippingAddress || {}) as {
    fullName?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };

  return (
    <Card className={`border-border shadow-xs overflow-hidden ${className || ""}`}>
      <CardHeader className="p-4 sm:p-5 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div>
            <span className="text-xs text-muted-foreground">Order #</span>
            <p className="font-mono text-sm sm:text-base font-bold text-foreground">
              {order.orderNumber}
            </p>
          </div>
          <div className="hidden sm:block text-muted-foreground/40">|</div>
          <div>
            <span className="text-xs text-muted-foreground">Placed</span>
            <p className="text-xs sm:text-sm font-medium text-foreground">
              {formattedDate}
            </p>
          </div>
          <div className="hidden sm:block text-muted-foreground/40">|</div>
          <div>
            <span className="text-xs text-muted-foreground">Total</span>
            <p className="text-xs sm:text-sm font-bold text-foreground">
              {formatMoney(order.total)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <OrderStatusBadge status={order.status} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="gap-1 text-xs sm:text-sm"
          >
            <span>{isExpanded ? "Hide Details" : "View Details"}</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Compact Item Thumbnails Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
            {order.items.slice(0, 4).map((item) => {
              const product = item.variant?.product;
              const primaryImage = product?.images?.[0];
              const productUrl = product?.slug ? `/products/${product.slug}` : null;

              const thumbnailContent = (
                <>
                  {primaryImage ? (
                    <Image
                      src={primaryImage}
                      alt={product?.name || "Product preview"}
                      fill
                      sizes="48px"
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      data-testid="order-item-placeholder-compact"
                      className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground"
                    >
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                  {item.quantity > 1 && (
                    <span className="absolute bottom-0 right-0 bg-foreground/80 text-background text-[10px] font-bold px-1 rounded-tl">
                      ×{item.quantity}
                    </span>
                  )}
                </>
              );

              return productUrl ? (
                <Link
                  key={item.id}
                  href={productUrl}
                  className="relative h-12 w-12 rounded-md border border-border bg-muted overflow-hidden shrink-0 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                  title={`${product?.name || "Product"} (${item.quantity}x)`}
                >
                  {thumbnailContent}
                </Link>
              ) : (
                <div
                  key={item.id}
                  className="relative h-12 w-12 rounded-md border border-border bg-muted overflow-hidden shrink-0"
                  title={`${product?.name || "Product"} (${item.quantity}x)`}
                >
                  {thumbnailContent}
                </div>
              );
            })}
            {order.items.length > 4 && (
              <div className="h-12 w-12 rounded-md border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground font-medium shrink-0">
                +{order.items.length - 4}
              </div>
            )}
          </div>

          <div className="text-right shrink-0 text-xs text-muted-foreground">
            <span>{totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}</span>
          </div>
        </div>

        {/* Expandable Section */}
        {isExpanded && (
          <div className="pt-4 border-t border-border space-y-4 animate-in fade-in-50 duration-200">
            {/* Line Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Item Breakdown
              </h4>
              <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                {order.items.map((item) => {
                  const product = item.variant?.product;
                  const unitPrice = Number(item.unitPrice) || 0;
                  const lineTotal = unitPrice * item.quantity;
                  const primaryImage = product?.images?.[0];
                  const productUrl = product?.slug ? `/products/${product.slug}` : null;

                  return (
                    <div
                      key={item.id}
                      className="p-3 flex items-center justify-between gap-3 text-sm bg-card"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {productUrl ? (
                          <Link
                            href={productUrl}
                            className="relative h-10 w-10 rounded-md border border-border bg-muted overflow-hidden shrink-0 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            {primaryImage ? (
                              <Image
                                src={primaryImage}
                                alt={product?.name || "Item"}
                                fill
                                sizes="40px"
                                className="object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                            ) : (
                              <div
                                data-testid="order-item-placeholder-breakdown"
                                className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground"
                              >
                                <Package className="h-4 w-4" />
                              </div>
                            )}
                          </Link>
                        ) : (
                          <div className="relative h-10 w-10 rounded-md border border-border bg-muted overflow-hidden shrink-0">
                            {primaryImage ? (
                              <Image
                                src={primaryImage}
                                alt={product?.name || "Item"}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div
                                data-testid="order-item-placeholder-breakdown"
                                className="flex h-full w-full items-center justify-center bg-muted/40 text-muted-foreground"
                              >
                                <Package className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="min-w-0">
                          {productUrl ? (
                            <Link
                              href={productUrl}
                              className="font-medium text-foreground truncate text-xs sm:text-sm block hover:text-primary hover:underline transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xs"
                            >
                              {product?.name || "Product"}
                            </Link>
                          ) : (
                            <p className="font-medium text-foreground truncate text-xs sm:text-sm">
                              {product?.name || "Product"}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {item.variant?.name ? `${item.variant.name} • ` : ""}
                            Qty: {item.quantity} × {formatMoney(unitPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="font-medium text-xs sm:text-sm text-foreground">
                          {formatMoney(lineTotal)}
                        </span>
                        {order.status === "DELIVERED" && productUrl && (
                          <Link
                            href={`${productUrl}#reviews`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline hover:text-primary/80 transition-colors py-0.5 px-2 rounded-md bg-primary/10 hover:bg-primary/15 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span>Write Review</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Destination & Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Shipping Destination</span>
                </div>
                <div className="text-muted-foreground pl-5 space-y-0.5">
                  <p className="font-medium text-foreground">{shipping.fullName || "Customer"}</p>
                  <p>{shipping.street}</p>
                  <p>
                    {shipping.city ? `${shipping.city}, ` : ""}
                    {shipping.state} {shipping.postalCode}
                  </p>
                  <p>{shipping.country || "USA"}</p>
                </div>
              </div>

              <div className="flex flex-col justify-end gap-2">
                <Link
                  href={`/order-confirmation?orderNumber=${encodeURIComponent(order.orderNumber)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background hover:bg-muted text-foreground text-xs sm:text-sm font-medium h-9 px-3 transition-colors"
                >
                  <Receipt className="h-4 w-4" />
                  <span>View Printable Receipt</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
