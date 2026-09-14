import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-response";
import { getWishlist } from "@/lib/services/wishlist";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required to access wishlist", 401);
    }

    const result = await getWishlist(session.user.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/account/wishlist] Error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
