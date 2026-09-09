# Crossword Master: Word Puzzle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Crossword Master: Word Puzzle", an interactive educational crossword mini-game in GameHub where learners solve procedural crossword grids across topics with bilingual clues, audio pronunciation, and smart hint assists.

**Architecture:** Procedural constraint-satisfaction crossword generator (`crossword-generator.ts`) generating $8 \times 8$ to $10 \times 10$ boards with 4-6 intersecting words, driven by `useCrosswordEngine` hook and modular presentation components (`CrosswordGrid`, `CluePanel`, `HintBar`, `VirtualKeyboard`, `CrosswordCompletionModal`).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React, Web Speech API (`useSpeech`), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-08-crossword-master-word-puzzle-design.md`

## Global Constraints
- Interactive components must include `'use client'`.
- All text classes must adhere to GameHub typography standard $\ge 16\text{px}$ (use `text-xs`, `text-sm`, `text-base` etc., avoiding arbitrary `text-[10px]`).
- Grid dimensions: $8 \times 8$ to $10 \times 10$ containing 4-6 intersecting words.
- Dual input support: physical PC keyboard and mobile `VirtualKeyboard`.
- Hints: Audio is free, Reveal 1 Letter is -10 points, Reveal Word is -30 points.
- Tests live under `tests/unit/crossword/`, `tests/components/crossword/`, and `tests/e2e/crossword.spec.ts`.

---

### Task 1: Type Definitions & Procedural Crossword Grid Generator

**Files:**
- Create: `src/types/crossword.ts`
- Create: `src/lib/crossword/crossword-generator.ts`
- Test: `tests/unit/crossword/crossword-generator.test.ts`

**Interfaces:**
- Produces:
  - `Direction`: `'across' | 'down'`
  - `CrosswordWord`, `CrosswordCell`, `CrosswordBoard`
  - `generateCrosswordBoard(topicId?: string, wordCount?: number): CrosswordBoard`

- [ ] **Step 1: Write the failing unit test for generator**

```typescript
// tests/unit/crossword/crossword-generator.test.ts
import { describe, it, expect } from "vitest";
import { generateCrosswordBoard } from "@/lib/crossword/crossword-generator";

describe("Crossword Generator Engine", () => {
  it("generates a valid board with 4 to 6 intersecting words", () => {
    const board = generateCrosswordBoard("animals", 5);
    expect(board.words.length).toBeGreaterThanOrEqual(4);
    expect(board.words.length).toBeLessThanOrEqual(6);
    expect(board.rows).toBeGreaterThanOrEqual(8);
    expect(board.cols).toBeGreaterThanOrEqual(8);
    expect(board.grid.length).toBe(board.rows);
    expect(board.grid[0].length).toBe(board.cols);
  });

  it("assigns unique, ascending clue numbers starting from 1", () => {
    const board = generateCrosswordBoard("animals", 5);
    const numbers = board.words.map((w) => w.number);
    expect(numbers.length).toBe(board.words.length);
    expect(Math.min(...numbers)).toBe(1);
  });

  it("guarantees intersecting cells share the exact same character", () => {
    const board = generateCrosswordBoard("animals", 5);
    for (const word of board.words) {
      for (let i = 0; i < word.word.length; i++) {
        const r = word.direction === "across" ? word.startRow : word.startRow + i;
        const c = word.direction === "across" ? word.startCol + i : word.startCol;
        const cell = board.grid[r][c];
        expect(cell.isBlocked).toBe(false);
        expect(cell.char).toBe(word.word[i]);
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/crossword/crossword-generator.test.ts`
Expected: FAIL with Cannot find module `@/lib/crossword/crossword-generator`

- [ ] **Step 3: Implement types and procedural generator**

Create `src/types/crossword.ts`:
```typescript
export type Direction = "across" | "down";

export interface CrosswordWord {
  id: string;
  word: string;
  clue: string;
  phonetic?: string;
  emoji?: string;
  direction: Direction;
  startRow: number;
  startCol: number;
  number: number;
  isSolved: boolean;
  isRevealed: boolean;
}

export interface CrosswordCell {
  row: number;
  col: number;
  char: string;
  userChar: string;
  isBlocked: boolean;
  clueNumber?: number;
  acrossWordId?: string;
  downWordId?: string;
  isRevealed?: boolean;
}

export interface CrosswordBoard {
  rows: number;
  cols: number;
  grid: CrosswordCell[][];
  words: CrosswordWord[];
  topicId: string;
}
```

Create `src/lib/crossword/crossword-generator.ts`:
```typescript
import { CrosswordBoard, CrosswordCell, CrosswordWord, Direction } from "@/types/crossword";
import animalsData from "@/data/words/animals.json";
import fruitsData from "@/data/words/fruits.json";
import schoolData from "@/data/words/school.json";

interface RawWord {
  id: string;
  english: string;
  vietnamese: string;
  phonetic?: string;
  emoji?: string;
  topicId: string;
}

const TOPIC_POOLS: Record<string, RawWord[]> = {
  animals: animalsData as RawWord[],
  fruits: fruitsData as RawWord[],
  school: schoolData as RawWord[],
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function generateCrosswordBoard(topicId = "animals", targetWordCount = 5): CrosswordBoard {
  const pool = TOPIC_POOLS[topicId] || animalsData;
  const filteredWords = pool
    .map((w) => ({
      ...w,
      cleanWord: w.english.trim().toUpperCase().replace(/[^A-Z]/g, ""),
    }))
    .filter((w) => w.cleanWord.length >= 3 && w.cleanWord.length <= 8);

  const GRID_SIZE = 10;
  const grid: CrosswordCell[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => ({
      row: r,
      col: c,
      char: "",
      userChar: "",
      isBlocked: true,
    }))
  );

  const placedWords: CrosswordWord[] = [];
  const shuffledCandidates = shuffle(filteredWords);

  // 1. Place seed word horizontally in the center
  const seed = shuffledCandidates[0];
  const seedWord = seed.cleanWord;
  const startRow = Math.floor(GRID_SIZE / 2) - 1;
  const startCol = Math.max(0, Math.floor((GRID_SIZE - seedWord.length) / 2));

  for (let i = 0; i < seedWord.length; i++) {
    grid[startRow][startCol + i].char = seedWord[i];
    grid[startRow][startCol + i].isBlocked = false;
    grid[startRow][startCol + i].acrossWordId = seed.id;
  }

  placedWords.push({
    id: seed.id,
    word: seedWord,
    clue: seed.vietnamese,
    phonetic: seed.phonetic,
    emoji: seed.emoji,
    direction: "across",
    startRow,
    startCol,
    number: 1,
    isSolved: false,
    isRevealed: false,
  });

  // 2. Try placing remaining candidates intersecting with existing words
  for (let cIdx = 1; cIdx < shuffledCandidates.length; cIdx++) {
    if (placedWords.length >= targetWordCount) break;
    const candidate = shuffledCandidates[cIdx];
    const candidateStr = candidate.cleanWord;

    let placed = false;
    for (const existing of placedWords) {
      if (placed) break;
      const targetDir: Direction = existing.direction === "across" ? "down" : "across";

      // Find intersection letters
      for (let ePos = 0; ePos < existing.word.length; ePos++) {
        if (placed) break;
        const targetChar = existing.word[ePos];
        const cPos = candidateStr.indexOf(targetChar);
        if (cPos === -1) continue;

        // Calculate start position
        const intersectRow = existing.direction === "across" ? existing.startRow : existing.startRow + ePos;
        const intersectCol = existing.direction === "across" ? existing.startCol + ePos : existing.startCol;

        const candidateStartRow = targetDir === "down" ? intersectRow - cPos : intersectRow;
        const candidateStartCol = targetDir === "across" ? intersectCol - cPos : intersectCol;

        // Bounding check
        if (candidateStartRow < 0 || candidateStartCol < 0) continue;
        if (targetDir === "down" && candidateStartRow + candidateStr.length > GRID_SIZE) continue;
        if (targetDir === "across" && candidateStartCol + candidateStr.length > GRID_SIZE) continue;

        // Collision & spacing check
        let valid = true;
        for (let i = 0; i < candidateStr.length; i++) {
          const r = targetDir === "down" ? candidateStartRow + i : candidateStartRow;
          const c = targetDir === "across" ? candidateStartCol + i : candidateStartCol;
          const cell = grid[r][c];

          // Can overlap ONLY if the character matches
          if (!cell.isBlocked && cell.char !== candidateStr[i]) {
            valid = false;
            break;
          }
        }

        if (valid) {
          // Place candidate
          for (let i = 0; i < candidateStr.length; i++) {
            const r = targetDir === "down" ? candidateStartRow + i : candidateStartRow;
            const c = targetDir === "across" ? candidateStartCol + i : candidateStartCol;
            grid[r][c].char = candidateStr[i];
            grid[r][c].isBlocked = false;
            if (targetDir === "across") grid[r][c].acrossWordId = candidate.id;
            else grid[r][c].downWordId = candidate.id;
          }

          placedWords.push({
            id: candidate.id,
            word: candidateStr,
            clue: candidate.vietnamese,
            phonetic: candidate.phonetic,
            emoji: candidate.emoji,
            direction: targetDir,
            startRow: candidateStartRow,
            startCol: candidateStartCol,
            number: 1, // updated below
            isSolved: false,
            isRevealed: false,
          });
          placed = true;
        }
      }
    }
  }

  // 3. Assign clue numbers row-by-row, column-by-column
  let nextNumber = 1;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const startingWords = placedWords.filter((w) => w.startRow === r && w.startCol === c);
      if (startingWords.length > 0) {
        grid[r][c].clueNumber = nextNumber;
        for (const w of startingWords) {
          w.number = nextNumber;
        }
        nextNumber++;
      }
    }
  }

  return {
    rows: GRID_SIZE,
    cols: GRID_SIZE,
    grid,
    words: placedWords,
    topicId,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/crossword/crossword-generator.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/crossword.ts src/lib/crossword/crossword-generator.ts tests/unit/crossword/crossword-generator.test.ts
git commit -m "feat(crossword): add types and procedural crossword generator engine"
```

---

### Task 2: Crossword Engine State Machine Hook (`useCrosswordEngine`)

**Files:**
- Create: `src/hooks/useCrosswordEngine.ts`
- Test: `tests/unit/crossword/useCrosswordEngine.test.ts`

**Interfaces:**
- Consumes:
  - `CrosswordBoard`, `Direction` from `src/types/crossword.ts`
  - `generateCrosswordBoard` from `src/lib/crossword/crossword-generator.ts`
- Produces:
  - `useCrosswordEngine(topicId?: string)` returning:
    - State: `board`, `selectedCell`, `direction`, `activeWord`, `score`, `hintsUsed`, `isComplete`, `elapsedSeconds`, `topicId`
    - Actions: `typeLetter(char: string)`, `handleBackspace()`, `moveCursor(deltaRow: number, deltaCol: number)`, `toggleDirection()`, `selectCell(row: number, col: number)`, `selectClue(wordId: string)`, `revealLetter()`, `revealWord()`, `loadNewPuzzle(newTopicId?: string)`

- [ ] **Step 1: Write the failing unit test for `useCrosswordEngine`**

```typescript
// tests/unit/crossword/useCrosswordEngine.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCrosswordEngine } from "@/hooks/useCrosswordEngine";

describe("useCrosswordEngine Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with a valid board and focuses the first word", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    expect(result.current.board.words.length).toBeGreaterThanOrEqual(4);
    expect(result.current.selectedCell).not.toBeNull();
    expect(result.current.activeWord).not.toBeNull();
  });

  it("handles letter typing and auto-advances the cursor", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    const initialCell = { ...result.current.selectedCell };

    act(() => {
      result.current.typeLetter("A");
    });

    const typedCell = result.current.board.grid[initialCell.row][initialCell.col];
    expect(typedCell.userChar).toBe("A");
    // Cursor advanced
    expect(
      result.current.selectedCell.row !== initialCell.row ||
        result.current.selectedCell.col !== initialCell.col
    ).toBe(true);
  });

  it("reveals single letter with penalty and marks cell revealed", () => {
    const { result } = renderHook(() => useCrosswordEngine("animals"));
    const cell = { ...result.current.selectedCell };

    act(() => {
      result.current.revealLetter();
    });

    const revealedCell = result.current.board.grid[cell.row][cell.col];
    expect(revealedCell.userChar).toBe(revealedCell.char);
    expect(revealedCell.isRevealed).toBe(true);
    expect(result.current.hintsUsed).toBe(1);
    expect(result.current.score).toBeLessThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/crossword/useCrosswordEngine.test.ts`
Expected: FAIL with Cannot find module `@/hooks/useCrosswordEngine`

- [ ] **Step 3: Implement `useCrosswordEngine` hook**

Create `src/hooks/useCrosswordEngine.ts`:
```typescript
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CrosswordBoard, CrosswordWord, Direction } from "@/types/crossword";
import { generateCrosswordBoard } from "@/lib/crossword/crossword-generator";

export function useCrosswordEngine(initialTopicId = "animals") {
  const [topicId, setTopicId] = useState(initialTopicId);
  const [board, setBoard] = useState<CrosswordBoard>(() => generateCrosswordBoard(initialTopicId));
  const [direction, setDirection] = useState<Direction>("across");
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>(() => {
    const firstWord = board.words[0];
    return { row: firstWord.startRow, col: firstWord.startCol };
  });

  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wordsRevealed, setWordsRevealed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeWord = useMemo(() => {
    const currentCell = board.grid[selectedCell.row]?.[selectedCell.col];
    if (!currentCell || currentCell.isBlocked) return board.words[0];

    const wordId = direction === "across" ? currentCell.acrossWordId : currentCell.downWordId;
    if (wordId) {
      const found = board.words.find((w) => w.id === wordId);
      if (found) return found;
    }
    return (
      board.words.find((w) => w.id === currentCell.acrossWordId || w.id === currentCell.downWordId) ||
      board.words[0]
    );
  }, [board, selectedCell, direction]);

  const selectCell = useCallback(
    (row: number, col: number) => {
      const cell = board.grid[row]?.[col];
      if (!cell || cell.isBlocked) return;

      if (selectedCell.row === row && selectedCell.col === col) {
        // Toggle direction if cell has both across and down words
        if (cell.acrossWordId && cell.downWordId) {
          setDirection((prev) => (prev === "across" ? "down" : "across"));
        }
      } else {
        setSelectedCell({ row, col });
        if (direction === "across" && !cell.acrossWordId && cell.downWordId) {
          setDirection("down");
        } else if (direction === "down" && !cell.downWordId && cell.acrossWordId) {
          setDirection("across");
        }
      }
    },
    [board.grid, selectedCell, direction]
  );

  const selectClue = useCallback(
    (wordId: string) => {
      const word = board.words.find((w) => w.id === wordId);
      if (word) {
        setSelectedCell({ row: word.startRow, col: word.startCol });
        setDirection(word.direction);
      }
    },
    [board.words]
  );

  const toggleDirection = useCallback(() => {
    setDirection((prev) => (prev === "across" ? "down" : "across"));
  }, []);

  const typeLetter = useCallback(
    (char: string) => {
      if (isComplete) return;
      const upperChar = char.toUpperCase().slice(0, 1);
      if (!/^[A-Z]$/.test(upperChar)) return;

      const { row, col } = selectedCell;
      const currentCell = board.grid[row]?.[col];
      if (!currentCell || currentCell.isBlocked) return;

      setBoard((prev) => {
        const nextGrid = prev.grid.map((r) => r.map((c) => ({ ...c })));
        nextGrid[row][col].userChar = upperChar;
        return { ...prev, grid: nextGrid };
      });

      // Advance cursor in current direction
      const nextRow = direction === "down" ? row + 1 : row;
      const nextCol = direction === "across" ? col + 1 : col;

      if (
        nextRow < board.rows &&
        nextCol < board.cols &&
        !board.grid[nextRow][nextCol].isBlocked
      ) {
        setSelectedCell({ row: nextRow, col: nextCol });
      }
    },
    [board, selectedCell, direction, isComplete]
  );

  const handleBackspace = useCallback(() => {
    if (isComplete) return;
    const { row, col } = selectedCell;
    const currentCell = board.grid[row]?.[col];
    if (!currentCell || currentCell.isBlocked) return;

    if (currentCell.userChar !== "") {
      setBoard((prev) => {
        const nextGrid = prev.grid.map((r) => r.map((c) => ({ ...c })));
        nextGrid[row][col].userChar = "";
        return { ...prev, grid: nextGrid };
      });
    } else {
      // Step back
      const prevRow = direction === "down" ? row - 1 : row;
      const prevCol = direction === "across" ? col - 1 : col;

      if (
        prevRow >= 0 &&
        prevCol >= 0 &&
        !board.grid[prevRow][prevCol].isBlocked
      ) {
        setSelectedCell({ row: prevRow, col: prevCol });
        setBoard((prev) => {
          const nextGrid = prev.grid.map((r) => r.map((c) => ({ ...c })));
          nextGrid[prevRow][prevCol].userChar = "";
          return { ...prev, grid: nextGrid };
        });
      }
    }
  }, [board, selectedCell, direction, isComplete]);

  const moveCursor = useCallback(
    (deltaRow: number, deltaCol: number) => {
      let r = selectedCell.row + deltaRow;
      let c = selectedCell.col + deltaCol;
      while (r >= 0 && r < board.rows && c >= 0 && c < board.cols) {
        if (!board.grid[r][c].isBlocked) {
          setSelectedCell({ row: r, col: c });
          break;
        }
        r += deltaRow;
        c += deltaCol;
      }
    },
    [board, selectedCell]
  );

  const revealLetter = useCallback(() => {
    const { row, col } = selectedCell;
    const cell = board.grid[row]?.[col];
    if (!cell || cell.isBlocked || cell.isRevealed) return;

    setBoard((prev) => {
      const nextGrid = prev.grid.map((r) => r.map((c) => ({ ...c })));
      nextGrid[row][col].userChar = cell.char;
      nextGrid[row][col].isRevealed = true;
      return { ...prev, grid: nextGrid };
    });

    setHintsUsed((prev) => prev + 1);
    setScore((prev) => prev - 10);
  }, [board.grid, selectedCell]);

  const revealWord = useCallback(() => {
    if (!activeWord) return;

    setBoard((prev) => {
      const nextGrid = prev.grid.map((r) => r.map((c) => ({ ...c })));
      for (let i = 0; i < activeWord.word.length; i++) {
        const r = activeWord.direction === "across" ? activeWord.startRow : activeWord.startRow + i;
        const c = activeWord.direction === "across" ? activeWord.startCol + i : activeWord.startCol;
        nextGrid[r][c].userChar = activeWord.word[i];
        nextGrid[r][c].isRevealed = true;
      }
      return { ...prev, grid: nextGrid };
    });

    setWordsRevealed((prev) => prev + 1);
    setScore((prev) => prev - 30);
  }, [activeWord]);

  const loadNewPuzzle = useCallback((newTopicId?: string) => {
    const targetTopic = newTopicId || topicId;
    if (newTopicId) setTopicId(newTopicId);
    const newBoard = generateCrosswordBoard(targetTopic);
    setBoard(newBoard);
    const firstWord = newBoard.words[0];
    setSelectedCell({ row: firstWord.startRow, col: firstWord.startCol });
    setDirection("across");
    setScore(0);
    setHintsUsed(0);
    setWordsRevealed(0);
    setIsComplete(false);
    setElapsedSeconds(0);
  }, [topicId]);

  // Check completion
  useEffect(() => {
    let allFilledAndCorrect = true;
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        const cell = board.grid[r][c];
        if (!cell.isBlocked) {
          if (cell.userChar !== cell.char) {
            allFilledAndCorrect = false;
            break;
          }
        }
      }
      if (!allFilledAndCorrect) break;
    }

    if (allFilledAndCorrect && !isComplete) {
      setIsComplete(true);
      setScore((prev) => prev + board.words.length * 100);
    }
  }, [board, isComplete]);

  // Timer
  useEffect(() => {
    if (!isComplete) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isComplete]);

  return {
    topicId,
    board,
    selectedCell,
    direction,
    activeWord,
    score,
    hintsUsed,
    wordsRevealed,
    isComplete,
    elapsedSeconds,
    typeLetter,
    handleBackspace,
    moveCursor,
    toggleDirection,
    selectCell,
    selectClue,
    revealLetter,
    revealWord,
    loadNewPuzzle,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/crossword/useCrosswordEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCrosswordEngine.ts tests/unit/crossword/useCrosswordEngine.test.ts
git commit -m "feat(crossword): implement useCrosswordEngine state machine and interaction hook"
```

---

### Task 3: Crossword Grid & Cell Components

**Files:**
- Create: `src/components/game/crossword/CrosswordCellItem.tsx`
- Create: `src/components/game/crossword/CrosswordGrid.tsx`
- Test: `tests/components/crossword/CrosswordGrid.test.tsx`

**Interfaces:**
- Consumes:
  - `CrosswordCell`, `CrosswordWord`, `Direction` from `src/types/crossword.ts`
- Produces:
  - `<CrosswordCellItem />`
  - `<CrosswordGrid />` rendering responsive matrix of interactive cells.

- [ ] **Step 1: Write the failing test for CrosswordGrid**

```typescript
// tests/components/crossword/CrosswordGrid.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CrosswordGrid } from "@/components/game/crossword/CrosswordGrid";
import { generateCrosswordBoard } from "@/lib/crossword/crossword-generator";

describe("CrosswordGrid Component", () => {
  const board = generateCrosswordBoard("animals", 5);

  it("renders crossword matrix with correct grid size and cell elements", () => {
    render(
      <CrosswordGrid
        board={board}
        selectedCell={{ row: board.words[0].startRow, col: board.words[0].startCol }}
        direction="across"
        activeWord={board.words[0]}
        onSelectCell={vi.fn()}
      />
    );

    const interactiveCells = screen.getAllByRole("button");
    expect(interactiveCells.length).toBeGreaterThanOrEqual(10);
  });

  it("calls onSelectCell when an unblocked cell is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <CrosswordGrid
        board={board}
        selectedCell={{ row: 0, col: 0 }}
        direction="across"
        activeWord={board.words[0]}
        onSelectCell={handleSelect}
      />
    );

    const firstWordCell = screen.getByTestId(
      `cell-${board.words[0].startRow}-${board.words[0].startCol}`
    );
    fireEvent.click(firstWordCell);
    expect(handleSelect).toHaveBeenCalledWith(
      board.words[0].startRow,
      board.words[0].startCol
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/crossword/CrosswordGrid.test.tsx`
Expected: FAIL with Cannot find module `@/components/game/crossword/CrosswordGrid`

- [ ] **Step 3: Implement CrosswordCellItem & CrosswordGrid**

Create `src/components/game/crossword/CrosswordCellItem.tsx`:
```tsx
"use client";

import React from "react";
import { CrosswordCell } from "@/types/crossword";

interface CrosswordCellItemProps {
  cell: CrosswordCell;
  isSelected: boolean;
  isInActiveWord: boolean;
  onSelect: () => void;
}

export const CrosswordCellItem: React.FC<CrosswordCellItemProps> = ({
  cell,
  isSelected,
  isInActiveWord,
  onSelect,
}) => {
  if (cell.isBlocked) {
    return <div className="w-full aspect-square bg-slate-950/80 rounded-lg border border-slate-900" />;
  }

  const isRevealed = cell.isRevealed;

  return (
    <button
      type="button"
      data-testid={`cell-${cell.row}-${cell.col}`}
      onClick={onSelect}
      className={`relative w-full aspect-square flex items-center justify-center font-black text-lg md:text-xl rounded-lg border transition-all cursor-pointer select-none ${
        isSelected
          ? "bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30 scale-105 z-10"
          : isInActiveWord
          ? "bg-indigo-600/30 text-white border-indigo-500/60"
          : "bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500"
      }`}
    >
      {cell.clueNumber && (
        <span className="absolute top-0.5 left-1 text-[11px] font-mono font-bold leading-none text-slate-400">
          {cell.clueNumber}
        </span>
      )}
      <span className={isRevealed ? "text-amber-300" : ""}>{cell.userChar}</span>
    </button>
  );
};
```

Create `src/components/game/crossword/CrosswordGrid.tsx`:
```tsx
"use client";

import React from "react";
import { CrosswordBoard, CrosswordWord, Direction } from "@/types/crossword";
import { CrosswordCellItem } from "./CrosswordCellItem";

interface CrosswordGridProps {
  board: CrosswordBoard;
  selectedCell: { row: number; col: number };
  direction: Direction;
  activeWord: CrosswordWord | null;
  onSelectCell: (row: number, col: number) => void;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  board,
  selectedCell,
  direction,
  activeWord,
  onSelectCell,
}) => {
  const isCellInActiveWord = (r: number, c: number) => {
    if (!activeWord) return false;
    if (activeWord.direction === "across") {
      return (
        r === activeWord.startRow &&
        c >= activeWord.startCol &&
        c < activeWord.startCol + activeWord.word.length
      );
    }
    return (
      c === activeWord.startCol &&
      r >= activeWord.startRow &&
      r < activeWord.startRow + activeWord.word.length
    );
  };

  return (
    <div className="w-full max-w-lg aspect-square bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-3 md:p-4 shadow-2xl flex flex-col justify-center">
      <div
        className="grid gap-1.5 w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${board.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${board.rows}, minmax(0, 1fr))`,
        }}
      >
        {board.grid.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <CrosswordCellItem
              key={`${rIdx}-${cIdx}`}
              cell={cell}
              isSelected={selectedCell.row === rIdx && selectedCell.col === cIdx}
              isInActiveWord={isCellInActiveWord(rIdx, cIdx)}
              onSelect={() => onSelectCell(rIdx, cIdx)}
            />
          ))
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/crossword/CrosswordGrid.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/game/crossword/CrosswordCellItem.tsx src/components/game/crossword/CrosswordGrid.tsx tests/components/crossword/CrosswordGrid.test.tsx
git commit -m "feat(crossword): implement CrosswordGrid and CrosswordCellItem components"
```

---

### Task 4: Clue Panel, Hint Bar & Virtual Keyboard

**Files:**
- Create: `src/components/game/crossword/ClueItem.tsx`
- Create: `src/components/game/crossword/CluePanel.tsx`
- Create: `src/components/game/crossword/HintBar.tsx`
- Create: `src/components/game/crossword/VirtualKeyboard.tsx`
- Test: `tests/components/crossword/CluePanel.test.tsx`
- Test: `tests/components/crossword/VirtualKeyboard.test.tsx`

**Interfaces:**
- Consumes:
  - `CrosswordWord` from `src/types/crossword.ts`
  - `useSpeech` from `@/hooks/useSpeech`
- Produces:
  - `<CluePanel />`
  - `<HintBar />`
  - `<VirtualKeyboard />`

- [ ] **Step 1: Write failing tests for CluePanel and VirtualKeyboard**

```typescript
// tests/components/crossword/CluePanel.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CluePanel } from "@/components/game/crossword/CluePanel";
import { CrosswordWord } from "@/types/crossword";

const mockWords: CrosswordWord[] = [
  {
    id: "tiger",
    word: "TIGER",
    clue: "Con hổ dũng mãnh",
    direction: "across",
    startRow: 0,
    startCol: 0,
    number: 1,
    isSolved: false,
    isRevealed: false,
  },
  {
    id: "rabbit",
    word: "RABBIT",
    clue: "Con thỏ trắng",
    direction: "down",
    startRow: 0,
    startCol: 4,
    number: 2,
    isSolved: false,
    isRevealed: false,
  },
];

describe("CluePanel Component", () => {
  it("renders Across and Down clue sections", () => {
    render(
      <CluePanel
        words={mockWords}
        activeWordId="tiger"
        onSelectWord={vi.fn()}
      />
    );

    expect(screen.getByText(/Hàng ngang/i)).toBeInTheDocument();
    expect(screen.getByText(/Hàng dọc/i)).toBeInTheDocument();
    expect(screen.getByText("Con hổ dũng mãnh")).toBeInTheDocument();
    expect(screen.getByText("Con thỏ trắng")).toBeInTheDocument();
  });

  it("triggers onSelectWord when clicking a clue item", () => {
    const handleSelect = vi.fn();
    render(
      <CluePanel
        words={mockWords}
        activeWordId="tiger"
        onSelectWord={handleSelect}
      />
    );

    fireEvent.click(screen.getByText("Con thỏ trắng"));
    expect(handleSelect).toHaveBeenCalledWith("rabbit");
  });
});
```

```typescript
// tests/components/crossword/VirtualKeyboard.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VirtualKeyboard } from "@/components/game/crossword/VirtualKeyboard";

describe("VirtualKeyboard Component", () => {
  it("renders keys and dispatches onKeyPress", () => {
    const handleKeyPress = vi.fn();
    const handleBackspace = vi.fn();
    const handleToggle = vi.fn();

    render(
      <VirtualKeyboard
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onToggleDirection={handleToggle}
        direction="across"
      />
    );

    const keyA = screen.getByRole("button", { name: "A" });
    fireEvent.click(keyA);
    expect(handleKeyPress).toHaveBeenCalledWith("A");

    const backspace = screen.getByRole("button", { name: /Xóa/i });
    fireEvent.click(backspace);
    expect(handleBackspace).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/components/crossword/CluePanel.test.tsx tests/components/crossword/VirtualKeyboard.test.tsx`
Expected: FAIL with Cannot find modules

- [ ] **Step 3: Implement ClueItem, CluePanel, HintBar, VirtualKeyboard**

Create `src/components/game/crossword/ClueItem.tsx`:
```tsx
"use client";

import React from "react";
import { CrosswordWord } from "@/types/crossword";
import { useSpeech } from "@/hooks/useSpeech";
import { Volume2 } from "lucide-react";

interface ClueItemProps {
  word: CrosswordWord;
  isActive: boolean;
  onSelect: () => void;
}

export const ClueItem: React.FC<ClueItemProps> = ({ word, isActive, onSelect }) => {
  const { speak } = useSpeech({ rate: 0.9, lang: "en-US" });

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(word.word);
  };

  return (
    <div
      onClick={onSelect}
      className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
        isActive
          ? "bg-amber-500/20 border-amber-500/50 text-white shadow-md shadow-amber-500/10"
          : "bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center font-mono font-bold text-xs text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
          {word.number}
        </span>
        <div className="text-xs md:text-sm font-medium">
          <span>{word.clue}</span>
          <span className="text-xs text-slate-400 ml-1.5 font-mono">({word.word.length} chữ cái)</span>
        </div>
      </div>

      <button
        type="button"
        aria-label={`Phát âm từ số ${word.number}`}
        onClick={handleSpeak}
        className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <Volume2 className="w-4 h-4" />
      </button>
    </div>
  );
};
```

Create `src/components/game/crossword/CluePanel.tsx`:
```tsx
"use client";

import React from "react";
import { CrosswordWord } from "@/types/crossword";
import { ClueItem } from "./ClueItem";
import { ArrowRight, ArrowDown } from "lucide-react";

interface CluePanelProps {
  words: CrosswordWord[];
  activeWordId: string;
  onSelectWord: (wordId: string) => void;
}

export const CluePanel: React.FC<CluePanelProps> = ({
  words,
  activeWordId,
  onSelectWord,
}) => {
  const acrossWords = words.filter((w) => w.direction === "across");
  const downWords = words.filter((w) => w.direction === "down");

  return (
    <div className="w-full flex flex-col gap-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-5 shadow-2xl max-h-[500px] overflow-y-auto">
      {/* Across */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5">
          <ArrowRight className="w-4 h-4" /> Hàng ngang (Across)
        </div>
        <div className="space-y-2">
          {acrossWords.map((word) => (
            <ClueItem
              key={word.id}
              word={word}
              isActive={activeWordId === word.id}
              onSelect={() => onSelectWord(word.id)}
            />
          ))}
        </div>
      </div>

      {/* Down */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-2.5">
          <ArrowDown className="w-4 h-4" /> Hàng dọc (Down)
        </div>
        <div className="space-y-2">
          {downWords.map((word) => (
            <ClueItem
              key={word.id}
              word={word}
              isActive={activeWordId === word.id}
              onSelect={() => onSelectWord(word.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

Create `src/components/game/crossword/HintBar.tsx`:
```tsx
"use client";

import React from "react";
import { Lightbulb, BookOpen, Volume2 } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";

interface HintBarProps {
  activeWord: { word: string } | null;
  onRevealLetter: () => void;
  onRevealWord: () => void;
  disabled: boolean;
}

export const HintBar: React.FC<HintBarProps> = ({
  activeWord,
  onRevealLetter,
  onRevealWord,
  disabled,
}) => {
  const { speak } = useSpeech({ rate: 0.9, lang: "en-US" });

  const handleSpeak = () => {
    if (activeWord) speak(activeWord.word);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
      <button
        type="button"
        disabled={disabled || !activeWord}
        onClick={handleSpeak}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
      >
        <Volume2 className="w-3.5 h-3.5" /> Nghe Từ (Miễn phí)
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={onRevealLetter}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
      >
        <Lightbulb className="w-3.5 h-3.5" /> Gợi ý 1 chữ (-10đ)
      </button>

      <button
        type="button"
        disabled={disabled || !activeWord}
        onClick={onRevealWord}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
      >
        <BookOpen className="w-3.5 h-3.5" /> Mở cả từ (-30đ)
      </button>
    </div>
  );
};
```

Create `src/components/game/crossword/VirtualKeyboard.tsx`:
```tsx
"use client";

import React from "react";
import { Direction } from "@/types/crossword";
import { Delete, RotateCcw } from "lucide-react";

interface VirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onToggleDirection: () => void;
  direction: Direction;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onToggleDirection,
  direction,
}) => {
  return (
    <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-3 shadow-xl flex flex-col gap-1.5 select-none">
      {KEYBOARD_ROWS.map((row, rIdx) => (
        <div key={rIdx} className="flex justify-center gap-1 md:gap-1.5">
          {rIdx === 2 && (
            <button
              type="button"
              onClick={onToggleDirection}
              className="px-2.5 py-3 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1 border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> {direction === "across" ? "Ngang" : "Dọc"}
            </button>
          )}

          {row.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => onKeyPress(char)}
              className="w-8 md:w-10 h-10 md:h-12 rounded-lg bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 font-bold text-sm md:text-base flex items-center justify-center border border-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              {char}
            </button>
          ))}

          {rIdx === 2 && (
            <button
              type="button"
              aria-label="Xóa ký tự"
              onClick={onBackspace}
              className="px-3 py-3 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white font-bold flex items-center justify-center border border-rose-500/40 transition-colors cursor-pointer"
            >
              <Delete className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/crossword/CluePanel.test.tsx tests/components/crossword/VirtualKeyboard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/game/crossword/ClueItem.tsx src/components/game/crossword/CluePanel.tsx src/components/game/crossword/HintBar.tsx src/components/game/crossword/VirtualKeyboard.tsx tests/components/crossword/
git commit -m "feat(crossword): add CluePanel, HintBar, and VirtualKeyboard components"
```

---

### Task 5: Post-Puzzle Summary & Completion Modal

**Files:**
- Create: `src/components/game/crossword/CrosswordCompletionModal.tsx`
- Test: `tests/components/crossword/CrosswordCompletionModal.test.tsx`

**Interfaces:**
- Produces:
  - `<CrosswordCompletionModal />` displaying stars, points, elapsed time, and next puzzle actions.

- [ ] **Step 1: Write the failing test for completion modal**

```typescript
// tests/components/crossword/CrosswordCompletionModal.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CrosswordCompletionModal } from "@/components/game/crossword/CrosswordCompletionModal";

describe("CrosswordCompletionModal Component", () => {
  it("renders victory heading, score, and next puzzle button", () => {
    const handleNext = vi.fn();
    render(
      <CrosswordCompletionModal
        isOpen={true}
        score={500}
        stars={3}
        elapsedSeconds={85}
        hintsUsed={0}
        onNextPuzzle={handleNext}
      />
    );

    expect(screen.getByText("HOÀN THÀNH Ô CHỮ!")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
    const nextBtn = screen.getByRole("button", { name: /Lưới Tiếp Theo/i });
    fireEvent.click(nextBtn);
    expect(handleNext).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/crossword/CrosswordCompletionModal.test.tsx`
Expected: FAIL with Cannot find module `@/components/game/crossword/CrosswordCompletionModal`

- [ ] **Step 3: Implement CrosswordCompletionModal**

Create `src/components/game/crossword/CrosswordCompletionModal.tsx`:
```tsx
"use client";

import React from "react";
import { Trophy, Star, RotateCcw, Clock } from "lucide-react";

interface CrosswordCompletionModalProps {
  isOpen: boolean;
  score: number;
  stars: number;
  elapsedSeconds: number;
  hintsUsed: number;
  onNextPuzzle: () => void;
}

export const CrosswordCompletionModal: React.FC<CrosswordCompletionModalProps> = ({
  isOpen,
  score,
  stars,
  elapsedSeconds,
  hintsUsed,
  onNextPuzzle,
}) => {
  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crossword-modal-title"
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20 mb-4">
          <Trophy className="w-10 h-10" />
        </div>

        <h2 id="crossword-modal-title" className="text-2xl md:text-3xl font-black text-white">
          HOÀN THÀNH Ô CHỮ!
        </h2>
        <p className="text-slate-400 text-sm mt-1">Xuất sắc! Bạn đã giải thành công tất cả các từ.</p>

        {/* Stars */}
        <div className="flex items-center gap-2 my-4">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-8 h-8 ${
                starIdx <= stars
                  ? "text-amber-400 fill-amber-400 filter drop-shadow-md"
                  : "text-slate-700 fill-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 w-full my-4">
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 font-bold block">Tổng Điểm</span>
            <span className="text-xl font-black text-white">{score}</span>
          </div>
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 font-bold block flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" /> Thời gian
            </span>
            <span className="text-xl font-black text-sky-400 font-mono">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onNextPuzzle}
          className="mt-4 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold flex items-center justify-center gap-2 text-sm shadow-xl shadow-amber-500/20 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Lưới Tiếp Theo
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/crossword/CrosswordCompletionModal.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/game/crossword/CrosswordCompletionModal.tsx tests/components/crossword/CrosswordCompletionModal.test.tsx
git commit -m "feat(crossword): add CrosswordCompletionModal with star rating and next puzzle trigger"
```

---

### Task 6: Route Assembly, Hub Registration & Playwright E2E

**Files:**
- Create: `src/app/games/crossword/page.tsx`
- Modify: `src/data/games.json`
- Create: `tests/e2e/crossword.spec.ts`

**Interfaces:**
- Consumes:
  - All crossword components
  - `useCrosswordEngine` hook
  - `useGameTracking` hook
- Produces:
  - Next.js route at `/games/crossword`
  - Catalog entry with priority 11 in `src/data/games.json`

- [ ] **Step 1: Write E2E test**

```typescript
// tests/e2e/crossword.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Crossword Master E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "gamehub_student_session",
        JSON.stringify({
          classCode: "TEST99",
          studentName: "Alex",
          studentId: "student-alex",
        })
      );
    });
  });

  test("loads crossword page, renders grid and clue panel, and accepts typing", async ({ page }) => {
    await page.goto("/games/crossword");
    await expect(page.getByText(/Hàng ngang/i)).toBeVisible();
    await expect(page.getByText(/Hàng dọc/i)).toBeVisible();

    // Type a letter on keyboard
    await page.keyboard.press("T");
  });
});
```

- [ ] **Step 2: Create page component**

Create `src/app/games/crossword/page.tsx`:
```tsx
"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useCrosswordEngine } from "@/hooks/useCrosswordEngine";
import { useGameTracking } from "@/hooks/use-game-tracking";
import { CrosswordGrid } from "@/components/game/crossword/CrosswordGrid";
import { CluePanel } from "@/components/game/crossword/CluePanel";
import { HintBar } from "@/components/game/crossword/HintBar";
import { VirtualKeyboard } from "@/components/game/crossword/VirtualKeyboard";
import { CrosswordCompletionModal } from "@/components/game/crossword/CrosswordCompletionModal";

const TOPICS = [
  { id: "animals", name: "🐾 Động vật (Animals)" },
  { id: "fruits", name: "🍎 Trái cây (Fruits)" },
  { id: "school", name: "🎒 Trường học (School)" },
];

export default function CrosswordPage() {
  const {
    topicId,
    board,
    selectedCell,
    direction,
    activeWord,
    score,
    hintsUsed,
    isComplete,
    elapsedSeconds,
    typeLetter,
    handleBackspace,
    toggleDirection,
    selectCell,
    selectClue,
    revealLetter,
    revealWord,
    loadNewPuzzle,
  } = useCrosswordEngine();

  const { submitSession, resetSession } = useGameTracking({
    gameType: "crossword",
  });
  const sessionSubmittedRef = useRef(false);

  // Keyboard navigation on physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return;
      if (/^[a-zA-Z]$/.test(e.key)) {
        typeLetter(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === " ") {
        e.preventDefault();
        toggleDirection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [typeLetter, handleBackspace, toggleDirection, isComplete]);

  // Submit session on completion
  useEffect(() => {
    if (isComplete && !sessionSubmittedRef.current) {
      sessionSubmittedRef.current = true;
      submitSession({
        score,
        totalQuestions: board.words.length,
      }).catch((err) => console.error("Failed to submit crossword session:", err));

      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("gamehub_crossword_progress");
          const history = stored ? JSON.parse(stored) : [];
          history.push({
            date: new Date().toISOString(),
            score,
            topicId,
            elapsedSeconds,
            wordsCount: board.words.length,
          });
          localStorage.setItem("gamehub_crossword_progress", JSON.stringify(history.slice(-20)));
        }
      } catch (err) {
        console.error("Failed to save crossword progress:", err);
      }
    } else if (!isComplete) {
      sessionSubmittedRef.current = false;
    }
  }, [isComplete, score, board.words.length, topicId, elapsedSeconds, submitSession]);

  const handleNextPuzzle = () => {
    resetSession();
    loadNewPuzzle();
  };

  const calculatedStars = hintsUsed === 0 ? 3 : hintsUsed <= 2 ? 2 : 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> GameHub
        </Link>

        {/* Topic Selector */}
        <select
          value={topicId}
          onChange={(e) => loadNewPuzzle(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs md:text-sm font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-amber-500"
        >
          {TOPICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono font-bold text-slate-300">
            ⏱️ {Math.floor(elapsedSeconds / 60).toString().padStart(2, "0")}:
            {(elapsedSeconds % 60).toString().padStart(2, "0")}
          </div>

          <div className="bg-amber-500/20 px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-xs font-black text-amber-400">
            ⭐ {score} ĐIỂM
          </div>

          <button
            type="button"
            onClick={() => loadNewPuzzle()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
            title="Tạo đề ô chữ mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
        {/* Left Column: Grid + Hints + Virtual Keyboard */}
        <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
          <CrosswordGrid
            board={board}
            selectedCell={selectedCell}
            direction={direction}
            activeWord={activeWord}
            onSelectCell={selectCell}
          />

          <HintBar
            activeWord={activeWord}
            onRevealLetter={revealLetter}
            onRevealWord={revealWord}
            disabled={isComplete}
          />

          <VirtualKeyboard
            onKeyPress={typeLetter}
            onBackspace={handleBackspace}
            onToggleDirection={toggleDirection}
            direction={direction}
          />
        </div>

        {/* Right Column: Clue Panel */}
        <div className="w-full lg:flex-1">
          <CluePanel
            words={board.words}
            activeWordId={activeWord?.id || ""}
            onSelectWord={selectClue}
          />
        </div>
      </main>

      {/* Completion Modal */}
      <CrosswordCompletionModal
        isOpen={isComplete}
        score={score}
        stars={calculatedStars}
        elapsedSeconds={elapsedSeconds}
        hintsUsed={hintsUsed}
        onNextPuzzle={handleNextPuzzle}
      />
    </div>
  );
}
```

- [ ] **Step 3: Register in `src/data/games.json`**

Append entry to `src/data/games.json` with `priority: 11`:
```json
  {
    "id": "crossword",
    "slug": "crossword",
    "titleVi": "Giải đố Ô chữ",
    "titleEn": "Crossword Master",
    "description": "Giải đố các ô chữ tiếng Anh đan xen theo chủ đề với gợi ý ngữ cảnh và phát âm audio",
    "emoji": "🧩",
    "route": "/games/crossword",
    "priority": 11
  }
```

- [ ] **Step 4: Run full test suite & TypeScript verification**

Run: `npm run test:run`
Run: `npx tsc --noEmit`
Expected: 100% tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/games/crossword/page.tsx src/data/games.json tests/e2e/crossword.spec.ts tests/data/games.test.ts
git commit -m "feat(crossword): assemble crossword page route and register in GameHub catalog"
```
