import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileView } from "@/components/account/profile-view";
import ShopLayout from "@/app/(shop)/layout";
import { getServerSession } from "next-auth";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/components/layout/header-cart-button", () => ({
  HeaderCartButton: () => <div data-testid="header-cart-button">Cart</div>,
  MobileCartNavButton: () => <div data-testid="mobile-cart-button">Cart</div>,
}));

vi.mock("@/components/cart/cart-drawer", () => ({
  CartDrawer: () => <div data-testid="cart-drawer" />,
}));

describe("Admin Portal Link (ISSUE-003)", () => {
  it("renders Admin Portal card in ProfileView when user has ADMIN role", () => {
    render(
      <ProfileView
        user={{
          id: "usr_admin",
          name: "Admin User",
          email: "admin@store.com",
          role: "ADMIN",
          createdAt: new Date().toISOString(),
        }}
      />
    );

    const adminPortalLink = screen.getByRole("link", { name: /admin portal/i });
    expect(adminPortalLink).toBeTruthy();
    expect(adminPortalLink.getAttribute("href")).toBe("/admin/dashboard");
  });

  it("does not render Admin Portal card in ProfileView when user has CUSTOMER role", () => {
    render(
      <ProfileView
        user={{
          id: "usr_customer",
          name: "Regular Customer",
          email: "customer@store.com",
          role: "CUSTOMER",
          createdAt: new Date().toISOString(),
        }}
      />
    );

    expect(screen.queryByRole("link", { name: /admin portal/i })).toBeNull();
  });

  it("renders Admin link in ShopLayout header when user has ADMIN role", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_admin", name: "Admin", role: "ADMIN" },
    });

    const jsx = await ShopLayout({ children: <div>Content</div> });
    render(jsx);

    const adminLink = screen.getByRole("link", { name: /admin/i });
    expect(adminLink).toBeTruthy();
    expect(adminLink.getAttribute("href")).toBe("/admin/dashboard");
  });

  it("does not render Admin link in ShopLayout header for CUSTOMER or guest", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_cust", name: "Customer", role: "CUSTOMER" },
    });

    const jsx = await ShopLayout({ children: <div>Content</div> });
    render(jsx);

    expect(screen.queryByRole("link", { name: /^admin$/i })).toBeNull();
  });
});
