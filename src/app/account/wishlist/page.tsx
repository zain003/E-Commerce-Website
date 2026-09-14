"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishlistCard } from "@/components/wishlist/wishlist-card";
import { HydratedWishlistItem } from "@/types";

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

export default function WishlistPage() {
  const { data: session, status } = useSafeSession();
  const router = useSafeRouter();

  const [items, setItems] = useState<HydratedWishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=%2Faccount%2Fwishlist");
      return;
    }

    if (status === "authenticated") {
      let isMounted = true;

      const fetchWishlist = async () => {
        try {
          setIsLoading(true);
          const res = await fetch("/api/account/wishlist");
          if (!res.ok) {
            throw new Error("Failed to load wishlist");
          }
          const body = await res.json();
          if (body.success && isMounted) {
            setItems(body.data || []);
          } else if (isMounted) {
            setError(body.error?.message || "Failed to load wishlist");
          }
        } catch (err) {
          if (isMounted) {
            setError(err instanceof Error ? err.message : "Error loading wishlist");
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      fetchWishlist();

      return () => {
        isMounted = false;
      };
    }
  }, [status, router]);

  const handleRemoveItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  if (status === "loading" || (isLoading && items.length === 0 && !error)) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length === 1
              ? "1 saved product"
              : `${items.length} saved products`}
          </p>
        </div>

        {items.length > 0 && (
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center min-h-[40vh]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Your wishlist is empty
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Save items you love by tapping the heart icon while browsing our collection to easily find them later.
          </p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary shadow-xs h-12 px-6 text-base rounded-md"
            >
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        /* Wishlist Items Grid */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
