import { describe, it, expect } from "vitest";
import type { Game, Topic, Word, Letter, GameNumber, Color, Sentence } from "@/types";
import type { PreviewPayload, UseGameConfigResult, FlashcardSettings } from "@/types/config";

describe("Type definitions", () => {
  it("allows constructing valid Game objects", () => {
    const game: Game = {
      id: "flashcard",
      slug: "flashcard",
      titleVi: "Học từ vựng",
      titleEn: "Flashcard",
      description: "Học từ vựng qua thẻ lật",
      emoji: "🃏",
      route: "/games/flashcard",
      priority: 1,
    };
    expect(game.id).toBe("flashcard");
  });

  it("allows constructing valid Topic objects", () => {
    const topic: Topic = {
      id: "animals",
      nameEn: "Animals",
      nameVi: "Động vật",
      emoji: "🐾",
    };
    expect(topic.id).toBe("animals");
  });

  it("allows constructing valid Word objects", () => {
    const word: Word = {
      id: "cat",
      english: "Cat",
      phonetic: "/kæt/",
      vietnamese: "Con mèo",
      emoji: "🐱",
      topicId: "animals",
    };
    expect(word.english).toBe("Cat");
  });

  it("allows constructing valid Letter objects", () => {
    const letter: Letter = {
      letter: "A",
      phonetic: "/eɪ/",
      exampleWord: "Apple",
      exampleEmoji: "🍎",
    };
    expect(letter.letter).toBe("A");
  });

  it("allows constructing valid GameNumber objects", () => {
    const num: GameNumber = {
      value: 1,
      english: "One",
      vietnamese: "Một",
      emoji: "🍎",
    };
    expect(num.value).toBe(1);
  });

  it("allows constructing valid Color objects", () => {
    const color: Color = {
      id: "red",
      english: "Red",
      vietnamese: "Đỏ",
      hex: "#EF4444",
      tailwindClass: "bg-red-500",
    };
    expect(color.id).toBe("red");
  });

  it("allows constructing valid Sentence objects", () => {
    const sentence: Sentence = {
      id: "i-am-eating",
      words: ["I", "am", "eating"],
      full: "I am eating",
      vietnamese: "Tôi đang ăn",
      emoji: "🍽️",
      category: "daily-actions",
    };
    expect(sentence.words).toHaveLength(3);
  });

  it("allows constructing valid PreviewPayload objects", () => {
    const payload: PreviewPayload = {
      gameId: "flashcard",
      settings: {
        topics: ["animals"],
        wordLimit: 5,
        autoSpeak: false,
      },
    };
    expect(payload.gameId).toBe("flashcard");
    expect(payload.settings).toEqual({
      topics: ["animals"],
      wordLimit: 5,
      autoSpeak: false,
    });
  });

  it("allows constructing valid UseGameConfigResult objects with isPreview", () => {
    const result: UseGameConfigResult<FlashcardSettings> = {
      config: null,
      settings: {
        topics: ["animals"],
        wordLimit: 5,
        autoSpeak: true,
      },
      configName: null,
      configId: null,
      isLoading: false,
      isPreview: true,
    };
    expect(result.isPreview).toBe(true);
    expect(result.settings?.wordLimit).toBe(5);
  });
});
