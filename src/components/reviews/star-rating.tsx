"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StarRatingProps {
  rating: number; // 0 to 5 (e.g. 4.3 or 5)
  maxStars?: number; // default 5
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showScore?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function StarRating({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onChange,
  showScore = false,
  disabled = false,
  className,
  name = "rating",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  const handleStarClick = (starValue: number) => {
    if (disabled || !interactive) return;
    onChange?.(starValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (disabled || !interactive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange?.(starValue);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(maxStars, starValue + 1);
      onChange?.(next);
      const nextEl = document.getElementById(`${name}-star-${next}`);
      nextEl?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = Math.max(1, starValue - 1);
      onChange?.(prev);
      const prevEl = document.getElementById(`${name}-star-${prev}`);
      prevEl?.focus();
    }
  };

  if (!interactive) {
    return (
      <div
        className={cn("inline-flex items-center gap-1.5", className)}
        role="img"
        aria-label={`${rating} out of ${maxStars} stars`}
      >
        <div className="flex items-center gap-0.5">
          {Array.from({ length: maxStars }).map((_, idx) => {
            const starValue = idx + 1;
            const isFilled = rating >= starValue;
            const isHalf = !isFilled && rating >= starValue - 0.5;

            return (
              <div key={idx} className="relative inline-block">
                {isHalf ? (
                  <div className="relative">
                    <Star
                      className={cn(
                        sizeClasses[size],
                        "text-muted-foreground/30 fill-muted/20"
                      )}
                    />
                    <div className="absolute inset-0 w-1/2 overflow-hidden">
                      <Star
                        className={cn(
                          sizeClasses[size],
                          "text-amber-400 fill-amber-400"
                        )}
                      />
                    </div>
                  </div>
                ) : (
                  <Star
                    className={cn(
                      sizeClasses[size],
                      isFilled
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground/30 fill-muted/20"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
        {showScore && (
          <span className="text-sm font-semibold text-foreground">
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Star rating selection"
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }).map((_, idx) => {
          const starValue = idx + 1;
          const isFilled = activeRating >= starValue;

          return (
            <button
              key={idx}
              id={`${name}-star-${starValue}`}
              type="button"
              role="radio"
              aria-checked={rating === starValue}
              aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
              disabled={disabled}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => !disabled && setHoverRating(starValue)}
              onMouseLeave={() => !disabled && setHoverRating(null)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              className={cn(
                "rounded-md p-1 transition-transform focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-1",
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:scale-110"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors duration-150",
                  isFilled
                    ? "text-amber-400 fill-amber-400"
                    : "text-muted-foreground/30 fill-muted/20"
                )}
              />
            </button>
          );
        })}
      </div>
      {showScore && (
        <span className="text-sm font-semibold text-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
