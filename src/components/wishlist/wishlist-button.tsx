"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function useSafeSession() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const session = useSession();
    if (!session) {
      return { data: null, status: "unauthenticated" as const };
    }
    return session;
  } catch {
    return { data: null, status: "unauthenticated" as const };
  }
}

function useSafeRouter() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router = useRouter();
    if (!router) {
      return { push: () => {}, replace: () => {}, back: () => {} };
    }
    return router;
  } catch {
    return { push: () => {}, replace: () => {}, back: () => {} };
  }
}

function useSafePathname() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const pathname = usePathname();
    return pathname || "/";
  } catch {
    return "/";
  }
}

export interface WishlistButtonProps {
  productId: string;
  initialWishlisted?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onToggle?: (isWishlisted: boolean) => void;
}

export function WishlistButton({
  productId,
  initialWishlisted = false,
  size = "md",
  className,
  onToggle,
}: WishlistButtonProps) {
  const { data: session, status } = useSafeSession();
  const router = useSafeRouter();
  const pathname = useSafePathname();

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isPending, setIsPending] = useState(false);

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const buttonSizes = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Check authentication
    if (status === "unauthenticated" || !session?.user) {
      const callbackUrl = encodeURIComponent(pathname || "/");
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    const previousState = isWishlisted;
    const nextState = !previousState;

    // Optimistic update
    setIsWishlisted(nextState);
    if (onToggle) {
      onToggle(nextState);
    }

    setIsPending(true);
    try {
      const res = await fetch("/api/account/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        throw new Error("Failed to toggle wishlist item");
      }

      const body = await res.json();
      if (!body.success) {
        throw new Error(body.error?.message || "Error toggling wishlist");
      }

      setIsWishlisted(body.data.isWishlisted);
      if (onToggle && body.data.isWishlisted !== nextState) {
        onToggle(body.data.isWishlisted);
      }
    } catch (err) {
      // Rollback on error
      console.error("[WishlistButton] Toggle error:", err);
      setIsWishlisted(previousState);
      if (onToggle) {
        onToggle(previousState);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isWishlisted}
      className={cn(
        "flex items-center justify-center rounded-full bg-background/80 backdrop-blur-xs text-foreground/80 shadow-xs transition-all duration-200 hover:scale-110 hover:bg-background hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 cursor-pointer",
        buttonSizes[size],
        className
      )}
    >
      <Heart
        className={cn(
          "transition-colors duration-200",
          iconSizes[size],
          isWishlisted
            ? "fill-rose-500 text-rose-500 scale-105"
            : "text-muted-foreground hover:text-foreground"
        )}
      />
    </button>
  );
}
