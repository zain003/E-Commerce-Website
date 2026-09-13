"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HydratedOrder } from "@/types";
import { OrderHistoryCard } from "./order-history-card";
import { Button } from "@/components/ui/button";
import { PackageOpen, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

export interface OrderHistoryListProps {
  orders: HydratedOrder[];
  total: number;
  page: number;
  totalPages: number;
  className?: string;
}

export function OrderHistoryList({
  orders,
  total: _total,
  page,
  totalPages,
  className,
}: OrderHistoryListProps) {
  const router = useRouter();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(`/account/orders?page=${newPage}`);
  };

  if (!orders || orders.length === 0) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-border p-8 sm:p-12 text-center bg-card/50 space-y-4 max-w-xl mx-auto ${
          className || ""
        }`}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <PackageOpen className="h-8 w-8 text-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">No orders yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You haven&apos;t placed any orders yet. Discover our catalog and find items you love.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 py-2 text-sm gap-2 shadow-xs cursor-pointer select-none"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Start Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ""}`}>
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderHistoryCard key={order.id} order={order} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="gap-1.5"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
