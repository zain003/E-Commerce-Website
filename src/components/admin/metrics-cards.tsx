import React from "react";
import { DollarSign, ShoppingBag, Clock, CheckCircle2 } from "lucide-react";
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
      description: "Gross revenue from paid orders",
      icon: DollarSign,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Total Orders",
      value: (metrics?.totalOrders ?? 0).toLocaleString(),
      description: "Lifetime placed orders",
      icon: ShoppingBag,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Pending Processing",
      value: (metrics?.processingOrders ?? 0).toLocaleString(),
      description: "Active orders awaiting fulfillment",
      icon: Clock,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Delivered Orders",
      value: (metrics?.deliveredOrders ?? 0).toLocaleString(),
      description: "Successfully fulfilled orders",
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
        return (
          <Card
            key={card.title}
            className="overflow-hidden border border-border bg-card transition-shadow hover:shadow-xs"
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
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {card.value}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
