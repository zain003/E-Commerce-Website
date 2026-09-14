import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-response";
import { createReviewSchema, reviewQuerySchema } from "@/lib/validators/review";
import {
  getProductReviews,
  createProductReview,
} from "@/lib/services/reviews";

interface RouteContext {
  params: Promise<{
    slug?: string;
    id?: string;
  }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const id = params.slug || params.id;

    if (!id || id.trim() === "") {
      return apiError("BAD_REQUEST", "Product ID is required", 400);
    }

    const searchParams = req.nextUrl.searchParams;
    const pageRaw = searchParams.get("page") ?? undefined;
    const limitRaw = searchParams.get("limit") ?? undefined;

    const validatedQuery = reviewQuerySchema.safeParse({
      page: pageRaw,
      limit: limitRaw,
    });

    if (!validatedQuery.success) {
      return apiError(
        "VALIDATION_ERROR",
        "Invalid pagination parameters",
        400,
        validatedQuery.error.flatten().fieldErrors
      );
    }

    const result = await getProductReviews(
      id,
      validatedQuery.data.page,
      validatedQuery.data.limit
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/products/[id]/reviews] Error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required to submit a review", 401);
    }

    const params = await context.params;
    const id = params.slug || params.id;

    if (!id || id.trim() === "") {
      return apiError("BAD_REQUEST", "Product ID is required", 400);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid JSON payload", 400);
    }

    const validated = createReviewSchema.safeParse({
      ...body,
      productId: id,
    });

    if (!validated.success) {
      return apiError(
        "VALIDATION_ERROR",
        "Validation failed",
        400,
        validated.error.flatten().fieldErrors
      );
    }

    const result = await createProductReview(validated.data, session.user.id);

    if (!result.success) {
      let status = 400;
      if (result.error?.code === "ONLY_VERIFIED_BUYERS") {
        status = 403;
      } else if (result.error?.code === "ALREADY_REVIEWED") {
        status = 409;
      } else if (result.error?.code === "NOT_FOUND") {
        status = 404;
      } else if (result.error?.code === "INTERNAL_SERVER_ERROR") {
        status = 500;
      }
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[POST /api/products/[id]/reviews] Error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
