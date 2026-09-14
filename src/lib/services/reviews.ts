import { prisma } from "@/lib/prisma";
import type {
  Review,
  User,
  ApiResponse,
  PaginatedResult,
  CreateReviewDto,
  ProductReviewSummary,
} from "@/types";

/**
 * Pure calculation helper to aggregate ratings, distribution, and rounded average.
 */
export function calculateReviewSummary(
  reviews: Array<{ rating: number }>
): ProductReviewSummary {
  const totalReviews = reviews.length;
  const ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  if (totalReviews === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution,
    };
  }

  let totalScore = 0;
  for (const review of reviews) {
    const star = review.rating;
    totalScore += star;
    if (star >= 1 && star <= 5) {
      ratingDistribution[star as 1 | 2 | 3 | 4 | 5] =
        (ratingDistribution[star as 1 | 2 | 3 | 4 | 5] || 0) + 1;
    }
  }

  const averageRating = Math.round((totalScore / totalReviews) * 10) / 10;

  return {
    averageRating,
    totalReviews,
    ratingDistribution,
  };
}

/**
 * Verifies whether the specified user has completed an order containing the product.
 */
export async function hasUserPurchasedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      status: {
        in: ["PROCESSING", "SHIPPED", "DELIVERED"],
      },
      OR: [
        { paymentStatus: "PAID" },
        { status: "DELIVERED" },
      ],
      items: {
        some: {
          variant: {
            productId,
          },
        },
      },
    },
    select: { id: true },
  });

  return Boolean(order);
}

/**
 * Retrieves paginated reviews for a given product with reviewer name.
 */
export async function getProductReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<ApiResponse<PaginatedResult<Review & { user: Pick<User, "name"> }>>> {
  try {
    let resolvedProductId = productId;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: productId }, { slug: productId }],
      },
      select: { id: true },
    });
    if (product) {
      resolvedProductId = product.id;
    }

    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(50, limit));
    const skip = (validPage - 1) * validLimit;

    const [total, items] = await Promise.all([
      prisma.review.count({ where: { productId: resolvedProductId } }),
      prisma.review.findMany({
        where: { productId: resolvedProductId },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: validLimit,
      }),
    ]);

    const totalPages = Math.ceil(total / validLimit) || 1;

    return {
      success: true,
      data: {
        items,
        total,
        page: validPage,
        limit: validLimit,
        totalPages,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[getProductReviews] Error fetching product reviews:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch product reviews",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Computes and returns rating breakdown and average score for a product.
 */
export async function getProductReviewSummary(
  productId: string
): Promise<ApiResponse<ProductReviewSummary>> {
  try {
    let resolvedProductId = productId;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: productId }, { slug: productId }],
      },
      select: { id: true },
    });
    if (product) {
      resolvedProductId = product.id;
    }

    const reviews = await prisma.review.findMany({
      where: { productId: resolvedProductId },
      select: { rating: true },
    });

    const summary = calculateReviewSummary(reviews);

    return {
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[getProductReviewSummary] Error computing review summary:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to compute review summary",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Submits a new review with verified purchaser and duplicate checks.
 */
export async function createProductReview(
  dto: CreateReviewDto,
  userId: string
): Promise<ApiResponse<Review>> {
  try {
    // 1. Resolve product
    let targetProduct = await prisma.product.findUnique({
      where: { id: dto.productId },
      select: { id: true },
    });

    if (!targetProduct) {
      targetProduct = await prisma.product.findUnique({
        where: { slug: dto.productId },
        select: { id: true },
      });
    }

    if (!targetProduct) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Product "${dto.productId}" not found`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    const resolvedProductId = targetProduct.id;

    // 2. Verified purchaser check
    const isPurchased = await hasUserPurchasedProduct(userId, resolvedProductId);
    if (!isPurchased) {
      return {
        success: false,
        error: {
          code: "ONLY_VERIFIED_BUYERS",
          message: "Only verified buyers who completed a purchase of this product may leave a review",
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Duplicate review check (1 review per product per user)
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId: resolvedProductId,
      },
      select: { id: true },
    });

    if (existingReview) {
      return {
        success: false,
        error: {
          code: "ALREADY_REVIEWED",
          message: "You have already reviewed this product",
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 4. Create review
    const review = await prisma.review.create({
      data: {
        userId,
        productId: resolvedProductId,
        rating: dto.rating,
        title: dto.title?.trim() || null,
        comment: dto.comment.trim(),
      },
    });

    return {
      success: true,
      data: review,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[createProductReview] Error creating review:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create review",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
