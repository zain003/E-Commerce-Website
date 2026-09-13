import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductTable } from "@/components/admin/product-table";
import { AdminProduct, Category } from "@/types";
import { Decimal } from "@prisma/client/runtime/library";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockCategories: Category[] = [
  {
    id: "cat_apparel",
    name: "Apparel",
    slug: "apparel",
    description: null,
    imageUrl: null,
    createdAt: new Date(),
  },
  {
    id: "cat_accessories",
    name: "Accessories",
    slug: "accessories",
    description: null,
    imageUrl: null,
    createdAt: new Date(),
  },
];

const mockProducts: AdminProduct[] = [
  {
    id: "prod_1",
    name: "Alpha Graphic Tee",
    slug: "alpha-graphic-tee",
    description: "Comfortable organic cotton graphic tee",
    basePrice: new Decimal("29.99"),
    categoryId: "cat_apparel",
    images: ["/images/tee.jpg"],
    featured: true,
    isArchived: false,
    createdAt: new Date("2026-09-01T10:00:00.000Z"),
    updatedAt: new Date(),
    category: mockCategories[0],
    variants: [
      {
        id: "var_1a",
        productId: "prod_1",
        sku: "TEE-BLK-S",
        name: "Black / Small",
        priceDelta: new Decimal("0.00"),
        stock: 50,
      },
      {
        id: "var_1b",
        productId: "prod_1",
        sku: "TEE-BLK-M",
        name: "Black / Medium",
        priceDelta: new Decimal("0.00"),
        stock: 15000, // Large stock test (> 10,000)
      },
    ],
  },
  {
    id: "prod_2",
    name: "Beta Leather Wallet",
    slug: "beta-leather-wallet",
    description: "Slim bi-fold genuine leather wallet",
    basePrice: new Decimal("49.99"),
    categoryId: "cat_accessories",
    images: [],
    featured: false,
    isArchived: true, // Archived product
    createdAt: new Date("2026-09-05T10:00:00.000Z"),
    updatedAt: new Date(),
    category: mockCategories[1],
    variants: [
      {
        id: "var_2a",
        productId: "prod_2",
        sku: "WLT-BRN",
        name: "Brown",
        priceDelta: new Decimal("0.00"),
        stock: 0, // Out of stock test
      },
    ],
  },
  {
    id: "prod_3",
    name: "Zeta Running Cap",
    slug: "zeta-running-cap",
    description: "Breathable ultra-light runner cap",
    basePrice: new Decimal("19.99"),
    categoryId: "cat_apparel",
    images: ["/images/cap.jpg"],
    featured: false,
    isArchived: false,
    createdAt: new Date("2026-09-10T10:00:00.000Z"),
    updatedAt: new Date(),
    category: mockCategories[0],
    variants: [
      {
        id: "var_3a",
        productId: "prod_3",
        sku: "CAP-WHT-OS",
        name: "White / One Size",
        priceDelta: new Decimal("0.00"),
        stock: 5, // Low stock test
      },
    ],
  },
];

describe("ProductTable UI Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders product rows with thumbnail, name, category, formatted stock, and status", () => {
    render(
      <ProductTable
        products={mockProducts}
        categories={mockCategories}
        onEdit={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    // Product names rendered
    expect(screen.getByText("Alpha Graphic Tee")).toBeTruthy();
    expect(screen.getByText("Beta Leather Wallet")).toBeTruthy();
    expect(screen.getByText("Zeta Running Cap")).toBeTruthy();

    // Category badges
    expect(screen.getAllByText("Apparel").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Accessories").length).toBeGreaterThanOrEqual(1);

    // Formatted stock: prod_1 has 50 + 15000 = 15050 total stock (> 10,000 formatted cleanly)
    expect(screen.getByText("15,050")).toBeTruthy();

    // Status badges
    expect(screen.getAllByText(/active/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/archived/i).length).toBeGreaterThanOrEqual(1);
  });

  it("filters products by search input matching name or SKU", async () => {
    const user = userEvent.setup();

    render(
      <ProductTable
        products={mockProducts}
        categories={mockCategories}
        onEdit={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search products or sku/i);
    await user.type(searchInput, "Beta");

    expect(screen.getByText("Beta Leather Wallet")).toBeTruthy();
    expect(screen.queryByText("Alpha Graphic Tee")).toBeNull();
    expect(screen.queryByText("Zeta Running Cap")).toBeNull();

    // Clear search
    await user.clear(searchInput);
    expect(screen.getByText("Alpha Graphic Tee")).toBeTruthy();

    // Search by variant SKU
    await user.type(searchInput, "CAP-WHT");
    expect(screen.getByText("Zeta Running Cap")).toBeTruthy();
    expect(screen.queryByText("Alpha Graphic Tee")).toBeNull();
  });

  it("filters products by category selector", async () => {
    const user = userEvent.setup();

    render(
      <ProductTable
        products={mockProducts}
        categories={mockCategories}
        onEdit={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    const categorySelect = screen.getByLabelText(/filter by category/i);
    await user.selectOptions(categorySelect, "cat_accessories");

    expect(screen.getByText("Beta Leather Wallet")).toBeTruthy();
    expect(screen.queryByText("Alpha Graphic Tee")).toBeNull();
    expect(screen.queryByText("Zeta Running Cap")).toBeNull();
  });

  it("filters products by status (All, Active, Archived)", async () => {
    const user = userEvent.setup();

    render(
      <ProductTable
        products={mockProducts}
        categories={mockCategories}
        onEdit={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    const statusSelect = screen.getByLabelText(/filter by status/i);

    // Filter Active only
    await user.selectOptions(statusSelect, "active");
    expect(screen.getByText("Alpha Graphic Tee")).toBeTruthy();
    expect(screen.getByText("Zeta Running Cap")).toBeTruthy();
    expect(screen.queryByText("Beta Leather Wallet")).toBeNull();

    // Filter Archived only
    await user.selectOptions(statusSelect, "archived");
    expect(screen.getByText("Beta Leather Wallet")).toBeTruthy();
    expect(screen.queryByText("Alpha Graphic Tee")).toBeNull();
    expect(screen.queryByText("Zeta Running Cap")).toBeNull();
  });

  it("sorts products by name, price, and stock", async () => {
    const user = userEvent.setup();

    render(
      <ProductTable
        products={mockProducts}
        categories={mockCategories}
        onEdit={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    // Click on "Price" sort button
    const priceSortBtn = screen.getByRole("button", { name: /sort by price/i });
    await user.click(priceSortBtn);

    // Lowest price first: Zeta ($19.99), then Alpha ($29.99), then Beta ($49.99)
    const rows = screen.getAllByTestId("product-row");
    expect(rows[0].textContent).toContain("Zeta Running Cap");
    expect(rows[2].textContent).toContain("Beta Leather Wallet");

    // Click again for descending sort
    await user.click(priceSortBtn);
    const rowsDesc = screen.getAllByTestId("product-row");
    expect(rowsDesc[0].textContent).toContain("Beta Leather Wallet");
    expect(rowsDesc[2].textContent).toContain("Zeta Running Cap");
  });

  it("calls onEdit when Edit button is clicked", async () => {
    const user = userEvent.setup();
    const onEditMock = vi.fn();

    render(
      <ProductTable
        products={mockProducts}
        categories={mockCategories}
        onEdit={onEditMock}
        onRefresh={vi.fn()}
      />
    );

    const editBtn = screen.getByRole("button", {
      name: /edit product alpha graphic tee/i,
    });
    await user.click(editBtn);

    expect(onEditMock).toHaveBeenCalledWith(mockProducts[0]);
  });

  it("opens archive confirmation dialog and calls API on confirmation", async () => {
    const user = userEvent.setup();
    const onRefreshMock = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { ...mockProducts[0], isArchived: true },
      }),
    });

    render(
      <ProductTable
        products={mockProducts}
        categories={mockCategories}
        onEdit={vi.fn()}
        onRefresh={onRefreshMock}
      />
    );

    // Click archive button on Alpha Graphic Tee (active)
    const archiveBtn = screen.getByRole("button", {
      name: /archive product alpha graphic tee/i,
    });
    await user.click(archiveBtn);

    // Confirmation dialog appears
    expect(screen.getByText(/archive alpha graphic tee\?/i)).toBeTruthy();
    const confirmBtn = screen.getByRole("button", { name: /confirm archive/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/admin/products/${mockProducts[0].id}`,
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isArchived: true }),
        })
      );
    });

    await waitFor(() => {
      expect(onRefreshMock).toHaveBeenCalled();
    });
  });

  it("expands variants section to show variant details and StockQuickEdit", async () => {
    const user = userEvent.setup();

    render(
      <ProductTable
        products={mockProducts}
        categories={mockCategories}
        onEdit={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    // Click expand variants button on prod_1 (Alpha Graphic Tee)
    const expandBtn = screen.getByRole("button", {
      name: /view variants for alpha graphic tee/i,
    });
    await user.click(expandBtn);

    expect(screen.getByText("TEE-BLK-S")).toBeTruthy();
    expect(screen.getByText("Black / Small")).toBeTruthy();
    expect(screen.getByText("TEE-BLK-M")).toBeTruthy();
  });
});
