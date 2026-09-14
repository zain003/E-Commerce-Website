"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { StarRating } from "@/components/reviews/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2 } from "lucide-react";
import { Review } from "@/types";

const clientReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Please select a rating between 1 and 5 stars")
    .max(5, "Rating cannot exceed 5"),
  title: z
    .string()
    .trim()
    .max(100, "Title cannot exceed 100 characters")
    .optional(),
  comment: z
    .string()
    .trim()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment cannot exceed 1000 characters"),
});

type ReviewFormValues = z.infer<typeof clientReviewSchema>;

export interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onSuccess?: (newReview: Review & { user?: { name: string | null } | null }) => void;
}

export function ReviewFormModal({
  isOpen,
  onClose,
  productId,
  productName,
  onSuccess,
}: ReviewFormModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(clientReviewSchema),
    defaultValues: {
      rating: 5,
      title: "",
      comment: "",
    },
  });

  const commentValue = watch("comment") || "";

  const onSubmit = async (values: ReviewFormValues) => {
    setServerError(null);

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: values.rating,
          title: values.title?.trim() || undefined,
          comment: values.comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.error?.code === "ONLY_VERIFIED_BUYERS") {
          setServerError(
            "Only verified buyers who completed a purchase of this product may leave a review"
          );
        } else if (data.error?.code === "ALREADY_REVIEWED") {
          setServerError("You have already reviewed this product");
        } else {
          setServerError(
            data.error?.message || "Failed to submit review. Please try again."
          );
        }
        return;
      }

      // Success
      reset();
      onSuccess?.(data.data);
      onClose();
    } catch {
      setServerError("An unexpected network error occurred. Please try again.");
    }
  };

  const handleModalClose = () => {
    if (isSubmitting) return;
    setServerError(null);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Write a Review"
      description={`Share your honest feedback on ${productName}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{serverError}</p>
          </div>
        )}

        {/* Overall Star Rating */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Rating <span className="text-destructive">*</span>
          </label>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <StarRating
                rating={field.value}
                interactive={true}
                size="lg"
                onChange={(rating) => field.onChange(rating)}
                disabled={isSubmitting}
              />
            )}
          />
          {errors.rating && (
            <p className="mt-1 text-xs text-destructive">
              {errors.rating.message}
            </p>
          )}
        </div>

        {/* Review Title */}
        <div>
          <label
            htmlFor="review-title"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
          >
            Review Title (Optional)
          </label>
          <Input
            id="review-title"
            placeholder="e.g. Best quality, Fits perfectly"
            maxLength={100}
            disabled={isSubmitting}
            {...register("title")}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-destructive">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="review-comment"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Your Review <span className="text-destructive">*</span>
            </label>
            <span className="text-[11px] text-muted-foreground font-mono">
              {commentValue.length}/1000
            </span>
          </div>
          <textarea
            id="review-comment"
            rows={4}
            placeholder="What did you like or dislike? How was the sizing and quality?"
            maxLength={1000}
            disabled={isSubmitting}
            className="w-full rounded-md border border-border bg-transparent p-3 text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            {...register("comment")}
          />
          {errors.comment && (
            <p className="mt-1 text-xs text-destructive">
              {errors.comment.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleModalClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2 font-semibold shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Review</span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
