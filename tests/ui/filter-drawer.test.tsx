import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterDrawer } from "@/components/search/filter-drawer";
import { Category } from "@/types";

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

describe("FilterDrawer UI Component", () => {
  const mockCategories: Category[] = [
    {
      id: "cat-1",
      name: "Apparel",
      slug: "apparel",
      description: "Clothing items",
      imageUrl: null,
      createdAt: new Date(),
    },
    {
      id: "cat-2",
      name: "Footwear",
      slug: "footwear",
      description: "Shoes and boots",
      imageUrl: null,
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("renders mobile trigger button with accessible label and active filter count badge", () => {
    render(
      <FilterDrawer
        categories={mockCategories}
        activeFilterCount={3}
      />
    );

    const triggerBtn = screen.getByRole("button", { name: /filters & sort/i });
    expect(triggerBtn).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("opens sheet modal when trigger button is clicked", async () => {
    const user = userEvent.setup();
    render(<FilterDrawer categories={mockCategories} />);

    expect(screen.queryByRole("dialog")).toBeNull();

    const triggerBtn = screen.getByRole("button", { name: /filters & sort/i });
    await user.click(triggerBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(screen.getByText(/filter & sort products/i)).toBeTruthy();
  });

  it("closes modal when clicking close button ('X')", async () => {
    const user = userEvent.setup();
    render(<FilterDrawer categories={mockCategories} />);

    await user.click(screen.getByRole("button", { name: /filters & sort/i }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    const closeBtn = screen.getByRole("button", { name: /close/i });
    await user.click(closeBtn);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("applying filters inside drawer updates URL and closes drawer", async () => {
    const user = userEvent.setup();
    render(<FilterDrawer categories={mockCategories} />);

    await user.click(screen.getByRole("button", { name: /filters & sort/i }));

    const apparelBtn = screen.getByRole("button", { name: "Apparel" });
    await user.click(apparelBtn);

    const applyBtn = screen.getByRole("button", { name: /show results/i });
    await user.click(applyBtn);

    expect(mockReplace.mock.calls[0][0]).toContain("category=apparel");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
