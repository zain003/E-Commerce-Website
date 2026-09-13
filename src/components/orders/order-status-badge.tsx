import * as React from "react";
import { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Truck, CreditCard, XCircle } from "lucide-react";

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = React.useMemo(() => {
    switch (status) {
      case "DELIVERED":
        return {
          label: "Delivered",
          icon: CheckCircle2,
          styles:
            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
        };
      case "SHIPPED":
        return {
          label: "Shipped",
          icon: Truck,
          styles:
            "border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
        };
      case "PROCESSING":
        return {
          label: "Processing",
          icon: Clock,
          styles:
            "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
        };
      case "PENDING_PAYMENT":
        return {
          label: "Pending Payment",
          icon: CreditCard,
          styles:
            "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          icon: XCircle,
          styles:
            "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
        };
      default:
        return {
          label: status,
          icon: Clock,
          styles: "border-border bg-muted text-muted-foreground",
        };
    }
  }, [status]);

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        config.styles,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </div>
  );
}
