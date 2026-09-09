# Design Spec: Crossword Master: Word Puzzle

**Feature Name:** Crossword Master: Word Puzzle (Vocab Crossword)  
**Date:** 2026-09-08  
**Status:** Approved by User  
**Target Path:** `src/app/games/crossword/` & `src/components/game/crossword/`

---

## 1. Overview & Educational Objectives

### 1.1 Overview
**Crossword Master: Word Puzzle** is an interactive educational crossword puzzle mini-game in GameHub. Learners solve procedural crossword grids ($8 \times 8$ to $10 \times 10$) containing intersecting vocabulary words across chosen topics (e.g., Animals, Fruits, School, Workplace Tenses). Each word offers contextual bilingual clues (Vietnamese definition + illustration emoji + audio pronunciation via `useSpeech`).

### 1.2 Educational Objectives
- **Spelling & Letter Sequence:** Reinforce correct orthography through active letter placement.
- **Reading & Word Association:** Connect Vietnamese contextual definitions to English target vocabulary.
- **Auditory Phonics:** Hone listening comprehension via speech synthesis audio integration.
- **Deductive Reasoning:** Utilize intersecting shared letters as natural crossword hints.

---

## 2. Core Game Architecture & Data Model

### 2.1 Data Structures (`src/types/crossword.ts`)
```typescript
export type Direction = "across" | "down";

export interface CrosswordWord {
  id: string;
  word: string;             // Uppercase English word (e.g. "TIGER")
  clue: string;             // Vietnamese definition
  phonetic?: string;        // IPA notation (e.g. "/ˈtaɪ.ɡər/")
  emoji?: string;           // Optional illustration icon
  direction: Direction;     // "across" | "down"
  startRow: number;         // 0-indexed row on grid
  startCol: number;         // 0-indexed col on grid
  number: number;           // Sequential clue number (1, 2, 3...)
  isSolved: boolean;        // True when all letters match
  isRevealed: boolean;      // True if solved via full-reveal hint
}

export interface CrosswordCell {
  row: number;
  col: number;
  char: string;             // Correct uppercase letter
  userChar: string;         // User entered letter or ""
  isBlocked: boolean;       // True for black/empty cells, false for active cells
  clueNumber?: number;      // Small badge number in cell corner
  acrossWordId?: string;    // ID of across word passing through
  downWordId?: string;      // ID of down word passing through
  isRevealed?: boolean;     // True if revealed via hint
}

export interface CrosswordBoard {
  rows: number;
  cols: number;
  grid: CrosswordCell[][];
  words: CrosswordWord[];
  topicId: string;
}
```

---

## 3. Procedural Grid Generation Algorithm

### 3.1 Constraint-Based Placement Engine (`crossword-generator.ts`)
1. **Word Pool Selection:** Filter vocabulary words from selected GameHub topic (`animals`, `fruits`, `school`, etc.) with lengths between 3 and 8 characters.
2. **Seed Word Placement:** Pick a random longer word (5-8 letters) and place it horizontally (`across`) near the center of the grid.
3. **Intersecting Word Search:**
   - Iterate through candidate words in the topic pool.
   - Find letter intersections with already-placed words.
   - Validate placement:
     - Must fit within bounding box ($8 \times 8$ to $10 \times 10$).
     - Cannot collide with differing characters.
     - Cannot form illegal adjacent parallel tiles (classic crossword rule).
     - Perpendicular alignment: if intersecting word is `across`, new word must be `down`, and vice-versa.
4. **Target Count:** Continue until 4 to 6 valid intersecting words are placed.
5. **Numbering:** Traverse the board row-by-row, column-by-column to assign incremental clue numbers (`1, 2, 3...`) to the start cell of each word.

---

## 4. Input Engine & Cursor Navigation

### 4.1 Navigation Hook (`useCrosswordEngine.ts`)
- **State:**
  - `board`: Current generated `CrosswordBoard`.
  - `selectedCell`: `{ row: number, col: number }`.
  - `direction`: `'across' | 'down'`.
  - `activeWord`: The `CrosswordWord` currently focused based on `selectedCell` and `direction`.
  - `score`: Total points accumulated.
  - `hintsUsed`: Counter of single-letter hints consumed.
  - `wordsRevealed`: Counter of full words revealed.
  - `isComplete`: Boolean flag indicating full board completion.
  - `elapsedSeconds`: Timer tracking time spent on the puzzle.
- **Key Actions:**
  - `typeLetter(char: string)`: Places uppercase character in `selectedCell`, advances cursor to next cell in current word.
  - `handleBackspace()`: Clears character in current cell or moves cursor back and clears.
  - `moveCursor(deltaRow, deltaCol)`: Moves cursor using arrow keys.
  - `toggleDirection()`: Toggles between `across` and `down` if cell is an intersection.
  - `selectClue(wordId: string)`: Sets cursor to the starting cell of the word and aligns direction.
  - `revealLetter()`: Reveals correct character in `selectedCell` (-10 pts, increments `hintsUsed`).
  - `revealWord()`: Fills all remaining characters for `activeWord` (-30 pts, marks word as revealed).

---

## 5. Component Architecture & UI Layout

### 5.1 Directory Structure
```
src/
├── app/games/crossword/
│   └── page.tsx                         # Page entry point with session tracking
├── components/game/crossword/
│   ├── CrosswordHeader.tsx              # Topic picker, timer, score, reset button
│   ├── CrosswordGrid.tsx                # Responsive matrix of cells with aspect-square
│   ├── CrosswordCellItem.tsx            # Single cell with clue number, active/highlight styling
│   ├── CluePanel.tsx                    # Across & Down list with audio speak button
│   ├── HintBar.tsx                      # 3 Hint action buttons (Speak, Reveal Letter, Reveal Word)
│   ├── VirtualKeyboard.tsx              # Responsive 3-row on-screen keyboard (A-Z, Backspace, Direction)
│   └── CrosswordCompletionModal.tsx     # Victory dialog with stars, XP rewards, and next puzzle
├── hooks/
│   └── useCrosswordEngine.ts            # Core interaction, cursor, and validation engine
└── lib/crossword/
    └── crossword-generator.ts           # Procedural grid generation algorithm
```

### 5.2 Responsive Layout
- **Desktop (>= 1024px):** 2-column layout. Left column houses the `CrosswordGrid` and `HintBar`. Right column houses the `CluePanel` with Across and Down sections.
- **Mobile / Tablet (< 1024px):** Stacked vertical view. Top: grid; middle: active clue banner with speak button; bottom: `VirtualKeyboard` with large touch-friendly keys (min 44px touch target).

---

## 6. Scoring, Gamification & Data Persistence

### 6.1 Scoring Rules
- **Base Word Score:** +100 points per correctly solved word without full reveal.
- **Speed Bonus:** +100 points if completed within 120 seconds.
- **Hint Deductions:**
  - Audio Listen: Free (0 pts).
  - Reveal Letter: -10 points.
  - Reveal Word: -30 points.

### 6.2 Star Rating
- ⭐ **1 Star:** Completed board correctly.
- ⭐⭐ **2 Stars:** Score $\ge 75\%$ of max points and $\le 2$ letter hints used.
- ⭐⭐⭐ **3 Stars:** Flawless completion (0 hints and 0 reveals used).

### 6.3 Data Persistence
- **Classroom Tracking:** Integrates `useGameTracking({ gameType: 'crossword' })` to submit session metrics (score, elapsed time, total words) to Supabase `game_attempts`.
- **Offline / Anonymous Storage:** Saves recent completed puzzles and earned XP into `localStorage` (`gamehub_crossword_progress`).

---

## 7. Verification & Testing Strategy

### 7.1 Unit Tests (`Vitest`)
- `crossword-generator.test.ts`:
  - Generates valid board with 4-6 intersecting words.
  - Verifies all intersecting coordinates share identical letters.
  - Verifies clue numbers are unique and strictly ascending.
- `useCrosswordEngine.test.ts`:
  - Cursor navigation on letter input and backspace.
  - Arrow key navigation bypassing blocked cells.
  - Clue selection jumping to word start coordinate.
  - Hint deduction and completion detection.

### 7.2 Component Tests (`React Testing Library`)
- `CrosswordGrid.test.tsx`: Renders matrix, verifies clue number badges, and handles click selection.
- `VirtualKeyboard.test.tsx`: Dispatches virtual key clicks and backspace.
- `CluePanel.test.tsx`: Renders Across/Down lists, triggers audio speech via `useSpeech`.

### 7.3 Playwright E2E Tests (`tests/e2e/crossword.spec.ts`)
- Navigates to `/games/crossword`.
- Selects cell, types letters, verifies auto-cursor progression.
- Completes word and verifies completion dialog triggers.
- Runs on Desktop Chromium and Mobile Chrome viewports.
