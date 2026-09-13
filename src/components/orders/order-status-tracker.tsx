import * as React from "react";
import { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Check, Clock, PackageCheck, Truck, AlertCircle } from "lucide-react";

export interface OrderStatusTrackerProps {
  status: OrderStatus;
  className?: string;
}

interface Step {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: Step[] = [
  {
    id: "confirmed",
    name: "Confirmed",
    description: "Order placed & verified",
    icon: Check,
  },
  {
    id: "processing",
    name: "Processing",
    description: "Preparing for shipment",
    icon: Clock,
  },
  {
    id: "shipped",
    name: "Shipped",
    description: "In transit with courier",
    icon: Truck,
  },
  {
    id: "delivered",
    name: "Delivered",
    description: "Delivered to destination",
    icon: PackageCheck,
  },
];

export function OrderStatusTracker({ status, className }: OrderStatusTrackerProps) {
  if (status === "CANCELLED") {
    return (
      <div
        role="alert"
        className={cn(
          "rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive flex items-center gap-3 text-sm",
          className
        )}
      >
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Order Cancelled</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            This order was cancelled. If you have any questions, please reach out to customer support.
          </p>
        </div>
      </div>
    );
  }

  // Determine current active step index (0-based)
  // 0: Confirmed (PENDING_PAYMENT)
  // 1: Processing (PROCESSING)
  // 2: Shipped (SHIPPED)
  // 3: Delivered (DELIVERED)
  let activeIndex = 0;
  if (status === "PROCESSING") activeIndex = 1;
  else if (status === "SHIPPED") activeIndex = 2;
  else if (status === "DELIVERED") activeIndex = 3;

  return (
    <div className={cn("w-full py-4", className)}>
      <ol
        role="list"
        aria-label="Order status progress"
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 relative"
      >
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex || status === "DELIVERED";
          const isCurrent = index === activeIndex && status !== "DELIVERED";
          const StepIcon = step.icon;

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Connector line on desktop */}
              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={cn(
                    "hidden sm:block absolute top-5 left-1/2 w-full h-0.5 -z-0 transition-colors",
                    index < activeIndex
                      ? "bg-primary"
                      : "bg-border"
                  )}
                />
              )}

              {/* Step circle icon */}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all shadow-xs",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                    ? "border-primary bg-background text-primary ring-4 ring-primary/10"
                    : "border-border bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 stroke-[2.5]" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
              </div>

              {/* Step info */}
              <div className="mt-2.5 space-y-0.5">
                <p
                  className={cn(
                    "text-xs sm:text-sm font-semibold",
                    isCurrent || isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </p>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
