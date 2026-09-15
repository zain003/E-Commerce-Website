import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BackButton } from "@/components/ui/back-button";
import { useRouter } from "next/navigation";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("BackButton Component", () => {
  const mockBack = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      back: mockBack,
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    } as any);
  });

  it("renders with default label 'Back'", () => {
    render(<BackButton />);
    const button = screen.getByRole("button", { name: /back/i });
    expect(button).toBeTruthy();
    expect(button.textContent).toContain("Back");
  });

  it("calls router.back() when history length > 1", () => {
    Object.defineProperty(window, "history", {
      writable: true,
      value: { length: 3 },
    });

    render(<BackButton />);
    const button = screen.getByRole("button", { name: /back/i });
    fireEvent.click(button);

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("calls router.push(fallbackUrl) when history length <= 1", () => {
    Object.defineProperty(window, "history", {
      writable: true,
      value: { length: 1 },
    });

    render(<BackButton fallbackUrl="/account/profile" />);
    const button = screen.getByRole("button", { name: /back/i });
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith("/account/profile");
    expect(mockBack).not.toHaveBeenCalled();
  });
});
