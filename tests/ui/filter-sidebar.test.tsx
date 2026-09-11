import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { Category } from "@/types";

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

describe("FilterSidebar UI Component", () => {
  const mockCategories: Category[] = [
    {
      id: "cat-1",
      name: "Apparel",
      slug: "apparel",
      description: "Clothing items",
      imageUrl: null,
      createdAt: new Date(),
    },
    {
      id: "cat-2",
      name: "Accessories",
      slug: "accessories",
      description: "Everyday accessories",
      imageUrl: null,
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("renders all categories, price filter inputs, and in-stock checkbox", () => {
    render(<FilterSidebar categories={mockCategories} />);

    expect(screen.getByText("Filters")).toBeTruthy();
    expect(screen.getByText("Categories")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Apparel" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Accessories" })).toBeTruthy();
    expect(screen.getByLabelText(/min price/i)).toBeTruthy();
    expect(screen.getByLabelText(/max price/i)).toBeTruthy();
    expect(screen.getByLabelText(/in stock only/i)).toBeTruthy();
  });

  it("selecting category updates URL with category slug and resets page", async () => {
    const user = userEvent.setup();
    render(<FilterSidebar categories={mockCategories} />);

    const categoryBtn = screen.getByRole("button", { name: "Apparel" });
    await user.click(categoryBtn);

    expect(mockReplace.mock.calls[0][0]).toContain("category=apparel");
  });

  it("clicking an already selected category unselects it and removes category param", async () => {
    mockSearchParams = new URLSearchParams("category=apparel");
    const user = userEvent.setup();
    render(<FilterSidebar categories={mockCategories} selectedCategory="apparel" />);

    const categoryBtn = screen.getByRole("button", { name: "Apparel" });
    await user.click(categoryBtn);

    expect(mockReplace.mock.calls[0][0]).not.toContain("category=");
  });

  it("applies price range filters when user fills inputs and clicks Apply", async () => {
    const user = userEvent.setup();
    render(<FilterSidebar categories={mockCategories} />);

    const minInput = screen.getByLabelText(/min price/i);
    const maxInput = screen.getByLabelText(/max price/i);
    const applyButton = screen.getByRole("button", { name: /apply price/i });

    await user.type(minInput, "25");
    await user.type(maxInput, "100");
    await user.click(applyButton);

    const callUrl = mockReplace.mock.calls[0][0];
    expect(callUrl).toMatch(/minPrice=25.*maxPrice=100|maxPrice=100.*minPrice=25/);
  });

  it("toggles in-stock only filter and updates URL with inStock=true", async () => {
    const user = userEvent.setup();
    render(<FilterSidebar categories={mockCategories} />);

    const inStockCheckbox = screen.getByLabelText(/in stock only/i);
    await user.click(inStockCheckbox);

    expect(mockReplace.mock.calls[0][0]).toContain("inStock=true");
  });

  it("renders Reset All button when active filters exist, clicking it resets filters", async () => {
    mockSearchParams = new URLSearchParams("category=apparel&minPrice=20&inStock=true");
    const user = userEvent.setup();
    render(
      <FilterSidebar
        categories={mockCategories}
        selectedCategory="apparel"
        minPrice={20}
        inStockOnly={true}
      />
    );

    const resetButton = screen.getByRole("button", { name: /clear all/i });
    expect(resetButton).toBeTruthy();

    await user.click(resetButton);
    expect(mockReplace.mock.calls[0][0]).toBe("/products");
  });
});
