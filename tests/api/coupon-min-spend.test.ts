import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as validateCouponRoute } from "@/app/api/coupons/validate/route";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    coupon: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe("POST /api/coupons/validate — Minimum Spend & Usage Limits (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns HTTP 400 MINIMUM_SPEND_NOT_MET when cartSubtotal is less than minSpend", async () => {
    vi.mocked(prisma.coupon.findFirst).mockResolvedValue({
      id: "coup_vip",
      code: "VIP50",
      discountType: "FIXED_AMOUNT",
      discountValue: new Decimal("50.00"),
      minSpend: new Decimal("200.00"),
      maxUses: 100,
      usedCount: 10,
      expiresAt: null,
      isActive: true,
      createdAt: new Date(),
    } as any);

    const req = new NextRequest("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      body: JSON.stringify({
        code: "VIP50",
        cartSubtotal: 150.0, // below 200 minSpend
      }),
    });

    const res = await validateCouponRoute(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error?.code).toBe("MINIMUM_SPEND_NOT_MET");
    expect(body.error?.message).toContain("200");
  });

  it("accepts coupon when cartSubtotal meets minSpend exactly or exceeds it", async () => {
    vi.mocked(prisma.coupon.findFirst).mockResolvedValue({
      id: "coup_vip",
      code: "VIP50",
      discountType: "FIXED_AMOUNT",
      discountValue: new Decimal("50.00"),
      minSpend: new Decimal("200.00"),
      maxUses: 100,
      usedCount: 10,
      expiresAt: null,
      isActive: true,
      createdAt: new Date(),
    } as any);

    const req = new NextRequest("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      body: JSON.stringify({
        code: "VIP50",
        cartSubtotal: 200.0,
      }),
    });

    const res = await validateCouponRoute(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.discountAmount).toBe(50.0);
    expect(body.data.newTotal).toBe(150.0);
  });

  it("returns HTTP 400 COUPON_MAX_USES_REACHED when usedCount equals or exceeds maxUses", async () => {
    vi.mocked(prisma.coupon.findFirst).mockResolvedValue({
      id: "coup_exhausted",
      code: "FLASH100",
      discountType: "PERCENTAGE",
      discountValue: new Decimal("50.00"),
      minSpend: null,
      maxUses: 10,
      usedCount: 10, // fully used
      expiresAt: null,
      isActive: true,
      createdAt: new Date(),
    } as any);

    const req = new NextRequest("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      body: JSON.stringify({
        code: "FLASH100",
        cartSubtotal: 100.0,
      }),
    });

    const res = await validateCouponRoute(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error?.code).toBe("COUPON_MAX_USES_REACHED");
  });

  it("returns HTTP 400 VALIDATION_ERROR when coupon code is empty or missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      body: JSON.stringify({
        code: "",
        cartSubtotal: 100,
      }),
    });

    const res = await validateCouponRoute(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error?.code).toBe("VALIDATION_ERROR");
  });

  it("returns HTTP 400 BAD_REQUEST when JSON payload is malformed", async () => {
    const req = new NextRequest("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      body: "{invalid-json",
    });

    const res = await validateCouponRoute(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error?.code).toBe("BAD_REQUEST");
  });
});
