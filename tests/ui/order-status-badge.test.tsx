import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderStatus } from "@/types";

describe("OrderStatusBadge (UI)", () => {
  const statuses: Array<{ status: OrderStatus; expectedLabel: RegExp }> = [
    { status: "PENDING_PAYMENT", expectedLabel: /pending payment/i },
    { status: "PROCESSING", expectedLabel: /processing/i },
    { status: "SHIPPED", expectedLabel: /shipped/i },
    { status: "DELIVERED", expectedLabel: /delivered/i },
    { status: "CANCELLED", expectedLabel: /cancelled/i },
  ];

  statuses.forEach(({ status, expectedLabel }) => {
    it(`renders correct accessible label and badge for status: ${status}`, () => {
      render(<OrderStatusBadge status={status} />);
      const badge = screen.getByText(expectedLabel);
      expect(badge).toBeTruthy();
    });
  });

  it("applies custom className to the badge container", () => {
    render(<OrderStatusBadge status="DELIVERED" className="custom-test-class" />);
    const badge = screen.getByText(/delivered/i);
    expect(badge.closest("div")?.className).toContain("custom-test-class");
  });

  it("renders distinct visual styles for successful and cancelled statuses", () => {
    const { rerender } = render(<OrderStatusBadge status="DELIVERED" />);
    const deliveredEl = screen.getByText(/delivered/i).closest("div");
    expect(deliveredEl?.className).toMatch(/emerald|green|success/i);

    rerender(<OrderStatusBadge status="CANCELLED" />);
    const cancelledEl = screen.getByText(/cancelled/i).closest("div");
    expect(cancelledEl?.className).toMatch(/red|destructive/i);
  });
});
