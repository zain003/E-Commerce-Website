import { apiSuccess, apiError } from "@/lib/api-response";
import { getFeaturedProducts } from "@/lib/services/products";

export async function GET() {
  try {
    const products = await getFeaturedProducts();
    return apiSuccess(products);
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    return apiError(
      "INTERNAL_SERVER_ERROR",
      "Failed to fetch featured products",
      500
    );
  }
}
