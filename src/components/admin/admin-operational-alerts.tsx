"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OperationalAlertsProps {
  processingOrdersCount?: number;
  className?: string;
}

export function AdminOperationalAlerts({
  processingOrdersCount = 0,
  className,
}: OperationalAlertsProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base sm:text-lg font-bold tracking-tight text-foreground">
            Operational Radar
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            Action Items
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Fulfillment bottlenecks and inventory replenishment priorities.
        </p>
      </div>

      <div className="space-y-3">
        {/* Processing Orders Alert */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 transition-colors hover:bg-amber-500/10">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Fulfillment Queue
              </span>
              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                {processingOrdersCount} pending
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Paid customer orders awaiting tracking dispatch.
            </p>
            <Link
              href="/admin/orders?status=PROCESSING"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline mt-2"
            >
              <span>Process order queue</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-3.5 transition-colors hover:bg-muted/70">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Inventory Health
              </span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                Threshold: &lt;5
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Automated monitors check active variant SKU levels.
            </p>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline mt-2"
            >
              <span>Inspect stock levels</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* System Integrity */}
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-[11px] text-foreground">
            Stripe webhook listener & automated inventory sync operational.
          </span>
        </div>
      </div>
    </div>
  );
}
