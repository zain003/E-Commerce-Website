import { NextRequest } from "next/server";
import { parseSearchParams } from "@/lib/validators/search";
import { searchProducts } from "@/lib/services/search";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const parseResult = parseSearchParams(req.nextUrl.searchParams);

    if (!parseResult.success) {
      return apiError(
        "VALIDATION_ERROR",
        "Invalid search parameters",
        400,
        parseResult.error.flatten().fieldErrors
      );
    }

    const results = await searchProducts(parseResult.data);
    return apiSuccess(results);
  } catch (error) {
    console.error("[SearchRoute] GET /api/search error:", error);
    return apiError(
      "INTERNAL_SERVER_ERROR",
      "An error occurred while searching products",
      500
    );
  }
}
