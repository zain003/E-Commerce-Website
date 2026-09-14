import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricsCards } from "@/components/admin/metrics-cards";
import type { AdminOrderMetrics } from "@/types";

describe("MetricsCards Component (UI)", () => {
  const mockMetrics: AdminOrderMetrics = {
    totalRevenue: 12450.75,
    totalOrders: 142,
    processingOrders: 18,
    deliveredOrders: 115,
  };

  it("renders all 4 KPI metric cards with correct titles", () => {
    render(<MetricsCards metrics={mockMetrics} />);

    expect(screen.getByText("Total Revenue")).toBeTruthy();
    expect(screen.getByText("Total Orders")).toBeTruthy();
    expect(screen.getByText("Pending Processing")).toBeTruthy();
    expect(screen.getByText("Delivered Orders")).toBeTruthy();
  });

  it("formats total revenue as currency correctly", () => {
    render(<MetricsCards metrics={mockMetrics} />);

    // Check for $12,450.75
    expect(screen.getByText("$12,450.75")).toBeTruthy();
  });

  it("formats order counts as numeric values correctly", () => {
    render(<MetricsCards metrics={mockMetrics} />);

    expect(screen.getByText("142")).toBeTruthy();
    expect(screen.getByText("18")).toBeTruthy();
    expect(screen.getByText("115")).toBeTruthy();
  });

  it("handles zero and empty metrics gracefully", () => {
    const zeroMetrics: AdminOrderMetrics = {
      totalRevenue: 0,
      totalOrders: 0,
      processingOrders: 0,
      deliveredOrders: 0,
    };

    render(<MetricsCards metrics={zeroMetrics} />);

    expect(screen.getByText("$0.00")).toBeTruthy();
    const zeroCounts = screen.getAllByText("0");
    expect(zeroCounts.length).toBe(3); // total, processing, delivered
  });
});
