import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminRootPage from "@/app/admin/page";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

describe("Admin Root Route /admin (ISSUE-004)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to login with admin callbackUrl", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    await AdminRootPage();

    expect(redirect).toHaveBeenCalledWith("/login?callbackUrl=/admin/dashboard");
  });

  it("redirects non-admin customers to /unauthorized", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_cust", name: "Customer", role: "CUSTOMER" },
    });

    await AdminRootPage();

    expect(redirect).toHaveBeenCalledWith("/unauthorized");
  });

  it("redirects authenticated admin to /admin/dashboard", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_admin", name: "Admin", role: "ADMIN" },
    });

    await AdminRootPage();

    expect(redirect).toHaveBeenCalledWith("/admin/dashboard");
  });
});
