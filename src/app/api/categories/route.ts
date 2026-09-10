import { apiSuccess, apiError } from "@/lib/api-response";
import { getCategories } from "@/lib/services/products";

export async function GET() {
  try {
    const categories = await getCategories();
    return apiSuccess(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return apiError(
      "INTERNAL_SERVER_ERROR",
      "Failed to fetch categories",
      500
    );
  }
}
