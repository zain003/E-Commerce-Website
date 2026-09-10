import { cacheLife } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Category, Product, ProductDetail } from "@/types";

/**
 * Fetch all categories ordered by name ascending.
 * Cached with Next.js 16 "use cache" directive and "hours" cacheLife profile.
 */
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");

  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Fetch featured products that are not archived.
 * Cached with Next.js 16 "use cache" directive and "hours" cacheLife profile.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");

  return prisma.product.findMany({
    where: {
      featured: true,
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Fetch complete product details by slug including category and variants.
 * Excludes archived products (returns null if archived or not found).
 * Safely decodes URL encoded slugs.
 * Cached with Next.js 16 "use cache" directive and "hours" cacheLife profile.
 */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("hours");

  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    decodedSlug = slug;
  }

  const product = await prisma.product.findFirst({
    where: {
      slug: decodedSlug,
      isArchived: false,
    },
    include: {
      category: true,
      variants: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  return product;
}

/**
 * Fetch all active products within a category by category slug.
 * Excludes archived products.
 * Safely decodes URL encoded category slugs.
 * Cached with Next.js 16 "use cache" directive and "hours" cacheLife profile.
 */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  "use cache";
  cacheLife("hours");

  let decodedSlug = categorySlug;
  try {
    decodedSlug = decodeURIComponent(categorySlug);
  } catch {
    decodedSlug = categorySlug;
  }

  return prisma.product.findMany({
    where: {
      category: {
        slug: decodedSlug,
      },
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
