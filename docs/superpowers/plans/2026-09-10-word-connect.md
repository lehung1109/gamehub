# Word Connect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and integrate Word Connect (Vòng Xoay Nối Chữ), an educational English anagram and vocabulary connecting game featuring interactive letter wheels (drag/click), crossword word slot grids, bonus word jar, 1-click shuffle, hints, and full GameHub platform tracking.

**Architecture:** A decoupled structure featuring a pure validation/anagram evaluator (`engine.ts`), a level curriculum repository (`levels.json`), a custom React state engine (`useWordConnectGame`), responsive interactive letter wheel with SVG line connection, slot rows, sound synthesizer, and platform integration with `useGameTracking`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React, Web Speech API (TTS), Web Audio API, Vitest & React Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-10-word-connect-design.md`

## Global Constraints

- File locations: `src/app/games/word-connect/` and `src/data/word-connect/`.
- No external dictionary APIs at runtime (offline-ready, zero latency).
- Touch target minimum 44px for buttons and wheel letters.
- Accessible ARIA labels and clean dark/light mode compatibility.
- Integration with GameHub `useGameTracking`.

---

### Task 1: Word Connect Types & Pure Engine Validation Logic

**Files:**
- Create: `src/types/word-connect.ts`
- Create: `src/lib/word-connect/engine.ts`
- Test: `tests/unit/word-connect/engine.test.ts`

**Interfaces:**
- Consumes: None
- Produces:
  - Types: `WordConnectWordInfo`, `WordConnectLevel`, `WordConnectSubmissionResult`
  - Functions: `checkWordSubmission`, `revealRandomHintLetter`, `shuffleLetters`

- [ ] **Step 1: Write failing test for engine logic**

Create `tests/unit/word-connect/engine.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import {
  checkWordSubmission,
  revealRandomHintLetter,
  shuffleLetters,
} from "@/lib/word-connect/engine";
import { WordConnectLevel } from "@/types/word-connect";

const MOCK_LEVEL: WordConnectLevel = {
  id: "level-1",
  levelNumber: 1,
  letters: ["A", "C", "T", "S"],
  targetWords: [
    {
      word: "CAT",
      vietnameseMeaning: "Con mèo",
      phonetic: "/kæt/",
      partOfSpeech: "noun",
      exampleSentence: "A cute cat.",
    },
    {
      word: "ACT",
      vietnameseMeaning: "Hành động / Diễn xuất",
      phonetic: "/ækt/",
      partOfSpeech: "verb",
      exampleSentence: "Act quickly.",
    },
    {
      word: "CATS",
      vietnameseMeaning: "Những con mèo",
      phonetic: "/kæts/",
      partOfSpeech: "noun",
      exampleSentence: "Two cats playing.",
    },
  ],
  bonusWords: ["CAST", "SAT"],
  difficulty: "easy",
};

describe("Word Connect Engine", () => {
  it("validates a correct target word that hasn't been solved yet", () => {
    const result = checkWordSubmission("CAT", MOCK_LEVEL, []);
    expect(result.type).toBe("target");
    expect(result.word).toBe("CAT");
  });

  it("detects when a word has already been solved", () => {
    const result = checkWordSubmission("CAT", MOCK_LEVEL, ["CAT"]);
    expect(result.type).toBe("already_solved");
  });

  it("detects valid bonus words not in the main grid", () => {
    const result = checkWordSubmission("CAST", MOCK_LEVEL, ["CAT"], []);
    expect(result.type).toBe("bonus");
    expect(result.word).toBe("CAST");
  });

  it("detects when a bonus word was already found", () => {
    const result = checkWordSubmission("CAST", MOCK_LEVEL, ["CAT"], ["CAST"]);
    expect(result.type).toBe("already_solved_bonus");
  });

  it("rejects invalid words not matching target or bonus", () => {
    const result = checkWordSubmission("XYZ", MOCK_LEVEL, []);
    expect(result.type).toBe("invalid");
  });

  it("reveals a random unrevealed letter index for an unsolved target word", () => {
    const revealedMap = { CAT: [0] }; // 'C' already revealed
    const hint = revealRandomHintLetter(MOCK_LEVEL.targetWords, ["ACT", "CATS"], revealedMap);
    expect(hint).not.toBeNull();
    expect(hint?.word).toBe("CAT");
    expect([1, 2]).toContain(hint?.letterIndex);
  });

  it("shuffles letters while preserving the same multiset of characters", () => {
    const letters = ["A", "C", "T", "S"];
    const shuffled = shuffleLetters(letters);
    expect(shuffled.length).toBe(letters.length);
    expect([...shuffled].sort()).toEqual([...letters].sort());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/word-connect/engine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement types and engine**
Create `src/types/word-connect.ts` and `src/lib/word-connect/engine.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/word-connect/engine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/types/word-connect.ts src/lib/word-connect/engine.ts tests/unit/word-connect/engine.test.ts
git commit -m "feat(word-connect): add types and validation engine logic"
```

---

### Task 2: Curriculum Level Data & Levels Repository

**Files:**
- Create: `src/data/word-connect/levels.json`
- Create: `src/data/word-connect/levels.ts`
- Test: `tests/unit/word-connect/levels-data.test.ts`

**Interfaces:**
- Consumes: `src/types/word-connect.ts`
- Produces: `WORD_CONNECT_LEVELS: WordConnectLevel[]`, `getLevelByIndex(index: number): WordConnectLevel`

- [ ] **Step 1: Write test for levels curriculum**
Create `tests/unit/word-connect/levels-data.test.ts`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/word-connect/levels-data.test.ts`

- [ ] **Step 3: Create levels.json with 20 progressive levels and helper levels.ts**
Lengths 3 to 6 letters, progressive difficulty, bilingual definitions.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/word-connect/levels-data.test.ts`

- [ ] **Step 5: Commit**
```bash
git add src/data/word-connect/ tests/unit/word-connect/levels-data.test.ts
git commit -m "feat(word-connect): add curriculum level bank and helper functions"
```

---

### Task 3: Game Engine Hook (`useWordConnectGame`)

**Files:**
- Create: `src/hooks/use-word-connect-game.ts`
- Test: `tests/unit/word-connect/use-word-connect-game.test.ts`

**Interfaces:**
- Consumes: `checkWordSubmission`, `revealRandomHintLetter`, `shuffleLetters`, `WORD_CONNECT_LEVELS`
- Produces: `useWordConnectGame` hook

- [ ] **Step 1: Write hook unit test**
Create `tests/unit/word-connect/use-word-connect-game.test.ts`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/word-connect/use-word-connect-game.test.ts`

- [ ] **Step 3: Implement hook**
State: `selectedIndices`, `currentInput`, `solvedWords`, `foundBonusWords`, `revealedHints`, `score`, `isCompleted`.
Actions: `selectLetter(index)`, `removeLastLetter()`, `clearSelection()`, `submitWord()`, `shuffle()`, `useHint()`, `nextLevel()`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/word-connect/use-word-connect-game.test.ts`

- [ ] **Step 5: Commit**
```bash
git add src/hooks/use-word-connect-game.ts tests/unit/word-connect/use-word-connect-game.test.ts
git commit -m "feat(word-connect): implement useWordConnectGame state hook"
```

---

### Task 4: Letter Wheel, SVG Connectors & Word Slots Components

**Files:**
- Create: `src/app/games/word-connect/components/LetterWheel.tsx`
- Create: `src/app/games/word-connect/components/WordSlotsBoard.tsx`
- Create: `src/app/games/word-connect/components/WordSlotRow.tsx`
- Create: `src/app/games/word-connect/components/WordConnectControls.tsx`
- Test: `tests/components/word-connect/WordConnectUI.test.tsx`

**Interfaces:**
- Consumes: `WordConnectLevel`, `useWordConnectGame` state
- Produces: Interactive wheel and slot components

- [ ] **Step 1: Write component tests**
Create `tests/components/word-connect/WordConnectUI.test.tsx`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/components/word-connect/WordConnectUI.test.tsx`

- [ ] **Step 3: Implement components**
Interactive touch/pointer SVG drawing on LetterWheel, slot rows with revealed hints, controls for Shuffle, Hint, Clear, Backspace.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/components/word-connect/WordConnectUI.test.tsx`

- [ ] **Step 5: Commit**
```bash
git add src/app/games/word-connect/components/ tests/components/word-connect/WordConnectUI.test.tsx
git commit -m "feat(word-connect): add LetterWheel, WordSlotsBoard, and interactive controls"
```

---

### Task 5: Header, Modals, Audio Synthesis & Main Game Page

**Files:**
- Create: `src/app/games/word-connect/components/WordConnectHeader.tsx`
- Create: `src/app/games/word-connect/components/BonusWordsModal.tsx`
- Create: `src/app/games/word-connect/components/WordConnectResultDialog.tsx`
- Create: `src/app/games/word-connect/components/WordConnectGuideModal.tsx`
- Create: `src/lib/word-connect/sound.ts`
- Create: `src/app/games/word-connect/page.tsx`
- Test: `tests/app/games/word-connect/page.test.tsx`

**Interfaces:**
- Consumes: All UI components, `useWordConnectGame`, `useGameTracking`, `useSpeech`
- Produces: App Router `/games/word-connect`

- [ ] **Step 1: Write page integration test**
Create `tests/app/games/word-connect/page.test.tsx`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/app/games/word-connect/page.test.tsx`

- [ ] **Step 3: Implement page, header, dialogs, sound synthesizer**
Sound effects for letter select, word solve, bonus word, error buzz, level clear fanfare.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/app/games/word-connect/page.test.tsx`

- [ ] **Step 5: Commit**
```bash
git add src/app/games/word-connect/ src/lib/word-connect/sound.ts tests/app/games/word-connect/page.test.tsx
git commit -m "feat(word-connect): add main game page, header, modals, and sound synthesizer"
```

---

### Task 6: Platform Registration, Instructions Guide & Config Schema

**Files:**
- Modify: `src/data/games.json`
- Modify: `src/data/game-instructions.ts`
- Modify: `src/lib/game-config-schema.ts`
- Test: `tests/unit/word-connect/word-connect-integration.test.ts`

**Interfaces:**
- Consumes: Word Connect metadata
- Produces: Full platform integration verified

- [ ] **Step 1: Write integration test**
Create `tests/unit/word-connect/word-connect-integration.test.ts`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/word-connect/word-connect-integration.test.ts`

- [ ] **Step 3: Register game in games.json, game-instructions.ts, and game-config-schema.ts**

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/word-connect/word-connect-integration.test.ts`

- [ ] **Step 5: Run full test suite regression**
Run: `npm test -- --run`

- [ ] **Step 6: Commit**
```bash
git add src/data/games.json src/data/game-instructions.ts src/lib/game-config-schema.ts tests/unit/word-connect/word-connect-integration.test.ts
git commit -m "feat(word-connect): register Word Connect in games catalog, guide, and config schema"
```
