import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { GET as getWishlistRoute } from "@/app/api/account/wishlist/route";
import { POST as toggleWishlistRoute } from "@/app/api/account/wishlist/toggle/route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    wishlistItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Wishlist API — Authentication Guard (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/account/wishlist", () => {
    it("returns HTTP 401 UNAUTHORIZED when session is null", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/account/wishlist");
      const res = await getWishlistRoute(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe("UNAUTHORIZED");
    });

    it("returns HTTP 401 UNAUTHORIZED when session has no user ID", async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: "guest@example.com" },
      } as any);

      const req = new NextRequest("http://localhost:3000/api/account/wishlist");
      const res = await getWishlistRoute(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe("UNAUTHORIZED");
    });
  });

  describe("POST /api/account/wishlist/toggle", () => {
    it("returns HTTP 401 UNAUTHORIZED when session is null", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/account/wishlist/toggle", {
        method: "POST",
        body: JSON.stringify({ productId: "prod_1" }),
      });
      const res = await toggleWishlistRoute(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe("UNAUTHORIZED");
    });

    it("returns HTTP 401 UNAUTHORIZED when session has no user ID", async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { name: "Guest" },
      } as any);

      const req = new NextRequest("http://localhost:3000/api/account/wishlist/toggle", {
        method: "POST",
        body: JSON.stringify({ productId: "prod_1" }),
      });
      const res = await toggleWishlistRoute(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe("UNAUTHORIZED");
    });
  });
});
