import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";
import type {
  ApiResponse,
  PaginatedResult,
  Product,
  ProductVariant,
  CreateProductDto,
  UpdateProductDto,
  AdminProduct,
} from "@/types";

/**
 * Fetch paginated list of all products for admin management.
 * Includes category and variants. Includes active and archived products.
 */
export async function getAdminProducts(
  page = 1,
  limit = 10
): Promise<ApiResponse<PaginatedResult<AdminProduct>>> {
  try {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        skip,
        take: safeLimit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: true,
          variants: {
            orderBy: {
              name: "asc",
            },
          },
        },
      }),
      prisma.product.count(),
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    return {
      success: true,
      data: {
        items,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[AdminProductsService] getAdminProducts error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve products for admin",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Create a new product with nested variants in a single atomic transaction.
 * Enforces unique slug and SKU constraints, validates category existence,
 * and triggers immediate storefront cache revalidation.
 */
export async function createAdminProduct(
  dto: CreateProductDto
): Promise<ApiResponse<Product>> {
  try {
    // 1. Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      return {
        success: false,
        error: {
          code: "CATEGORY_NOT_FOUND",
          message: `Category with ID ${dto.categoryId} does not exist`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Verify product slug is unique
    const existingSlug = await prisma.product.findUnique({
      where: { slug: dto.slug },
    });

    if (existingSlug) {
      return {
        success: false,
        error: {
          code: "CONFLICT",
          message: `Product with slug "${dto.slug}" already exists`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Verify variant SKUs are unique
    for (const variant of dto.variants) {
      const existingSku = await prisma.productVariant.findUnique({
        where: { sku: variant.sku },
      });

      if (existingSku) {
        return {
          success: false,
          error: {
            code: "CONFLICT",
            message: `Product variant with SKU "${variant.sku}" already exists`,
          },
          timestamp: new Date().toISOString(),
        };
      }
    }

    // 4. Create product with nested variants
    const product = await prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        basePrice: new Decimal(dto.basePrice),
        categoryId: dto.categoryId,
        images: dto.images,
        featured: dto.featured ?? false,
        variants: {
          create: dto.variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            priceDelta: new Decimal(v.priceDelta),
            stock: v.stock,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
      },
    });

    // 5. Trigger Next.js 16 cache revalidation for storefront catalog reads
    try {
      revalidateTag("products");
    } catch (tagError) {
      console.warn("[AdminProductsService] revalidateTag('products') warning:", tagError);
    }

    return {
      success: true,
      data: product,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[AdminProductsService] createAdminProduct error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create product",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Update an existing product, including archive toggle and variant adjustments.
 * Triggers Next.js 16 cache revalidation upon success.
 */
export async function updateAdminProduct(
  id: string,
  dto: UpdateProductDto
): Promise<ApiResponse<Product>> {
  try {
    // 1. Verify product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Product with ID ${id} not found`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 2. If updating slug, verify it is not taken by another product
    if (dto.slug && dto.slug !== existingProduct.slug) {
      const slugCollision = await prisma.product.findFirst({
        where: {
          slug: dto.slug,
          NOT: { id },
        },
      });

      if (slugCollision) {
        return {
          success: false,
          error: {
            code: "CONFLICT",
            message: `Slug "${dto.slug}" is already used by another product`,
          },
          timestamp: new Date().toISOString(),
        };
      }
    }

    // 3. If updating categoryId, verify category exists
    if (dto.categoryId && dto.categoryId !== existingProduct.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        return {
          success: false,
          error: {
            code: "CATEGORY_NOT_FOUND",
            message: `Category with ID ${dto.categoryId} does not exist`,
          },
          timestamp: new Date().toISOString(),
        };
      }
    }

    // 4. Construct update payload
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.basePrice !== undefined) updateData.basePrice = new Decimal(dto.basePrice);
    if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
    if (dto.images !== undefined) updateData.images = dto.images;
    if (dto.featured !== undefined) updateData.featured = dto.featured;
    if (dto.isArchived !== undefined) updateData.isArchived = dto.isArchived;

    // 5. Execute update (and variant upserts if provided)
    let updatedProduct: Product;
    if (dto.variants && dto.variants.length > 0) {
      const operations: any[] = [
        prisma.product.update({
          where: { id },
          data: updateData,
          include: {
            category: true,
            variants: true,
          },
        }),
      ];

      for (const v of dto.variants) {
        operations.push(
          prisma.productVariant.upsert({
            where: { sku: v.sku },
            update: {
              name: v.name,
              priceDelta: new Decimal(v.priceDelta),
              stock: v.stock,
            },
            create: {
              productId: id,
              sku: v.sku,
              name: v.name,
              priceDelta: new Decimal(v.priceDelta),
              stock: v.stock,
            },
          })
        );
      }

      const results = await prisma.$transaction(operations);
      updatedProduct = results[0];
    } else {
      updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          variants: true,
        },
      });
    }

    // 6. Trigger Next.js 16 cache revalidation for storefront catalog reads
    try {
      revalidateTag("products");
    } catch (tagError) {
      console.warn("[AdminProductsService] revalidateTag('products') warning:", tagError);
    }

    return {
      success: true,
      data: updatedProduct,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[AdminProductsService] updateAdminProduct error for ID ${id}:`, error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update product",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Adjust stock count for a specific variant immediately.
 * Triggers Next.js 16 cache revalidation upon success.
 */
export async function updateVariantStock(
  variantId: string,
  stock: number
): Promise<ApiResponse<ProductVariant>> {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Product variant with ID ${variantId} not found`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });

    // Trigger Next.js 16 cache revalidation
    try {
      revalidateTag("products");
    } catch (tagError) {
      console.warn("[AdminProductsService] revalidateTag('products') warning:", tagError);
    }

    return {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[AdminProductsService] updateVariantStock error for variant ${variantId}:`, error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update variant stock",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
