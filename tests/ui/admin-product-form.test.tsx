import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductFormModal } from "@/components/admin/product-form-modal";
import { Category, AdminProduct } from "@/types";
import { Decimal } from "@prisma/client/runtime/library";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockCategories: Category[] = [
  {
    id: "cat_apparel",
    name: "Apparel",
    slug: "apparel",
    description: "Apparel items",
    imageUrl: null,
    createdAt: new Date(),
  },
  {
    id: "cat_footwear",
    name: "Footwear",
    slug: "footwear",
    description: "Shoes and boots",
    imageUrl: null,
    createdAt: new Date(),
  },
];

const mockExistingProduct: AdminProduct = {
  id: "prod_1",
  name: "Classic Denim Jacket",
  slug: "classic-denim-jacket",
  description: "A vintage denim jacket with brass buttons",
  basePrice: new Decimal("89.99"),
  categoryId: "cat_apparel",
  images: ["https://images.unsplash.com/photo-1"],
  featured: true,
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  category: mockCategories[0],
  variants: [
    {
      id: "var_1",
      productId: "prod_1",
      sku: "JKT-DNM-S",
      name: "Small",
      priceDelta: new Decimal("0.00"),
      stock: 12,
    },
    {
      id: "var_2",
      productId: "prod_1",
      sku: "JKT-DNM-M",
      name: "Medium",
      priceDelta: new Decimal("5.00"),
      stock: 8,
    },
  ],
};

describe("ProductFormModal UI Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders create product form with all fields when product prop is null", () => {
    render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        categories={mockCategories}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: /create product/i })).toBeTruthy();
    expect(screen.getByLabelText(/product name/i)).toBeTruthy();
    expect(screen.getByLabelText(/slug/i)).toBeTruthy();
    expect(screen.getByLabelText(/category/i)).toBeTruthy();
    expect(screen.getByLabelText(/description/i)).toBeTruthy();
    expect(screen.getByLabelText(/base price/i)).toBeTruthy();
    expect(screen.getByLabelText(/featured/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /add variant/i })).toBeTruthy();
  });

  it("displays inline field-level validation errors when required fields are empty upon submission", async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        categories={mockCategories}
        onSuccess={onSuccessMock}
      />
    );

    // Click submit button without filling fields
    const submitBtn = screen.getByRole("button", { name: /create product/i });
    await user.click(submitBtn);

    expect(await screen.findByText(/product name is required/i)).toBeTruthy();
    expect(screen.getByText(/slug is required/i)).toBeTruthy();
    expect(screen.getByText(/description is required/i)).toBeTruthy();
    expect(screen.getByText(/category is required/i)).toBeTruthy();
    expect(mockFetch).not.toHaveBeenCalled();
    expect(onSuccessMock).not.toHaveBeenCalled();
  });

  it("auto-generates slug from product name when generate button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        categories={mockCategories}
        onSuccess={vi.fn()}
      />
    );

    const nameInput = screen.getByLabelText(/product name/i);
    await user.type(nameInput, "Premium Wool Sweater 2026!");

    const generateSlugBtn = screen.getByRole("button", { name: /generate/i });
    await user.click(generateSlugBtn);

    const slugInput = screen.getByLabelText(/slug/i) as HTMLInputElement;
    expect(slugInput.value).toBe("premium-wool-sweater-2026");
  });

  it("displays immediate error when adding multiple variants with duplicate SKUs", async () => {
    const user = userEvent.setup();

    render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        categories={mockCategories}
        onSuccess={vi.fn()}
      />
    );

    // First variant row SKU
    const skuInputs = screen.getAllByLabelText(/sku/i);
    await user.type(skuInputs[0], "DUPLICATE-SKU");

    // Add a second variant row
    const addVariantBtn = screen.getByRole("button", { name: /add variant/i });
    await user.click(addVariantBtn);

    // Type duplicate SKU in the second row
    const updatedSkuInputs = screen.getAllByLabelText(/sku/i);
    expect(updatedSkuInputs.length).toBe(2);
    await user.type(updatedSkuInputs[1], "DUPLICATE-SKU");

    // Immediate error should appear
    expect(await screen.findByText(/duplicate sku/i)).toBeTruthy();
  });

  it("can add and remove variant rows dynamically", async () => {
    const user = userEvent.setup();

    render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        categories={mockCategories}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getAllByLabelText(/sku/i).length).toBe(1);

    // Add second variant
    await user.click(screen.getByRole("button", { name: /add variant/i }));
    expect(screen.getAllByLabelText(/sku/i).length).toBe(2);

    // Add third variant
    await user.click(screen.getByRole("button", { name: /add variant/i }));
    expect(screen.getAllByLabelText(/sku/i).length).toBe(3);

    // Remove third variant
    const removeButtons = screen.getAllByRole("button", { name: /remove variant/i });
    await user.click(removeButtons[removeButtons.length - 1]);
    expect(screen.getAllByLabelText(/sku/i).length).toBe(2);
  });

  it("submits valid product payload to POST /api/admin/products and calls onSuccess", async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();
    const onCloseMock = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: "prod_new_1",
          name: "Leather Oxford Shoes",
          slug: "leather-oxford-shoes",
        },
      }),
    });

    render(
      <ProductFormModal
        isOpen={true}
        onClose={onCloseMock}
        categories={mockCategories}
        onSuccess={onSuccessMock}
      />
    );

    await user.type(screen.getByLabelText(/product name/i), "Leather Oxford Shoes");
    await user.type(screen.getByLabelText(/slug/i), "leather-oxford-shoes");
    await user.selectOptions(screen.getByLabelText(/category/i), "cat_footwear");
    await user.type(screen.getByLabelText(/description/i), "Handcrafted genuine leather oxford shoes");
    await user.clear(screen.getByLabelText(/base price/i));
    await user.type(screen.getByLabelText(/base price/i), "149.99");

    const skuInput = screen.getAllByLabelText(/sku/i)[0];
    const varNameInput = screen.getAllByLabelText(/variant name/i)[0];
    const stockInput = screen.getAllByLabelText(/stock/i)[0];

    await user.type(skuInput, "SHOE-OXF-42");
    await user.type(varNameInput, "Size 42");
    await user.clear(stockInput);
    await user.type(stockInput, "15");

    const submitBtn = screen.getByRole("button", { name: /create product/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/admin/products",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Leather Oxford Shoes",
            slug: "leather-oxford-shoes",
            description: "Handcrafted genuine leather oxford shoes",
            basePrice: 149.99,
            categoryId: "cat_footwear",
            images: [],
            featured: false,
            variants: [
              {
                sku: "SHOE-OXF-42",
                name: "Size 42",
                priceDelta: 0,
                stock: 15,
              },
            ],
          }),
        })
      );
    });

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it("pre-populates existing product data and sends PATCH /api/admin/products/:id in edit mode", async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();
    const onCloseMock = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          ...mockExistingProduct,
          name: "Updated Denim Jacket",
        },
      }),
    });

    render(
      <ProductFormModal
        isOpen={true}
        onClose={onCloseMock}
        product={mockExistingProduct}
        categories={mockCategories}
        onSuccess={onSuccessMock}
      />
    );

    expect(screen.getByRole("heading", { name: /edit product/i })).toBeTruthy();
    const nameInput = screen.getByLabelText(/product name/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Classic Denim Jacket");

    await user.clear(nameInput);
    await user.type(nameInput, "Updated Denim Jacket");

    const submitBtn = screen.getByRole("button", { name: /save changes/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/admin/products/${mockExistingProduct.id}`,
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it("displays server error alert when API returns 409 conflict", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        success: false,
        error: { code: "CONFLICT", message: "Product with slug 'duplicate-slug' already exists" },
      }),
    });

    render(
      <ProductFormModal
        isOpen={true}
        onClose={vi.fn()}
        categories={mockCategories}
        onSuccess={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/product name/i), "Some Product");
    await user.type(screen.getByLabelText(/slug/i), "duplicate-slug");
    await user.selectOptions(screen.getByLabelText(/category/i), "cat_apparel");
    await user.type(screen.getByLabelText(/description/i), "Some description");
    await user.clear(screen.getByLabelText(/base price/i));
    await user.type(screen.getByLabelText(/base price/i), "29.99");

    const skuInput = screen.getAllByLabelText(/sku/i)[0];
    const varNameInput = screen.getAllByLabelText(/variant name/i)[0];
    await user.type(skuInput, "SOME-SKU");
    await user.type(varNameInput, "Default");

    await user.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
      expect(screen.getByText(/product with slug 'duplicate-slug' already exists/i)).toBeTruthy();
    });
  });
});
