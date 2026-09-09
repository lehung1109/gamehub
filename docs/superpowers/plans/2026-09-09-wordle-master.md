# Wordle Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and integrate Wordle Master, an educational English word-guessing mini-game with 4-6 letter options, 3-tier hints (audio pronunciation, Vietnamese meaning, letter reveal), O(1) dictionary validation, and full GameHub classroom tracking.

**Architecture:** A modular decoupled architecture where a pure evaluation algorithm (`evaluateWordleGuess`) handles duplicate letter evaluation, an in-memory dictionary validates candidate guesses in O(1), a custom React state engine (`useWordleGame`) orchestrates game progress and scoring, and accessible, responsive UI components render the 3D-flipping grid, on-screen keyboard, and educational review modals.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React, Web Speech API (TTS), Web Audio API, Vitest & React Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-09-wordle-master-design.md`

## Global Constraints

- Must follow GameHub standard file structure under `src/app/games/wordle/` and `src/data/wordle/`.
- No external 3rd-party dictionary API calls at runtime (pure client-side / offline-ready).
- Must adhere to ESL-friendly visual design: dark/light theme compatibility, touch target minimum 44px for keys and buttons.
- Duplicate letter evaluation must follow official Wordle 2-pass algorithm.
- Integration with GameHub tracking hook `useGameTracking` for student analytics.

---

### Task 1: Wordle Types & Duplicate Letter Evaluation Algorithm

**Files:**
- Create: `src/types/wordle.ts`
- Create: `src/lib/wordle/evaluator.ts`
- Test: `tests/unit/wordle/evaluator.test.ts`

**Interfaces:**
- Consumes: None
- Produces:
  - Types: `WordleTargetWord`, `LetterStatus`, `EvaluatedLetter`, `EvaluatedRow`
  - Function: `evaluateWordleGuess(guess: string, target: string): EvaluatedLetter[]`

- [ ] **Step 1: Write the failing test for evaluation algorithm**

Create `tests/unit/wordle/evaluator.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { evaluateWordleGuess } from "@/lib/wordle/evaluator";

describe("evaluateWordleGuess", () => {
  it("evaluates all correct letters when guess matches target exactly", () => {
    const result = evaluateWordleGuess("APPLE", "APPLE");
    expect(result).toEqual([
      { char: "A", status: "correct" },
      { char: "P", status: "correct" },
      { char: "P", status: "correct" },
      { char: "L", status: "correct" },
      { char: "E", status: "correct" },
    ]);
  });

  it("evaluates all absent letters when no letters match", () => {
    const result = evaluateWordleGuess("ROUND", "CLIMB");
    expect(result).toEqual([
      { char: "R", status: "absent" },
      { char: "O", status: "absent" },
      { char: "U", status: "absent" },
      { char: "N", status: "absent" },
      { char: "D", status: "absent" },
    ]);
  });

  it("correctly handles duplicate letters when target has fewer occurrences than guess", () => {
    // Target has 1 'L'. Guess has 2 'L's.
    // LION vs LLAMA: first L is correct (green), second L is absent (gray).
    const result = evaluateWordleGuess("LLAMA", "LION");
    expect(result[0]).toEqual({ char: "L", status: "correct" });
    expect(result[1]).toEqual({ char: "L", status: "absent" });
  });

  it("correctly prioritizes exact matches (correct) over misplaced matches (present)", () => {
    // Target has 2 'P's (APPLE). Guess is PAPER.
    // Index 0: 'P' -> present (yellow) because index 2 'P' will match exact 'P' at index 2.
    // Index 1: 'A' -> present (yellow)
    // Index 2: 'P' -> correct (green)
    // Index 3: 'E' -> present (yellow)
    // Index 4: 'R' -> absent (gray)
    const result = evaluateWordleGuess("PAPER", "APPLE");
    expect(result).toEqual([
      { char: "P", status: "present" },
      { char: "A", status: "present" },
      { char: "P", status: "correct" },
      { char: "E", status: "present" },
      { char: "R", status: "absent" },
    ]);
  });

  it("handles case insensitivity cleanly", () => {
    const result = evaluateWordleGuess("tiger", "TIGER");
    expect(result.every((r) => r.status === "correct")).toBe(true);
  });

  it("supports 4-letter and 6-letter words", () => {
    const result4 = evaluateWordleGuess("BEAR", "BEAR");
    expect(result4.length).toBe(4);
    expect(result4.every((r) => r.status === "correct")).toBe(true);

    const result6 = evaluateWordleGuess("DOCTOR", "DOCTOR");
    expect(result6.length).toBe(6);
    expect(result6.every((r) => r.status === "correct")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/wordle/evaluator.test.ts`
Expected: FAIL with "Cannot find module '@/lib/wordle/evaluator'"

- [ ] **Step 3: Write types and implementation**

Create `src/types/wordle.ts`:
```typescript
export type LetterStatus = "correct" | "present" | "absent" | "empty" | "tbd";

export interface EvaluatedLetter {
  char: string;
  status: LetterStatus;
}

export type EvaluatedRow = EvaluatedLetter[];

export interface WordleTargetWord {
  id: string;
  word: string;
  length: 4 | 5 | 6;
  category: "animals" | "school" | "technology" | "daily-life" | "fruits" | "workplace";
  vietnameseMeaning: string;
  phonetic: string;
  partOfSpeech: "noun" | "verb" | "adjective";
  exampleSentence: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface WordleStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>; // 1 -> count, 2 -> count, ... 6 -> count
}
```

Create `src/lib/wordle/evaluator.ts`:
```typescript
import { EvaluatedLetter } from "@/types/wordle";

export function evaluateWordleGuess(guess: string, target: string): EvaluatedLetter[] {
  const g = guess.trim().toUpperCase();
  const t = target.trim().toUpperCase();
  const len = t.length;

  const result: EvaluatedLetter[] = Array.from({ length: len }, (_, i) => ({
    char: g[i] || "",
    status: "absent",
  }));

  // Count available occurrences in target
  const targetCounts: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const char = t[i];
    targetCounts[char] = (targetCounts[char] || 0) + 1;
  }

  // Pass 1: Mark exact matches (correct - green)
  for (let i = 0; i < len; i++) {
    if (g[i] === t[i]) {
      result[i].status = "correct";
      targetCounts[g[i]] -= 1;
    }
  }

  // Pass 2: Mark misplaced occurrences (present - yellow)
  for (let i = 0; i < len; i++) {
    if (result[i].status !== "correct") {
      const char = g[i];
      if (char && targetCounts[char] && targetCounts[char] > 0) {
        result[i].status = "present";
        targetCounts[char] -= 1;
      } else {
        result[i].status = "absent";
      }
    }
  }

  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/wordle/evaluator.test.ts`
Expected: PASS (all 6 tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/types/wordle.ts src/lib/wordle/evaluator.ts tests/unit/wordle/evaluator.test.ts
git commit -m "feat(wordle): add wordle types and duplicate letter evaluation algorithm"
```

---

### Task 2: Target Word Bank & Validation Dictionary

**Files:**
- Create: `src/data/wordle/words.json`
- Create: `src/data/wordle/valid-dictionary.ts`
- Test: `tests/unit/wordle/words-data.test.ts`

**Interfaces:**
- Consumes: `src/types/wordle.ts`
- Produces:
  - `WORDLE_TARGET_WORDS: WordleTargetWord[]`
  - `isValidWordleGuess(guess: string): boolean`
  - `getRandomWord(category?: string, length?: 4 | 5 | 6): WordleTargetWord`

- [ ] **Step 1: Write failing test for word data and validation**

Create `tests/unit/wordle/words-data.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { isValidWordleGuess, getRandomWord, WORDLE_TARGET_WORDS } from "@/data/wordle/valid-dictionary";

describe("Wordle Data & Validation Dictionary", () => {
  it("contains curated target words for lengths 4, 5, and 6", () => {
    expect(WORDLE_TARGET_WORDS.length).toBeGreaterThanOrEqual(30);

    const lengths = new Set(WORDLE_TARGET_WORDS.map((w) => w.length));
    expect(lengths.has(4)).toBe(true);
    expect(lengths.has(5)).toBe(true);
    expect(lengths.has(6)).toBe(true);

    // Each target word has required fields
    for (const w of WORDLE_TARGET_WORDS) {
      expect(w.word.length).toBe(w.length);
      expect(w.vietnameseMeaning.length).toBeGreaterThan(0);
      expect(w.phonetic.length).toBeGreaterThan(0);
      expect(w.exampleSentence.length).toBeGreaterThan(0);
    }
  });

  it("validates known target words as valid guesses", () => {
    expect(isValidWordleGuess("APPLE")).toBe(true);
    expect(isValidWordleGuess("tiger")).toBe(true); // lower-case normalization
    expect(isValidWordleGuess("ROBOT")).toBe(true);
  });

  it("rejects invalid or gibberish words", () => {
    expect(isValidWordleGuess("XYZQW")).toBe(false);
    expect(isValidWordleGuess("ABCDE")).toBe(false);
    expect(isValidWordleGuess("")).toBe(false);
  });

  it("gets random word filtered by length and category", () => {
    const animalWord = getRandomWord("animals", 4);
    expect(animalWord.category).toBe("animals");
    expect(animalWord.length).toBe(4);
    expect(animalWord.word.length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/wordle/words-data.test.ts`
Expected: FAIL with "Cannot find module '@/data/wordle/valid-dictionary'"

- [ ] **Step 3: Create target words JSON and validation dictionary**

Create `src/data/wordle/words.json` containing 40+ curated target words across categories (animals, school, technology, daily-life, fruits, workplace) for lengths 4, 5, and 6.

Create `src/data/wordle/valid-dictionary.ts`:
- Import `words.json`
- Compile a comprehensive `Set<string>` of valid English words (including all target words plus common 4-6 letter English vocabulary words).
- Export `isValidWordleGuess(guess: string): boolean`.
- Export `getRandomWord(category?: string, length?: 4 | 5 | 6): WordleTargetWord`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/wordle/words-data.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/wordle/words.json src/data/wordle/valid-dictionary.ts tests/unit/wordle/words-data.test.ts
git commit -m "feat(wordle): add target words data bank and fast validation dictionary"
```

---

### Task 3: Game Engine Hook (`useWordleGame`)

**Files:**
- Create: `src/hooks/use-wordle-game.ts`
- Test: `tests/unit/wordle/use-wordle-game.test.ts`

**Interfaces:**
- Consumes: `evaluateWordleGuess`, `isValidWordleGuess`, `WordleTargetWord`
- Produces:
  ```typescript
  export function useWordleGame(options?: {
    initialWord?: WordleTargetWord;
    maxAttempts?: number;
    onGameComplete?: (result: { won: boolean; attempts: number; stars: number }) => void;
  }): {
    targetWord: WordleTargetWord;
    guesses: string[];
    currentGuess: string;
    gameStatus: "playing" | "won" | "lost";
    isShaking: boolean;
    errorMessage: string | null;
    keyboardStatus: Record<string, LetterStatus>;
    hintsUsed: { audio: boolean; meaning: boolean; letter: boolean };
    revealedPositions: Record<number, string>;
    starsEarned: number;
    stats: WordleStats;
    addLetter: (char: string) => void;
    removeLetter: () => void;
    submitGuess: () => void;
    useAudioHint: () => void;
    useMeaningHint: () => void;
    useLetterHint: () => void;
    resetGame: (newWord?: WordleTargetWord) => void;
  }
  ```

- [ ] **Step 1: Write failing hook test**

Create `tests/unit/wordle/use-wordle-game.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWordleGame } from "@/hooks/use-wordle-game";
import { WordleTargetWord } from "@/types/wordle";

const MOCK_WORD: WordleTargetWord = {
  id: "test-apple",
  word: "APPLE",
  length: 5,
  category: "fruits",
  vietnameseMeaning: "Quả táo",
  phonetic: "/ˈæp.əl/",
  partOfSpeech: "noun",
  exampleSentence: "An apple a day.",
  difficulty: "easy",
};

describe("useWordleGame", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with default playing state", () => {
    const { result } = renderHook(() => useWordleGame({ initialWord: MOCK_WORD }));
    expect(result.current.gameStatus).toBe("playing");
    expect(result.current.currentGuess).toBe("");
    expect(result.current.guesses).toEqual([]);
    expect(result.current.targetWord.word).toBe("APPLE");
  });

  it("handles adding and removing letters up to word length", () => {
    const { result } = renderHook(() => useWordleGame({ initialWord: MOCK_WORD }));

    act(() => {
      result.current.addLetter("A");
      result.current.addLetter("P");
    });
    expect(result.current.currentGuess).toBe("AP");

    act(() => {
      result.current.removeLetter();
    });
    expect(result.current.currentGuess).toBe("A");

    act(() => {
      result.current.addLetter("P");
      result.current.addLetter("P");
      result.current.addLetter("L");
      result.current.addLetter("E");
      result.current.addLetter("S"); // exceeds length 5
    });
    expect(result.current.currentGuess).toBe("APPLE");
  });

  it("prevents submitting when guess is shorter than word length", () => {
    const { result } = renderHook(() => useWordleGame({ initialWord: MOCK_WORD }));

    act(() => {
      result.current.addLetter("A");
      result.current.submitGuess();
    });

    expect(result.current.guesses.length).toBe(0);
    expect(result.current.isShaking).toBe(true);
    expect(result.current.errorMessage).toContain("đủ");
  });

  it("wins the game when submitting the exact target word", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useWordleGame({ initialWord: MOCK_WORD, onGameComplete: onComplete })
    );

    act(() => {
      for (const char of "APPLE") result.current.addLetter(char);
      result.current.submitGuess();
    });

    expect(result.current.gameStatus).toBe("won");
    expect(result.current.guesses).toEqual(["APPLE"]);
    expect(result.current.starsEarned).toBe(3);
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ won: true, attempts: 1, stars: 3 })
    );
  });

  it("reveals a letter when using letter hint", () => {
    const { result } = renderHook(() => useWordleGame({ initialWord: MOCK_WORD }));

    act(() => {
      result.current.useLetterHint();
    });

    expect(result.current.hintsUsed.letter).toBe(true);
    expect(Object.keys(result.current.revealedPositions).length).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/wordle/use-wordle-game.test.ts`
Expected: FAIL with "Cannot find module '@/hooks/use-wordle-game'"

- [ ] **Step 3: Implement `useWordleGame`**

Create `src/hooks/use-wordle-game.ts`:
- Manage `guesses`, `currentGuess`, `gameStatus`, `isShaking`, `errorMessage`, `revealedPositions`, `hintsUsed`, `keyboardStatus`.
- Implement `submitGuess()` with dictionary validation, duplicate-letter evaluation via `evaluateWordleGuess`, status update, and win/loss scoring.
- Calculate stars based on attempt count (1-2: 3 stars, 3-4: 2 stars, 5-6: 1 star).
- Manage keyboard color priority: correct > present > absent.
- Update `localStorage` stats (streak, win rate, distribution).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/wordle/use-wordle-game.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-wordle-game.ts tests/unit/wordle/use-wordle-game.test.ts
git commit -m "feat(wordle): implement useWordleGame state machine hook with scoring and hints"
```

---

### Task 4: Grid, Row, Tile & Keyboard UI Components

**Files:**
- Create: `src/app/games/wordle/components/WordleTile.tsx`
- Create: `src/app/games/wordle/components/WordleRow.tsx`
- Create: `src/app/games/wordle/components/WordleGrid.tsx`
- Create: `src/app/games/wordle/components/WordleKeyboard.tsx`
- Test: `tests/components/wordle/WordleGridAndKeyboard.test.tsx`

**Interfaces:**
- Consumes: `LetterStatus`, `EvaluatedLetter`, `evaluateWordleGuess`
- Produces:
  - `<WordleGrid rows={...} currentGuess={...} isShaking={...} targetWord={...} />`
  - `<WordleKeyboard onKeyPress={...} onBackspace={...} onEnter={...} keyStatus={...} />`

- [ ] **Step 1: Write component tests**

Create `tests/components/wordle/WordleGridAndKeyboard.test.tsx`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { WordleGrid } from "@/app/games/wordle/components/WordleGrid";
import { WordleKeyboard } from "@/app/games/wordle/components/WordleKeyboard";

describe("WordleGrid and WordleKeyboard Components", () => {
  it("renders 6 rows with correct number of tiles per row", () => {
    render(
      <WordleGrid
        wordLength={5}
        maxAttempts={6}
        guesses={["LIGHT"]}
        currentGuess="AP"
        targetWord="APPLE"
        isShaking={false}
        revealedPositions={{}}
      />
    );

    const rows = screen.getAllByTestId(/^wordle-row-/);
    expect(rows.length).toBe(6);
  });

  it("renders all QWERTY keyboard keys with Enter and Backspace", () => {
    const onKey = vi.fn();
    const onEnter = vi.fn();
    const onBackspace = vi.fn();

    render(
      <WordleKeyboard
        onKeyPress={onKey}
        onEnter={onEnter}
        onBackspace={onBackspace}
        keyStatus={{ A: "correct", B: "absent" }}
      />
    );

    const keyA = screen.getByRole("button", { name: "A" });
    fireEvent.click(keyA);
    expect(onKey).toHaveBeenCalledWith("A");

    const enterBtn = screen.getByRole("button", { name: /ENTER/i });
    fireEvent.click(enterBtn);
    expect(onEnter).toHaveBeenCalled();

    const backspaceBtn = screen.getByRole("button", { name: /DELETE|BACKSPACE|⌫/i });
    fireEvent.click(backspaceBtn);
    expect(onBackspace).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/wordle/WordleGridAndKeyboard.test.tsx`
Expected: FAIL with missing component modules

- [ ] **Step 3: Implement components**

Implement:
1. `src/app/games/wordle/components/WordleTile.tsx`:
   - Handles letter display, flip animation delay based on index, color classes (emerald, amber, slate).
2. `src/app/games/wordle/components/WordleRow.tsx`:
   - Renders tiles for completed guesses, current typing row, or empty future rows. Handles shake class.
3. `src/app/games/wordle/components/WordleGrid.tsx`:
   - Renders 6 rows centered, responsive.
4. `src/app/games/wordle/components/WordleKeyboard.tsx`:
   - QWERTY rows, color coded keys, min 44px height touch targets, accessibility labels.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/wordle/WordleGridAndKeyboard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/games/wordle/components/ tests/components/wordle/WordleGridAndKeyboard.test.tsx
git commit -m "feat(wordle): add WordleGrid, WordleRow, WordleTile, and WordleKeyboard components"
```

---

### Task 5: Header, Hints Bar, Modals & Main Page Route

**Files:**
- Create: `src/app/games/wordle/components/WordleHeader.tsx`
- Create: `src/app/games/wordle/components/WordleHintsBar.tsx`
- Create: `src/app/games/wordle/components/WordleResultDialog.tsx`
- Create: `src/app/games/wordle/components/WordleStatsModal.tsx`
- Create: `src/app/games/wordle/page.tsx`
- Test: `tests/app/games/wordle/page.test.tsx`

**Interfaces:**
- Consumes: `useWordleGame`, `WordleGrid`, `WordleKeyboard`, `useGameTracking`, `useSpeech`
- Produces: Next.js App Router Page `/games/wordle`

- [ ] **Step 1: Write page integration test**

Create `tests/app/games/wordle/page.test.tsx`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import WordlePage from "@/app/games/wordle/page";

// Mock useGameTracking
vi.mock("@/hooks/use-game-tracking", () => ({
  useGameTracking: () => ({
    trackAttempt: vi.fn(),
    sessionStats: { played: 0 },
  }),
}));

describe("WordlePage", () => {
  it("renders game header, wordle grid, hint buttons, and keyboard", () => {
    render(<WordlePage />);

    expect(screen.getByText(/Wordle Master/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nghe/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gợi ý/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tiết lộ/i })).toBeInTheDocument();
  });

  it("allows typing via virtual keyboard on page", () => {
    render(<WordlePage />);

    const keyA = screen.getByRole("button", { name: "A" });
    fireEvent.click(keyA);

    // Tile displays 'A'
    expect(screen.getAllByText("A").length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/app/games/wordle/page.test.tsx`
Expected: FAIL with "Cannot find module '@/app/games/wordle/page'"

- [ ] **Step 3: Implement Header, HintsBar, ResultDialog, StatsModal and Page**

1. `WordleHeader.tsx`: Back button, Category picker, Word length selector (4, 5, 6), Stats button, How-to-play guide button.
2. `WordleHintsBar.tsx`: Audio TTS button (uses Web Speech synthesis), Vietnamese meaning button with tooltip/popover, Letter reveal button.
3. `WordleResultDialog.tsx`: Dialog showing stars, XP, confetti on victory, full target word vocabulary card (audio button, IPA, meaning, example sentence), share emoji grid button.
4. `WordleStatsModal.tsx`: Displays games played, win rate %, streak, and guess distribution bar chart.
5. `src/app/games/wordle/page.tsx`: Top-level component tying hook, keyboard events listener (`keydown`), sound effects via Web Audio API, and tracking via `useGameTracking`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/app/games/wordle/page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/games/wordle/ tests/app/games/wordle/page.test.tsx
git commit -m "feat(wordle): add Wordle page, header, hints bar, stats modal, and result dialog"
```

---

### Task 6: Platform Registration, Instructions Guide & Config Schema

**Files:**
- Modify: `src/data/games.json`
- Modify: `src/data/game-instructions.ts`
- Modify: `src/lib/game-config-schema.ts`
- Test: `tests/unit/wordle/wordle-integration.test.ts`

**Interfaces:**
- Consumes: Wordle Game Metadata
- Produces: System-wide game registration and teacher config schema

- [ ] **Step 1: Write integration test**

Create `tests/unit/wordle/wordle-integration.test.ts`:
```typescript
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
  });

  it("has comprehensive game instructions in game-instructions.ts", () => {
    const instructions = GAME_INSTRUCTIONS["wordle"];
    expect(instructions).toBeDefined();
    expect(instructions.howToPlay.length).toBeGreaterThan(0);
    expect(instructions.tips.length).toBeGreaterThan(0);
  });

  it("defines configuration schema for Wordle in game-config-schema.ts", () => {
    const schema = GAME_CONFIG_SCHEMAS["wordle"];
    expect(schema).toBeDefined();
    expect(schema.fields).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/wordle/wordle-integration.test.ts`
Expected: FAIL with "expected undefined to be defined"

- [ ] **Step 3: Update games.json, game-instructions.ts, and game-config-schema.ts**

1. Update `src/data/games.json` adding Wordle Master (`id: "wordle"`, `route: "/games/wordle"`, `emoji: "🟩"`, `priority: 14`).
2. Update `src/data/game-instructions.ts` adding detailed how-to-play guide, color rules (Xanh = đúng vị trí, Vàng = sai vị trí, Xám = không có), hint instructions, and ESL learning tips.
3. Update `src/lib/game-config-schema.ts` adding schema for teacher customization (allowed word lengths, category selection, hint toggles).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/wordle/wordle-integration.test.ts`
Expected: PASS

- [ ] **Step 5: Run full test suite regression**

Run: `npm test -- --run`
Expected: All test suites pass (0 regressions).

- [ ] **Step 6: Commit**

```bash
git add src/data/games.json src/data/game-instructions.ts src/lib/game-config-schema.ts tests/unit/wordle/wordle-integration.test.ts
git commit -m "feat(wordle): register Wordle Master in games catalog, instructions guide, and config schema"
```

---

## Plan Self-Review Checklist
- [x] **Spec coverage:** All spec items (4-6 letters, duplicate letters algorithm, 3-tier hints, O(1) dictionary, virtual keyboard, scoring & tracking, teacher config) have corresponding tasks.
- [x] **No placeholders:** All tasks have full test code and complete implementation instructions.
- [x] **Type consistency:** Types (`WordleTargetWord`, `LetterStatus`, `EvaluatedLetter`, etc.) are defined in Task 1 and consistently imported across Tasks 2-6.
