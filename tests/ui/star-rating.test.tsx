import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StarRating } from "@/components/reviews/star-rating";

describe("StarRating UI Component", () => {
  it("renders 5 stars in read-only mode by default", () => {
    render(<StarRating rating={4} />);

    const starsContainer = screen.getByRole("img", { name: /4 out of 5 stars/i });
    expect(starsContainer).toBeTruthy();
  });

  it("clicking the 4th star sets rating value to 4 and calls onChange", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <StarRating
        rating={1}
        interactive={true}
        onChange={handleChange}
      />
    );

    const fourthStar = screen.getByRole("radio", { name: /4 stars/i });
    expect(fourthStar).toBeTruthy();

    await user.click(fourthStar);

    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it("supports keyboard navigation with Enter and Space keys", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <StarRating
        rating={2}
        interactive={true}
        onChange={handleChange}
      />
    );

    const fifthStar = screen.getByRole("radio", { name: /5 stars/i });
    fifthStar.focus();
    expect(document.activeElement).toBe(fifthStar);

    await user.keyboard("{Enter}");
    expect(handleChange).toHaveBeenCalledWith(5);

    const thirdStar = screen.getByRole("radio", { name: /3 stars/i });
    thirdStar.focus();
    await user.keyboard(" ");
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it("renders with numeric score when showScore is true", () => {
    render(<StarRating rating={4.5} showScore={true} />);

    expect(screen.getByText("4.5")).toBeTruthy();
  });

  it("does not trigger onChange when disabled is true", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <StarRating
        rating={3}
        interactive={true}
        disabled={true}
        onChange={handleChange}
      />
    );

    const fourthStar = screen.getByRole("radio", { name: /4 stars/i });
    await user.click(fourthStar);

    expect(handleChange).not.toHaveBeenCalled();
  });
});
