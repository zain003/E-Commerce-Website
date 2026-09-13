import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserOrders } from "@/lib/services/orders";
import { orderHistoryQuerySchema } from "@/lib/validators/orders";
import { apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const searchParams = req.nextUrl.searchParams;
    const pageRaw = searchParams.get("page") ?? undefined;
    const limitRaw = searchParams.get("limit") ?? undefined;

    const validatedQuery = orderHistoryQuerySchema.safeParse({
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

    const result = await getUserOrders(
      session.user.id,
      validatedQuery.data.page,
      validatedQuery.data.limit
    );

    if (!result.success) {
      const status = result.error?.code === "BAD_REQUEST" ? 400 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/account/orders] Error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
