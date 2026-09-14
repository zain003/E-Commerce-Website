import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UnauthorizedPage from "@/app/unauthorized/page";

describe("UnauthorizedPage (UI)", () => {
  it("renders 403 heading and defaults Sign in as Admin button to /admin/dashboard", async () => {
    const Component = await UnauthorizedPage({});
    render(Component);

    expect(screen.getByRole("heading", { name: /403 — access denied/i })).toBeTruthy();
    const adminLoginLink = screen.getByRole("link", { name: /sign in as admin/i });
    expect(adminLoginLink.getAttribute("href")).toBe("/login?callbackUrl=%2Fadmin%2Fdashboard");

    const storefrontLink = screen.getByRole("link", { name: /back to storefront/i });
    expect(storefrontLink.getAttribute("href")).toBe("/");
  });

  it("preserves attempted callbackUrl when passed in searchParams", async () => {
    const Component = await UnauthorizedPage({
      searchParams: Promise.resolve({ callbackUrl: "/admin/orders" }),
    });
    render(Component);

    const adminLoginLink = screen.getByRole("link", { name: /sign in as admin/i });
    expect(adminLoginLink.getAttribute("href")).toBe("/login?callbackUrl=%2Fadmin%2Forders");
  });
});
