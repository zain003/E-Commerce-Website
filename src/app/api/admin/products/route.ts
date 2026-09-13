import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminProducts, createAdminProduct } from "@/lib/services/admin-products";
import {
  adminProductQuerySchema,
  createProductSchema,
} from "@/lib/validators/admin-product";
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
    const pageRaw = searchParams.get("page") ?? undefined;
    const limitRaw = searchParams.get("limit") ?? undefined;

    const validatedQuery = adminProductQuerySchema.safeParse({
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

    const result = await getAdminProducts(
      validatedQuery.data.page,
      validatedQuery.data.limit
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/products] Error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (session.user.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Admin access required", 403);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("VALIDATION_ERROR", "Malformed JSON payload", 400);
    }

    const validatedBody = createProductSchema.safeParse(body);
    if (!validatedBody.success) {
      return apiError(
        "VALIDATION_ERROR",
        "Invalid product payload",
        400,
        validatedBody.error.flatten().fieldErrors
      );
    }

    const result = await createAdminProduct(validatedBody.data);

    if (!result.success) {
      if (result.error?.code === "CONFLICT") {
        return NextResponse.json(result, { status: 409 });
      }
      if (result.error?.code === "CATEGORY_NOT_FOUND") {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/products] Error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Internal server error occurred", 500);
  }
}
