"use client";

import React, { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export interface OrderStatusDropdownProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
  disabled?: boolean;
  className?: string;
}

export function OrderStatusDropdown({
  orderId,
  currentStatus,
  onStatusChange,
  disabled = false,
  className,
}: OrderStatusDropdownProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state if prop changes
  React.useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  const isTerminal = allowedTransitions.length === 0;

  // Options to show in the dropdown: current status + allowed next transitions
  const options = Array.from(new Set([currentStatus, ...allowedTransitions]));

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    if (newStatus === status) return;

    setIsUpdating(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.error?.message || "Failed to update order status. Please try again."
        );
      }

      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(orderId, newStatus);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Network error updating order status");
      // Revert select back to current status
      setStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={cn("relative inline-flex flex-col items-start gap-1", className)}>
      <div className="relative inline-flex items-center">
        <label htmlFor={`status-select-${orderId}`} className="sr-only">
          Update order status
        </label>
        <select
          id={`status-select-${orderId}`}
          aria-label="Update order status"
          value={status}
          disabled={disabled || isTerminal || isUpdating}
          onChange={handleChange}
          className={cn(
            "h-8 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70",
            status === "DELIVERED" && "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
            status === "PROCESSING" && "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
            status === "SHIPPED" && "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
            status === "CANCELLED" && "text-red-700 bg-red-50 border-red-200 dark:bg-red-950 dark:text-red-300",
            status === "PENDING_PAYMENT" && "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
          )}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {STATUS_LABELS[opt] || opt}
            </option>
          ))}
        </select>

        {isUpdating && (
          <div className="absolute right-2 top-2 flex items-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-1 text-[11px] text-destructive mt-0.5"
        >
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
