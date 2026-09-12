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

  it("renders all game cards sorted strictly by priority order in the DOM", () => {
    render(<HomePage />);

    const mainRegion = screen.getByRole("main", { name: /danh sách trò chơi/i });
    const gameLinks = within(mainRegion).getAllByRole("link");
    expect(gameLinks.length).toBe(20);
    expect(gameLinks.length).toBe(games.length);

    // Verify all games are present in strict priority order
    const sortedGames = [...games].sort((a, b) => a.priority - b.priority);
    const expectedRoutes = sortedGames.map((g) => g.route);
    const actualRoutes = gameLinks.map((link) => link.getAttribute("href"));

    expect(actualRoutes).toEqual(expectedRoutes);

    // Verify titles, badges, and emojis for each game within each card
    gameLinks.forEach((link, idx) => {
      const game = sortedGames[idx];
      expect(within(link).getByText(game.titleVi)).toBeInTheDocument();
      expect(within(link).getByText(game.titleEn)).toBeInTheDocument();
      expect(within(link).getByText(game.emoji)).toBeInTheDocument();
    });
  });

  it("renders category tabs and search input on the homepage", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("tablist", { name: /phân loại trò chơi/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /tất cả/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /từ vựng/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /phát âm & nghe/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /ngữ pháp & đặt câu/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /giải đố arcade/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /đọc & hội thoại/i })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/tìm kiếm trò chơi/i)
    ).toBeInTheDocument();
  });

  it("renders a login button linking to /login for teachers/admins", () => {
    render(<HomePage />);

    const loginLink = screen.getByRole("link", { name: /đăng nhập/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("renders the daily streak badge in the top bar", () => {
    render(<HomePage />);

    const streakBadge = screen.getByRole("button", { name: /chuỗi học tập/i });
    expect(streakBadge).toBeInTheDocument();
  });

  it("links to all game routes correctly and accessibly", () => {
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

  it("renders banners linking to Tenses and Parts of Speech hubs", () => {
    render(<HomePage />);

    const tensesLink = screen.getByRole("link", {
      name: /khám phá hub 12 thì/i,
    });
    expect(tensesLink).toBeInTheDocument();
    expect(tensesLink).toHaveAttribute("href", "/tenses");

    const posLink = screen.getByRole("link", {
      name: /khám phá hub từ loại/i,
    });
    expect(posLink).toBeInTheDocument();
    expect(posLink).toHaveAttribute("href", "/parts-of-speech");
  });
});
