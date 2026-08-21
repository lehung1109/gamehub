import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BackButton } from "@/components/custom/BackButton";

describe("BackButton component", () => {
  it("renders default label and href to /", () => {
    render(<BackButton />);
    const link = screen.getByRole("link", { name: /trang chủ/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders custom label and custom href", () => {
    render(<BackButton href="/games/flashcard" label="Chọn chủ đề" />);
    const link = screen.getByRole("link", { name: /chọn chủ đề/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/games/flashcard");
  });
});
