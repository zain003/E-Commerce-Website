import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileView } from "@/components/account/profile-view";

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

describe("Customer Profile Edit UI (ISSUE-008)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Edit Profile button and opens edit modal on click", async () => {
    const user = userEvent.setup();

    render(
      <ProfileView
        user={{
          id: "usr_100",
          name: "Original Name",
          email: "customer@example.com",
          role: "CUSTOMER",
          createdAt: new Date().toISOString(),
        }}
      />
    );

    expect(screen.getByText("Original Name")).toBeTruthy();

    const editButtons = screen.getAllByRole("button", { name: /edit profile/i });
    expect(editButtons.length).toBeGreaterThanOrEqual(1);

    await user.click(editButtons[0]);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: /edit profile/i })).toBeTruthy();
    const nameInput = screen.getByLabelText(/full name/i);
    expect(nameInput).toBeTruthy();
    expect((nameInput as HTMLInputElement).value).toBe("Original Name");
  });

  it("submits updated name to PATCH /api/account/profile and updates UI immediately", async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: "usr_100", name: "Updated VIP Name", email: "customer@example.com", role: "CUSTOMER" },
      }),
    });

    render(
      <ProfileView
        user={{
          id: "usr_100",
          name: "Original Name",
          email: "customer@example.com",
          role: "CUSTOMER",
          createdAt: new Date().toISOString(),
        }}
      />
    );

    const editButton = screen.getAllByRole("button", { name: /edit profile/i })[0];
    await user.click(editButton);

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Updated VIP Name");

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/account/profile",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ name: "Updated VIP Name" }),
        })
      );
      expect(screen.getByText("Updated VIP Name")).toBeTruthy();
    });
  });
});
