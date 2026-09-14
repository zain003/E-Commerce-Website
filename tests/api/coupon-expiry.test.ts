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

describe("POST /api/coupons/validate — Expiry & Status Verification (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns HTTP 400 COUPON_EXPIRED when coupon expiration date has passed", async () => {
    const expiredDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // 1 day ago

    vi.mocked(prisma.coupon.findFirst).mockResolvedValue({
      id: "coup_1",
      code: "SUMMER20",
      discountType: "PERCENTAGE",
      discountValue: new Decimal("20.00"),
      minSpend: null,
      maxUses: null,
      usedCount: 5,
      expiresAt: expiredDate,
      isActive: true,
      createdAt: new Date(),
    } as any);

    const req = new NextRequest("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      body: JSON.stringify({
        code: "SUMMER20",
        cartSubtotal: 100,
      }),
    });

    const res = await validateCouponRoute(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error?.code).toBe("COUPON_EXPIRED");
  });

  it("returns HTTP 400 COUPON_INACTIVE when coupon isActive is false", async () => {
    vi.mocked(prisma.coupon.findFirst).mockResolvedValue({
      id: "coup_inactive",
      code: "OFFLINE10",
      discountType: "FIXED_AMOUNT",
      discountValue: new Decimal("10.00"),
      minSpend: null,
      maxUses: null,
      usedCount: 0,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      isActive: false,
      createdAt: new Date(),
    } as any);

    const req = new NextRequest("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      body: JSON.stringify({
        code: "OFFLINE10",
        cartSubtotal: 50,
      }),
    });

    const res = await validateCouponRoute(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error?.code).toBe("COUPON_INACTIVE");
  });

  it("returns HTTP 400 COUPON_NOT_FOUND when coupon code does not exist in database", async () => {
    vi.mocked(prisma.coupon.findFirst).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      body: JSON.stringify({
        code: "NONEXISTENT",
        cartSubtotal: 100,
      }),
    });

    const res = await validateCouponRoute(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error?.code).toBe("COUPON_NOT_FOUND");
  });

  it("accepts valid active coupon with future expiration date and trims whitespace", async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days in future

    vi.mocked(prisma.coupon.findFirst).mockResolvedValue({
      id: "coup_valid",
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      discountValue: new Decimal("10.00"),
      minSpend: null,
      maxUses: null,
      usedCount: 0,
      expiresAt: futureDate,
      isActive: true,
      createdAt: new Date(),
    } as any);

    const req = new NextRequest("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      body: JSON.stringify({
        code: "  welcome10  ",
        cartSubtotal: 150,
      }),
    });

    const res = await validateCouponRoute(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({
      valid: true,
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      discountAmount: 15,
      newTotal: 135,
      minSpend: null,
    });
  });
});
