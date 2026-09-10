import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VariantSelector } from "@/components/product/variant-selector";
import { Decimal } from "@prisma/client/runtime/library";
import { ProductVariant } from "@/types";

describe("VariantSelector UI Component", () => {
  const mockVariants: ProductVariant[] = [
    {
      id: "var-1",
      productId: "prod-1",
      sku: "TEE-BLK-S",
      name: "Small / Black",
      priceDelta: new Decimal("0.00"),
      stock: 12,
    },
    {
      id: "var-2",
      productId: "prod-1",
      sku: "TEE-BLK-M",
      name: "Medium / Black",
      priceDelta: new Decimal("5.00"),
      stock: 3,
    },
    {
      id: "var-3",
      productId: "prod-1",
      sku: "TEE-BLK-L",
      name: "Large / Black",
      priceDelta: new Decimal("10.00"),
      stock: 0, // Out of stock
    },
  ];

  const basePrice = new Decimal("49.99");

  it("renders all variant options with names and stock indicators", () => {
    render(
      <VariantSelector
        variants={mockVariants}
        basePrice={basePrice}
      />
    );

    expect(screen.getByText("Small / Black")).toBeTruthy();
    expect(screen.getByText("Medium / Black")).toBeTruthy();
    expect(screen.getByText("Large / Black")).toBeTruthy();

    // Out of stock indicator for variant 3
    expect(screen.getByText(/out of stock/i)).toBeTruthy();
  });

  it("displays price deltas for variants with non-zero delta", () => {
    render(
      <VariantSelector
        variants={mockVariants}
        basePrice={basePrice}
      />
    );

    // Medium variant has +$5.00 delta
    expect(screen.getByText(/\+\$5\.00/)).toBeTruthy();
    // Large variant has +$10.00 delta
    expect(screen.getByText(/\+\$10\.00/)).toBeTruthy();
  });

  it("disables out of stock variants from being selected", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <VariantSelector
        variants={mockVariants}
        basePrice={basePrice}
        onSelectVariant={onSelect}
      />
    );

    // Variant 3 has stock 0
    const outOfStockButton = screen.getByRole("button", {
      name: /large \/ black/i,
    });

    expect(outOfStockButton.hasAttribute("disabled")).toBe(true);

    await user.click(outOfStockButton);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("updates selected variant and dynamic price calculation on click", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <VariantSelector
        variants={mockVariants}
        basePrice={basePrice}
        onSelectVariant={onSelect}
      />
    );

    // Initially selects first in-stock variant (Small / Black -> $49.99)
    expect(screen.getByTestId("variant-total-price").textContent).toBe("$49.99");

    // Click on Medium / Black (+$5.00 delta -> $54.99)
    const mediumButton = screen.getByRole("button", {
      name: /medium \/ black/i,
    });
    await user.click(mediumButton);

    expect(onSelect).toHaveBeenCalledWith(mockVariants[1]);
    expect(screen.getByTestId("variant-total-price").textContent).toBe("$54.99");
  });

  it("displays low stock warning when stock is less than or equal to 5", async () => {
    const user = userEvent.setup();

    render(
      <VariantSelector
        variants={mockVariants}
        basePrice={basePrice}
      />
    );

    // Select Medium (stock: 3)
    const mediumButton = screen.getByRole("button", {
      name: /medium \/ black/i,
    });
    await user.click(mediumButton);

    expect(screen.getByText(/only 3 left in stock/i)).toBeTruthy();
  });

  it("handles empty variants array gracefully without crashing", () => {
    render(
      <VariantSelector
        variants={[]}
        basePrice={basePrice}
      />
    );

    expect(screen.getByTestId("variant-total-price").textContent).toBe("$49.99");
  });
});
