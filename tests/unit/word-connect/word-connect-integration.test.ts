import { describe, it, expect } from "vitest";
import games from "@/data/games.json";
import { GAME_INSTRUCTIONS, getGameInstruction } from "@/data/game-instructions";
import { GAME_CONFIG_SCHEMAS } from "@/lib/game-config-schema";

describe("Word Connect Platform Integration", () => {
  it("registers Word Connect in games.json with correct metadata", () => {
    const wordConnect = games.find((g) => g.id === "word-connect");
    expect(wordConnect).toBeDefined();
    expect(wordConnect?.slug).toBe("word-connect");
    expect(wordConnect?.route).toBe("/games/word-connect");
    expect(wordConnect?.titleEn).toBe("Word Connect");
    expect(wordConnect?.titleVi).toBe("Vòng Xoay Nối Chữ");
    expect(wordConnect?.emoji).toBe("🔄");
    expect(wordConnect?.priority).toBe(15);
  });

  it("has comprehensive game instructions in game-instructions.ts", () => {
    const instructions = GAME_INSTRUCTIONS["word-connect"];
    expect(instructions).toBeDefined();
    expect(instructions.id).toBe("word-connect");
    expect(instructions.slug).toBe("word-connect");
    expect(instructions.titleVi).toBe("Vòng Xoay Nối Chữ");
    expect(instructions.titleEn).toBe("Word Connect");
    expect(instructions.emoji).toBe("🔄");
    expect(instructions.summary).toBeTruthy();
    expect(instructions.quickSummary).toBeDefined();
    expect(instructions.goal).toBeTruthy();
    expect(instructions.steps.length).toBeGreaterThanOrEqual(3);
    expect(instructions.howToPlay).toBeDefined();
    expect(instructions.howToPlay?.length).toBeGreaterThan(0);
    expect(instructions.controls.mouse).toBeTruthy();
    expect(instructions.controls.touch).toBeTruthy();
    expect(instructions.controls.keyboard).toBeTruthy();
    expect(instructions.tips.length).toBeGreaterThan(0);
    expect(instructions.benefits).toBeDefined();
    expect(instructions.benefits?.length).toBeGreaterThan(0);

    // Verify lookup via getGameInstruction helper
    const byId = getGameInstruction("word-connect");
    expect(byId).toBeDefined();
    expect(byId?.id).toBe("word-connect");

    const byRoute = getGameInstruction("/games/word-connect");
    expect(byRoute).toBeDefined();
    expect(byRoute?.id).toBe("word-connect");
  });

  it("defines configuration schema for Word Connect in game-config-schema.ts", () => {
    const schema = GAME_CONFIG_SCHEMAS["word-connect"];
    expect(schema).toBeDefined();
    expect(schema.gameId).toBe("word-connect");
    expect(schema.title).toBeTruthy();
    expect(schema.description).toBeTruthy();
    expect(schema.fields).toBeDefined();

    // Verify required configurable fields
    expect(schema.fields.difficultyRange).toBeDefined();
    expect(schema.fields.difficultyRange.name).toBe("difficultyRange");

    expect(schema.fields.allowHints).toBeDefined();
    expect(schema.fields.allowHints.name).toBe("allowHints");
    expect(schema.fields.allowHints.type).toBe("boolean");

    expect(schema.fields.allowShuffle).toBeDefined();
    expect(schema.fields.allowShuffle.name).toBe("allowShuffle");
    expect(schema.fields.allowShuffle.type).toBe("boolean");

    expect(schema.fields.enableBonusWords).toBeDefined();
    expect(schema.fields.enableBonusWords.name).toBe("enableBonusWords");
    expect(schema.fields.enableBonusWords.type).toBe("boolean");
  });
});
