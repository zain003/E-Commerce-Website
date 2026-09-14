import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
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

describe("Storefront Footer Navigation (ISSUE-006)", () => {
  it("renders organized, accessible links to core destinations in the footer", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const jsx = await ShopLayout({ children: <div>Page Content</div> });
    render(jsx);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeTruthy();

    const footerScope = within(footer);

    // Shop links
    expect(footerScope.getByRole("link", { name: /all products/i }).getAttribute("href")).toBe("/products");
    expect(footerScope.getByRole("link", { name: /categories/i }).getAttribute("href")).toBe("/#categories");

    // Account links
    expect(footerScope.getByRole("link", { name: /my orders/i }).getAttribute("href")).toBe("/account/orders");
    expect(footerScope.getByRole("link", { name: /saved wishlist/i }).getAttribute("href")).toBe("/account/wishlist");
    expect(footerScope.getByRole("link", { name: /saved addresses/i }).getAttribute("href")).toBe("/account/addresses");
    expect(footerScope.getByRole("link", { name: /profile settings/i }).getAttribute("href")).toBe("/account/profile");
  });
});
