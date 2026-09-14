import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("Orders Navigation Links (ISSUE-002)", () => {
  it("renders accessible links to /account/orders across header, mobile navigation, and footer", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const jsx = await ShopLayout({ children: <div>Store Content</div> });
    render(jsx);

    const orderLinks = screen.getAllByRole("link", { name: /orders/i });
    expect(orderLinks.length).toBeGreaterThanOrEqual(3);

    const hrefs = orderLinks.map((link) => link.getAttribute("href"));
    expect(hrefs.every((href) => href === "/account/orders")).toBe(true);
  });
});
