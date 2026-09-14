"use client";

import React from "react";
import { ProductReviewSummary } from "@/types";
import { StarRating } from "@/components/reviews/star-rating";
import { Button } from "@/components/ui/button";
import { PenSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingBreakdownProps {
  summary: ProductReviewSummary;
  className?: string;
  onWriteReviewClick?: () => void;
}

export function RatingBreakdown({
  summary,
  className,
  onWriteReviewClick,
}: RatingBreakdownProps) {
  const averageRating = summary?.averageRating ?? 0;
  const totalReviews = summary?.totalReviews ?? 0;
  const ratingDistribution = summary?.ratingDistribution || {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  const stars: Array<1 | 2 | 3 | 4 | 5> = [5, 4, 3, 2, 1];

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-xs",
        className
      )}
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
        {/* Left column: Big Score & Stars (4 cols) */}
        <div className="flex flex-col items-center justify-center text-center md:col-span-4 md:border-r md:border-border md:pr-6">
          <span className="text-5xl font-black tracking-tight text-foreground">
            {averageRating.toFixed(1)}
          </span>

          <div className="mt-2.5">
            <StarRating rating={averageRating} size="lg" />
          </div>

          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {totalReviews > 0
              ? `Based on ${totalReviews} customer ${
                  totalReviews === 1 ? "review" : "reviews"
                }`
              : "No reviews yet. Be the first to review!"}
          </p>

          {onWriteReviewClick && (
            <div className="mt-5 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onWriteReviewClick}
                className="w-full gap-2 font-semibold shadow-2xs hover:bg-muted"
              >
                <PenSquare className="h-4 w-4" />
                <span>Write a Review</span>
              </Button>
            </div>
          )}
        </div>

        {/* Right column: Distribution Bar Chart (8 cols) */}
        <div className="flex flex-col gap-2.5 md:col-span-8">
          {stars.map((star) => {
            const count = ratingDistribution[star] || 0;
            const percent =
              totalReviews > 0
                ? Math.round((count / totalReviews) * 100)
                : 0;

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                {/* Star level label */}
                <div className="flex w-12 items-center justify-end gap-1 font-medium text-muted-foreground">
                  <span>{star}</span>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </div>

                {/* Progress bar */}
                <div
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${star} star reviews: ${percent}%`}
                  className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Percentage & Count display */}
                <div className="w-14 text-right tabular-nums text-muted-foreground font-mono">
                  {percent}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
