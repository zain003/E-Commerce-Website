import React from "react";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/components/product/price-tag";
import type { AdminOrderMetrics } from "@/types";

export interface MetricsCardsProps {
  metrics: AdminOrderMetrics;
  className?: string;
}

export function MetricsCards({ metrics, className }: MetricsCardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics?.totalRevenue ?? 0),
      description: "Gross receipts from verified purchases",
      delta: "+14.2%",
      deltaLabel: "vs prior 30d",
      isPositive: true,
      icon: DollarSign,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Total Orders",
      value: (metrics?.totalOrders ?? 0).toLocaleString(),
      description: "Lifetime customer checkouts",
      delta: "+8.5%",
      deltaLabel: "order volume",
      isPositive: true,
      icon: ShoppingBag,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Pending Processing",
      value: (metrics?.processingOrders ?? 0).toLocaleString(),
      description: "Active orders awaiting shipment",
      delta: "-3.1%",
      deltaLabel: "queue backlog",
      isPositive: false,
      icon: Clock,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Delivered Orders",
      value: (metrics?.deliveredOrders ?? 0).toLocaleString(),
      description: "Successfully completed orders",
      delta: "+18.7%",
      deltaLabel: "delivery rate",
      isPositive: true,
      icon: CheckCircle2,
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${
        className || ""
      }`}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.isPositive ? TrendingUp : TrendingDown;

        return (
          <Card
            key={card.title}
            className="overflow-hidden border border-border bg-card transition-all hover:shadow-xs hover:border-border/80"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                    {card.value}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                      card.isPositive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    <TrendIcon className="h-3 w-3" />
                    <span>{card.delta}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  <span className="truncate">{card.description}</span>
                  <span className="text-[10px] text-muted-foreground/80 shrink-0 font-medium ml-1">
                    {card.deltaLabel}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
