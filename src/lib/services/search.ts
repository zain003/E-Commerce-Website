import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Category, Product, PaginatedResult, SearchFilterParams } from "@/types";

export type ProductWithCategory = Product & {
  category: Category;
};

/**
 * Searches and filters the product catalog using dynamic Prisma queries.
 * Supports text search (name & description), category slug filtering,
 * price range boundaries, stock availability, multiple sorting strategies,
 * and atomic pagination via prisma.$transaction.
 *
 * Always enforces `isArchived: false` to ensure archived catalog items are excluded.
 */
export async function searchProducts(
  params: SearchFilterParams
): Promise<PaginatedResult<ProductWithCategory>> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(params.limit || 12, 100));
  const skip = (page - 1) * limit;
  const take = limit;

  // Build dynamic where clause
  const where: Prisma.ProductWhereInput = {
    isArchived: false,
  };

  // Text search on name or description (case-insensitive)
  if (params.query && params.query.trim().length > 0) {
    const trimmedQuery = params.query.trim();
    where.OR = [
      {
        name: {
          contains: trimmedQuery,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: trimmedQuery,
          mode: "insensitive",
        },
      },
    ];
  }

  // Category filter with safe URL decoding
  if (params.categorySlug && params.categorySlug.trim().length > 0) {
    let decodedSlug = params.categorySlug.trim();
    try {
      decodedSlug = decodeURIComponent(decodedSlug);
    } catch {
      decodedSlug = params.categorySlug.trim();
    }
    where.category = {
      slug: decodedSlug,
    };
  }

  // Price range filter
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.basePrice = {
      ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
      ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
    };
  }

  // In-stock only filter (requires at least one variant with stock > 0)
  if (params.inStockOnly) {
    where.variants = {
      some: {
        stock: {
          gt: 0,
        },
      },
    };
  }

  // Dynamic sorting
  let orderBy:
    | Prisma.ProductOrderByWithRelationInput
    | Prisma.ProductOrderByWithRelationInput[];

  switch (params.sortBy) {
    case "price_asc":
      orderBy = { basePrice: "asc" };
      break;
    case "price_desc":
      orderBy = { basePrice: "desc" };
      break;
    case "featured":
      orderBy = [{ featured: "desc" }, { createdAt: "desc" }];
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  try {
    // Atomic pagination fetch
    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      items: items as ProductWithCategory[],
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("[SearchService] searchProducts database query error:", error);
    throw error;
  }
}
