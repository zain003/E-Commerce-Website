import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => "/products/classic-shirt"),
}));

describe("WishlistButton Component (UI)", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    } as any);

    global.fetch = vi.fn();
  });

  it("renders with un-wishlisted state by default and accessible ARIA label", () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "usr_1" } },
      status: "authenticated",
    } as any);

    render(<WishlistButton productId="prod_1" />);

    const button = screen.getByRole("button", { name: /add to wishlist/i });
    expect(button).toBeTruthy();
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("toggles to wishlisted state immediately and fires API toggle request when clicked", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "usr_1" } },
      status: "authenticated",
    } as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { isWishlisted: true, productId: "prod_1" },
      }),
    } as any);

    render(<WishlistButton productId="prod_1" />);

    const button = screen.getByRole("button", { name: /add to wishlist/i });
    fireEvent.click(button);

    // Optimistic state change
    expect(button.getAttribute("aria-label")).toBe("Remove from wishlist");
    expect(button.getAttribute("aria-pressed")).toBe("true");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/account/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "prod_1" }),
      });
    });
  });

  it("toggles back to un-wishlisted state when clicked again", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "usr_1" } },
      status: "authenticated",
    } as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { isWishlisted: false, productId: "prod_1" },
      }),
    } as any);

    render(<WishlistButton productId="prod_1" initialWishlisted={true} />);

    const button = screen.getByRole("button", { name: /remove from wishlist/i });
    expect(button.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(button);

    expect(button.getAttribute("aria-label")).toBe("Add to wishlist");
    expect(button.getAttribute("aria-pressed")).toBe("false");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/account/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "prod_1" }),
      });
    });
  });

  it("redirects unauthenticated users to login page when clicked", () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: "unauthenticated",
    } as any);

    render(<WishlistButton productId="prod_1" />);

    const button = screen.getByRole("button", { name: /add to wishlist/i });
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith("/login?callbackUrl=%2Fproducts%2Fclassic-shirt");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("reverts state if the API toggle request fails", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "usr_1" } },
      status: "authenticated",
    } as any);

    vi.mocked(global.fetch).mockRejectedValue(new Error("Network Error"));

    render(<WishlistButton productId="prod_1" initialWishlisted={false} />);

    const button = screen.getByRole("button", { name: /add to wishlist/i });
    fireEvent.click(button);

    // After failure, it rolls back
    await waitFor(() => {
      expect(button.getAttribute("aria-label")).toBe("Add to wishlist");
      expect(button.getAttribute("aria-pressed")).toBe("false");
    });
  });
});
