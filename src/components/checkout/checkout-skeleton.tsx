import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CheckoutSkeleton() {
  return (
    <div
      className="container max-w-6xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8 space-y-8 animate-pulse"
      aria-busy="true"
      aria-label="Loading checkout session"
    >
      {/* Stepper Skeleton */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 max-w-xl mx-auto py-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="h-4 w-20 rounded bg-muted/80 hidden sm:block" />
        </div>
        <div className="h-0.5 w-8 sm:w-12 bg-muted/60" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted/60" />
          <div className="h-4 w-20 rounded bg-muted/50 hidden sm:block" />
        </div>
        <div className="h-0.5 w-8 sm:w-12 bg-muted/60" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted/60" />
          <div className="h-4 w-20 rounded bg-muted/50 hidden sm:block" />
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-start">
        {/* Left Column: Form Section */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="space-y-2 pb-4">
              <div className="h-6 w-48 rounded bg-muted" />
              <div className="h-4 w-72 max-w-full rounded bg-muted/70" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-20 rounded bg-muted/70" />
                  <div className="h-10 w-full rounded-md bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 rounded bg-muted/70" />
                  <div className="h-10 w-full rounded-md bg-muted/50" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-muted/70" />
                <div className="h-10 w-full rounded-md bg-muted/50" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-16 rounded bg-muted/70" />
                  <div className="h-10 w-full rounded-md bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-16 rounded bg-muted/70" />
                  <div className="h-10 w-full rounded-md bg-muted/50" />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <div className="h-4 w-16 rounded bg-muted/70" />
                  <div className="h-10 w-full rounded-md bg-muted/50" />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <div className="h-11 w-36 rounded-md bg-muted" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-4">
              <div className="h-5 w-36 rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Item Previews */}
              <div className="space-y-3 divide-y divide-border/40">
                {[1, 2].map((i) => (
                  <div key={i} className="pt-3 first:pt-0 flex items-center gap-3">
                    <div className="h-14 w-14 rounded-lg bg-muted shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-3 w-20 rounded bg-muted/70" />
                    </div>
                    <div className="h-4 w-14 rounded bg-muted" />
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-border">
                <div className="flex justify-between">
                  <div className="h-4 w-16 rounded bg-muted/70" />
                  <div className="h-4 w-12 rounded bg-muted" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 rounded bg-muted/70" />
                  <div className="h-4 w-12 rounded bg-muted" />
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-center">
                  <div className="h-5 w-16 rounded bg-muted font-bold" />
                  <div className="h-6 w-20 rounded bg-muted font-bold" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
