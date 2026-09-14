"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MetricsCards } from "@/components/admin/metrics-cards";
import { OrderTable } from "@/components/admin/order-table";
import { OrderDetailsDrawer } from "@/components/admin/order-details-drawer";
import type { AdminOrder, AdminOrderMetrics, OrderStatus } from "@/types";

export interface AdminOrdersManagerProps {
  initialOrders: AdminOrder[];
  metrics: AdminOrderMetrics;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  initialStatus?: OrderStatus | "ALL";
}

export function AdminOrdersManager({
  initialOrders,
  metrics: initialMetrics,
  total,
  page,
  limit,
  totalPages,
  initialStatus = "ALL",
}: AdminOrdersManagerProps) {
  const router = useRouter();

  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [metrics, setMetrics] = useState<AdminOrderMetrics>(initialMetrics);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">(
    initialStatus
  );
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync state when props change
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    setMetrics(initialMetrics);
  }, [initialMetrics]);

  useEffect(() => {
    setSelectedStatus(initialStatus);
  }, [initialStatus]);

  const handleSelectOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    // 1. Update orders array locally
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated: AdminOrder = {
            ...ord,
            status: newStatus,
            // If cancelling a paid order, paymentStatus is refunded
            paymentStatus:
              newStatus === "CANCELLED" && ord.paymentStatus === "PAID"
                ? "REFUNDED"
                : ord.paymentStatus,
          };
          return updated;
        }
        return ord;
      })
    );

    // 2. Update currently open drawer order if open
    setSelectedOrder((prev) => {
      if (prev && prev.id === orderId) {
        return {
          ...prev,
          status: newStatus,
          paymentStatus:
            newStatus === "CANCELLED" && prev.paymentStatus === "PAID"
              ? "REFUNDED"
              : prev.paymentStatus,
        };
      }
      return prev;
    });

    // 3. Refresh server data in background to sync metrics and counts
    router.refresh();
  };

  const handleStatusFilterChange = (newStatus: OrderStatus | "ALL") => {
    setSelectedStatus(newStatus);
    const query = new URLSearchParams();
    if (newStatus !== "ALL") {
      query.set("status", newStatus);
    }
    query.set("page", "1");
    query.set("limit", String(limit));
    router.push(`/admin/orders?${query.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const query = new URLSearchParams();
    if (selectedStatus !== "ALL") {
      query.set("status", selectedStatus);
    }
    query.set("page", String(newPage));
    query.set("limit", String(limit));
    router.push(`/admin/orders?${query.toString()}`);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Orders & Fulfillment
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review customer orders, track package fulfillment, and manage live order statuses.
        </p>
      </div>

      {/* KPI Overview Cards */}
      <MetricsCards metrics={metrics} />

      {/* Filterable Orders Table */}
      <div className="space-y-3">
        <OrderTable
          orders={orders}
          selectedStatus={selectedStatus}
          onStatusFilterChange={handleStatusFilterChange}
          onSelectOrder={handleSelectOrder}
          onStatusChange={handleStatusChange}
          total={total}
          page={page}
          limit={limit}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Order Details Inspection Drawer */}
      <OrderDetailsDrawer
        isOpen={isDrawerOpen}
        order={selectedOrder}
        onClose={handleCloseDrawer}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
