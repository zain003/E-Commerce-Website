import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function OrderConfirmationSkeleton() {
  return (
    <div
      className="container max-w-5xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8 space-y-8 animate-pulse"
      aria-busy="true"
      aria-label="Loading order confirmation receipt"
    >
      {/* Celebration Header Skeleton */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center" />
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-lg bg-muted mx-auto" />
          <div className="h-4 w-96 max-w-full rounded bg-muted/70 mx-auto" />
        </div>
        <div className="pt-2 flex justify-center">
          <div className="h-7 w-48 rounded-full bg-muted" />
        </div>
      </div>

      {/* Main Receipt Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Column: Items & Tracker (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracker Card Skeleton */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="h-5 w-32 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-10 w-full rounded-md bg-muted/60" />
            </CardContent>
          </Card>

          {/* Items Card Skeleton */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="h-5 w-40 rounded bg-muted" />
            </CardHeader>
            <CardContent className="divide-y divide-border/60">
              {[1, 2].map((i) => (
                <div key={i} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
                  <div className="h-16 w-16 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-muted" />
                    <div className="h-3 w-28 rounded bg-muted/70" />
                  </div>
                  <div className="h-4 w-16 rounded bg-muted" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Financial Breakdown & Address (1 Col) */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="h-5 w-36 rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <div className="h-4 w-20 rounded bg-muted/70" />
                  <div className="h-4 w-14 rounded bg-muted" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-muted/70" />
                  <div className="h-4 w-14 rounded bg-muted" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 rounded bg-muted/70" />
                  <div className="h-4 w-14 rounded bg-muted" />
                </div>
                <div className="pt-2 border-t border-border flex justify-between">
                  <div className="h-5 w-16 rounded bg-muted font-bold" />
                  <div className="h-5 w-20 rounded bg-muted font-bold" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="h-5 w-36 rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted/70" />
              <div className="h-3 w-40 rounded bg-muted/70" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
