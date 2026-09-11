import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActiveFilters } from "@/components/search/active-filters";

const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/products",
}));

describe("ActiveFilters UI Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("renders nothing when no filters are active", () => {
    const { container } = render(<ActiveFilters />);
    expect(container.firstChild).toBeNull();
  });

  it("renders pills for query, category, price range, and in-stock filter", () => {
    mockSearchParams = new URLSearchParams(
      "q=jacket&category=apparel&minPrice=50&maxPrice=150&inStock=true"
    );

    render(
      <ActiveFilters
        query="jacket"
        categorySlug="apparel"
        categoryName="Apparel"
        minPrice={50}
        maxPrice={150}
        inStockOnly={true}
      />
    );

    expect(screen.getByText(/Search: "jacket"/i)).toBeTruthy();
    expect(screen.getByText(/Category: Apparel/i)).toBeTruthy();
    expect(screen.getByText(/Price: \$50 - \$150/i)).toBeTruthy();
    expect(screen.getByText(/In Stock Only/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /clear all/i })).toBeTruthy();
  });

  it("clicking 'x' on category pill removes only category filter from URL", async () => {
    mockSearchParams = new URLSearchParams("q=jacket&category=apparel&inStock=true");
    const user = userEvent.setup();

    render(
      <ActiveFilters
        query="jacket"
        categorySlug="apparel"
        categoryName="Apparel"
        inStockOnly={true}
      />
    );

    const removeCategoryBtn = screen.getByRole("button", {
      name: /remove category filter/i,
    });
    await user.click(removeCategoryBtn);

    const callUrl = mockReplace.mock.calls[0][0];
    expect(callUrl).toContain("q=jacket");
    expect(callUrl).not.toContain("category=");
  });

  it("clicking 'x' on price pill removes price bounds from URL", async () => {
    mockSearchParams = new URLSearchParams("minPrice=20&maxPrice=80");
    const user = userEvent.setup();

    render(<ActiveFilters minPrice={20} maxPrice={80} />);

    const removePriceBtn = screen.getByRole("button", {
      name: /remove price filter/i,
    });
    await user.click(removePriceBtn);

    const callUrl = mockReplace.mock.calls[0][0];
    expect(callUrl).not.toContain("minPrice=");
    expect(callUrl).not.toContain("maxPrice=");
  });

  it("clicking 'Clear all' button clears all active filters from URL", async () => {
    mockSearchParams = new URLSearchParams("q=jacket&category=apparel&inStock=true");
    const user = userEvent.setup();

    render(
      <ActiveFilters
        query="jacket"
        categorySlug="apparel"
        categoryName="Apparel"
        inStockOnly={true}
      />
    );

    const clearAllBtn = screen.getByRole("button", { name: /clear all/i });
    await user.click(clearAllBtn);

    expect(mockReplace.mock.calls[0][0]).toBe("/products");
  });
});
