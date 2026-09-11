import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatalogView } from "@/components/search/catalog-view";
import { Decimal } from "@prisma/client/runtime/library";
import { Category } from "@/types";

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
    fill,
    priority,
    sizes,
    ...props
  }: {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} data-fill={fill ? "true" : undefined} {...props} />;
  },
}));

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

describe("CatalogView UI Component", () => {
  const mockCategories: Category[] = [
    {
      id: "cat-1",
      name: "Apparel",
      slug: "apparel",
      description: "Clothing items",
      imageUrl: null,
      createdAt: new Date(),
    },
  ];

  const mockProducts = [
    {
      id: "prod-1",
      name: "Everyday Oxford Shirt",
      slug: "everyday-oxford-shirt",
      description: "Classic oxford button-down shirt.",
      basePrice: new Decimal("64.00"),
      categoryId: "cat-1",
      images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c"],
      featured: true,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: mockCategories[0],
    },
    {
      id: "prod-2",
      name: "Merino Wool Crewneck",
      slug: "merino-wool-crewneck",
      description: "Superfine 100% merino wool knit.",
      basePrice: new Decimal("88.00"),
      categoryId: "cat-1",
      images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27"],
      featured: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: mockCategories[0],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("renders product cards grid when items are present", () => {
    render(
      <CatalogView
        initialProducts={mockProducts}
        initialTotal={2}
        initialPage={1}
        initialLimit={12}
        initialTotalPages={1}
        categories={mockCategories}
      />
    );

    expect(screen.getByText("Everyday Oxford Shirt")).toBeTruthy();
    expect(screen.getByText("Merino Wool Crewneck")).toBeTruthy();
    expect(screen.getByText(/showing 2 items/i)).toBeTruthy();
  });

  it("renders loading skeleton cards when isLoading state is active", () => {
    render(
      <CatalogView
        initialProducts={mockProducts}
        initialTotal={2}
        initialPage={1}
        initialLimit={12}
        initialTotalPages={1}
        categories={mockCategories}
        isLoading={true}
      />
    );

    const skeletons = screen.getAllByTestId("product-card-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders empty state with 'Clear all filters' button when products array is empty", async () => {
    mockSearchParams = new URLSearchParams("q=nonexistent");
    const user = userEvent.setup();

    render(
      <CatalogView
        initialProducts={[]}
        initialTotal={0}
        initialPage={1}
        initialLimit={12}
        initialTotalPages={0}
        categories={mockCategories}
      />
    );

    expect(screen.getByText(/no products found/i)).toBeTruthy();
    const clearBtn = screen.getByTestId("empty-state-clear-btn");
    expect(clearBtn).toBeTruthy();

    await user.click(clearBtn);
    expect(mockReplace.mock.calls[0][0]).toBe("/products");
  });

  it("renders pagination and clicking next page button updates URL with page parameter", async () => {
    const user = userEvent.setup();

    render(
      <CatalogView
        initialProducts={mockProducts}
        initialTotal={24}
        initialPage={1}
        initialLimit={12}
        initialTotalPages={2}
        categories={mockCategories}
      />
    );

    const nextBtn = screen.getByRole("button", { name: /next page/i });
    expect(nextBtn).toBeTruthy();

    await user.click(nextBtn);
    expect(mockReplace.mock.calls[0][0]).toContain("page=2");
  });
});
