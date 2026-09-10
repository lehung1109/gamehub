import { describe, it, expect } from "vitest";
import gamesList from "@/data/games.json";
import { getGameInstruction } from "@/data/game-instructions";

describe("game-instructions data", () => {
  it("contains instructions for all games defined in games.json", () => {
    for (const game of gamesList) {
      const instruction = getGameInstruction(game.id);
      expect(instruction, `Missing instructions for game id: ${game.id}`).toBeDefined();
      expect(instruction?.titleVi).toBeTruthy();
      expect(instruction?.titleEn).toBeTruthy();
      expect(instruction?.emoji).toBeTruthy();
      expect(instruction?.summary).toBeTruthy();
      expect(instruction?.goal).toBeTruthy();
      expect(Array.isArray(instruction?.steps)).toBe(true);
      expect(instruction!.steps.length).toBeGreaterThanOrEqual(3);
      expect(instruction?.controls).toBeDefined();
      expect(Array.isArray(instruction?.tips)).toBe(true);
      expect(instruction!.tips.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("contains instructions for extended games (typing, roleplay, reading)", () => {
    const extendedGames = ["typing", "roleplay", "reading"];
    for (const id of extendedGames) {
      const instruction = getGameInstruction(id);
      expect(instruction, `Missing instructions for extended game: ${id}`).toBeDefined();
      expect(instruction!.steps.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("normalizes route paths with subpaths properly", () => {
    expect(getGameInstruction("/games/flashcard")?.id).toBe("flashcard");
    expect(getGameInstruction("/games/flashcard/animals")?.id).toBe("flashcard");
    expect(getGameInstruction("/games/reading/test-module")?.id).toBe("reading");
    expect(getGameInstruction("/games/vocab-defense")?.id).toBe("vocab-defense");
  });

  it("returns fallback or undefined gracefully for unknown game", () => {
    expect(getGameInstruction("non-existent-game")).toBeUndefined();
    expect(getGameInstruction(null)).toBeUndefined();
    expect(getGameInstruction("")).toBeUndefined();
  });
});
