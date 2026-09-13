import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressStep } from "@/components/checkout/address-step";
import { Address } from "@/types";

const mockSavedAddresses: Address[] = [
  {
    id: "addr-1",
    userId: "user-1",
    fullName: "Jane Doe",
    street: "123 Main St",
    city: "Seattle",
    state: "WA",
    postalCode: "98101",
    country: "USA",
    phone: "+12065550100",
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: "addr-2",
    userId: "user-1",
    fullName: "Jane Doe Work",
    street: "456 Market St",
    city: "Seattle",
    state: "WA",
    postalCode: "98102",
    country: "USA",
    phone: "+12065550200",
    isDefault: false,
    createdAt: new Date(),
  },
];

describe("Checkout AddressStep UI Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all required address input fields in guest mode", () => {
    render(<AddressStep isGuest={true} onNext={vi.fn()} />);

    expect(screen.getByLabelText(/email address/i)).toBeTruthy();
    expect(screen.getByLabelText(/full name/i)).toBeTruthy();
    expect(screen.getByLabelText(/street address/i)).toBeTruthy();
    expect(screen.getByLabelText(/city/i)).toBeTruthy();
    expect(screen.getByLabelText(/state/i)).toBeTruthy();
    expect(screen.getByLabelText(/postal/i)).toBeTruthy();
    expect(screen.getByLabelText(/country/i)).toBeTruthy();
    expect(screen.getByLabelText(/phone/i)).toBeTruthy();
  });

  it("displays validation errors and prevents advancing when required fields are empty", async () => {
    const user = userEvent.setup();
    const onNextMock = vi.fn();

    render(<AddressStep isGuest={true} onNext={onNextMock} />);

    const continueBtn = screen.getByRole("button", { name: /continue to delivery/i });
    await user.click(continueBtn);

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeTruthy();
      expect(screen.getByText(/street address is required/i)).toBeTruthy();
      expect(screen.getByText(/city is required/i)).toBeTruthy();
      expect(screen.getByText(/invalid email/i)).toBeTruthy();
    });

    expect(onNextMock).not.toHaveBeenCalled();
  });

  it("validates phone number digits requirement", async () => {
    const user = userEvent.setup();
    const onNextMock = vi.fn();

    render(<AddressStep isGuest={true} onNext={onNextMock} />);

    await user.type(screen.getByLabelText(/email address/i), "guest@example.com");
    await user.type(screen.getByLabelText(/full name/i), "John Smith");
    await user.type(screen.getByLabelText(/street address/i), "789 Broadway");
    await user.type(screen.getByLabelText(/city/i), "New York");
    await user.type(screen.getByLabelText(/state/i), "NY");
    await user.type(screen.getByLabelText(/postal/i), "10001");
    await user.type(screen.getByLabelText(/country/i), "United States");
    await user.type(screen.getByLabelText(/phone/i), "123"); // Too short (< 7 digits)

    const continueBtn = screen.getByRole("button", { name: /continue to delivery/i });
    await user.click(continueBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/phone number must contain between 7 and 15 digits/i)
      ).toBeTruthy();
    });

    expect(onNextMock).not.toHaveBeenCalled();
  });

  it("submits valid guest address and calls onNext with sanitized payload", async () => {
    const user = userEvent.setup();
    const onNextMock = vi.fn();

    render(<AddressStep isGuest={true} onNext={onNextMock} />);

    await user.type(screen.getByLabelText(/email address/i), "guest@example.com");
    await user.type(screen.getByLabelText(/full name/i), "John Smith");
    await user.type(screen.getByLabelText(/street address/i), "789 Broadway");
    await user.type(screen.getByLabelText(/city/i), "New York");
    await user.type(screen.getByLabelText(/state/i), "NY");
    await user.type(screen.getByLabelText(/postal/i), "10001");
    await user.type(screen.getByLabelText(/country/i), "United States");
    await user.type(screen.getByLabelText(/phone/i), "+1 (212) 555-0199");

    const continueBtn = screen.getByRole("button", { name: /continue to delivery/i });
    await user.click(continueBtn);

    await waitFor(() => {
      expect(onNextMock).toHaveBeenCalledTimes(1);
    });

    expect(onNextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        guestEmail: "guest@example.com",
        address: expect.objectContaining({
          fullName: "John Smith",
          street: "789 Broadway",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "United States",
          phone: "+1 (212) 555-0199",
        }),
      })
    );
  });

  it("renders saved addresses for authenticated users and pre-selects default address", async () => {
    const user = userEvent.setup();
    const onNextMock = vi.fn();

    render(
      <AddressStep
        isGuest={false}
        savedAddresses={mockSavedAddresses}
        onNext={onNextMock}
      />
    );

    // Should display saved addresses
    expect(screen.getByText("123 Main St")).toBeTruthy();
    expect(screen.getByText("456 Market St")).toBeTruthy();

    const continueBtn = screen.getByRole("button", { name: /continue to delivery/i });
    await user.click(continueBtn);

    await waitFor(() => {
      expect(onNextMock).toHaveBeenCalledTimes(1);
    });

    // Default address (123 Main St) was pre-selected
    expect(onNextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        address: expect.objectContaining({
          street: "123 Main St",
          postalCode: "98101",
        }),
      })
    );
  });

  it("allows selecting another saved address", async () => {
    const user = userEvent.setup();
    const onNextMock = vi.fn();

    render(
      <AddressStep
        isGuest={false}
        savedAddresses={mockSavedAddresses}
        onNext={onNextMock}
      />
    );

    // Select the second address (456 Market St)
    const secondAddressRadio = screen.getByLabelText(/456 Market St/i);
    await user.click(secondAddressRadio);

    const continueBtn = screen.getByRole("button", { name: /continue to delivery/i });
    await user.click(continueBtn);

    await waitFor(() => {
      expect(onNextMock).toHaveBeenCalledTimes(1);
    });

    expect(onNextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        address: expect.objectContaining({
          street: "456 Market St",
          postalCode: "98102",
        }),
      })
    );
  });

  it("allows switching to enter a new address for authenticated users", async () => {
    const user = userEvent.setup();
    const onNextMock = vi.fn();

    render(
      <AddressStep
        isGuest={false}
        savedAddresses={mockSavedAddresses}
        onNext={onNextMock}
      />
    );

    const newAddressRadio = screen.getByLabelText(/use a new address/i);
    await user.click(newAddressRadio);

    // Form inputs should now be visible
    expect(screen.getByLabelText(/street address/i)).toBeTruthy();

    await user.type(screen.getByLabelText(/full name/i), "Alice Wonder");
    await user.type(screen.getByLabelText(/street address/i), "999 Pine St");
    await user.type(screen.getByLabelText(/city/i), "Seattle");
    await user.type(screen.getByLabelText(/state/i), "WA");
    await user.type(screen.getByLabelText(/postal/i), "98103");
    await user.type(screen.getByLabelText(/country/i), "USA");
    await user.type(screen.getByLabelText(/phone/i), "+12065559999");

    const continueBtn = screen.getByRole("button", { name: /continue to delivery/i });
    await user.click(continueBtn);

    await waitFor(() => {
      expect(onNextMock).toHaveBeenCalledTimes(1);
    });

    expect(onNextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        address: expect.objectContaining({
          street: "999 Pine St",
          fullName: "Alice Wonder",
        }),
      })
    );
  });
});
