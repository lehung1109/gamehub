import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HomePage from "@/app/page";
import games from "@/data/games.json";

describe("HomePage (src/app/page.tsx)", () => {
  it("renders the header and welcoming title for kids", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /gamehub|tiếng anh/i })
    ).toBeInTheDocument();
  });

  it("renders all 6 game cards sorted strictly by priority order in the DOM", () => {
    render(<HomePage />);

    const mainRegion = screen.getByRole("main", { name: /danh sách trò chơi/i });
    const gameLinks = within(mainRegion).getAllByRole("link");
    expect(gameLinks.length).toBe(6);

    // Verify all 6 games are present in strict priority order
    const sortedGames = [...games].sort((a, b) => a.priority - b.priority);
    const expectedRoutes = sortedGames.map((g) => g.route);
    const actualRoutes = gameLinks.map((link) => link.getAttribute("href"));

    expect(actualRoutes).toEqual(expectedRoutes);

    // Verify titles, badges, and emojis for each game
    sortedGames.forEach((game) => {
      expect(screen.getByText(game.titleVi)).toBeInTheDocument();
      expect(screen.getByText(game.titleEn)).toBeInTheDocument();
      expect(screen.getByText(game.emoji)).toBeInTheDocument();
    });
  });

  it("renders a login button linking to /login for teachers/admins", () => {
    render(<HomePage />);

    const loginLink = screen.getByRole("link", { name: /đăng nhập/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("links to all 6 game routes correctly and accessibly", () => {
    render(<HomePage />);

    games.forEach((game) => {
      const link = screen.getByRole("link", {
        name: new RegExp(game.titleVi, "i"),
      });
      expect(link).toHaveAttribute("href", game.route);
    });
  });

  it("renders empty state fallback gracefully when no games are provided", () => {
    render(<HomePage gamesOverride={[]} />);

    expect(
      screen.getByRole("heading", { level: 2, name: /chưa có trò chơi nào/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/các trò chơi đang được cập nhật/i)
    ).toBeInTheDocument();
  });
});
