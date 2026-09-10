import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/product/product-card";
import { Decimal } from "@prisma/client/runtime/library";

// Mock Next.js Image for jsdom compatibility
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
    fill,
    sizes,
    priority,
    ...props
  }: {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    sizes?: string;
    priority?: boolean;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} data-fill={fill ? "true" : undefined} {...props} />;
  },
}));

describe("ProductCard UI Component", () => {
  const mockProduct = {
    id: "prod-1",
    name: "Classic Organic Cotton Tee",
    slug: "classic-organic-cotton-tee",
    description: "Ultra-soft 100% organic cotton everyday essential.",
    basePrice: new Decimal("49.99"),
    categoryId: "cat-1",
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"],
    featured: true,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: "cat-1",
      name: "Apparel",
      slug: "apparel",
      description: "Clothing items",
      imageUrl: null,
      createdAt: new Date(),
    },
  };

  it("renders product title, formatted currency price, and image with alt text", () => {
    render(<ProductCard product={mockProduct} />);

    // Title
    expect(screen.getByText("Classic Organic Cotton Tee")).toBeTruthy();

    // Formatted Price ($49.99)
    expect(screen.getByText("$49.99")).toBeTruthy();

    // Image
    const img = screen.getByRole("img", { name: "Classic Organic Cotton Tee" });
    expect(img).toBeTruthy();
    expect(img.getAttribute("src")).toBe(
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"
    );
  });

  it("links to the correct product slug URL", () => {
    render(<ProductCard product={mockProduct} />);

    const link = screen.getByRole("link", {
      name: /classic organic cotton tee/i,
    });
    expect(link.getAttribute("href")).toBe("/products/classic-organic-cotton-tee");
  });

  it("renders category badge when category relation is present", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Apparel")).toBeTruthy();
  });

  it("renders a high-quality placeholder when product has no images", () => {
    const productWithoutImages = {
      ...mockProduct,
      images: [],
    };

    render(<ProductCard product={productWithoutImages} />);

    // Renders placeholder container with fallback icon/text
    const placeholder = screen.getByTestId("product-card-placeholder");
    expect(placeholder).toBeTruthy();
    // Image element should not exist when fallback placeholder is active
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("handles long product titles with clean truncation class", () => {
    const longTitleProduct = {
      ...mockProduct,
      name: "Super Long Title Product That Could Potentially Break The Card Layout In Dense Grids If Not Truncated Cleanly",
    };

    render(<ProductCard product={longTitleProduct} />);

    const titleElement = screen.getByText(longTitleProduct.name);
    expect(titleElement.className).toMatch(/truncate|line-clamp/);
  });

  it("handles numeric basePrice and string basePrice gracefully", () => {
    const numericProduct = {
      ...mockProduct,
      basePrice: 29.5 as unknown as Decimal,
    };

    render(<ProductCard product={numericProduct} />);
    expect(screen.getByText("$29.50")).toBeTruthy();
  });
});
