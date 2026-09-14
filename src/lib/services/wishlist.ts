import { prisma } from "@/lib/prisma";
import type {
  ApiResponse,
  HydratedWishlistItem,
  ToggleWishlistResponse,
} from "@/types";

/**
 * Retrieves the customer's full wishlist enriched with product details and live inStock calculations.
 */
export async function getWishlist(
  userId: string
): Promise<ApiResponse<HydratedWishlistItem[]>> {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            variants: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const hydratedItems: HydratedWishlistItem[] = items.map((item) => {
      const isArchived = Boolean(item.product.isArchived);
      const hasStock = item.product.variants?.some((v) => v.stock > 0) ?? false;
      const inStock = !isArchived && hasStock;

      return {
        ...item,
        product: {
          ...item.product,
          inStock,
        },
      };
    });

    return {
      success: true,
      data: hydratedItems,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[getWishlist] Error retrieving wishlist:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve wishlist",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Toggles a product in the user's wishlist (adds if absent, removes if present).
 */
export async function toggleWishlistItem(
  productId: string,
  userId: string
): Promise<ApiResponse<ToggleWishlistResponse>> {
  try {
    // 1. Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Product with ID "${productId}" not found`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Check if already wishlisted
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      // Remove from wishlist
      await prisma.wishlistItem.delete({
        where: {
          id: existing.id,
        },
      });

      return {
        success: true,
        data: {
          isWishlisted: false,
          productId,
        },
        timestamp: new Date().toISOString(),
      };
    } else {
      // Add to wishlist
      await prisma.wishlistItem.create({
        data: {
          userId,
          productId,
        },
      });

      return {
        success: true,
        data: {
          isWishlisted: true,
          productId,
        },
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("[toggleWishlistItem] Error toggling wishlist item:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to toggle wishlist item",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
