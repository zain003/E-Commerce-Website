import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeaderAccountButton } from "@/components/layout/header-account-button";

describe("HeaderAccountButton Component (UI)", () => {
  it("renders link to /login with accessible label when unauthenticated", () => {
    render(<HeaderAccountButton user={null} />);

    const link = screen.getByRole("link", { name: /sign in to your account/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/login");
    expect(link.textContent).toContain("Account");
  });

  it("renders link to /account/profile with first name when authenticated with user name", () => {
    render(
      <HeaderAccountButton
        user={{
          id: "usr_1",
          name: "Alice Wonderland",
          email: "alice@example.com",
          role: "CUSTOMER",
        }}
      />
    );

    const link = screen.getByRole("link", { name: /view your account profile/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/account/profile");
    expect(link.textContent).toContain("Alice");
  });

  it("renders link to /account/profile with fallback Account label when authenticated without user name", () => {
    render(
      <HeaderAccountButton
        user={{
          id: "usr_2",
          name: null,
          email: "user@example.com",
          role: "CUSTOMER",
        }}
      />
    );

    const link = screen.getByRole("link", { name: /view your account profile/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/account/profile");
    expect(link.textContent).toContain("Account");
  });
});
