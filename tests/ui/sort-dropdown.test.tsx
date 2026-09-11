import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortDropdown } from "@/components/search/sort-dropdown";

const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/products",
}));

describe("SortDropdown UI Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("renders accessible sort select dropdown with all sort options", () => {
    render(<SortDropdown currentSort="newest" />);

    const select = screen.getByRole("combobox", { name: /sort products/i });
    expect(select).toBeTruthy();
    expect(screen.getByRole("option", { name: /newest arrivals/i })).toBeTruthy();
    expect(screen.getByRole("option", { name: /price: low to high/i })).toBeTruthy();
    expect(screen.getByRole("option", { name: /price: high to low/i })).toBeTruthy();
    expect(screen.getByRole("option", { name: /featured/i })).toBeTruthy();
  });

  it("changing selection updates URL with new sort option and resets page", async () => {
    const user = userEvent.setup();
    mockSearchParams = new URLSearchParams("page=2");
    render(<SortDropdown currentSort="newest" />);

    const select = screen.getByRole("combobox", { name: /sort products/i });
    await user.selectOptions(select, "price_asc");

    expect(mockReplace.mock.calls[0][0]).toContain("sort=price_asc");
    expect(mockReplace.mock.calls[0][0]).not.toContain("page=");
  });
});
