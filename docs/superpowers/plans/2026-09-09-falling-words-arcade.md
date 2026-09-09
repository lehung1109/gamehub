# Falling Words: Word Rain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Falling Words: Word Rain" (`/games/falling-words`), a fast-paced ESL arcade typing and listening game where players pop falling vocabulary bubbles across 4 lanes before they hit the ground, utilizing auto-lock targeting, combo streaks, smart bombs, and Web Speech pronunciation.

**Architecture:** A delta-time physics game loop hook (`useFallingWordsEngine`) powers the game state with auto-lock targeting and collision handling; responsive React components render the 4-lane arena with accessible bubble elements, danger zone, HUD header, and touch keyboard; completion integrates session tracking, Web Speech audio, and local storage history.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React, Web Speech API (`useSpeech`), Vitest, React Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-09-falling-words-arcade-design.md`

## Global Constraints

- **Typography Compliance:** Every rendered text element (timer, scores, words, clues, labels, buttons) MUST compute to $\ge 16\text{px}$ font size (`text-base`, `text-lg`, `text-xl`). Never use sub-16px utility classes (`text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
- **Touch Targets:** All interactive virtual keyboard buttons and HUD action buttons MUST have a minimum 44px vertical touch target (`min-h-[44px]`).
- **SSR Hydration Safety:** Use `React.useSyncExternalStore` for client-only mounts and procedural random generation to prevent hydration mismatches.
- **W3C ARIA Standards:** Game arena container must have `role="region"` and descriptive label; modal must have `role="dialog"` and `aria-modal="true"`.
- **Audio Reliability:** Use existing `useSpeech` hook for pronunciation upon word completion and modal replay, guarding against unmounted or unsupported speech synthesis states.

---

### Task 1: Types & Spawning Engine Utilities

**Files:**
- Create: `src/types/falling-words.ts`
- Create: `src/lib/falling-words/falling-words-spawner.ts`
- Test: `tests/unit/falling-words/falling-words-spawner.test.ts`

**Interfaces:**
- Consumes: `src/data/words/animals.json`, `src/data/words/fruits.json`, `src/data/words/school.json`, `src/data/words/family.json`, `src/data/words/body-parts.json`.
- Produces:
  - `SpecialPowerType = "double_score" | "heal_life" | "slow_freeze"`
  - `FallingWord`: `{ id: string; word: string; clue: string; phonetic?: string; emoji?: string; lane: number; y: number; speed: number; typedIndex: number; isTargeted: boolean; specialType?: SpecialPowerType }`
  - `FallingWordsState`: Full engine state interface.
  - `getWordsForTopic(topicId: string): VocabularyItem[]`
  - `createFallingWord(vocabItem: VocabularyItem, lane: number, baseSpeed: number, rng?: () => number): FallingWord`
  - `selectAvailableLane(activeLanes: number[], rng?: () => number): number`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/falling-words/falling-words-spawner.test.ts
import { describe, it, expect } from "vitest";
import {
  getWordsForTopic,
  createFallingWord,
  selectAvailableLane,
} from "@/lib/falling-words/falling-words-spawner";

describe("Falling Words Spawner", () => {
  it("loads vocabulary words for valid topics", () => {
    const animalWords = getWordsForTopic("animals");
    expect(animalWords.length).toBeGreaterThan(0);
    expect(animalWords[0]).toHaveProperty("english");
    expect(animalWords[0]).toHaveProperty("vietnamese");
  });

  it("falls back to animals if unknown topic provided", () => {
    const fallbackWords = getWordsForTopic("unknown_topic");
    expect(fallbackWords.length).toBeGreaterThan(0);
  });

  it("creates a falling word with initial coordinates and normal properties", () => {
    const vocab = {
      id: "animal-cat",
      english: "Cat",
      vietnamese: "Con mèo",
      phonetic: "/kæt/",
      emoji: "🐱",
    };
    // Mock RNG returning > 0.20 for no special power
    const word = createFallingWord(vocab, 2, 15, () => 0.5);
    expect(word.word).toBe("CAT");
    expect(word.clue).toBe("Con mèo");
    expect(word.lane).toBe(2);
    expect(word.y).toBe(0);
    expect(word.speed).toBe(15);
    expect(word.typedIndex).toBe(0);
    expect(word.isTargeted).toBe(false);
    expect(word.specialType).toBeUndefined();
  });

  it("spawns special bonus bubble when rng is <= 0.20", () => {
    const vocab = {
      id: "animal-dog",
      english: "Dog",
      vietnamese: "Con chó",
    };
    // RNG: 0.05 triggers special power
    const specialWord1 = createFallingWord(vocab, 0, 10, () => 0.05);
    expect(specialWord1.specialType).toBeDefined();
    expect(["double_score", "heal_life", "slow_freeze"]).toContain(
      specialWord1.specialType
    );
  });

  it("selects least occupied lane among 4 lanes (0 to 3)", () => {
    // If lanes 0, 1, 2 are busy, lane 3 should be selected
    const lane = selectAvailableLane([0, 1, 2]);
    expect(lane).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/falling-words/falling-words-spawner.test.ts`  
Expected: FAIL with module not found or missing exports.

- [ ] **Step 3: Write minimal implementation**

Create `src/types/falling-words.ts`:
```typescript
export type SpecialPowerType = "double_score" | "heal_life" | "slow_freeze";

export interface VocabularyItem {
  id: string;
  english: string;
  vietnamese: string;
  phonetic?: string;
  emoji?: string;
  topicId?: string;
}

export interface FallingWord {
  id: string;
  word: string; // Uppercase for consistent matching
  clue: string;
  phonetic?: string;
  emoji?: string;
  lane: number; // 0, 1, 2, 3
  y: number; // 0 to 100 percentage
  speed: number; // % per second
  typedIndex: number;
  isTargeted: boolean;
  specialType?: SpecialPowerType;
}

export interface PoppedWordSummary {
  word: string;
  clue: string;
  phonetic?: string;
  emoji?: string;
}

export interface FallingWordsState {
  fallingWords: FallingWord[];
  targetWordId: string | null;
  score: number;
  combo: number;
  maxCombo: number;
  lives: number; // 3 to 0
  timeLeft: number; // 60 to 0
  bombsAvailable: number; // 0 to 2
  isFrozen: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  topicId: string;
  wordsPopped: PoppedWordSummary[];
}
```

Create `src/lib/falling-words/falling-words-spawner.ts`:
```typescript
import { FallingWord, SpecialPowerType, VocabularyItem } from "@/types/falling-words";
import animals from "@/data/words/animals.json";
import fruits from "@/data/words/fruits.json";
import school from "@/data/words/school.json";
import family from "@/data/words/family.json";
import bodyParts from "@/data/words/body-parts.json";

const TOPIC_MAP: Record<string, VocabularyItem[]> = {
  animals: animals as VocabularyItem[],
  fruits: fruits as VocabularyItem[],
  school: school as VocabularyItem[],
  family: family as VocabularyItem[],
  "body-parts": bodyParts as VocabularyItem[],
};

export function getWordsForTopic(topicId: string): VocabularyItem[] {
  return TOPIC_MAP[topicId] || TOPIC_MAP.animals;
}

export function createFallingWord(
  vocab: VocabularyItem,
  lane: number,
  baseSpeed: number,
  rng: () => number = Math.random
): FallingWord {
  const cleanWord = vocab.english.replace(/[^a-zA-Z]/g, "").toUpperCase();
  const isSpecial = rng() <= 0.2;
  let specialType: SpecialPowerType | undefined = undefined;

  if (isSpecial) {
    const roll = rng();
    if (roll < 0.45) {
      specialType = "double_score";
    } else if (roll < 0.75) {
      specialType = "slow_freeze";
    } else {
      specialType = "heal_life";
    }
  }

  return {
    id: `${vocab.id || cleanWord}-${Date.now()}-${Math.floor(rng() * 1000)}`,
    word: cleanWord,
    clue: vocab.vietnamese,
    phonetic: vocab.phonetic,
    emoji: vocab.emoji,
    lane,
    y: 0,
    speed: Math.max(8, baseSpeed),
    typedIndex: 0,
    isTargeted: false,
    specialType,
  };
}

export function selectAvailableLane(
  activeLanes: number[],
  rng: () => number = Math.random
): number {
  const allLanes = [0, 1, 2, 3];
  const laneCounts = [0, 0, 0, 0];
  for (const lane of activeLanes) {
    if (lane >= 0 && lane < 4) {
      laneCounts[lane]++;
    }
  }

  const minCount = Math.min(...laneCounts);
  const candidateLanes = allLanes.filter((l) => laneCounts[l] === minCount);

  const chosenIndex = Math.floor(rng() * candidateLanes.length);
  return candidateLanes[chosenIndex];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/falling-words/falling-words-spawner.test.ts`  
Expected: PASS with all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/types/falling-words.ts src/lib/falling-words/falling-words-spawner.ts tests/unit/falling-words/falling-words-spawner.test.ts
git commit -m "feat(falling-words): add types and spawner utilities"
```

---

### Task 2: State Machine & Game Engine Hook (`useFallingWordsEngine`)

**Files:**
- Create: `src/hooks/useFallingWordsEngine.ts`
- Test: `tests/unit/falling-words/useFallingWordsEngine.test.ts`

**Interfaces:**
- Consumes: `src/types/falling-words.ts`, `src/lib/falling-words/falling-words-spawner.ts`.
- Produces: `useFallingWordsEngine(initialTopicId?: string)` returning:
  - State: `fallingWords`, `targetWordId`, `score`, `combo`, `maxCombo`, `lives`, `timeLeft`, `bombsAvailable`, `isFrozen`, `isGameOver`, `isVictory`, `topicId`, `wordsPopped`, `lastPoppedWord: PoppedWordSummary | null`.
  - Actions:
    - `typeLetter(char: string): { matched: boolean; popped: boolean; word?: PoppedWordSummary }`
    - `triggerBomb(): boolean`
    - `updatePhysics(dt: number): void`
    - `restartGame(newTopicId?: string): void`
    - `setTopicId(topicId: string): void`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/falling-words/useFallingWordsEngine.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFallingWordsEngine } from "@/hooks/useFallingWordsEngine";

describe("useFallingWordsEngine Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with 3 lives, 60s time, 0 score and empty target", () => {
    const { result } = renderHook(() => useFallingWordsEngine("animals"));
    expect(result.current.lives).toBe(3);
    expect(result.current.timeLeft).toBe(60);
    expect(result.current.score).toBe(0);
    expect(result.current.combo).toBe(0);
    expect(result.current.bombsAvailable).toBe(0);
    expect(result.current.isGameOver).toBe(false);
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
      result.current.typeLetter("C");
    });

    expect(result.current.targetWordId).not.toBeNull();
    const targeted = result.current.fallingWords.find(
      (w) => w.id === result.current.targetWordId
    );
    expect(targeted?.word).toBe("COW");
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
      result.current.typeLetter("C");
    });
    expect(result.current.targetWordId).toBeDefined();

    act(() => {
      result.current.typeLetter("A");
    });

    act(() => {
      const res = result.current.typeLetter("T");
      expect(res.popped).toBe(true);
    });

    expect(result.current.combo).toBe(1);
    expect(result.current.score).toBeGreaterThan(50);
    expect(result.current.wordsPopped.length).toBe(1);
    expect(result.current.targetWordId).toBeNull();
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
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/falling-words/useFallingWordsEngine.test.ts`  
Expected: FAIL with module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/hooks/useFallingWordsEngine.ts`:
```typescript
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  FallingWord,
  PoppedWordSummary,
  VocabularyItem,
} from "@/types/falling-words";
import {
  getWordsForTopic,
  createFallingWord,
  selectAvailableLane,
} from "@/lib/falling-words/falling-words-spawner";

export function useFallingWordsEngine(initialTopicId: string = "animals") {
  const [topicId, setTopicId] = useState(initialTopicId);
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [targetWordId, setTargetWordId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [bombsAvailable, setBombsAvailable] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [wordsPopped, setWordsPopped] = useState<PoppedWordSummary[]>([]);
  const [lastPoppedWord, setLastPoppedWord] = useState<PoppedWordSummary | null>(null);

  const wordQueueRef = useRef<VocabularyItem[]>([]);
  const spawnTimerRef = useRef(0);
  const freezeTimerRef = useRef(0);

  const initQueue = useCallback((topic: string) => {
    const list = getWordsForTopic(topic);
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    wordQueueRef.current = shuffled;
  }, []);

  useEffect(() => {
    initQueue(topicId);
  }, [topicId, initQueue]);

  const restartGame = useCallback(
    (newTopicId?: string) => {
      const tId = newTopicId || topicId;
      if (newTopicId) setTopicId(newTopicId);
      initQueue(tId);
      setFallingWords([]);
      setTargetWordId(null);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setLives(3);
      setTimeLeft(60);
      setBombsAvailable(0);
      setIsFrozen(false);
      setIsGameOver(false);
      setIsVictory(false);
      setWordsPopped([]);
      setLastPoppedWord(null);
      spawnTimerRef.current = 0;
      freezeTimerRef.current = 0;
    },
    [topicId, initQueue]
  );

  const spawnWordWithProperties = useCallback(
    (props: Partial<FallingWord> & { word: string; clue: string }) => {
      const newWord: FallingWord = {
        id: `word-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        word: props.word.toUpperCase(),
        clue: props.clue,
        phonetic: props.phonetic,
        emoji: props.emoji,
        lane: props.lane ?? 0,
        y: props.y ?? 0,
        speed: props.speed ?? 12,
        typedIndex: props.typedIndex ?? 0,
        isTargeted: false,
        specialType: props.specialType,
      };
      setFallingWords((prev) => [...prev, newWord]);
    },
    []
  );

  const awardBomb = useCallback(() => {
    setBombsAvailable((prev) => Math.min(2, prev + 1));
  }, []);

  const typeLetter = useCallback(
    (char: string) => {
      if (isGameOver || lives <= 0 || timeLeft <= 0) {
        return { matched: false, popped: false };
      }

      const inputChar = char.toUpperCase();
      let matched = false;
      let popped = false;
      let poppedItem: PoppedWordSummary | undefined = undefined;

      setFallingWords((prevWords) => {
        let currentTargetId = targetWordId;
        let targetedWord = prevWords.find((w) => w.id === currentTargetId);

        if (!targetedWord) {
          const candidates = prevWords
            .filter((w) => w.word.length > 0 && w.word[0] === inputChar)
            .sort((a, b) => b.y - a.y);

          if (candidates.length > 0) {
            targetedWord = candidates[0];
            currentTargetId = targetedWord.id;
            setTargetWordId(currentTargetId);
          }
        }

        if (!targetedWord) {
          return prevWords;
        }

        const expectedChar = targetedWord.word[targetedWord.typedIndex];
        if (inputChar === expectedChar) {
          matched = true;
          const nextIndex = targetedWord.typedIndex + 1;

          if (nextIndex >= targetedWord.word.length) {
            popped = true;
            poppedItem = {
              word: targetedWord.word,
              clue: targetedWord.clue,
              phonetic: targetedWord.phonetic,
              emoji: targetedWord.emoji,
            };

            const heightBonus = Math.floor((100 - targetedWord.y) * 0.5);
            const comboBonus = Math.min(100, combo * 10);
            let wordScore = 50 + heightBonus + comboBonus;

            if (targetedWord.specialType === "double_score") {
              wordScore *= 2;
            } else if (targetedWord.specialType === "heal_life") {
              setLives((prev) => Math.min(3, prev + 1));
            } else if (targetedWord.specialType === "slow_freeze") {
              setIsFrozen(true);
              freezeTimerRef.current = 4;
            }

            setScore((s) => s + wordScore);
            const nextCombo = combo + 1;
            setCombo(nextCombo);
            setMaxCombo((m) => Math.max(m, nextCombo));

            if (nextCombo === 5) {
              setIsFrozen(true);
              freezeTimerRef.current = 3;
            } else if (nextCombo > 0 && nextCombo % 10 === 0) {
              setBombsAvailable((b) => Math.min(2, b + 1));
            }

            setWordsPopped((wp) => [...wp, poppedItem!]);
            setLastPoppedWord(poppedItem!);
            setTargetWordId(null);

            return prevWords.filter((w) => w.id !== targetedWord!.id);
          } else {
            return prevWords.map((w) =>
              w.id === targetedWord!.id
                ? { ...w, typedIndex: nextIndex, isTargeted: true }
                : { ...w, isTargeted: false }
            );
          }
        }

        return prevWords;
      });

      return { matched, popped, word: poppedItem };
    },
    [isGameOver, lives, timeLeft, targetWordId, combo]
  );

  const triggerBomb = useCallback(() => {
    if (bombsAvailable <= 0 || fallingWords.length === 0 || isGameOver) {
      return false;
    }

    setBombsAvailable((b) => Math.max(0, b - 1));
    const points = fallingWords.length * 50;
    setScore((s) => s + points);

    const cleared: PoppedWordSummary[] = fallingWords.map((w) => ({
      word: w.word,
      clue: w.clue,
      phonetic: w.phonetic,
      emoji: w.emoji,
    }));
    setWordsPopped((prev) => [...prev, ...cleared]);
    setFallingWords([]);
    setTargetWordId(null);

    return true;
  }, [bombsAvailable, fallingWords, isGameOver]);

  const updatePhysics = useCallback(
    (dt: number) => {
      if (isGameOver) return;

      if (isFrozen) {
        freezeTimerRef.current -= dt;
        if (freezeTimerRef.current <= 0) {
          setIsFrozen(false);
        }
      }

      setFallingWords((prevWords) => {
        const remaining: FallingWord[] = [];
        let livesLost = 0;

        for (const word of prevWords) {
          const moveSpeed = isFrozen ? 0 : word.speed;
          const newY = word.y + moveSpeed * dt;

          if (newY >= 95) {
            livesLost++;
            if (targetWordId === word.id) {
              setTargetWordId(null);
            }
          } else {
            remaining.push({
              ...word,
              y: newY,
              isTargeted: word.id === targetWordId,
            });
          }
        }

        if (livesLost > 0) {
          setCombo(0);
          setLives((l) => {
            const nextLives = Math.max(0, l - livesLost);
            if (nextLives === 0) {
              setIsGameOver(true);
              setIsVictory(false);
            }
            return nextLives;
          });
        }

        return remaining;
      });

      spawnTimerRef.current += dt;
      const spawnInterval = Math.max(1.5, 2.2 - ((60 - timeLeft) / 60) * 0.7);

      if (spawnTimerRef.current >= spawnInterval) {
        spawnTimerRef.current = 0;

        setFallingWords((currentWords) => {
          if (currentWords.length >= 6) return currentWords;

          if (wordQueueRef.current.length === 0) {
            initQueue(topicId);
          }
          const nextVocab = wordQueueRef.current.shift();
          if (!nextVocab) return currentWords;

          const activeLanes = currentWords.map((w) => w.lane);
          const lane = selectAvailableLane(activeLanes);
          const baseSpeed = 9 + ((60 - timeLeft) / 60) * 6;
          const newWord = createFallingWord(nextVocab, lane, baseSpeed);

          return [...currentWords, newWord];
        });
      }
    },
    [isGameOver, isFrozen, targetWordId, timeLeft, topicId, initQueue]
  );

  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setIsGameOver(true);
          setIsVictory(lives > 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver, lives]);

  return {
    topicId,
    fallingWords,
    targetWordId,
    score,
    combo,
    maxCombo,
    lives,
    timeLeft,
    bombsAvailable,
    isFrozen,
    isGameOver,
    isVictory,
    wordsPopped,
    lastPoppedWord,
    typeLetter,
    triggerBomb,
    updatePhysics,
    restartGame,
    setTopicId,
    awardBomb,
    spawnWordWithProperties,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/falling-words/useFallingWordsEngine.test.ts`  
Expected: PASS with all tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useFallingWordsEngine.ts tests/unit/falling-words/useFallingWordsEngine.test.ts
git commit -m "feat(falling-words): implement useFallingWordsEngine state machine hook"
```

---

### Task 3: Falling Words Arena & Bubble Components

**Files:**
- Create: `src/components/game/falling-words/FallingWordBubble.tsx`
- Create: `src/components/game/falling-words/FallingWordsArena.tsx`
- Test: `tests/components/falling-words/FallingWordBubble.test.tsx`
- Test: `tests/components/falling-words/FallingWordsArena.test.tsx`

**Interfaces:**
- Consumes: `FallingWord` from `src/types/falling-words.ts`.
- Produces:
  - `FallingWordBubble`: Props `{ word: FallingWord }`
  - `FallingWordsArena`: Props `{ fallingWords: FallingWord[]; isFrozen: boolean }`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/components/falling-words/FallingWordBubble.test.tsx
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FallingWordBubble } from "@/components/game/falling-words/FallingWordBubble";
import { FallingWord } from "@/types/falling-words";

describe("FallingWordBubble Component", () => {
  const sampleWord: FallingWord = {
    id: "test-1",
    word: "DOLPHIN",
    clue: "Cá heo",
    emoji: "🐬",
    lane: 1,
    y: 40,
    speed: 12,
    typedIndex: 3,
    isTargeted: true,
  };

  it("renders the word with typed prefix highlighted and Vietnamese clue", () => {
    render(<FallingWordBubble word={sampleWord} />);
    expect(screen.getByText("Cá heo")).toBeInTheDocument();
    expect(screen.getByText("🐬")).toBeInTheDocument();
    expect(screen.getByText("DOL")).toBeInTheDocument();
    expect(screen.getByText("PHIN")).toBeInTheDocument();
  });

  it("applies yellow styling for double_score special power", () => {
    const specialWord: FallingWord = {
      ...sampleWord,
      specialType: "double_score",
    };
    const { container } = render(<FallingWordBubble word={specialWord} />);
    expect(container.querySelector(".border-amber-400")).toBeInTheDocument();
  });
});

// tests/components/falling-words/FallingWordsArena.test.tsx
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FallingWordsArena } from "@/components/game/falling-words/FallingWordsArena";

describe("FallingWordsArena Component", () => {
  it("renders the arena with role=region and danger zone", () => {
    render(<FallingWordsArena fallingWords={[]} isFrozen={false} />);
    const region = screen.getByRole("region", { name: /khu vực từ rơi/i });
    expect(region).toBeInTheDocument();
    expect(screen.getByText(/danger zone/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/components/falling-words/`  
Expected: FAIL with module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/game/falling-words/FallingWordBubble.tsx`:
```tsx
import React from "react";
import { FallingWord } from "@/types/falling-words";

interface FallingWordBubbleProps {
  word: FallingWord;
}

export const FallingWordBubble: React.FC<FallingWordBubbleProps> = ({ word }) => {
  const typedPart = word.word.slice(0, word.typedIndex);
  const remainingPart = word.word.slice(word.typedIndex);

  const leftPercent = 12.5 + word.lane * 25;

  let specialStyle = "border-slate-700 bg-slate-900/90 text-slate-100 shadow-lg";
  let badge = null;

  if (word.specialType === "double_score") {
    specialStyle = "border-amber-400 bg-amber-950/80 text-amber-100 shadow-amber-500/30";
    badge = <span className="text-base font-black text-amber-400 ml-1">2x⭐</span>;
  } else if (word.specialType === "heal_life") {
    specialStyle = "border-pink-400 bg-pink-950/80 text-pink-100 shadow-pink-500/30";
    badge = <span className="text-base font-black text-pink-400 ml-1">+1💖</span>;
  } else if (word.specialType === "slow_freeze") {
    specialStyle = "border-cyan-400 bg-cyan-950/80 text-cyan-100 shadow-cyan-500/30";
    badge = <span className="text-base font-black text-cyan-400 ml-1">❄️</span>;
  }

  const targetRing = word.isTargeted
    ? "ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-950 scale-105"
    : "";

  return (
    <div
      data-testid={`falling-word-${word.id}`}
      style={{
        left: `${leftPercent}%`,
        top: `${word.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      className={`absolute transition-transform duration-75 flex flex-col items-center px-4 py-2.5 rounded-2xl border-2 backdrop-blur-md select-none pointer-events-none z-10 ${specialStyle} ${targetRing}`}
    >
      <div className="flex items-center gap-1.5 font-mono text-lg md:text-xl font-black tracking-wider">
        {word.emoji && <span className="text-xl mr-1">{word.emoji}</span>}
        <span className="text-emerald-400 underline decoration-2 underline-offset-4">
          {typedPart}
        </span>
        <span className="text-slate-100">{remainingPart}</span>
        {badge}
      </div>

      <div className="text-base font-bold text-slate-300 mt-0.5 truncate max-w-[180px]">
        {word.clue}
      </div>
    </div>
  );
};
```

Create `src/components/game/falling-words/FallingWordsArena.tsx`:
```tsx
import React from "react";
import { FallingWord } from "@/types/falling-words";
import { FallingWordBubble } from "./FallingWordBubble";

interface FallingWordsArenaProps {
  fallingWords: FallingWord[];
  isFrozen: boolean;
}

export const FallingWordsArena: React.FC<FallingWordsArenaProps> = ({
  fallingWords,
  isFrozen,
}) => {
  return (
    <div
      role="region"
      aria-label="Khu vực từ rơi"
      className="relative w-full h-[520px] md:h-[580px] bg-slate-950/90 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm select-none"
    >
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none divide-x divide-slate-800/40">
        <div className="h-full" />
        <div className="h-full" />
        <div className="h-full" />
        <div className="h-full" />
      </div>

      {isFrozen && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-cyan-900/80 border border-cyan-400 text-cyan-200 px-4 py-1.5 rounded-full text-base font-black animate-pulse flex items-center gap-2">
          ❄️ ĐÓNG BĂNG THỜI GIAN
        </div>
      )}

      {fallingWords.map((word) => (
        <FallingWordBubble key={word.id} word={word} />
      ))}

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-red-950/80 via-red-900/30 to-transparent border-t border-red-500/40 flex items-center justify-center pointer-events-none">
        <span className="text-base font-black tracking-widest text-red-400/90 uppercase animate-pulse">
          ⚠️ Danger Zone ⚠️
        </span>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run tests/components/falling-words/`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/game/falling-words/FallingWordBubble.tsx src/components/game/falling-words/FallingWordsArena.tsx tests/components/falling-words/FallingWordBubble.test.tsx tests/components/falling-words/FallingWordsArena.test.tsx
git commit -m "feat(falling-words): implement FallingWordBubble and FallingWordsArena"
```

---

### Task 4: Arcade Header, Bomb Controls & Virtual Keyboard

**Files:**
- Create: `src/components/game/falling-words/ArcadeHeader.tsx`
- Create: `src/components/game/falling-words/VirtualKeyboard.tsx`
- Test: `tests/components/falling-words/ArcadeHeader.test.tsx`
- Test: `tests/components/falling-words/VirtualKeyboard.test.tsx`

**Interfaces:**
- Consumes: `FallingWordsState` fields.
- Produces:
  - `ArcadeHeader`: Props `{ topicId: string; onTopicChange: (id: string) => void; lives: number; timeLeft: number; score: number; combo: number; bombsAvailable: number; onTriggerBomb: () => void; }`
  - `VirtualKeyboard`: Props `{ onKeyPress: (key: string) => void; onTriggerBomb: () => void; bombsAvailable: number; }`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/components/falling-words/ArcadeHeader.test.tsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArcadeHeader } from "@/components/game/falling-words/ArcadeHeader";

describe("ArcadeHeader Component", () => {
  it("renders hearts, timer, score, combo and handles bomb click", () => {
    const onTriggerBomb = vi.fn();
    render(
      <ArcadeHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        lives={3}
        timeLeft={45}
        score={350}
        combo={4}
        bombsAvailable={1}
        onTriggerBomb={onTriggerBomb}
      />
    );

    expect(screen.getByLabelText(/số mạng còn lại: 3/i)).toBeInTheDocument();
    expect(screen.getByText("45s")).toBeInTheDocument();
    expect(screen.getByText("350")).toBeInTheDocument();
    expect(screen.getByText("4x")).toBeInTheDocument();

    const bombBtn = screen.getByRole("button", { name: /kích hoạt bom/i });
    expect(bombBtn).toBeEnabled();
    fireEvent.click(bombBtn);
    expect(onTriggerBomb).toHaveBeenCalledTimes(1);
  });
});

// tests/components/falling-words/VirtualKeyboard.test.tsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VirtualKeyboard } from "@/components/game/falling-words/VirtualKeyboard";

describe("VirtualKeyboard Component", () => {
  it("renders all letter keys with min 44px touch target", () => {
    const onKeyPress = vi.fn();
    render(
      <VirtualKeyboard
        onKeyPress={onKeyPress}
        onTriggerBomb={vi.fn()}
        bombsAvailable={0}
      />
    );

    const aKey = screen.getByRole("button", { name: "A" });
    expect(aKey).toHaveClass("min-h-[44px]");
    fireEvent.click(aKey);
    expect(onKeyPress).toHaveBeenCalledWith("A");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/components/falling-words/ArcadeHeader.test.tsx tests/components/falling-words/VirtualKeyboard.test.tsx`  
Expected: FAIL with module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/game/falling-words/ArcadeHeader.tsx`:
```tsx
import React from "react";
import Link from "next/link";
import { ArrowLeft, Bomb, Heart } from "lucide-react";

interface ArcadeHeaderProps {
  topicId: string;
  onTopicChange: (topicId: string) => void;
  lives: number;
  timeLeft: number;
  score: number;
  combo: number;
  bombsAvailable: number;
  onTriggerBomb: () => void;
}

const TOPICS = [
  { id: "animals", name: "🐾 Động vật" },
  { id: "fruits", name: "🍎 Trái cây" },
  { id: "school", name: "🎒 Trường học" },
  { id: "family", name: "👨‍👩‍👧‍👦 Gia đình" },
  { id: "body-parts", name: "🦶 Cơ thể" },
];

export const ArcadeHeader: React.FC<ArcadeHeaderProps> = ({
  topicId,
  onTopicChange,
  lives,
  timeLeft,
  score,
  combo,
  bombsAvailable,
  onTriggerBomb,
}) => {
  return (
    <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-3xl backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold text-slate-300 hover:text-white transition-colors bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" /> GameHub
        </Link>

        <select
          value={topicId}
          onChange={(e) => onTopicChange(e.target.value)}
          aria-label="Chọn chủ đề"
          className="bg-slate-800 text-base font-bold text-slate-200 border border-slate-700 rounded-2xl px-3 py-2 min-h-[44px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {TOPICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <div
          aria-label={`Số mạng còn lại: ${lives}`}
          className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-2xl min-h-[44px]"
        >
          {[1, 2, 3].map((i) => (
            <Heart
              key={i}
              className={`w-6 h-6 ${
                i <= lives ? "text-rose-500 fill-rose-500 animate-pulse" : "text-slate-700"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-2xl min-h-[44px]">
          <span className="text-base text-slate-400 font-bold">⏱️</span>
          <span
            className={`font-mono text-base md:text-lg font-black ${
              timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-emerald-400"
            }`}
          >
            {timeLeft}s
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-2xl min-h-[44px]">
          <span className="text-base text-amber-400 font-bold">⚡</span>
          <span className="font-mono text-base md:text-lg font-black text-amber-400">
            {combo}x
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-2xl min-h-[44px]">
          <span className="text-base text-slate-400 font-bold">🏆</span>
          <span className="font-mono text-base md:text-lg font-black text-white">
            {score}
          </span>
        </div>

        <button
          type="button"
          onClick={onTriggerBomb}
          disabled={bombsAvailable === 0}
          aria-label="Kích hoạt Bom"
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-base min-h-[44px] border transition-all ${
            bombsAvailable > 0
              ? "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30 cursor-pointer animate-bounce"
              : "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
          }`}
        >
          <Bomb className="w-5 h-5" />
          <span>BOM ({bombsAvailable})</span>
        </button>
      </div>
    </header>
  );
};
```

Create `src/components/game/falling-words/VirtualKeyboard.tsx`:
```tsx
import React from "react";
import { Bomb } from "lucide-react";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onTriggerBomb: () => void;
  bombsAvailable: number;
}

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onTriggerBomb,
  bombsAvailable,
}) => {
  return (
    <div
      role="region"
      aria-label="Bàn phím ảo"
      className="w-full max-w-2xl mt-4 flex flex-col gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl backdrop-blur-md select-none"
    >
      {ROWS.map((row, rIndex) => (
        <div key={rIndex} className="flex justify-center gap-1.5 w-full">
          {row.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => onKeyPress(char)}
              aria-label={char}
              className="flex-1 min-w-[28px] max-w-[48px] h-11 md:h-12 min-h-[44px] bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 active:scale-95 text-slate-100 font-mono font-bold text-base md:text-lg rounded-xl border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            >
              {char}
            </button>
          ))}
        </div>
      ))}

      <div className="flex justify-center mt-1">
        <button
          type="button"
          onClick={onTriggerBomb}
          disabled={bombsAvailable === 0}
          aria-label="Phím cách Bom tổng"
          className={`w-full max-w-sm h-11 md:h-12 min-h-[44px] rounded-xl font-bold text-base flex items-center justify-center gap-2 border transition-all ${
            bombsAvailable > 0
              ? "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-md cursor-pointer"
              : "bg-slate-800/60 text-slate-500 border-slate-700 cursor-not-allowed"
          }`}
        >
          <Bomb className="w-5 h-5" />
          <span>BOM TOÀN MÀN HÌNH (SPACE)</span>
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run tests/components/falling-words/ArcadeHeader.test.tsx tests/components/falling-words/VirtualKeyboard.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/game/falling-words/ArcadeHeader.tsx src/components/game/falling-words/VirtualKeyboard.tsx tests/components/falling-words/ArcadeHeader.test.tsx tests/components/falling-words/VirtualKeyboard.test.tsx
git commit -m "feat(falling-words): implement ArcadeHeader and VirtualKeyboard"
```

---

### Task 5: Word Rain Summary Modal & Audio Integration

**Files:**
- Create: `src/components/game/falling-words/WordRainSummaryModal.tsx`
- Test: `tests/components/falling-words/WordRainSummaryModal.test.tsx`

**Interfaces:**
- Consumes: `PoppedWordSummary` from `src/types/falling-words.ts`, `useSpeech` from `src/hooks/useSpeech.ts`.
- Produces: `WordRainSummaryModal`: Props `{ isOpen: boolean; isVictory: boolean; score: number; combo: number; lives: number; wordsPopped: PoppedWordSummary[]; onRestart: () => void; }`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/components/falling-words/WordRainSummaryModal.test.tsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WordRainSummaryModal } from "@/components/game/falling-words/WordRainSummaryModal";

describe("WordRainSummaryModal Component", () => {
  const sampleWords = [
    { word: "ELEPHANT", clue: "Con voi", phonetic: "/ˈelɪfənt/" },
    { word: "TIGER", clue: "Con hổ", phonetic: "/ˈtaɪɡər/" },
  ];

  it("renders dialog with 3 stars when score >= 1200 and 3 lives intact", () => {
    render(
      <WordRainSummaryModal
        isOpen={true}
        isVictory={true}
        score={1350}
        combo={12}
        lives={3}
        wordsPopped={sampleWords}
        onRestart={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/hoàn thành thử thách/i)).toBeInTheDocument();
    expect(screen.getByText("1350")).toBeInTheDocument();
    expect(screen.getByText("ELEPHANT")).toBeInTheDocument();
    expect(screen.getByText("TIGER")).toBeInTheDocument();
  });

  it("triggers onRestart when play again button is clicked", () => {
    const onRestart = vi.fn();
    render(
      <WordRainSummaryModal
        isOpen={true}
        isVictory={false}
        score={300}
        combo={2}
        lives={0}
        wordsPopped={[]}
        onRestart={onRestart}
      />
    );

    const restartBtn = screen.getByRole("button", { name: /chơi lại/i });
    fireEvent.click(restartBtn);
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/components/falling-words/WordRainSummaryModal.test.tsx`  
Expected: FAIL with module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/game/falling-words/WordRainSummaryModal.tsx`:
```tsx
import React from "react";
import { Star, Volume2, RotateCcw } from "lucide-react";
import { PoppedWordSummary } from "@/types/falling-words";
import { useSpeech } from "@/hooks/useSpeech";

interface WordRainSummaryModalProps {
  isOpen: boolean;
  isVictory: boolean;
  score: number;
  combo: number;
  lives: number;
  wordsPopped: PoppedWordSummary[];
  onRestart: () => void;
}

export const WordRainSummaryModal: React.FC<WordRainSummaryModalProps> = ({
  isOpen,
  isVictory,
  score,
  combo,
  lives,
  wordsPopped,
  onRestart,
}) => {
  const { speak } = useSpeech();

  if (!isOpen) return null;

  const stars =
    score >= 1200 && lives >= 3 ? 3 : score >= 700 && lives >= 1 ? 2 : score > 0 ? 1 : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
        <h2
          id="summary-title"
          className="text-2xl md:text-3xl font-black text-white mb-2"
        >
          {isVictory ? "🎉 Hoàn Thành Thử Thách!" : "💥 Hết Mạng!"}
        </h2>

        <p className="text-base text-slate-300 mb-6">
          {isVictory
            ? "Tuyệt vời! Bạn đã vượt qua cơn mưa từ vựng 60 giây!"
            : "Bạn đã chiến đấu hết mình! Hãy thử lại để đạt điểm cao hơn nhé."}
        </p>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((starIndex) => (
            <Star
              key={starIndex}
              className={`w-10 h-10 ${
                starIndex <= stars
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-700"
              }`}
            />
          ))}
        </div>

        <div className="w-full grid grid-cols-3 gap-3 mb-6 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div>
            <div className="text-base text-slate-400 font-bold">Điểm số</div>
            <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
              {score}
            </div>
          </div>
          <div>
            <div className="text-base text-slate-400 font-bold">Max Combo</div>
            <div className="text-xl md:text-2xl font-black text-amber-400 font-mono">
              {combo}x
            </div>
          </div>
          <div>
            <div className="text-base text-slate-400 font-bold">Đã gõ</div>
            <div className="text-xl md:text-2xl font-black text-white font-mono">
              {wordsPopped.length}
            </div>
          </div>
        </div>

        {wordsPopped.length > 0 && (
          <div className="w-full mb-6 text-left">
            <h3 className="text-base font-black text-slate-300 mb-2">
              📖 Từ vựng đã bắn trúng ({wordsPopped.length})
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {wordsPopped.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-base"
                >
                  <div className="flex items-center gap-2">
                    {item.emoji && <span className="text-lg">{item.emoji}</span>}
                    <span className="font-bold text-white font-mono">
                      {item.word}
                    </span>
                    {item.phonetic && (
                      <span className="text-slate-400 text-base">
                        {item.phonetic}
                      </span>
                    )}
                    <span className="text-slate-300 text-base">
                      — {item.clue}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speak(item.word)}
                    aria-label={`Phát âm ${item.word}`}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-400 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer min-h-[44px]"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Chơi lại ngay</span>
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/components/falling-words/WordRainSummaryModal.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/game/falling-words/WordRainSummaryModal.tsx tests/components/falling-words/WordRainSummaryModal.test.tsx
git commit -m "feat(falling-words): implement WordRainSummaryModal with vocabulary review and speech"
```

---

### Task 6: Route Assembly, Games Catalog Registration (`priority: 12`) & Playwright E2E

**Files:**
- Create: `src/app/games/falling-words/page.tsx`
- Modify: `src/data/games.json`
- Modify: `tests/data/games.test.ts`
- Create: `tests/e2e/falling-words.spec.ts`

**Interfaces:**
- Connects: `useFallingWordsEngine`, `useSpeech`, `useGameTracking`, `ArcadeHeader`, `FallingWordsArena`, `VirtualKeyboard`, `WordRainSummaryModal`.
- Catalog entry: `falling-words` with `priority: 12`.
- E2E tests: full browser automation.

- [ ] **Step 1: Write the failing tests**

Update `tests/data/games.test.ts` to expect 12 games:
```typescript
// in tests/data/games.test.ts
expect(games).toHaveLength(12);
// and in expectedGameIds list add "falling-words"
```

Create `tests/e2e/falling-words.spec.ts`:
```typescript
import { test, expect } from "@playwright/test";

test.describe("Falling Words Arcade E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/games/falling-words");
  });

  test("loads the game arena, HUD header, and virtual keyboard", async ({ page }) => {
    await expect(page.getByRole("region", { name: /khu vực từ rơi/i })).toBeVisible();
    await expect(page.getByLabelText(/chọn chủ đề/i)).toBeVisible();
    await expect(page.getByRole("region", { name: /bàn phím ảo/i })).toBeVisible();
  });

  test("allows typing letters using virtual keyboard or physical keyboard", async ({ page }) => {
    const bubble = page.locator("[data-testid^='falling-word-']").first();
    await expect(bubble).toBeVisible({ timeout: 5000 });

    await page.keyboard.press("A");
    await expect(page.getByRole("region", { name: /khu vực từ rơi/i })).toBeVisible();
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm vitest run tests/data/games.test.ts`  
Expected: FAIL because games.json has only 11 games.

- [ ] **Step 3: Write minimal implementation**

Update `src/data/games.json` by adding the falling-words game:
```json
  {
    "id": "falling-words",
    "slug": "falling-words",
    "titleVi": "Mưa Từ Vựng",
    "titleEn": "Falling Words",
    "description": "Luyện gõ nhanh và phản xạ tiếng Anh với các từ rơi tốc độ cao, combo streak và bom nổ toàn màn hình",
    "emoji": "🌧️",
    "route": "/games/falling-words",
    "priority": 12
  }
```

Update `tests/data/games.test.ts` to include `"falling-words"` and expect 12 games.

Create `src/app/games/falling-words/page.tsx`:
```tsx
"use client";

import React, { useEffect, useRef } from "react";
import { useFallingWordsEngine } from "@/hooks/useFallingWordsEngine";
import { useSpeech } from "@/hooks/useSpeech";
import { useGameTracking } from "@/hooks/use-game-tracking";
import { ArcadeHeader } from "@/components/game/falling-words/ArcadeHeader";
import { FallingWordsArena } from "@/components/game/falling-words/FallingWordsArena";
import { VirtualKeyboard } from "@/components/game/falling-words/VirtualKeyboard";
import { WordRainSummaryModal } from "@/components/game/falling-words/WordRainSummaryModal";

const emptySubscribe = () => () => {};

export default function FallingWordsPage() {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const {
    topicId,
    fallingWords,
    score,
    combo,
    maxCombo,
    lives,
    timeLeft,
    bombsAvailable,
    isFrozen,
    isGameOver,
    isVictory,
    wordsPopped,
    lastPoppedWord,
    typeLetter,
    triggerBomb,
    updatePhysics,
    restartGame,
    setTopicId,
  } = useFallingWordsEngine();

  const { speak } = useSpeech();
  const { submitSession, resetSession } = useGameTracking({
    gameType: "falling-words",
  });
  const sessionSubmittedRef = useRef(false);

  useEffect(() => {
    if (lastPoppedWord) {
      speak(lastPoppedWord.word);
    }
  }, [lastPoppedWord, speak]);

  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      updatePhysics(dt);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [updatePhysics]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      if (["INPUT", "SELECT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        triggerBomb();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        typeLetter(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGameOver, triggerBomb, typeLetter]);

  useEffect(() => {
    if (isGameOver && !sessionSubmittedRef.current) {
      sessionSubmittedRef.current = true;
      submitSession({
        score,
        totalQuestions: wordsPopped.length,
      }).catch((err) => console.error("Failed to submit falling-words session:", err));

      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("gamehub_falling_words_progress");
          const history = stored ? JSON.parse(stored) : [];
          history.push({
            date: new Date().toISOString(),
            score,
            topicId,
            wordsPopped: wordsPopped.length,
            maxCombo,
            isVictory,
          });
          localStorage.setItem("gamehub_falling_words_progress", JSON.stringify(history.slice(-20)));
        }
      } catch (err) {
        console.error("Failed to save progress to local storage:", err);
      }
    } else if (!isGameOver) {
      sessionSubmittedRef.current = false;
    }
  }, [isGameOver, score, wordsPopped.length, topicId, maxCombo, isVictory, submitSession]);

  const handleRestart = () => {
    resetSession();
    restartGame();
  };

  const handleTopicChange = (newTopicId: string) => {
    resetSession();
    setTopicId(newTopicId);
    restartGame(newTopicId);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-5xl h-[600px] bg-slate-900/40 rounded-3xl border border-slate-800 animate-pulse flex items-center justify-center text-slate-500 font-bold text-base">
          Đang tải Mưa Từ Vựng...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8 select-none">
      <ArcadeHeader
        topicId={topicId}
        onTopicChange={handleTopicChange}
        lives={lives}
        timeLeft={timeLeft}
        score={score}
        combo={combo}
        bombsAvailable={bombsAvailable}
        onTriggerBomb={triggerBomb}
      />

      <div className="w-full max-w-5xl flex flex-col items-center">
        <FallingWordsArena fallingWords={fallingWords} isFrozen={isFrozen} />

        <VirtualKeyboard
          onKeyPress={typeLetter}
          onTriggerBomb={triggerBomb}
          bombsAvailable={bombsAvailable}
        />
      </div>

      <WordRainSummaryModal
        isOpen={isGameOver}
        isVictory={isVictory}
        score={score}
        combo={maxCombo}
        lives={lives}
        wordsPopped={wordsPopped}
        onRestart={handleRestart}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run unit and E2E tests to verify they pass**

Run: `pnpm vitest run tests/data/games.test.ts`  
Run: `pnpm vitest run tests/unit/falling-words/ tests/components/falling-words/`  
Run: `pnpm playwright test tests/e2e/falling-words.spec.ts`  
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/games.json tests/data/games.test.ts src/app/games/falling-words/page.tsx tests/e2e/falling-words.spec.ts
git commit -m "feat(falling-words): assemble route, register catalog priority 12, and add E2E tests"
```
