import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StockQuickEdit } from "@/components/admin/stock-quick-edit";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("StockQuickEdit UI Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders initial stock value and formats large numbers (> 10,000) cleanly", () => {
    render(
      <StockQuickEdit
        variantId="var_large_stock"
        initialStock={15500}
        variantName="Black / XL"
        sku="TSHIRT-BLK-XL"
      />
    );

    // Formatted via toLocaleString()
    expect(screen.getByText("15,500")).toBeTruthy();
  });

  it("displays out of stock indicator when stock is 0", () => {
    render(
      <StockQuickEdit
        variantId="var_out_of_stock"
        initialStock={0}
        variantName="White / Small"
        sku="TSHIRT-WHT-S"
      />
    );

    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText(/out of stock/i)).toBeTruthy();
  });

  it("displays low stock badge when stock is below 10", () => {
    render(
      <StockQuickEdit
        variantId="var_low_stock"
        initialStock={4}
        variantName="Blue / Medium"
        sku="TSHIRT-BLU-M"
      />
    );

    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText(/low stock/i)).toBeTruthy();
  });

  it("switches to input mode when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <StockQuickEdit
        variantId="var_edit_mode"
        initialStock={25}
        variantName="Standard"
        sku="PROD-STD"
      />
    );

    const editBtn = screen.getByRole("button", { name: /edit stock/i });
    await user.click(editBtn);

    const input = screen.getByRole("spinbutton", { name: /stock for standard/i });
    expect(input).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe("25");
  });

  it("triggers API update on blur when stock value changes", async () => {
    const user = userEvent.setup();
    const onStockChangeMock = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: "var_blur_test", stock: 35 },
      }),
    });

    render(
      <StockQuickEdit
        variantId="var_blur_test"
        initialStock={20}
        variantName="Standard"
        sku="PROD-STD"
        onStockChange={onStockChangeMock}
      />
    );

    // Enter edit mode
    await user.click(screen.getByRole("button", { name: /edit stock/i }));
    const input = screen.getByRole("spinbutton", { name: /stock for standard/i });

    // Clear and type new value
    await user.clear(input);
    await user.type(input, "35");

    // Trigger blur by clicking outside or tabbing away
    await user.tab();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/admin/variants/var_blur_test/stock",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: 35 }),
        })
      );
    });

    await waitFor(() => {
      expect(onStockChangeMock).toHaveBeenCalledWith(35);
      expect(screen.getByText("35")).toBeTruthy();
    });
  });

  it("triggers API update on Enter key press", async () => {
    const user = userEvent.setup();
    const onStockChangeMock = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: "var_enter_test", stock: 50 },
      }),
    });

    render(
      <StockQuickEdit
        variantId="var_enter_test"
        initialStock={10}
        variantName="Variant Enter"
        sku="VAR-ENTER"
        onStockChange={onStockChangeMock}
      />
    );

    await user.click(screen.getByRole("button", { name: /edit stock/i }));
    const input = screen.getByRole("spinbutton", { name: /stock for variant enter/i });

    await user.clear(input);
    await user.type(input, "50{Enter}");

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/admin/variants/var_enter_test/stock",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: 50 }),
        })
      );
    });

    await waitFor(() => {
      expect(onStockChangeMock).toHaveBeenCalledWith(50);
      expect(screen.getByText("50")).toBeTruthy();
    });
  });

  it("rejects negative stock values and displays validation message without API call", async () => {
    const user = userEvent.setup();

    render(
      <StockQuickEdit
        variantId="var_neg_test"
        initialStock={10}
        variantName="Neg Variant"
        sku="NEG-VAR"
      />
    );

    await user.click(screen.getByRole("button", { name: /edit stock/i }));
    const input = screen.getByRole("spinbutton", { name: /stock for neg variant/i });

    await user.clear(input);
    await user.type(input, "-5{Enter}");

    expect(screen.getByText(/stock cannot be negative/i)).toBeTruthy();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("cancels editing and restores initial stock on Escape without making API call", async () => {
    const user = userEvent.setup();

    render(
      <StockQuickEdit
        variantId="var_esc_test"
        initialStock={42}
        variantName="Esc Variant"
        sku="ESC-VAR"
      />
    );

    await user.click(screen.getByRole("button", { name: /edit stock/i }));
    const input = screen.getByRole("spinbutton", { name: /stock for esc variant/i });

    await user.clear(input);
    await user.type(input, "999{Escape}");

    expect(mockFetch).not.toHaveBeenCalled();
    expect(screen.getByText("42")).toBeTruthy();
  });

  it("displays inline error alert if API update fails", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to persist stock update" },
      }),
    });

    render(
      <StockQuickEdit
        variantId="var_err_test"
        initialStock={15}
        variantName="Err Variant"
        sku="ERR-VAR"
      />
    );

    await user.click(screen.getByRole("button", { name: /edit stock/i }));
    const input = screen.getByRole("spinbutton", { name: /stock for err variant/i });

    await user.clear(input);
    await user.type(input, "30{Enter}");

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
      expect(screen.getByText(/failed to persist stock update/i)).toBeTruthy();
    });
  });
});
