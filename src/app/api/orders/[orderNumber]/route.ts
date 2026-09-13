import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrderByNumber } from "@/lib/services/orders";
import { orderLookupQuerySchema } from "@/lib/validators/orders";
import { apiError } from "@/lib/api-response";

interface RouteContext {
  params: Promise<{
    orderNumber: string;
  }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { orderNumber } = await context.params;

    if (!orderNumber || orderNumber.trim() === "") {
      return apiError("BAD_REQUEST", "Order number is required", 400);
    }

    const searchParams = req.nextUrl.searchParams;
    const guestEmailParam = searchParams.get("guestEmail");

    let guestEmail: string | undefined = undefined;
    if (guestEmailParam !== null) {
      const validatedQuery = orderLookupQuerySchema.safeParse({
        guestEmail: guestEmailParam,
      });

      if (!validatedQuery.success) {
        return apiError(
          "VALIDATION_ERROR",
          "Invalid query parameters",
          400,
          validatedQuery.error.flatten().fieldErrors
        );
      }

      guestEmail = validatedQuery.data.guestEmail;
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const result = await getOrderByNumber(orderNumber, guestEmail, userId);

    if (!result.success) {
      const status =
        result.error?.code === "NOT_FOUND"
          ? 404
          : result.error?.code === "FORBIDDEN"
          ? 403
          : result.error?.code === "BAD_REQUEST"
          ? 400
          : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/orders/[orderNumber]] Error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
