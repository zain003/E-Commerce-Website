"use client";

import React, { useState } from "react";
import { TrendingUp, Calendar, DollarSign, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/components/product/price-tag";
import { cn } from "@/lib/utils";

interface DataPoint {
  label: string;
  date: string;
  revenue: number;
  orders: number;
}

const SEVEN_DAY_DATA: DataPoint[] = [
  { label: "Thu", date: "Sep 10", revenue: 2450, orders: 18 },
  { label: "Fri", date: "Sep 11", revenue: 3120, orders: 24 },
  { label: "Sat", date: "Sep 12", revenue: 4890, orders: 36 },
  { label: "Sun", date: "Sep 13", revenue: 4150, orders: 29 },
  { label: "Mon", date: "Sep 14", revenue: 2980, orders: 21 },
  { label: "Tue", date: "Sep 15", revenue: 3640, orders: 27 },
  { label: "Wed", date: "Sep 16 (Today)", revenue: 4210, orders: 31 },
];

const THIRTY_DAY_DATA: DataPoint[] = [
  { label: "W1", date: "Aug 18 - 24", revenue: 16800, orders: 122 },
  { label: "W2", date: "Aug 25 - 31", revenue: 19400, orders: 145 },
  { label: "W3", date: "Sep 01 - 07", revenue: 22100, orders: 168 },
  { label: "W4", date: "Sep 08 - 14", revenue: 25400, orders: 192 },
];

export function AdminRevenueChart({ className }: { className?: string }) {
  const [timeframe, setTimeframe] = useState<"7D" | "30D">("7D");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = timeframe === "7D" ? SEVEN_DAY_DATA : THIRTY_DAY_DATA;
  const maxRevenue = Math.max(...data.map((d) => d.revenue)) * 1.15;
  const totalPeriodRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalPeriodOrders = data.reduce((sum, d) => sum + d.orders, 0);
  const aov = totalPeriodOrders > 0 ? totalPeriodRevenue / totalPeriodOrders : 0;

  // Chart SVG Coordinates (viewBox 0 0 600 240)
  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth;
    const y = height - paddingY - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, ...d };
  });

  // Construct smooth SVG Bézier curve path
  const curvePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    const cpY2 = point.y;
    return `${acc} C ${cpX1},${cpY1} ${cpX2},${cpY2} ${point.x},${point.y}`;
  }, "");

  // Area path for gradient fill below line
  const areaPath = `${curvePath} L ${points[points.length - 1].x},${
    height - paddingY
  } L ${points[0].x},${height - paddingY} Z`;

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all",
        className
      )}
    >
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base sm:text-lg font-bold tracking-tight text-foreground">
              Revenue & Fulfillment Velocity
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> +14.2%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gross daily sales receipts, order velocity, and baseline AOV.
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setTimeframe("7D");
              setHoveredIndex(null);
            }}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
              timeframe === "7D"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => {
              setTimeframe("30D");
              setHoveredIndex(null);
            }}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
              timeframe === "30D"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Metric Quick Gauges Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-b border-border/40">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Window Revenue
          </span>
          <p className="text-xl font-bold tracking-tight text-foreground mt-0.5 font-mono">
            {formatCurrency(totalPeriodRevenue)}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Average Order Value
          </span>
          <p className="text-xl font-bold tracking-tight text-foreground mt-0.5 font-mono">
            {formatCurrency(aov)}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Orders Processed
          </span>
          <p className="text-xl font-bold tracking-tight text-foreground mt-0.5 font-mono">
            {totalPeriodOrders} units
          </p>
        </div>
      </div>

      {/* Interactive SVG Area Curve */}
      <div className="relative mt-4 w-full select-none">
        {/* Floating Tooltip Callout */}
        {activePoint && (
          <div
            className="pointer-events-none absolute z-10 -top-2 transform -translate-x-1/2 rounded-xl border border-border/80 bg-popover/95 px-3 py-2 text-popover-foreground shadow-xl backdrop-blur-md transition-all duration-150"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
            }}
          >
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="font-semibold text-muted-foreground">{activePoint.date}</span>
              <span className="font-mono font-bold text-emerald-500">
                {formatCurrency(activePoint.revenue)}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {activePoint.orders} completed purchases
            </p>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 overflow-visible"
          aria-label="Revenue performance graph"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary, #18181b)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--primary, #18181b)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Reference Lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const lineY = height - paddingY - ratio * chartHeight;
            const refVal = maxRevenue * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={lineY}
                  x2={width - paddingX}
                  y2={lineY}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={lineY + 3}
                  textAnchor="end"
                  className="fill-muted-foreground text-[9px] font-mono"
                >
                  ${Math.round(refVal / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Smooth Curve Stroke */}
          <path
            d={curvePath}
            fill="none"
            stroke="var(--primary, #18181b)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactive Data Nodes */}
          {points.map((pt, i) => (
            <g
              key={i}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Invisible large touch target */}
              <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

              {/* Visible Data Dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === i ? "6" : "3.5"}
                className={cn(
                  "transition-all duration-200 fill-card stroke-primary",
                  hoveredIndex === i ? "stroke-[3px]" : "stroke-2"
                )}
              />

              {/* X-axis Label */}
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className={cn(
                  "text-[10px] transition-colors font-medium",
                  hoveredIndex === i
                    ? "fill-foreground font-bold"
                    : "fill-muted-foreground"
                )}
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
