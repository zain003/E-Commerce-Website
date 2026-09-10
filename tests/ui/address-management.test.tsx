import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressesView } from "@/components/account/addresses-view";
import { Address } from "@/types";

const mockAddresses: Address[] = [
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
    fullName: "Jane Work",
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

describe("AddressesView UI Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("renders list of saved addresses and shows 'Default' badge exclusively on the default address", () => {
    render(<AddressesView initialAddresses={mockAddresses} />);

    expect(screen.getByText("123 Main St")).toBeTruthy();
    expect(screen.getByText("456 Market St")).toBeTruthy();

    const defaultBadges = screen.getAllByText(/^default$/i);
    // Exactly one "Default" badge should exist for addr-1
    expect(defaultBadges.length).toBe(1);
  });

  it("displays empty state when no addresses exist", () => {
    render(<AddressesView initialAddresses={[]} />);

    expect(screen.getByText(/no saved addresses yet/i)).toBeTruthy();
  });

  it("opens and closes the Add New Address modal", async () => {
    const user = userEvent.setup();
    render(<AddressesView initialAddresses={mockAddresses} />);

    // Initially modal is not visible
    expect(screen.queryByRole("dialog")).toBeNull();

    // Click "Add New Address" button
    const addButton = screen.getByRole("button", { name: /add new address/i });
    await user.click(addButton);

    // Modal dialog is now visible
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(screen.getByLabelText(/full name/i)).toBeTruthy();
    expect(screen.getByLabelText(/street address/i)).toBeTruthy();

    // Click cancel/close button
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    // Modal is closed
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("validates address fields and shows aria-invalid on empty submit inside modal", async () => {
    const user = userEvent.setup();
    render(<AddressesView initialAddresses={mockAddresses} />);

    await user.click(screen.getByRole("button", { name: /add new address/i }));

    const saveButton = screen.getByRole("button", { name: /save address/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeTruthy();
      expect(screen.getByText(/street is required/i)).toBeTruthy();
    });

    const fullNameInput = screen.getByLabelText(/full name/i);
    expect(fullNameInput.getAttribute("aria-invalid")).toBe("true");
  });

  it("submits new address form and adds it to the list", async () => {
    const user = userEvent.setup();
    const newAddr: Address = {
      id: "addr-3",
      userId: "user-1",
      fullName: "Bob Ross",
      street: "789 Pine Rd",
      city: "Portland",
      state: "OR",
      postalCode: "97201",
      country: "USA",
      phone: "+15035550199",
      isDefault: false,
      createdAt: new Date(),
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: newAddr,
          timestamp: new Date().toISOString(),
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      )
    );

    render(<AddressesView initialAddresses={mockAddresses} />);

    await user.click(screen.getByRole("button", { name: /add new address/i }));

    await user.type(screen.getByLabelText(/full name/i), "Bob Ross");
    await user.type(screen.getByLabelText(/street address/i), "789 Pine Rd");
    await user.type(screen.getByLabelText(/city/i), "Portland");
    await user.type(screen.getByLabelText(/state/i), "OR");
    await user.type(screen.getByLabelText(/postal code/i), "97201");
    await user.type(screen.getByLabelText(/country/i), "USA");
    await user.type(screen.getByLabelText(/phone/i), "+15035550199");

    await user.click(screen.getByRole("button", { name: /save address/i }));

    await waitFor(() => {
      expect(screen.getByText("789 Pine Rd")).toBeTruthy();
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("triggers deletion and removes address from the list", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: { deletedId: "addr-2" },
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    render(<AddressesView initialAddresses={mockAddresses} />);

    expect(screen.getByText("456 Market St")).toBeTruthy();

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    // Click delete on addr-2
    await user.click(deleteButtons[1]);

    await waitFor(() => {
      expect(screen.queryByText("456 Market St")).toBeNull();
      // addr-1 should still be present
      expect(screen.getByText("123 Main St")).toBeTruthy();
    });
  });
});
