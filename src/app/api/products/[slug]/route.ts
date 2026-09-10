import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getProductBySlug } from "@/lib/services/products";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { slug } = await context.params;

    if (!slug || slug.trim() === "") {
      return apiError(
        "BAD_REQUEST",
        "Product slug is required",
        400
      );
    }

    const product = await getProductBySlug(slug);

    if (!product) {
      return apiError(
        "NOT_FOUND",
        `Product with slug "${slug}" not found`,
        404
      );
    }

    return apiSuccess(product);
  } catch (error) {
    console.error("Failed to fetch product by slug:", error);
    return apiError(
      "INTERNAL_SERVER_ERROR",
      "Failed to fetch product",
      500
    );
  }
}
