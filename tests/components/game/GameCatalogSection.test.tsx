import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GameCatalogSection } from "@/components/game/GameCatalogSection";
import games from "@/data/games.json";
import { Game } from "@/types";

describe("GameCatalogSection", () => {
  const sampleGames = games as Game[];

  it("renders all games by default under 'Tất cả' tab", () => {
    render(<GameCatalogSection games={sampleGames} />);
    expect(screen.getByRole("tab", { name: /tất cả/i })).toHaveAttribute("aria-selected", "true");
    const gameCards = screen.getAllByRole("link");
    expect(gameCards.length).toBe(sampleGames.length);
  });

  it("filters games by category when tab clicked", () => {
    render(<GameCatalogSection games={sampleGames} />);
    const vocabTab = screen.getByRole("tab", { name: /từ vựng/i });
    fireEvent.click(vocabTab);

    expect(vocabTab).toHaveAttribute("aria-selected", "true");
    const vocabGames = sampleGames.filter((g) => g.category === "vocab");
    const displayedLinks = screen.getAllByRole("link");
    expect(displayedLinks.length).toBe(vocabGames.length);
  });

  it("filters games by search query", () => {
    render(<GameCatalogSection games={sampleGames} />);
    const searchInput = screen.getByPlaceholderText(/tìm kiếm trò chơi/i);
    fireEvent.change(searchInput, { target: { value: "flashcard" } });

    expect(screen.getByText("Học từ vựng")).toBeInTheDocument();
    expect(screen.queryByText("Mưa Từ Vựng")).not.toBeInTheDocument();
  });

  it("shows friendly empty state when search finds nothing and allows resetting", () => {
    render(<GameCatalogSection games={sampleGames} />);
    const searchInput = screen.getByPlaceholderText(/tìm kiếm trò chơi/i);
    fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });

    expect(screen.getByText(/không tìm thấy trò chơi nào/i)).toBeInTheDocument();
    const resetBtn = screen.getByRole("button", { name: /xóa bộ lọc|làm mới/i });
    fireEvent.click(resetBtn);

    expect(screen.getAllByRole("link").length).toBe(sampleGames.length);
  });
});
