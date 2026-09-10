import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/login-form";

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
let mockSearchParamsGet = vi.fn().mockReturnValue(null);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useSearchParams: () => ({
    get: mockSearchParamsGet,
  }),
}));

// Mock next-auth/react
const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

describe("LoginForm UI Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsGet = vi.fn().mockReturnValue(null);
  });

  it("renders all form elements with accessible labels and attributes", () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(submitButton).toBeTruthy();

    expect(emailInput.getAttribute("aria-invalid")).toBe("false");
    expect(passwordInput.getAttribute("aria-invalid")).toBe("false");
  });

  it("displays inline validation error on empty submit without calling signIn", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeTruthy();
      expect(screen.getByText(/password is required/i)).toBeTruthy();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(emailInput.getAttribute("aria-invalid")).toBe("true");
    expect(passwordInput.getAttribute("aria-invalid")).toBe("true");

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("shows inline validation error message on invalid email without triggering signIn", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "not-an-email");
    await user.type(passwordInput, "ValidPassword123!");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeTruthy();
    });

    expect(emailInput.getAttribute("aria-invalid")).toBe("true");
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("submits valid credentials and redirects to /account/profile by default", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ ok: true, error: null });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "Secret123!");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        email: "user@example.com",
        password: "Secret123!",
      });
      expect(mockPush).toHaveBeenCalledWith("/account/profile");
    });
  });

  it("redirects to callbackUrl when specified in searchParams", async () => {
    const user = userEvent.setup();
    mockSearchParamsGet.mockImplementation((key: string) => {
      if (key === "callbackUrl") return "/checkout";
      return null;
    });
    mockSignIn.mockResolvedValueOnce({ ok: true, error: null });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "buyer@example.com");
    await user.type(passwordInput, "Secret123!");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/checkout");
    });
  });

  it("displays accessible error alert when signIn fails", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ ok: false, error: "CredentialsSignin" });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "WrongPassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
      expect(screen.getByText(/invalid email or password/i)).toBeTruthy();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("disables submit button and shows spinner/pending state while submitting", async () => {
    const user = userEvent.setup();
    // Intentionally un-resolving promise to inspect pending state
    mockSignIn.mockImplementation(() => new Promise(() => {}));

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "ValidPassword123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton.hasAttribute("disabled")).toBe(true);
    });
  });
});
