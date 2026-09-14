import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { getProductReviewSummary } from "@/lib/services/reviews";

interface RouteContext {
  params: Promise<{
    slug?: string;
    id?: string;
  }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const id = params.slug || params.id;

    if (!id || id.trim() === "") {
      return apiError("BAD_REQUEST", "Product ID is required", 400);
    }

    const result = await getProductReviewSummary(id);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/products/[id]/reviews/summary] Error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
