import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductGallery } from "@/components/product/product-gallery";

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

describe("ProductGallery UI Component", () => {
  const mockImages = [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800",
    "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800",
  ];

  it("renders main active preview image with first image by default", () => {
    render(<ProductGallery images={mockImages} title="Everyday Shirt" />);

    const mainImage = screen.getByTestId("gallery-main-image");
    expect(mainImage).toBeTruthy();
    expect(mainImage.getAttribute("src")).toBe(mockImages[0]);
    expect(mainImage.getAttribute("alt")).toBe("Everyday Shirt - Image 1");
  });

  it("renders thumbnail strip when multiple images are provided", () => {
    render(<ProductGallery images={mockImages} title="Everyday Shirt" />);

    const thumbnails = screen.getAllByRole("button", { name: /view image \d/i });
    expect(thumbnails.length).toBe(3);

    // First thumbnail should be marked active
    expect(thumbnails[0].getAttribute("aria-current")).toBe("true");
    expect(thumbnails[1].getAttribute("aria-current")).toBe("false");
  });

  it("changes active preview image when a thumbnail is clicked", async () => {
    const user = userEvent.setup();

    render(<ProductGallery images={mockImages} title="Everyday Shirt" />);

    const thumbnails = screen.getAllByRole("button", { name: /view image \d/i });

    // Click second thumbnail
    await user.click(thumbnails[1]);

    const mainImage = screen.getByTestId("gallery-main-image");
    expect(mainImage.getAttribute("src")).toBe(mockImages[1]);
    expect(thumbnails[1].getAttribute("aria-current")).toBe("true");
    expect(thumbnails[0].getAttribute("aria-current")).toBe("false");
  });

  it("displays high-quality placeholder when images array is empty", () => {
    render(<ProductGallery images={[]} title="Product Without Photo" />);

    const placeholder = screen.getByTestId("gallery-placeholder");
    expect(placeholder).toBeTruthy();
    expect(screen.queryByTestId("gallery-main-image")).toBeNull();
  });

  it("does not render thumbnail navigation strip when there is only 1 image", () => {
    render(<ProductGallery images={[mockImages[0]]} title="Single Image Product" />);

    const mainImage = screen.getByTestId("gallery-main-image");
    expect(mainImage).toBeTruthy();
    expect(screen.queryAllByRole("button", { name: /view image \d/i }).length).toBe(0);
  });
});
