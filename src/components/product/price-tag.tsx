import React from "react";
import { cn } from "@/lib/utils";

export interface PriceTagProps extends React.HTMLAttributes<HTMLDivElement> {
  basePrice: number | string | { toNumber?: () => number; toString: () => string };
  priceDelta?: number | string | { toNumber?: () => number; toString: () => string };
  showDelta?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  currency?: string;
}

/**
 * Safely converts Decimal, string, or number values to JavaScript number.
 */
export function toNumericPrice(value: unknown): number {
  if (typeof value === "number") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber: () => number }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  const parsed = parseFloat(String(value ?? 0));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats numeric price with standard currency symbol and 2 decimal places.
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function PriceTag({
  basePrice,
  priceDelta,
  showDelta = false,
  size = "md",
  currency = "USD",
  className,
  ...props
}: PriceTagProps) {
  const numericBase = toNumericPrice(basePrice);
  const numericDelta = priceDelta !== undefined ? toNumericPrice(priceDelta) : 0;
  const totalPrice = numericBase + numericDelta;

  const sizeClasses = {
    sm: "text-sm font-semibold",
    md: "text-base font-bold",
    lg: "text-xl font-extrabold",
    xl: "text-2xl sm:text-3xl font-black",
  };

  return (
    <div
      className={cn("inline-flex items-baseline gap-2", className)}
      {...props}
    >
      <span
        className={cn("tracking-tight text-foreground", sizeClasses[size])}
        data-testid="price-tag-total"
      >
        {formatCurrency(totalPrice, currency)}
      </span>

      {showDelta && numericDelta !== 0 && (
        <span
          className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
          data-testid="price-tag-delta"
        >
          {numericDelta > 0 ? `+${formatCurrency(numericDelta, currency)}` : `-${formatCurrency(Math.abs(numericDelta), currency)}`}
        </span>
      )}
    </div>
  );
}
