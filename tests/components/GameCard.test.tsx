import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GameCard } from "@/components/custom/GameCard";
import { Game } from "@/types";

const mockGame: Game = {
  id: "flashcard",
  slug: "flashcard",
  titleVi: "Học từ vựng",
  titleEn: "Flashcard",
  description: "Học từ vựng qua thẻ lật với phát âm chuẩn",
  emoji: "🃏",
  route: "/games/flashcard",
  priority: 1,
};

describe("GameCard", () => {
  it("renders game title as an accessible h2 heading, emoji, english title, and description", () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText("🃏")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /học từ vựng/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Flashcard")).toBeInTheDocument();
    expect(
      screen.getByText("Học từ vựng qua thẻ lật với phát âm chuẩn")
    ).toBeInTheDocument();
  });

  it("links to the correct game route without overriding semantic children with aria-label", () => {
    render(<GameCard game={mockGame} />);

    const link = screen.getByRole("link", { name: /học từ vựng/i });
    expect(link).toHaveAttribute("href", "/games/flashcard");
    expect(link).not.toHaveAttribute("aria-label");
  });

  it("applies custom className and focus visible classes", () => {
    const { container } = render(
      <GameCard game={mockGame} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(container.firstChild).toHaveClass("focus-visible:ring-primary");
  });
});
