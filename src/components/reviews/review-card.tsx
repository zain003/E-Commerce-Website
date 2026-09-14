import React from "react";
import { StarRating } from "@/components/reviews/star-rating";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title?: string | null;
    comment: string;
    createdAt: Date | string;
    user?: {
      name?: string | null;
    } | null;
  };
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const reviewerName = review.user?.name || "Anonymous Customer";

  // Initials for avatar
  const initials = reviewerName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  // Formatted date
  const formattedDate = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-2xs transition-shadow hover:shadow-xs",
        className
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Reviewer Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials ? initials : <UserIcon className="h-4 w-4" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {reviewerName}
                </span>

                <Badge
                  variant="secondary"
                  className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-medium py-0"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Verified Purchase</span>
                </Badge>
              </div>

              <time
                dateTime={new Date(review.createdAt).toISOString()}
                className="text-xs text-muted-foreground"
              >
                {formattedDate}
              </time>
            </div>
          </div>

          {/* Star Rating */}
          <StarRating rating={review.rating} size="sm" />
        </div>

        {/* Review Content */}
        <div className="mt-1">
          {review.title && (
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {review.title}
            </h4>
          )}
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {review.comment}
          </p>
        </div>
      </div>
    </article>
  );
}
