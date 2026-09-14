import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PATCH } from "@/app/api/account/profile/route";
import { getServerSession } from "next-auth";
import * as authService from "@/lib/services/auth-service";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/services/auth-service", () => ({
  getCurrentUser: vi.fn(),
  updateProfile: vi.fn(),
}));

describe("PATCH /api/account/profile (ISSUE-008)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 UNAUTHORIZED when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Name" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 VALIDATION_ERROR when name is empty", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_1", email: "test@example.com", role: "CUSTOMER" },
    });

    const req = new NextRequest("http://localhost:3000/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 200 and updated user data upon successful profile update", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_1", email: "test@example.com", role: "CUSTOMER" },
    });

    vi.mocked(authService.updateProfile).mockResolvedValue({
      success: true,
      data: {
        id: "usr_1",
        name: "Jane Doe",
        email: "test@example.com",
        role: "CUSTOMER",
      },
      timestamp: new Date().toISOString(),
    });

    const req = new NextRequest("http://localhost:3000/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Jane Doe" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.name).toBe("Jane Doe");
    expect(authService.updateProfile).toHaveBeenCalledWith("usr_1", { name: "Jane Doe" });
  });
});
