"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

export function ProductGallery({
  images,
  title,
  className,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasImages = images && images.length > 0;
  const activeImage = hasImages ? images[activeIndex] || images[0] : null;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Main Preview Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted/30">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={`${title} - Image ${activeIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={activeIndex === 0}
            data-testid="gallery-main-image"
            className="object-cover transition-all duration-300"
          />
        ) : (
          <div
            data-testid="gallery-placeholder"
            className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted/40 text-muted-foreground"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background/80 shadow-xs">
              <ImageIcon className="h-8 w-8 text-muted-foreground/80" />
            </div>
            <p className="text-sm font-medium">No Images Available</p>
          </div>
        )}
      </div>

      {/* Thumbnail Strip (Rendered only when >1 images exist) */}
      {hasImages && images.length > 1 && (
        <div
          className="flex items-center gap-3 overflow-x-auto pb-1"
          role="region"
          aria-label="Product image thumbnails"
        >
          {images.map((imgUrl, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${imgUrl}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={isActive ? "true" : "false"}
                className={cn(
                  "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer",
                  isActive
                    ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "border-border opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={imgUrl}
                  alt={`${title} thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
