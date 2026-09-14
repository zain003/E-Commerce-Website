import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OrderStatusDropdown } from "@/components/admin/order-status-dropdown";
import type { OrderStatus } from "@/types";

describe("OrderStatusDropdown Component (UI)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the current status and only allowed transition options for PROCESSING", () => {
    render(
      <OrderStatusDropdown
        orderId="ord_123"
        currentStatus="PROCESSING"
        onStatusChange={vi.fn()}
      />
    );

    const select = screen.getByRole("combobox", { name: /update order status/i }) as HTMLSelectElement;
    expect(select.value).toBe("PROCESSING");

    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain("PROCESSING");
    expect(options).toContain("SHIPPED");
    expect(options).toContain("CANCELLED");
    expect(options).not.toContain("PENDING_PAYMENT");
    expect(options).not.toContain("DELIVERED");
  });

  it("disables selector when order is in a terminal status (DELIVERED)", () => {
    render(
      <OrderStatusDropdown
        orderId="ord_delivered"
        currentStatus="DELIVERED"
        onStatusChange={vi.fn()}
      />
    );

    const select = screen.getByRole("combobox", { name: /update order status/i }) as HTMLSelectElement;
    expect(select.disabled).toBe(true);
    expect(select.value).toBe("DELIVERED");
  });

  it("disables selector when order is in a terminal status (CANCELLED)", () => {
    render(
      <OrderStatusDropdown
        orderId="ord_cancelled"
        currentStatus="CANCELLED"
        onStatusChange={vi.fn()}
      />
    );

    const select = screen.getByRole("combobox", { name: /update order status/i }) as HTMLSelectElement;
    expect(select.disabled).toBe(true);
    expect(select.value).toBe("CANCELLED");
  });

  it("triggers API mutation and calls onStatusChange when a valid status is chosen", async () => {
    const mockOnStatusChange = vi.fn();
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: "ord_123", status: "SHIPPED" },
      }),
    } as Response);

    render(
      <OrderStatusDropdown
        orderId="ord_123"
        currentStatus="PROCESSING"
        onStatusChange={mockOnStatusChange}
      />
    );

    const select = screen.getByRole("combobox", { name: /update order status/i });
    fireEvent.change(select, { target: { value: "SHIPPED" } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/orders/ord_123/status",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "SHIPPED" }),
        })
      );
    });

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith("ord_123", "SHIPPED");
    });
  });

  it("handles API failure gracefully and displays an error alert", async () => {
    const mockOnStatusChange = vi.fn();
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: "Invalid status transition" },
      }),
    } as Response);

    render(
      <OrderStatusDropdown
        orderId="ord_123"
        currentStatus="PROCESSING"
        onStatusChange={mockOnStatusChange}
      />
    );

    const select = screen.getByRole("combobox", { name: /update order status/i }) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "SHIPPED" } });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
      expect(screen.getByText(/Invalid status transition/i)).toBeTruthy();
    });

    // Verify it reverts or keeps state and did not call success callback
    expect(mockOnStatusChange).not.toHaveBeenCalled();
    expect(select.value).toBe("PROCESSING");
  });
});
