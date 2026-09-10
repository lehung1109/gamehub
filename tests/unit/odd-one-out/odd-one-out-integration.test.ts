import { describe, it, expect } from "vitest";
import games from "@/data/games.json";
import { GAME_INSTRUCTIONS, getGameInstruction } from "@/data/game-instructions";
import { GAME_CONFIG_SCHEMAS } from "@/lib/game-config-schema";

describe("Odd One Out Platform Integration", () => {
  it("registers Odd One Out in games.json with correct metadata", () => {
    const oddOneOut = games.find((g) => g.id === "odd-one-out");
    expect(oddOneOut).toBeDefined();
    expect(oddOneOut?.slug).toBe("odd-one-out");
    expect(oddOneOut?.route).toBe("/games/odd-one-out");
    expect(oddOneOut?.titleEn).toBe("Odd One Out");
    expect(oddOneOut?.titleVi).toBe("Truy Tìm Kẻ Lạc Loài");
    expect(oddOneOut?.emoji).toBe("🎯");
    expect(oddOneOut?.priority).toBe(16);
    expect(oddOneOut?.description).toBe(
      "Phân tích ngữ nghĩa, tìm từ không cùng nhóm và hiểu sâu sắc bản chất từ vựng qua giải thích song ngữ"
    );
  });

  it("has comprehensive game instructions in game-instructions.ts", () => {
    const instructions = GAME_INSTRUCTIONS["odd-one-out"];
    expect(instructions).toBeDefined();
    expect(instructions.id).toBe("odd-one-out");
    expect(instructions.slug).toBe("odd-one-out");
    expect(instructions.titleVi).toBe("Truy Tìm Kẻ Lạc Loài");
    expect(instructions.titleEn).toBe("Odd One Out");
    expect(instructions.emoji).toBe("🎯");
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
    const byId = getGameInstruction("odd-one-out");
    expect(byId).toBeDefined();
    expect(byId?.id).toBe("odd-one-out");

    const byRoute = getGameInstruction("/games/odd-one-out");
    expect(byRoute).toBeDefined();
    expect(byRoute?.id).toBe("odd-one-out");
  });

  it("defines configuration schema for Odd One Out in game-config-schema.ts", () => {
    const schema = GAME_CONFIG_SCHEMAS["odd-one-out"];
    expect(schema).toBeDefined();
    expect(schema.gameId).toBe("odd-one-out");
    expect(schema.title).toBeTruthy();
    expect(schema.description).toBeTruthy();
    expect(schema.fields).toBeDefined();

    // Verify required configurable fields
    expect(schema.fields.difficulty).toBeDefined();
    expect(schema.fields.difficulty.name).toBe("difficulty");
    expect(schema.fields.difficulty.type).toBe("multiselect");

    expect(schema.fields.questionCount).toBeDefined();
    expect(schema.fields.questionCount.name).toBe("questionCount");
    expect(schema.fields.questionCount.type).toBe("number");
    expect(schema.fields.questionCount.min).toBe(5);
    expect(schema.fields.questionCount.max).toBe(20);

    expect(schema.fields.allowHints).toBeDefined();
    expect(schema.fields.allowHints.name).toBe("allowHints");
    expect(schema.fields.allowHints.type).toBe("boolean");
  });

  it("validates game settings and returns defaults for Odd One Out", async () => {
    const { validateGameSettings, getDefaultSettings, isValidGameId } = await import(
      "@/lib/game-config-schema"
    );

    expect(isValidGameId("odd-one-out")).toBe(true);

    const defaults = getDefaultSettings("odd-one-out");
    expect(defaults).toEqual({
      difficulty: ["easy", "medium", "hard"],
      questionCount: 10,
      allowHints: true,
    });

    const validRes = validateGameSettings("odd-one-out", {
      difficulty: ["easy", "hard"],
      questionCount: 15,
      allowHints: false,
    });
    expect(validRes.valid).toBe(true);
    expect(validRes.data).toEqual({
      difficulty: ["easy", "hard"],
      questionCount: 15,
      allowHints: false,
    });

    const fallbackRes = validateGameSettings("odd-one-out", {
      difficulty: ["invalid_difficulty"],
      questionCount: 999, // Should be clamped to max (20)
      allowHints: true,
    });
    expect(fallbackRes.valid).toBe(true);
    expect(fallbackRes.data).toEqual({
      difficulty: ["easy", "medium", "hard"],
      questionCount: 20,
      allowHints: true,
    });
  });
});
