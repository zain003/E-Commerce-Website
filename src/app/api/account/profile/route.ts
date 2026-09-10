import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/services/auth-service";
import { apiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const result = await getCurrentUser(session.user.id);

    if (!result.success) {
      const status = result.error?.code === "USER_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
