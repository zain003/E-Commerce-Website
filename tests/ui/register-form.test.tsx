import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "@/components/auth/register-form";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("RegisterForm UI Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("renders all registration inputs with accessible labels and attributes", () => {
    render(<RegisterForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    expect(nameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(submitButton).toBeTruthy();

    expect(emailInput.getAttribute("aria-invalid")).toBe("false");
    expect(passwordInput.getAttribute("aria-invalid")).toBe("false");
  });

  it("displays field-level errors if password < 8 chars without calling register API", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, "fetch");

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(emailInput, "newuser@example.com");
    await user.type(passwordInput, "short");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeTruthy();
    });

    expect(passwordInput.getAttribute("aria-invalid")).toBe("true");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("displays inline validation error on invalid email without calling register API", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, "fetch");

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(emailInput, "invalid-email-format");
    await user.type(passwordInput, "ValidPassword123!");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeTruthy();
    });

    expect(emailInput.getAttribute("aria-invalid")).toBe("true");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls /api/auth/register on valid submit and redirects upon success", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: { id: "user-123", email: "alice@example.com", role: "CUSTOMER" },
          timestamp: new Date().toISOString(),
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      )
    );

    render(<RegisterForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(nameInput, "Alice Smith");
    await user.type(emailInput, "alice@example.com");
    await user.type(passwordInput, "Password123!");
    await user.click(submitButton);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/auth/register",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Alice Smith",
            email: "alice@example.com",
            password: "Password123!",
          }),
        })
      );
      expect(mockPush).toHaveBeenCalledWith("/login?registered=true");
    });
  });

  it("displays accessible error alert when register API returns EMAIL_EXISTS", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "EMAIL_EXISTS",
            message: "A user with this email already exists",
          },
          timestamp: new Date().toISOString(),
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      )
    );

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(emailInput, "exists@example.com");
    await user.type(passwordInput, "Password123!");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
      expect(screen.getByText(/a user with this email already exists/i)).toBeTruthy();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("disables submit button and shows pending state while submitting", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}));

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(emailInput, "pending@example.com");
    await user.type(passwordInput, "Password123!");
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton.hasAttribute("disabled")).toBe(true);
    });
  });
});
