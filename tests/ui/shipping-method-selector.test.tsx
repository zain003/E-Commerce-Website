import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShippingStep } from "@/components/checkout/shipping-step";

describe("ShippingMethodSelector UI Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Standard and Express options with $5.00 Standard fee when subtotal < $100", () => {
    render(
      <ShippingStep
        selectedMethodId="STANDARD"
        subtotal={50.0}
        onChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText("Standard Delivery")).toBeTruthy();
    expect(screen.getByText("$5.00")).toBeTruthy();
    expect(screen.getByText("3-5 Business Days")).toBeTruthy();

    expect(screen.getByText("Express Delivery")).toBeTruthy();
    expect(screen.getByText("$15.00")).toBeTruthy();
    expect(screen.getByText("1-2 Business Days")).toBeTruthy();
  });

  it("renders 'Free' for Standard Delivery when subtotal is $100 or greater", () => {
    render(
      <ShippingStep
        selectedMethodId="STANDARD"
        subtotal={120.0}
        onChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText("Standard Delivery")).toBeTruthy();
    expect(screen.getAllByText(/free/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Express Delivery")).toBeTruthy();
    expect(screen.getByText("$15.00")).toBeTruthy();
  });

  it("calls onChange when selecting Express Delivery", async () => {
    const user = userEvent.setup();
    const onChangeMock = vi.fn();

    render(
      <ShippingStep
        selectedMethodId="STANDARD"
        subtotal={80.0}
        onChange={onChangeMock}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    );

    const expressOption = screen.getByLabelText(/express delivery/i);
    await user.click(expressOption);

    expect(onChangeMock).toHaveBeenCalledWith("EXPRESS");
  });

  it("calls onBack when clicking 'Back to Address' button", async () => {
    const user = userEvent.setup();
    const onBackMock = vi.fn();

    render(
      <ShippingStep
        selectedMethodId="STANDARD"
        subtotal={80.0}
        onChange={vi.fn()}
        onNext={vi.fn()}
        onBack={onBackMock}
      />
    );

    const backBtn = screen.getByRole("button", { name: /back to address/i });
    await user.click(backBtn);

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when clicking 'Continue to Review' button", async () => {
    const user = userEvent.setup();
    const onNextMock = vi.fn();

    render(
      <ShippingStep
        selectedMethodId="STANDARD"
        subtotal={80.0}
        onChange={vi.fn()}
        onNext={onNextMock}
        onBack={vi.fn()}
      />
    );

    const nextBtn = screen.getByRole("button", { name: /continue to review/i });
    await user.click(nextBtn);

    expect(onNextMock).toHaveBeenCalledTimes(1);
  });
});
