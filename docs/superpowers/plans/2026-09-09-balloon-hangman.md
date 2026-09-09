# Word Explorer: Balloon Hangman Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Word Explorer: Balloon Hangman" (`/games/hangman`), a child-friendly educational ESL word-guessing game where learners save a floating explorer by guessing secret vocabulary words letter-by-letter before all 6 colorful balloons pop.

**Architecture:** A state-driven round engine hook (`useHangmanEngine`) manages 5-word progression, letter guessing states, balloon integrity, and scoring; responsive React components render the sky balloon stage, letter slots, clue bar, virtual touch keyboard, HUD header, and 5-word review summary modal.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React, Web Speech API (`useSpeech`), Vitest, React Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-09-balloon-hangman-design.md`

## Global Constraints

- **Typography Compliance:** Every rendered text element (slots, clues, headers, buttons, keys) MUST compute to $\ge 16\text{px}$ font size (`text-base`, `text-lg`, `text-xl`). Never use sub-16px utility classes (`text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
- **Touch Targets:** All interactive virtual keyboard keys and HUD action buttons MUST have a minimum 44px vertical touch target (`min-h-[44px]`).
- **SSR Hydration Safety:** Use `React.useSyncExternalStore` for client-only mounting to prevent Next.js SSR hydration mismatches.
- **W3C ARIA Standards:** Game stage container must have `role="region"` and descriptive label; modal must have `role="dialog"` and `aria-modal="true"`.
- **Audio Reliability:** Use existing `useSpeech` hook for pronunciation upon word completion and modal replay, guarding against unmounted or unsupported speech synthesis states.

---

### Task 1: Types & Word Queue Utilities

**Files:**
- Create: `src/types/hangman.ts`
- Create: `src/lib/hangman/hangman-utils.ts`
- Test: `tests/unit/hangman/hangman-utils.test.ts`

**Interfaces:**
- Consumes: `src/data/words/animals.json`, `src/data/words/fruits.json`, `src/data/words/school.json`, `src/data/words/family.json`, `src/data/words/body-parts.json`.
- Produces:
  - `HangmanWord`: `{ id: string; word: string; clue: string; phonetic?: string; emoji?: string; }`
  - `HangmanRoundHistory`: `{ word: HangmanWord; solved: boolean; mistakes: number; score: number; }`
  - `KeyStatus`: `"default" | "correct" | "incorrect"`
  - `HangmanState`: Full engine state interface.
  - `loadRoundWords(topicId: string, count?: number, rng?: () => number): HangmanWord[]`
  - `calculateWordScore(mistakes: number, hintUsed: boolean): number`
  - `calculateRoundStars(totalScore: number, solvedCount: number, totalWords: number): number`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/hangman/hangman-utils.test.ts
import { describe, it, expect } from "vitest";
import {
  loadRoundWords,
  calculateWordScore,
  calculateRoundStars,
} from "@/lib/hangman/hangman-utils";

describe("Hangman Utilities", () => {
  it("loads 5 unique words for a given topic", () => {
    const words = loadRoundWords("animals", 5);
    expect(words).toHaveLength(5);
    expect(words[0]).toHaveProperty("word");
    expect(words[0]).toHaveProperty("clue");
    // All words should be uppercase
    expect(words[0].word).toBe(words[0].word.toUpperCase());
  });

  it("calculates word score based on mistakes and hint penalty", () => {
    // 0 mistakes, no hint: 200 - 0 + 6*30 = 380
    expect(calculateWordScore(0, false)).toBe(380);
    // 2 mistakes, no hint: 200 - 40 + 4*30 = 280
    expect(calculateWordScore(2, false)).toBe(280);
    // 1 mistake, hint used: 200 - 20 + 5*30 - 100 = 230
    expect(calculateWordScore(1, true)).toBe(230);
    // 6 mistakes (unsolved): 0
    expect(calculateWordScore(6, false)).toBe(0);
  });

  it("calculates round stars based on score and solved count", () => {
    // 3 stars: score >= 1200 and all 5 solved
    expect(calculateRoundStars(1400, 5, 5)).toBe(3);
    // 2 stars: score >= 700 and at least 3 solved
    expect(calculateRoundStars(850, 3, 5)).toBe(2);
    // 1 star: score > 0
    expect(calculateRoundStars(300, 1, 5)).toBe(1);
    // 0 stars: score 0
    expect(calculateRoundStars(0, 0, 5)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/hangman/hangman-utils.test.ts`  
Expected: FAIL with module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/types/hangman.ts`:
```typescript
export interface HangmanWord {
  id: string;
  word: string; // Uppercase
  clue: string;
  phonetic?: string;
  emoji?: string;
}

export interface HangmanRoundHistory {
  word: HangmanWord;
  solved: boolean;
  mistakes: number;
  score: number;
}

export type KeyStatus = "default" | "correct" | "incorrect";

export interface HangmanState {
  topicId: string;
  wordList: HangmanWord[];
  currentIndex: number;
  currentWord: HangmanWord | null;
  guessedLetters: Set<string>;
  mistakesCount: number;
  maxMistakes: number;
  hintUsed: boolean;
  score: number;
  wordStatus: "playing" | "won" | "lost";
  isRoundComplete: boolean;
  history: HangmanRoundHistory[];
}
```

Create `src/lib/hangman/hangman-utils.ts`:
```typescript
import { HangmanWord } from "@/types/hangman";
import animals from "@/data/words/animals.json";
import fruits from "@/data/words/fruits.json";
import school from "@/data/words/school.json";
import family from "@/data/words/family.json";
import bodyParts from "@/data/words/body-parts.json";

interface RawVocab {
  id: string;
  english: string;
  vietnamese: string;
  phonetic?: string;
  emoji?: string;
}

const TOPIC_MAP: Record<string, RawVocab[]> = {
  animals: animals as RawVocab[],
  fruits: fruits as RawVocab[],
  school: school as RawVocab[],
  family: family as RawVocab[],
  "body-parts": bodyParts as RawVocab[],
};

export function loadRoundWords(
  topicId: string,
  count: number = 5,
  rng: () => number = Math.random
): HangmanWord[] {
  const rawList = TOPIC_MAP[topicId] || TOPIC_MAP.animals;
  const filtered = rawList.filter((item) => /^[a-zA-Z]+$/.test(item.english.trim()));
  const shuffled = [...filtered].sort(() => rng() - 0.5);

  const selected = shuffled.slice(0, count);
  return selected.map((item) => ({
    id: item.id,
    word: item.english.trim().toUpperCase(),
    clue: item.vietnamese,
    phonetic: item.phonetic,
    emoji: item.emoji,
  }));
}

export function calculateWordScore(mistakes: number, hintUsed: boolean): number {
  if (mistakes >= 6) return 0;
  const remainingBalloons = 6 - mistakes;
  const base = 200;
  const mistakePenalty = mistakes * 20;
  const balloonBonus = remainingBalloons * 30;
  const hintPenalty = hintUsed ? 100 : 0;

  const total = base - mistakePenalty + balloonBonus - hintPenalty;
  return Math.max(50, total);
}

export function calculateRoundStars(
  totalScore: number,
  solvedCount: number,
  totalWords: number = 5
): number {
  if (totalScore >= 1200 && solvedCount === totalWords) return 3;
  if (totalScore >= 700 && solvedCount >= 3) return 2;
  if (totalScore > 0) return 1;
  return 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/hangman/hangman-utils.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/hangman.ts src/lib/hangman/hangman-utils.ts tests/unit/hangman/hangman-utils.test.ts
git commit -m "feat(hangman): add types and queue utilities"
```

---

### Task 2: State Machine Hook (`useHangmanEngine`)

**Files:**
- Create: `src/hooks/useHangmanEngine.ts`
- Test: `tests/unit/hangman/useHangmanEngine.test.ts`

**Interfaces:**
- Consumes: `src/types/hangman.ts`, `src/lib/hangman/hangman-utils.ts`.
- Produces: `useHangmanEngine(initialTopicId?: string)` returning:
  - State: `topicId`, `currentIndex`, `totalWords`, `currentWord`, `guessedLetters`, `mistakesCount`, `maxMistakes`, `hintUsed`, `score`, `wordStatus`, `isRoundComplete`, `history`, `revealedWord`.
  - Actions:
    - `guessLetter(char: string): { isCorrect: boolean; isWordSolved: boolean }`
    - `useHint(): string | null` (reveals 1 unrevealed letter)
    - `nextWord(): void`
    - `restartRound(newTopicId?: string): void`
    - `setTopicId(topicId: string): void`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/hangman/useHangmanEngine.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHangmanEngine } from "@/hooks/useHangmanEngine";

describe("useHangmanEngine Hook", () => {
  it("initializes with 5 words, 0 mistakes, and playing status", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.totalWords).toBe(5);
    expect(result.current.mistakesCount).toBe(0);
    expect(result.current.maxMistakes).toBe(6);
    expect(result.current.wordStatus).toBe("playing");
    expect(result.current.currentWord).not.toBeNull();
  });

  it("handles correct letter guess without increasing mistakes", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    const word = result.current.currentWord!.word;
    const firstChar = word[0];

    act(() => {
      const res = result.current.guessLetter(firstChar);
      expect(res.isCorrect).toBe(true);
    });

    expect(result.current.guessedLetters.has(firstChar)).toBe(true);
    expect(result.current.mistakesCount).toBe(0);
  });

  it("handles incorrect letter guess and pops 1 balloon", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    // Find a letter not in current word
    const word = result.current.currentWord!.word;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const wrongChar = alphabet.split("").find((c) => !word.includes(c))!;

    act(() => {
      const res = result.current.guessLetter(wrongChar);
      expect(res.isCorrect).toBe(false);
    });

    expect(result.current.guessedLetters.has(wrongChar)).toBe(true);
    expect(result.current.mistakesCount).toBe(1);
  });

  it("marks word won and adds score when all letters guessed", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    const word = result.current.currentWord!.word;
    const uniqueChars = Array.from(new Set(word.split("")));

    act(() => {
      for (const char of uniqueChars) {
        result.current.guessLetter(char);
      }
    });

    expect(result.current.wordStatus).toBe("won");
    expect(result.current.score).toBeGreaterThan(0);
  });

  it("marks word lost when 6 mistakes occur", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    const word = result.current.currentWord!.word;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const wrongChars = alphabet.split("").filter((c) => !word.includes(c)).slice(0, 6);

    act(() => {
      for (const char of wrongChars) {
        result.current.guessLetter(char);
      }
    });

    expect(result.current.mistakesCount).toBe(6);
    expect(result.current.wordStatus).toBe("lost");
  });

  it("useHint reveals an unguessed letter and marks hintUsed", () => {
    const { result } = renderHook(() => useHangmanEngine("animals"));
    let revealedChar: string | null = null;

    act(() => {
      revealedChar = result.current.useHint();
    });

    expect(revealedChar).not.toBeNull();
    expect(result.current.hintUsed).toBe(true);
    expect(result.current.guessedLetters.has(revealedChar!)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/hangman/useHangmanEngine.test.ts`  
Expected: FAIL with module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/hooks/useHangmanEngine.ts`:
```typescript
"use client";

import { useState, useCallback, useMemo } from "react";
import { HangmanWord, HangmanRoundHistory } from "@/types/hangman";
import {
  loadRoundWords,
  calculateWordScore,
} from "@/lib/hangman/hangman-utils";

export function useHangmanEngine(initialTopicId: string = "animals") {
  const [topicId, setTopicId] = useState(initialTopicId);
  const [wordList, setWordList] = useState<HangmanWord[]>(() =>
    loadRoundWords(initialTopicId, 5)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [mistakesCount, setMistakesCount] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [score, setScore] = useState(0);
  const [wordStatus, setWordStatus] = useState<"playing" | "won" | "lost">("playing");
  const [history, setHistory] = useState<HangmanRoundHistory[]>([]);
  const [isRoundComplete, setIsRoundComplete] = useState(false);

  const maxMistakes = 6;
  const currentWord = wordList[currentIndex] || null;

  const restartRound = useCallback(
    (newTopicId?: string) => {
      const t = newTopicId || topicId;
      if (newTopicId) setTopicId(newTopicId);
      const newWords = loadRoundWords(t, 5);
      setWordList(newWords);
      setCurrentIndex(0);
      setGuessedLetters(new Set());
      setMistakesCount(0);
      setHintUsed(false);
      setScore(0);
      setWordStatus("playing");
      setHistory([]);
      setIsRoundComplete(false);
    },
    [topicId]
  );

  const guessLetter = useCallback(
    (char: string) => {
      if (wordStatus !== "playing" || !currentWord) {
        return { isCorrect: false, isWordSolved: false };
      }

      const letter = char.toUpperCase();
      if (guessedLetters.has(letter)) {
        return { isCorrect: currentWord.word.includes(letter), isWordSolved: false };
      }

      const nextGuessed = new Set(guessedLetters);
      nextGuessed.add(letter);
      setGuessedLetters(nextGuessed);

      const isCorrect = currentWord.word.includes(letter);
      let nextMistakes = mistakesCount;

      if (!isCorrect) {
        nextMistakes = mistakesCount + 1;
        setMistakesCount(nextMistakes);
      }

      // Check if word is completely solved
      const isWordSolved = currentWord.word
        .split("")
        .every((c) => nextGuessed.has(c));

      if (isWordSolved) {
        setWordStatus("won");
        const wordPts = calculateWordScore(nextMistakes, hintUsed);
        setScore((s) => s + wordPts);
        setHistory((prev) => [
          ...prev,
          {
            word: currentWord,
            solved: true,
            mistakes: nextMistakes,
            score: wordPts,
          },
        ]);
      } else if (nextMistakes >= maxMistakes) {
        setWordStatus("lost");
        setHistory((prev) => [
          ...prev,
          {
            word: currentWord,
            solved: false,
            mistakes: nextMistakes,
            score: 0,
          },
        ]);
      }

      return { isCorrect, isWordSolved };
    },
    [wordStatus, currentWord, guessedLetters, mistakesCount, hintUsed, maxMistakes]
  );

  const useHint = useCallback(() => {
    if (wordStatus !== "playing" || !currentWord || hintUsed) {
      return null;
    }

    const unrevealed = currentWord.word
      .split("")
      .filter((c) => !guessedLetters.has(c));

    if (unrevealed.length <= 1) {
      return null;
    }

    const randomChar = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    setHintUsed(true);
    guessLetter(randomChar);
    return randomChar;
  }, [wordStatus, currentWord, hintUsed, guessedLetters, guessLetter]);

  const nextWord = useCallback(() => {
    if (currentIndex + 1 < wordList.length) {
      setCurrentIndex((i) => i + 1);
      setGuessedLetters(new Set());
      setMistakesCount(0);
      setHintUsed(false);
      setWordStatus("playing");
    } else {
      setIsRoundComplete(true);
    }
  }, [currentIndex, wordList.length]);

  return {
    topicId,
    currentIndex,
    totalWords: wordList.length,
    currentWord,
    guessedLetters,
    mistakesCount,
    maxMistakes,
    hintUsed,
    score,
    wordStatus,
    isRoundComplete,
    history,
    guessLetter,
    useHint,
    nextWord,
    restartRound,
    setTopicId,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/hangman/useHangmanEngine.test.ts`  
Expected: PASS with 6/6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useHangmanEngine.ts tests/unit/hangman/useHangmanEngine.test.ts
git commit -m "feat(hangman): implement useHangmanEngine state machine hook"
```

---

### Task 3: Balloon Stage & Word Display Components

**Files:**
- Create: `src/components/game/hangman/BalloonStage.tsx`
- Create: `src/components/game/hangman/WordDisplay.tsx`
- Test: `tests/components/hangman/BalloonStage.test.tsx`
- Test: `tests/components/hangman/WordDisplay.test.tsx`

**Interfaces:**
- Consumes: `HangmanWord` from `src/types/hangman.ts`.
- Produces:
  - `BalloonStage`: Props `{ mistakesCount: number; maxMistakes: number; wordStatus: "playing" | "won" | "lost" }`
  - `WordDisplay`: Props `{ word: HangmanWord; guessedLetters: Set<string>; wordStatus: "playing" | "won" | "lost" }`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/components/hangman/BalloonStage.test.tsx
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BalloonStage } from "@/components/game/hangman/BalloonStage";

describe("BalloonStage Component", () => {
  it("renders 6 balloons initially and accessible region", () => {
    render(<BalloonStage mistakesCount={0} maxMistakes={6} wordStatus="playing" />);
    expect(screen.getByRole("region", { name: /khu vực khinh khí cầu/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("balloon-item")).toHaveLength(6);
  });

  it("shows remaining balloons when mistakesCount is 2", () => {
    render(<BalloonStage mistakesCount={2} maxMistakes={6} wordStatus="playing" />);
    // 6 - 2 = 4 active balloons
    const active = screen.getAllByTestId("balloon-item").filter(
      (b) => !b.classList.contains("opacity-0")
    );
    expect(active).toHaveLength(4);
  });
});

// tests/components/hangman/WordDisplay.test.tsx
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WordDisplay } from "@/components/game/hangman/WordDisplay";

describe("WordDisplay Component", () => {
  const sampleWord = {
    id: "tiger",
    word: "TIGER",
    clue: "Con hổ",
    emoji: "🐯",
  };

  it("renders blank slots for unguessed letters", () => {
    render(
      <WordDisplay
        word={sampleWord}
        guessedLetters={new Set(["T", "E"])}
        wordStatus="playing"
      />
    );

    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByText("E")).toBeInTheDocument();
    expect(screen.getAllByTestId("letter-slot")).toHaveLength(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/hangman/`  
Expected: FAIL with module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/game/hangman/BalloonStage.tsx`:
```tsx
import React from "react";

interface BalloonStageProps {
  mistakesCount: number;
  maxMistakes: number;
  wordStatus: "playing" | "won" | "lost";
}

const BALLOON_COLORS = [
  { fill: "#ef4444", border: "#b91c1c", name: "Đỏ" }, // Red
  { fill: "#f97316", border: "#c2410c", name: "Cam" }, // Orange
  { fill: "#eab308", border: "#a16207", name: "Vàng" }, // Yellow
  { fill: "#22c55e", border: "#15803d", name: "Xanh lá" }, // Green
  { fill: "#3b82f6", border: "#1d4ed8", name: "Xanh dương" }, // Blue
  { fill: "#a855f7", border: "#7e22ce", name: "Tím" }, // Purple
];

export const BalloonStage: React.FC<BalloonStageProps> = ({
  mistakesCount,
  maxMistakes,
  wordStatus,
}) => {
  const remainingCount = Math.max(0, maxMistakes - mistakesCount);

  return (
    <div
      role="region"
      aria-label="Khu vực khinh khí cầu"
      className="relative w-full max-w-2xl h-64 md:h-72 bg-gradient-to-b from-sky-900/60 via-slate-900/80 to-slate-950 border-2 border-slate-800 rounded-3xl overflow-hidden flex flex-col items-center justify-between p-4 shadow-xl select-none"
    >
      {/* Sky status banner */}
      <div className="flex items-center justify-between w-full px-2 text-base font-bold text-slate-300">
        <span className="flex items-center gap-1.5">
          🎈 Bóng bay còn lại:{" "}
          <span className="font-mono text-lg font-black text-amber-400">
            {remainingCount}/{maxMistakes}
          </span>
        </span>
        {wordStatus === "won" && (
          <span className="text-emerald-400 font-black animate-bounce text-base">
            🎉 THẮNG RỒI!
          </span>
        )}
        {wordStatus === "lost" && (
          <span className="text-amber-400 font-black text-base">
            🪂 HẠ CÁNH AN TOÀN!
          </span>
        )}
      </div>

      {/* Balloons Cluster */}
      <div className="relative flex items-center justify-center gap-2 mt-2">
        {BALLOON_COLORS.map((b, idx) => {
          const isPopped = idx < mistakesCount;
          return (
            <div
              key={idx}
              data-testid="balloon-item"
              className={`transition-all duration-300 flex flex-col items-center ${
                isPopped
                  ? "opacity-0 scale-50 pointer-events-none"
                  : "opacity-100 scale-100 hover:scale-105"
              }`}
            >
              {/* SVG Balloon */}
              <svg width="40" height="52" viewBox="0 0 40 52" className="drop-shadow-md">
                <ellipse cx="20" cy="22" rx="18" ry="21" fill={b.fill} stroke={b.border} strokeWidth="2" />
                <polygon points="17,43 23,43 20,46" fill={b.border} />
                <line x1="20" y1="46" x2="20" y2="52" stroke="#94a3b8" strokeWidth="1.5" />
              </svg>
            </div>
          );
        })}
      </div>

      {/* Floating Explorer Character */}
      <div className="flex flex-col items-center mt-2 mb-2">
        <div className="text-5xl md:text-6xl transition-transform duration-300 transform hover:scale-110">
          {wordStatus === "won" ? "🧑‍🚀" : wordStatus === "lost" ? "🪂" : "🧑‍🚀"}
        </div>
        <div className="text-base font-bold text-slate-300 mt-1">
          {wordStatus === "won"
            ? "Nhà thám hiểm an toàn!"
            : wordStatus === "lost"
            ? "Đã bung dù cứu hộ!"
            : "Đang bay lơ lửng..."}
        </div>
      </div>
    </div>
  );
};
```

Create `src/components/game/hangman/WordDisplay.tsx`:
```tsx
import React from "react";
import { HangmanWord } from "@/types/hangman";

interface WordDisplayProps {
  word: HangmanWord;
  guessedLetters: Set<string>;
  wordStatus: "playing" | "won" | "lost";
}

export const WordDisplay: React.FC<WordDisplayProps> = ({
  word,
  guessedLetters,
  wordStatus,
}) => {
  return (
    <div
      role="region"
      aria-label={`Từ gồm ${word.word.length} chữ cái`}
      className="w-full max-w-2xl flex flex-col items-center gap-3 my-4"
    >
      {/* Letter Slot Boxes */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {word.word.split("").map((letter, index) => {
          const isGuessed = guessedLetters.has(letter);
          const showAnswer = wordStatus === "lost";

          return (
            <div
              key={index}
              data-testid="letter-slot"
              className={`w-12 h-14 md:w-14 md:h-16 rounded-2xl border-2 flex items-center justify-center font-mono font-black text-xl md:text-2xl shadow-md select-none transition-all ${
                isGuessed
                  ? "bg-slate-800 border-emerald-500 text-emerald-400"
                  : showAnswer
                  ? "bg-amber-950/70 border-amber-400 text-amber-300"
                  : "bg-slate-900/90 border-slate-700 text-transparent"
              }`}
            >
              {isGuessed ? letter : showAnswer ? letter : "_"}
            </div>
          );
        })}
      </div>

      {/* Clue Banner */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-base font-bold text-slate-200">
        {word.emoji && <span className="text-xl">{word.emoji}</span>}
        <span>Gợi ý nghĩa:</span>
        <span className="text-emerald-400 font-extrabold">{word.clue}</span>
        {word.phonetic && (
          <span className="text-slate-400 font-mono text-base">
            ({word.phonetic})
          </span>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/hangman/`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/game/hangman/BalloonStage.tsx src/components/game/hangman/WordDisplay.tsx tests/components/hangman/BalloonStage.test.tsx tests/components/hangman/WordDisplay.test.tsx
git commit -m "feat(hangman): implement BalloonStage and WordDisplay components"
```

---

### Task 4: Hangman Header, Clue Banner & Virtual Keyboard

**Files:**
- Create: `src/components/game/hangman/HangmanHeader.tsx`
- Create: `src/components/game/hangman/HangmanKeyboard.tsx`
- Test: `tests/components/hangman/HangmanHeader.test.tsx`
- Test: `tests/components/hangman/HangmanKeyboard.test.tsx`

**Interfaces:**
- Consumes: `HangmanState` fields.
- Produces:
  - `HangmanHeader`: Props `{ topicId: string; onTopicChange: (id: string) => void; currentIndex: number; totalWords: number; score: number; hintUsed: boolean; onUseHint: () => void; wordStatus: "playing" | "won" | "lost"; onNextWord: () => void; }`
  - `HangmanKeyboard`: Props `{ guessedLetters: Set<string>; currentWordLetters: Set<string>; onKeyPress: (key: string) => void; disabled: boolean; }`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/components/hangman/HangmanHeader.test.tsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HangmanHeader } from "@/components/game/hangman/HangmanHeader";

describe("HangmanHeader Component", () => {
  it("renders topic select, word index, score, and hint button", () => {
    const onUseHint = vi.fn();
    render(
      <HangmanHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        currentIndex={1}
        totalWords={5}
        score={380}
        hintUsed={false}
        onUseHint={onUseHint}
        wordStatus="playing"
        onNextWord={vi.fn()}
      />
    );

    expect(screen.getByText("Từ 2/5")).toBeInTheDocument();
    expect(screen.getByText("380")).toBeInTheDocument();
    const hintBtn = screen.getByRole("button", { name: /gợi ý/i });
    expect(hintBtn).toBeEnabled();
    fireEvent.click(hintBtn);
    expect(onUseHint).toHaveBeenCalledTimes(1);
  });

  it("shows next word button when word is won or lost", () => {
    const onNextWord = vi.fn();
    render(
      <HangmanHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        currentIndex={1}
        totalWords={5}
        score={380}
        hintUsed={false}
        onUseHint={vi.fn()}
        wordStatus="won"
        onNextWord={onNextWord}
      />
    );

    const nextBtn = screen.getByRole("button", { name: /từ tiếp theo/i });
    expect(nextBtn).toBeInTheDocument();
    fireEvent.click(nextBtn);
    expect(onNextWord).toHaveBeenCalledTimes(1);
  });
});

// tests/components/hangman/HangmanKeyboard.test.tsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HangmanKeyboard } from "@/components/game/hangman/HangmanKeyboard";

describe("HangmanKeyboard Component", () => {
  it("renders 26 letter buttons with min 44px touch target", () => {
    const onKeyPress = vi.fn();
    render(
      <HangmanKeyboard
        guessedLetters={new Set(["A"])}
        currentWordLetters={new Set(["A", "T"])}
        onKeyPress={onKeyPress}
        disabled={false}
      />
    );

    const aKey = screen.getByRole("button", { name: "A" });
    expect(aKey).toHaveClass("min-h-[44px]");
    expect(aKey).toBeDisabled(); // Already guessed
    expect(aKey).toHaveClass("bg-emerald-600"); // Correct letter

    const bKey = screen.getByRole("button", { name: "B" });
    expect(bKey).toBeEnabled();
    fireEvent.click(bKey);
    expect(onKeyPress).toHaveBeenCalledWith("B");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/hangman/HangmanHeader.test.tsx tests/components/hangman/HangmanKeyboard.test.tsx`  
Expected: FAIL with module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/game/hangman/HangmanHeader.tsx`:
```tsx
import React from "react";
import Link from "next/link";
import { ArrowLeft, Lightbulb, ArrowRight } from "lucide-react";

interface HangmanHeaderProps {
  topicId: string;
  onTopicChange: (id: string) => void;
  currentIndex: number;
  totalWords: number;
  score: number;
  hintUsed: boolean;
  onUseHint: () => void;
  wordStatus: "playing" | "won" | "lost";
  onNextWord: () => void;
}

const TOPICS = [
  { id: "animals", name: "🐾 Động vật" },
  { id: "fruits", name: "🍎 Trái cây" },
  { id: "school", name: "🎒 Trường học" },
  { id: "family", name: "👨‍👩‍👧‍👦 Gia đình" },
  { id: "body-parts", name: "🦶 Cơ thể" },
];

export const HangmanHeader: React.FC<HangmanHeaderProps> = ({
  topicId,
  onTopicChange,
  currentIndex,
  totalWords,
  score,
  hintUsed,
  onUseHint,
  wordStatus,
  onNextWord,
}) => {
  return (
    <header className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-3xl backdrop-blur-md">
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

      <div className="flex items-center gap-3">
        {/* Word progress indicator */}
        <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-2xl min-h-[44px]">
          <span className="text-base text-slate-400 font-bold">🎯</span>
          <span className="font-mono text-base md:text-lg font-black text-white">
            Từ {currentIndex + 1}/{totalWords}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-2xl min-h-[44px]">
          <span className="text-base text-slate-400 font-bold">🏆</span>
          <span className="font-mono text-base md:text-lg font-black text-amber-400">
            {score}
          </span>
        </div>

        {/* Hint button or Next word button */}
        {wordStatus === "playing" ? (
          <button
            type="button"
            onClick={onUseHint}
            disabled={hintUsed}
            aria-label="Gợi ý 1 chữ cái (-100 điểm)"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-base min-h-[44px] border transition-all ${
              hintUsed
                ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 cursor-pointer"
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            <span>Gợi ý (-100đ)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNextWord}
            aria-label="Từ tiếp theo"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-base min-h-[44px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-300 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer animate-pulse"
          >
            <span>Từ tiếp theo</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};
```

Create `src/components/game/hangman/HangmanKeyboard.tsx`:
```tsx
import React from "react";

interface HangmanKeyboardProps {
  guessedLetters: Set<string>;
  currentWordLetters: Set<string>;
  onKeyPress: (key: string) => void;
  disabled: boolean;
}

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export const HangmanKeyboard: React.FC<HangmanKeyboardProps> = ({
  guessedLetters,
  currentWordLetters,
  onKeyPress,
  disabled,
}) => {
  return (
    <div
      role="region"
      aria-label="Bàn phím chữ cái"
      className="w-full max-w-2xl mt-2 flex flex-col gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl backdrop-blur-md select-none"
    >
      {ROWS.map((row, rIndex) => (
        <div key={rIndex} className="flex justify-center gap-1.5 w-full">
          {row.map((char) => {
            const isGuessed = guessedLetters.has(char);
            const isCorrect = currentWordLetters.has(char);

            let keyStyle =
              "bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 cursor-pointer shadow-sm active:scale-95";

            if (isGuessed && isCorrect) {
              keyStyle = "bg-emerald-600 text-white border-emerald-500 cursor-not-allowed opacity-90";
            } else if (isGuessed && !isCorrect) {
              keyStyle = "bg-red-950/80 text-red-400 border-red-900/50 cursor-not-allowed opacity-40";
            } else if (disabled) {
              keyStyle = "bg-slate-800/50 text-slate-600 border-slate-800 cursor-not-allowed";
            }

            return (
              <button
                key={char}
                type="button"
                onClick={() => onKeyPress(char)}
                disabled={isGuessed || disabled}
                aria-label={char}
                className={`flex-1 min-w-[28px] max-w-[48px] h-11 md:h-12 min-h-[44px] font-mono font-bold text-base md:text-lg rounded-xl border flex items-center justify-center transition-all ${keyStyle}`}
              >
                {char}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/hangman/HangmanHeader.test.tsx tests/components/hangman/HangmanKeyboard.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/game/hangman/HangmanHeader.tsx src/components/game/hangman/HangmanKeyboard.tsx tests/components/hangman/HangmanHeader.test.tsx tests/components/hangman/HangmanKeyboard.test.tsx
git commit -m "feat(hangman): implement HangmanHeader and HangmanKeyboard components"
```

---

### Task 5: Hangman Round Summary Modal & Audio Integration

**Files:**
- Create: `src/components/game/hangman/HangmanSummaryModal.tsx`
- Test: `tests/components/hangman/HangmanSummaryModal.test.tsx`

**Interfaces:**
- Consumes: `HangmanRoundHistory` from `src/types/hangman.ts`, `useSpeech` from `src/hooks/useSpeech.ts`.
- Produces: `HangmanSummaryModal`: Props `{ isOpen: boolean; score: number; history: HangmanRoundHistory[]; onRestart: () => void; }`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/components/hangman/HangmanSummaryModal.test.tsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HangmanSummaryModal } from "@/components/game/hangman/HangmanSummaryModal";

describe("HangmanSummaryModal Component", () => {
  const sampleHistory = [
    {
      word: { id: "cat", word: "CAT", clue: "Con mèo", phonetic: "/kæt/" },
      solved: true,
      mistakes: 0,
      score: 380,
    },
    {
      word: { id: "dog", word: "DOG", clue: "Con chó", phonetic: "/dɒɡ/" },
      solved: true,
      mistakes: 1,
      score: 330,
    },
    {
      word: { id: "pig", word: "PIG", clue: "Con heo", phonetic: "/pɪɡ/" },
      solved: true,
      mistakes: 0,
      score: 380,
    },
    {
      word: { id: "duck", word: "DUCK", clue: "Con vịt", phonetic: "/dʌk/" },
      solved: true,
      mistakes: 0,
      score: 380,
    },
    {
      word: { id: "fish", word: "FISH", clue: "Con cá", phonetic: "/fɪʃ/" },
      solved: true,
      mistakes: 0,
      score: 380,
    },
  ];

  it("renders 3 stars for score >= 1200 and 5/5 solved", () => {
    render(
      <HangmanSummaryModal
        isOpen={true}
        score={1850}
        history={sampleHistory}
        onRestart={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/giải cứu thành công/i)).toBeInTheDocument();
    expect(screen.getByText("1850")).toBeInTheDocument();
    expect(screen.getByText("5/5")).toBeInTheDocument();
    expect(screen.getByText("CAT")).toBeInTheDocument();
  });

  it("triggers onRestart when play again button is clicked", () => {
    const onRestart = vi.fn();
    render(
      <HangmanSummaryModal
        isOpen={true}
        score={500}
        history={sampleHistory.slice(0, 2)}
        onRestart={onRestart}
      />
    );

    const replayBtn = screen.getByRole("button", { name: /thử thách vòng mới/i });
    fireEvent.click(replayBtn);
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/hangman/HangmanSummaryModal.test.tsx`  
Expected: FAIL with module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/game/hangman/HangmanSummaryModal.tsx`:
```tsx
import React from "react";
import { Star, Volume2, RotateCcw } from "lucide-react";
import { HangmanRoundHistory } from "@/types/hangman";
import { useSpeech } from "@/hooks/useSpeech";
import { calculateRoundStars } from "@/lib/hangman/hangman-utils";

interface HangmanSummaryModalProps {
  isOpen: boolean;
  score: number;
  history: HangmanRoundHistory[];
  onRestart: () => void;
}

export const HangmanSummaryModal: React.FC<HangmanSummaryModalProps> = ({
  isOpen,
  score,
  history,
  onRestart,
}) => {
  const { speak } = useSpeech();

  if (!isOpen) return null;

  const solvedCount = history.filter((h) => h.solved).length;
  const stars = calculateRoundStars(score, solvedCount, history.length || 5);

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
          {solvedCount >= 3
            ? "🎉 Giải Cứu Thành Công!"
            : "🪂 Hoàn Thành Thử Thách!"}
        </h2>

        <p className="text-base text-slate-300 mb-6">
          {solvedCount === 5
            ? "Xuất sắc! Bạn đã giải cứu nhà thám hiểm qua toàn bộ 5 từ vựng!"
            : `Bạn đã đoán đúng ${solvedCount}/5 từ. Cố gắng bảo toàn nhiều bóng bay hơn nhé!`}
        </p>

        {/* Stars */}
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

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div>
            <div className="text-base text-slate-400 font-bold">Tổng điểm</div>
            <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono">
              {score}
            </div>
          </div>
          <div>
            <div className="text-base text-slate-400 font-bold">Từ đoán đúng</div>
            <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
              {solvedCount}/{history.length || 5}
            </div>
          </div>
        </div>

        {/* Word Review List */}
        {history.length > 0 && (
          <div className="w-full mb-6 text-left">
            <h3 className="text-base font-black text-slate-300 mb-2">
              📖 Ôn tập từ vựng ({history.length} từ)
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-base"
                >
                  <div className="flex items-center gap-2">
                    {item.word.emoji && <span className="text-lg">{item.word.emoji}</span>}
                    <span className="font-bold text-white font-mono">
                      {item.word.word}
                    </span>
                    {item.word.phonetic && (
                      <span className="text-slate-400 text-base">
                        {item.word.phonetic}
                      </span>
                    )}
                    <span className="text-slate-300 text-base">
                      — {item.word.clue}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speak(item.word.word)}
                    aria-label={`Phát âm ${item.word.word}`}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-400 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Play Again Button */}
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer min-h-[44px]"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Thử thách vòng mới</span>
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/hangman/HangmanSummaryModal.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/game/hangman/HangmanSummaryModal.tsx tests/components/hangman/HangmanSummaryModal.test.tsx
git commit -m "feat(hangman): implement HangmanSummaryModal component"
```

---

### Task 6: Route Assembly, Games Catalog Registration (`priority: 13`) & Playwright E2E

**Files:**
- Create: `src/app/games/hangman/page.tsx`
- Modify: `src/data/games.json`
- Modify: `tests/data/games.test.ts`
- Create: `tests/e2e/hangman.spec.ts`

**Interfaces:**
- Connects: `useHangmanEngine`, `useSpeech`, `useGameTracking`, `HangmanHeader`, `BalloonStage`, `WordDisplay`, `HangmanKeyboard`, `HangmanSummaryModal`.
- Catalog entry: `hangman` with `priority: 13`.
- E2E tests: full browser automation.

- [ ] **Step 1: Write the failing tests**

Update `tests/data/games.test.ts` to expect 13 games:
```typescript
// in tests/data/games.test.ts
expect(games).toHaveLength(13);
// and in expectedGameIds list add "hangman"
```

Create `tests/e2e/hangman.spec.ts`:
```typescript
import { test, expect } from "@playwright/test";

test.describe("Hangman Mini-Game E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/games/hangman");
  });

  test("loads the balloon stage, word slots, and virtual keyboard", async ({ page }) => {
    await expect(page.getByRole("region", { name: /khu vực khinh khí cầu/i })).toBeVisible();
    await expect(page.getByLabelText(/chọn chủ đề/i)).toBeVisible();
    await expect(page.getByRole("region", { name: /bàn phím chữ cái/i })).toBeVisible();
  });

  test("allows guessing letters using virtual keyboard", async ({ page }) => {
    const aKey = page.getByRole("button", { name: "A", exact: true });
    await expect(aKey).toBeVisible();
    await aKey.click();
    await expect(aKey).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run tests/data/games.test.ts`  
Expected: FAIL because games.json has only 12 games.

- [ ] **Step 3: Write minimal implementation**

Update `src/data/games.json` by appending:
```json
  {
    "id": "hangman",
    "slug": "hangman",
    "titleVi": "Giải Cứu Nhà Thám Hiểm",
    "titleEn": "Word Explorer: Balloon Hangman",
    "description": "Đoán các chữ cái tiếng Anh để giữ khinh khí cầu bay cao và giải cứu nhà thám hiểm",
    "emoji": "🎈",
    "route": "/games/hangman",
    "priority": 13
  }
```

Update `tests/data/games.test.ts` to include `"hangman"` and expect 13 games.

Create `src/app/games/hangman/page.tsx`:
```tsx
"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { useHangmanEngine } from "@/hooks/useHangmanEngine";
import { useSpeech } from "@/hooks/useSpeech";
import { useGameTracking } from "@/hooks/use-game-tracking";
import { HangmanHeader } from "@/components/game/hangman/HangmanHeader";
import { BalloonStage } from "@/components/game/hangman/BalloonStage";
import { WordDisplay } from "@/components/game/hangman/WordDisplay";
import { HangmanKeyboard } from "@/components/game/hangman/HangmanKeyboard";
import { HangmanSummaryModal } from "@/components/game/hangman/HangmanSummaryModal";

const emptySubscribe = () => () => {};

export default function HangmanPage() {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const {
    topicId,
    currentIndex,
    totalWords,
    currentWord,
    guessedLetters,
    mistakesCount,
    maxMistakes,
    hintUsed,
    score,
    wordStatus,
    isRoundComplete,
    history,
    guessLetter,
    useHint,
    nextWord,
    restartRound,
    setTopicId,
  } = useHangmanEngine();

  const { speak } = useSpeech();
  const { submitSession, resetSession } = useGameTracking({
    gameType: "hangman",
  });
  const sessionSubmittedRef = useRef(false);

  // Automatically pronounce word when won
  useEffect(() => {
    if (wordStatus === "won" && currentWord) {
      speak(currentWord.word);
    }
  }, [wordStatus, currentWord, speak]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (wordStatus !== "playing") return;
      if (["INPUT", "SELECT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (/^[a-zA-Z]$/.test(e.key)) {
        guessLetter(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wordStatus, guessLetter]);

  // Submit session tracking on round complete
  useEffect(() => {
    if (isRoundComplete && !sessionSubmittedRef.current) {
      sessionSubmittedRef.current = true;
      submitSession({
        score,
        totalQuestions: totalWords,
      }).catch((err) => console.error("Failed to submit hangman session:", err));

      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("gamehub_hangman_progress");
          const records = stored ? JSON.parse(stored) : [];
          records.push({
            date: new Date().toISOString(),
            score,
            topicId,
            solvedCount: history.filter((h) => h.solved).length,
            totalWords,
          });
          localStorage.setItem("gamehub_hangman_progress", JSON.stringify(records.slice(-20)));
        }
      } catch (err) {
        console.error("Failed to save progress to local storage:", err);
      }
    } else if (!isRoundComplete) {
      sessionSubmittedRef.current = false;
    }
  }, [isRoundComplete, score, totalWords, topicId, history, submitSession]);

  const currentWordLetters = useMemo(() => {
    return new Set(currentWord?.word.split("") || []);
  }, [currentWord]);

  const handleRestart = () => {
    resetSession();
    restartRound();
  };

  const handleTopicChange = (newTopicId: string) => {
    resetSession();
    setTopicId(newTopicId);
    restartRound(newTopicId);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-4xl h-[600px] bg-slate-900/40 rounded-3xl border border-slate-800 animate-pulse flex items-center justify-center text-slate-500 font-bold text-base">
          Đang tải Giải Cứu Nhà Thám Hiểm...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8 select-none">
      <HangmanHeader
        topicId={topicId}
        onTopicChange={handleTopicChange}
        currentIndex={currentIndex}
        totalWords={totalWords}
        score={score}
        hintUsed={hintUsed}
        onUseHint={useHint}
        wordStatus={wordStatus}
        onNextWord={nextWord}
      />

      <div className="w-full max-w-4xl flex flex-col items-center">
        <BalloonStage
          mistakesCount={mistakesCount}
          maxMistakes={maxMistakes}
          wordStatus={wordStatus}
        />

        {currentWord && (
          <WordDisplay
            word={currentWord}
            guessedLetters={guessedLetters}
            wordStatus={wordStatus}
          />
        )}

        <HangmanKeyboard
          guessedLetters={guessedLetters}
          currentWordLetters={currentWordLetters}
          onKeyPress={guessLetter}
          disabled={wordStatus !== "playing"}
        />
      </div>

      <HangmanSummaryModal
        isOpen={isRoundComplete}
        score={score}
        history={history}
        onRestart={handleRestart}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run unit and E2E tests to verify they pass**

Run: `npx vitest run tests/data/games.test.ts`  
Run: `npx vitest run tests/unit/hangman/ tests/components/hangman/`  
Run: `npx playwright test tests/e2e/hangman.spec.ts`  
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/games.json tests/data/games.test.ts src/app/games/hangman/page.tsx tests/e2e/hangman.spec.ts
git commit -m "feat(hangman): assemble route, register catalog priority 13, and add E2E tests"
```
