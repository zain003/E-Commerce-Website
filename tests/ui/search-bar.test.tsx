import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { SearchBar } from "@/components/search/search-bar";

const mockReplace = vi.fn();
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/products",
}));

describe("SearchBar UI Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders search input with accessible placeholder and label", () => {
    render(<SearchBar placeholder="Search essentials..." />);

    const input = screen.getByRole("searchbox", { name: /search products/i });
    expect(input).toBeTruthy();
    expect(input.getAttribute("placeholder")).toBe("Search essentials...");
  });

  it("initializes with query from search params or initialQuery prop", () => {
    mockSearchParams = new URLSearchParams("q=hoodie");
    render(<SearchBar />);

    const input = screen.getByRole("searchbox", { name: /search products/i }) as HTMLInputElement;
    expect(input.value).toBe("hoodie");
  });

  it("debounces typing by 300ms and updates URL with ?q=value without page reload", async () => {
    render(<SearchBar />);

    const input = screen.getByRole("searchbox", { name: /search products/i });

    // Type query
    act(() => {
      input.focus();
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(input, "jacket");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // Before 300ms, router.replace should not be called
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(mockReplace).not.toHaveBeenCalled();

    // After 300ms, router.replace should be called with q=jacket and reset page to 1
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace.mock.calls[0][0]).toContain("q=jacket");
  });

  it("renders clear button when text is present, clicking it clears input and updates URL", () => {
    mockSearchParams = new URLSearchParams("q=denim");
    render(<SearchBar />);

    const input = screen.getByRole("searchbox", { name: /search products/i }) as HTMLInputElement;
    expect(input.value).toBe("denim");

    const clearButton = screen.getByRole("button", { name: /clear search/i });
    expect(clearButton).toBeTruthy();

    act(() => {
      clearButton.click();
    });

    expect(input.value).toBe("");
    expect(mockReplace.mock.calls[0][0]).not.toContain("q=");
  });

  it("immediately pushes search on Enter key press without waiting for debounce timer", () => {
    render(<SearchBar />);

    const input = screen.getByRole("searchbox", { name: /search products/i });

    act(() => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(input, "sneakers");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(mockReplace).not.toHaveBeenCalled();

    act(() => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace.mock.calls[0][0]).toContain("q=sneakers");
  });
});
