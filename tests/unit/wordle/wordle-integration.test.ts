import { describe, it, expect } from "vitest";
import games from "@/data/games.json";
import { GAME_INSTRUCTIONS } from "@/data/game-instructions";
import { GAME_CONFIG_SCHEMAS } from "@/lib/game-config-schema";

describe("Wordle Platform Integration", () => {
  it("registers Wordle Master in games.json", () => {
    const wordle = games.find((g) => g.id === "wordle");
    expect(wordle).toBeDefined();
    expect(wordle?.slug).toBe("wordle");
    expect(wordle?.route).toBe("/games/wordle");
    expect(wordle?.titleEn).toBe("Wordle Master");
    expect(wordle?.titleVi).toBe("Thử Thách Đoán Từ");
    expect(wordle?.emoji).toBe("🟩");
    expect(wordle?.priority).toBe(14);
  });

  it("has comprehensive game instructions in game-instructions.ts", () => {
    const instructions = GAME_INSTRUCTIONS["wordle"];
    expect(instructions).toBeDefined();
    expect(instructions.titleVi).toBe("Thử Thách Đoán Từ");
    expect(instructions.titleEn).toBe("Wordle Master");
    expect(instructions.quickSummary).toBeDefined();
    expect(instructions.howToPlay).toBeDefined();
    expect(instructions.howToPlay?.length).toBeGreaterThan(0);
    expect(instructions.tips.length).toBeGreaterThan(0);
    expect(instructions.benefits).toBeDefined();
    expect(instructions.benefits?.length).toBeGreaterThan(0);

    // Verify color guide is present in howToPlay
    const howToPlayText = instructions.howToPlay?.join(" ") ?? "";
    expect(howToPlayText.toLowerCase()).toContain("xanh");
    expect(howToPlayText.toLowerCase()).toContain("vàng");
    expect(howToPlayText.toLowerCase()).toContain("xám");
  });

  it("defines configuration schema for Wordle in game-config-schema.ts", () => {
    const schema = GAME_CONFIG_SCHEMAS["wordle"];
    expect(schema).toBeDefined();
    expect(schema.fields).toBeDefined();
    expect(schema.fields.allowedLengths).toBeDefined();
    expect(schema.fields.categories).toBeDefined();
    expect(schema.fields.maxAttempts).toBeDefined();
    expect(schema.fields.allowHints).toBeDefined();
  });
});
