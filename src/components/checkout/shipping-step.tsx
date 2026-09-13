"use client";

import * as React from "react";
import { ShippingMethod } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/components/product/price-tag";
import { Truck, Zap, ArrowLeft, ArrowRight, Check } from "lucide-react";

export interface ShippingStepProps {
  selectedMethodId: "STANDARD" | "EXPRESS";
  subtotal: number;
  availableMethods?: ShippingMethod[];
  onChange: (methodId: "STANDARD" | "EXPRESS") => void;
  onNext: () => void;
  onBack: () => void;
}

export function ShippingStep({
  selectedMethodId,
  subtotal,
  availableMethods,
  onChange,
  onNext,
  onBack,
}: ShippingStepProps) {
  const isFreeStandard = subtotal >= 100.0;

  const methods: {
    id: "STANDARD" | "EXPRESS";
    name: string;
    description: string;
    estimatedDays: string;
    price: number;
    isFree: boolean;
    icon: typeof Truck;
  }[] = [
    {
      id: "STANDARD",
      name: "Standard Delivery",
      description: "Delivered via ground postal service",
      estimatedDays: "3-5 Business Days",
      price: isFreeStandard ? 0.0 : 5.0,
      isFree: isFreeStandard,
      icon: Truck,
    },
    {
      id: "EXPRESS",
      name: "Express Delivery",
      description: "Priority air courier service with real-time tracking",
      estimatedDays: "1-2 Business Days",
      price: 15.0,
      isFree: false,
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Choose Delivery Speed
        </h3>
        <p className="text-xs text-muted-foreground">
          Select how quickly you would like your order to arrive.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Shipping Methods"
        className="space-y-3"
      >
        {methods.map((method) => {
          const isSelected = selectedMethodId === method.id;
          const IconComponent = method.icon;

          return (
            <label
              key={method.id}
              htmlFor={`shipping-${method.id}`}
              className={`relative flex cursor-pointer items-center justify-between rounded-2xl border p-4 sm:p-5 transition-all ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20 bg-card shadow-xs"
                  : "border-border bg-card/60 hover:border-border/80 hover:bg-card"
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <input
                  type="radio"
                  id={`shipping-${method.id}`}
                  name="shippingMethod"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => onChange(method.id)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                  aria-label={method.name}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-foreground">
                      {method.name}
                    </span>
                    {method.isFree && (
                      <Badge variant="success" className="text-[10px] font-semibold">
                        Free
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {method.description}
                  </p>
                  <div className="flex items-center gap-1.5 pt-0.5 text-xs font-medium text-foreground">
                    <IconComponent className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{method.estimatedDays}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 ml-4">
                {method.isFree ? (
                  <div className="space-y-0.5">
                    <span className="text-sm sm:text-base font-bold text-emerald-600">
                      Free
                    </span>
                    <p className="text-[10px] text-muted-foreground line-through">
                      $5.00
                    </p>
                  </div>
                ) : (
                  <span className="text-sm sm:text-base font-bold text-foreground">
                    {formatCurrency(method.price)}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          className="w-full sm:w-auto gap-2 font-semibold shadow-xs cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Address</span>
        </Button>

        <Button
          type="button"
          size="lg"
          onClick={onNext}
          className="w-full sm:w-auto gap-2 font-semibold shadow-xs cursor-pointer"
        >
          <span>Continue to Review</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
