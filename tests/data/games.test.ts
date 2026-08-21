import { describe, it, expect } from "vitest";
import games from "@/data/games.json";
import { Game } from "@/types";

describe("games.json data integrity", () => {
  it("contains exactly 6 games", () => {
    expect(Array.isArray(games)).toBe(true);
    expect(games).toHaveLength(6);
  });

  it("each game satisfies the Game interface and validation rules", () => {
    const ids = new Set<string>();
    const priorities = new Set<number>();

    const expectedGameIds = [
      "flashcard",
      "alphabet",
      "listening",
      "spelling",
      "numbers-colors",
      "sentences",
    ];

    games.forEach((game: Game, index: number) => {
      expect(game.id).toBeDefined();
      expect(typeof game.id).toBe("string");
      expect(game.id.length).toBeGreaterThan(0);
      expect(ids.has(game.id)).toBe(false);
      ids.add(game.id);

      expect(game.slug).toBeDefined();
      expect(typeof game.slug).toBe("string");
      expect(game.slug).toBe(game.id);

      expect(game.titleVi).toBeDefined();
      expect(typeof game.titleVi).toBe("string");
      expect(game.titleVi.length).toBeGreaterThan(0);

      expect(game.titleEn).toBeDefined();
      expect(typeof game.titleEn).toBe("string");
      expect(game.titleEn.length).toBeGreaterThan(0);

      expect(game.description).toBeDefined();
      expect(typeof game.description).toBe("string");
      expect(game.description.length).toBeGreaterThan(0);

      expect(game.emoji).toBeDefined();
      expect(typeof game.emoji).toBe("string");
      expect(game.emoji.length).toBeGreaterThan(0);

      expect(game.route).toBeDefined();
      expect(typeof game.route).toBe("string");
      expect(game.route).toBe(`/games/${game.slug}`);

      expect(typeof game.priority).toBe("number");
      expect(game.priority).toBe(index + 1);
      priorities.add(game.priority);
    });

    expect(Array.from(ids)).toEqual(expectedGameIds);
    expect(priorities.size).toBe(6);
  });
});
