import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-response";
import { toggleWishlistSchema } from "@/lib/validators/wishlist";
import { toggleWishlistItem } from "@/lib/services/wishlist";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required to update wishlist", 401);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return apiError("BAD_REQUEST", "Invalid JSON payload", 400);
    }

    const validated = toggleWishlistSchema.safeParse(body);
    if (!validated.success) {
      return apiError(
        "VALIDATION_ERROR",
        "Validation failed",
        400,
        validated.error.flatten().fieldErrors
      );
    }

    const result = await toggleWishlistItem(validated.data.productId, session.user.id);

    if (!result.success) {
      let status = 400;
      if (result.error?.code === "NOT_FOUND") {
        status = 404;
      } else if (result.error?.code === "INTERNAL_SERVER_ERROR") {
        status = 500;
      }
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[POST /api/account/wishlist/toggle] Error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
