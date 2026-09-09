import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFallingWordsEngine } from "@/hooks/useFallingWordsEngine";

describe("useFallingWordsEngine Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with 3 lives, 60s time, 0 score, 0 combo and empty target", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));
    expect(result.current.lives).toBe(3);
    expect(result.current.timeLeft).toBe(60);
    expect(result.current.score).toBe(0);
    expect(result.current.combo).toBe(0);
    expect(result.current.maxCombo).toBe(0);
    expect(result.current.bombsAvailable).toBe(0);
    expect(result.current.isFrozen).toBe(false);
    expect(result.current.isGameOver).toBe(false);
    expect(result.current.isVictory).toBe(false);
    expect(result.current.targetWordId).toBeNull();
    expect(result.current.wordsPopped).toEqual([]);
    expect(result.current.lastPoppedWord).toBeNull();
  });

  it("auto-locks onto lowest word matching typed letter", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));

    act(() => {
      result.current.spawnWordWithProperties({
        word: "CAT",
        clue: "Con mèo",
        y: 20,
        lane: 0,
      });
      result.current.spawnWordWithProperties({
        word: "COW",
        clue: "Con bò",
        y: 60,
        lane: 1,
      });
    });

    // Both start with C, but COW is lower (y=60 > y=20), so it should auto-lock COW
    act(() => {
      const res = result.current.typeLetter("C");
      expect(res.matched).toBe(true);
      expect(res.popped).toBe(false);
    });

    expect(result.current.targetWordId).not.toBeNull();
    const targeted = result.current.fallingWords.find(
      (w) => w.id === result.current.targetWordId
    );
    expect(targeted?.word).toBe("COW");
    expect(targeted?.isTargeted).toBe(true);
  });

  it("increments combo, awards points and pops word upon completion", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));

    act(() => {
      result.current.spawnWordWithProperties({
        word: "CAT",
        clue: "Con mèo",
        y: 20,
        lane: 0,
      });
    });

    act(() => {
      const res = result.current.typeLetter("c"); // lowercase input normalized
      expect(res.matched).toBe(true);
      expect(res.popped).toBe(false);
    });
    expect(result.current.targetWordId).not.toBeNull();

    act(() => {
      const res = result.current.typeLetter("A");
      expect(res.matched).toBe(true);
      expect(res.popped).toBe(false);
    });

    act(() => {
      const res = result.current.typeLetter("T");
      expect(res.matched).toBe(true);
      expect(res.popped).toBe(true);
      expect(res.word?.word).toBe("CAT");
    });

    expect(result.current.combo).toBe(1);
    expect(result.current.maxCombo).toBe(1);
    expect(result.current.score).toBeGreaterThan(50);
    expect(result.current.wordsPopped.length).toBe(1);
    expect(result.current.lastPoppedWord?.word).toBe("CAT");
    expect(result.current.targetWordId).toBeNull();
    expect(result.current.fallingWords.length).toBe(0);
  });

  it("rejects wrong letter without clearing typed progress or target", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));

    act(() => {
      result.current.spawnWordWithProperties({
        word: "DOG",
        clue: "Con chó",
        y: 30,
        lane: 0,
      });
    });

    act(() => {
      result.current.typeLetter("D");
    });
    expect(result.current.targetWordId).not.toBeNull();

    act(() => {
      const res = result.current.typeLetter("Z");
      expect(res.matched).toBe(false);
      expect(res.popped).toBe(false);
    });

    const word = result.current.fallingWords.find((w) => w.id === result.current.targetWordId);
    expect(word?.typedIndex).toBe(1); // Still 1 after typing 'D'
  });

  it("triggers special power 'double_score' multiplying word points by 2", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));

    act(() => {
      result.current.spawnWordWithProperties({
        word: "FOX",
        clue: "Con cáo",
        y: 20,
        lane: 0,
        specialType: "double_score",
      });
    });

    act(() => {
      result.current.typeLetter("F");
      result.current.typeLetter("O");
      result.current.typeLetter("X");
    });

    // Score without double: 50 + Math.floor((100 - 20) * 0.5) + (0 * 10) = 50 + 40 = 90
    // With double_score: 90 * 2 = 180
    expect(result.current.score).toBe(180);
  });

  it("triggers special power 'heal_life' restoring 1 lost heart", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));

    // Cause 1 life loss first via ground collision
    act(() => {
      result.current.spawnWordWithProperties({
        word: "BAT",
        clue: "Con dơi",
        y: 94,
        speed: 20,
      });
    });
    act(() => {
      result.current.updatePhysics(0.5); // y becomes 104 >= 95 -> loses 1 heart
    });
    expect(result.current.lives).toBe(2);

    // Now spawn and pop a heal_life word
    act(() => {
      result.current.spawnWordWithProperties({
        word: "BEE",
        clue: "Con ong",
        y: 20,
        lane: 1,
        specialType: "heal_life",
      });
    });

    act(() => {
      result.current.typeLetter("B");
      result.current.typeLetter("E");
      result.current.typeLetter("E");
    });

    expect(result.current.lives).toBe(3);
  });

  it("triggers special power 'slow_freeze' setting isFrozen to true", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));

    act(() => {
      result.current.spawnWordWithProperties({
        word: "PIG",
        clue: "Con heo",
        y: 20,
        lane: 0,
        specialType: "slow_freeze",
      });
    });

    act(() => {
      result.current.typeLetter("P");
      result.current.typeLetter("I");
      result.current.typeLetter("G");
    });

    expect(result.current.isFrozen).toBe(true);
  });

  it("triggers 3s freeze at combo 5 and awards +1 bomb at combo 10", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

    // Pop 5 words sequentially to reach combo 5
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.spawnWordWithProperties({
          word: `W${letters[i]}`,
          clue: `Word ${i}`,
          y: 10,
        });
        result.current.typeLetter("W");
        result.current.typeLetter(letters[i]);
      });
    }

    expect(result.current.combo).toBe(5);
    expect(result.current.isFrozen).toBe(true);

    // Pop 5 more words to reach combo 10
    for (let i = 5; i < 10; i++) {
      act(() => {
        result.current.spawnWordWithProperties({
          word: `W${letters[i]}`,
          clue: `Word ${i}`,
          y: 10,
        });
        result.current.typeLetter("W");
        result.current.typeLetter(letters[i]);
      });
    }

    expect(result.current.combo).toBe(10);
    expect(result.current.bombsAvailable).toBe(1);
  });

  it("deducts 1 life and resets combo when word hits bottom (y >= 95)", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));

    act(() => {
      result.current.spawnWordWithProperties({
        word: "DOG",
        clue: "Con chó",
        y: 94,
        speed: 20,
        lane: 1,
      });
    });

    // Advance physics dt = 0.5s -> y becomes 94 + 10 = 104 >= 95
    act(() => {
      result.current.updatePhysics(0.5);
    });

    expect(result.current.lives).toBe(2);
    expect(result.current.combo).toBe(0);
    expect(result.current.fallingWords.length).toBe(0);
  });

  it("clears targetWordId if targeted word hits bottom", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));

    act(() => {
      result.current.spawnWordWithProperties({
        word: "CAT",
        clue: "Con mèo",
        y: 93,
        speed: 10,
      });
    });

    act(() => {
      result.current.typeLetter("C");
    });
    expect(result.current.targetWordId).not.toBeNull();

    act(() => {
      result.current.updatePhysics(0.5); // y becomes 98 >= 95
    });

    expect(result.current.targetWordId).toBeNull();
  });

  it("triggers game over and sets isVictory to false when all 3 lives lost", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));

    act(() => {
      result.current.spawnWordWithProperties({ word: "A", clue: "A", y: 94, speed: 20 });
      result.current.spawnWordWithProperties({ word: "B", clue: "B", y: 94, speed: 20 });
      result.current.spawnWordWithProperties({ word: "C", clue: "C", y: 94, speed: 20 });
    });

    act(() => {
      result.current.updatePhysics(0.5);
    });

    expect(result.current.lives).toBe(0);
    expect(result.current.isGameOver).toBe(true);
    expect(result.current.isVictory).toBe(false);
  });

  it("triggerBomb clears all words and grants 50 points each when bomb available", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));

    act(() => {
      result.current.awardBomb();
      result.current.spawnWordWithProperties({ word: "BIRD", clue: "Con chim", y: 10, lane: 0 });
      result.current.spawnWordWithProperties({ word: "FISH", clue: "Con cá", y: 30, lane: 2 });
    });

    expect(result.current.bombsAvailable).toBe(1);
    expect(result.current.fallingWords.length).toBe(2);

    act(() => {
      const detonated = result.current.triggerBomb();
      expect(detonated).toBe(true);
    });

    expect(result.current.bombsAvailable).toBe(0);
    expect(result.current.fallingWords.length).toBe(0);
    expect(result.current.score).toBe(100);
    expect(result.current.wordsPopped.length).toBe(2);
  });

  it("triggerBomb returns false when bombsAvailable is 0 or arena is empty", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));

    act(() => {
      const detonated = result.current.triggerBomb();
      expect(detonated).toBe(false);
    });

    act(() => {
      result.current.awardBomb();
    });

    // Bomb available, but 0 words on screen
    act(() => {
      const detonated = result.current.triggerBomb();
      expect(detonated).toBe(false);
    });
  });

  it("does not advance word positions when isFrozen is true", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));

    act(() => {
      result.current.spawnWordWithProperties({
        word: "FROZEN",
        clue: "Đông cứng",
        y: 20,
        lane: 0,
        specialType: "slow_freeze",
      });
    });

    // Pop the freeze word
    act(() => {
      for (const char of "FROZEN") {
        result.current.typeLetter(char);
      }
    });
    expect(result.current.isFrozen).toBe(true);

    // Spawn another word
    act(() => {
      result.current.spawnWordWithProperties({
        word: "MOVING",
        clue: "Di chuyển",
        y: 30,
        speed: 20,
        lane: 1,
      });
    });

    // Update physics while frozen
    act(() => {
      result.current.updatePhysics(1.0);
    });

    const word = result.current.fallingWords.find((w) => w.word === "MOVING");
    expect(word?.y).toBe(30); // Did not move
  });

  it("restarts game resetting all state and initializes fresh word queue", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));

    act(() => {
      result.current.spawnWordWithProperties({ word: "CAT", clue: "Con mèo", y: 20 });
      result.current.typeLetter("C");
      result.current.awardBomb();
    });

    expect(result.current.targetWordId).not.toBeNull();
    expect(result.current.bombsAvailable).toBe(1);

    act(() => {
      result.current.restartGame("fruits");
    });

    expect(result.current.topicId).toBe("fruits");
    expect(result.current.lives).toBe(3);
    expect(result.current.score).toBe(0);
    expect(result.current.combo).toBe(0);
    expect(result.current.bombsAvailable).toBe(0);
    expect(result.current.fallingWords.length).toBe(0);
    expect(result.current.targetWordId).toBeNull();
    expect(result.current.wordsPopped.length).toBe(0);
  });
});
