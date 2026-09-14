import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminOrders } from "@/lib/services/admin-orders";
import { adminOrderQuerySchema } from "@/lib/validators/admin-orders";
import { apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (session.user.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Admin access required", 403);
    }

    const searchParams = req.nextUrl.searchParams;
    const statusRaw = searchParams.get("status") ?? undefined;
    const pageRaw = searchParams.get("page") ?? undefined;
    const limitRaw = searchParams.get("limit") ?? undefined;

    const validatedQuery = adminOrderQuerySchema.safeParse({
      status: statusRaw,
      page: pageRaw,
      limit: limitRaw,
    });

    if (!validatedQuery.success) {
      return apiError(
        "VALIDATION_ERROR",
        "Invalid query parameters",
        400,
        validatedQuery.error.flatten().fieldErrors
      );
    }

    const result = await getAdminOrders(
      validatedQuery.data.status,
      validatedQuery.data.page,
      validatedQuery.data.limit
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/orders] Error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
