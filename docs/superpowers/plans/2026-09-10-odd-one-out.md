# Implementation Plan: Odd One Out: Semantic Master (Truy Tìm Kẻ Lạc Loài)

## Overview
Implement Game 3 from the multi-game roadmap: Odd One Out (Truy Tìm Kẻ Lạc Loài) - an interactive vocabulary classification and semantic deduction game.

---

### Task 1: Data Types & Pure Evaluation Logic
**Files:**
- Create: src/types/odd-one-out.ts
- Create: src/lib/odd-one-out/engine.ts
- Test: 	ests/unit/odd-one-out/engine.test.ts

**Specifications:**
- src/types/odd-one-out.ts: Define SemanticWordItem, OddOneOutQuestion, OddOneOutState, OddOneOutAnswerResult.
- src/lib/odd-one-out/engine.ts:
  - checkOddOneOutAnswer(question: OddOneOutQuestion, selectedId: string): OddOneOutAnswerResult
  - calculateFiftyFiftyElimination(question: OddOneOutQuestion): string[] (returns 2 non-odd IDs to eliminate)
  - calculateQuestionScore(isCorrect: boolean, streak: number, hintsUsed: number): number
- Unit tests verifying correct/incorrect answer detection, 50/50 elimination logic, and scoring.

---

### Task 2: Curriculum Dataset & Repository
**Files:**
- Create: src/data/odd-one-out/challenges.json
- Create: src/data/odd-one-out/challenges.ts
- Test: 	ests/unit/odd-one-out/challenges-data.test.ts

**Specifications:**
- 30+ curated challenges across easy, medium, hard tiers.
- Every challenge has exactly 4 items, with exactly 1 isOdd: true and 3 isOdd: false.
- All items have word, ietnameseMeaning, phonetic, partOfSpeech, emoji.
- Helper getters: ODD_ONE_OUT_CHALLENGES, getChallengesByDifficulty, getRandomChallenges(count, difficulty).

---

### Task 3: State Machine Hook (useOddOneOutGame)
**Files:**
- Create: src/hooks/use-odd-one-out-game.ts
- Test: 	ests/unit/odd-one-out/use-odd-one-out-game.test.ts

**Specifications:**
- Hook managing question queue, active index, selected card, answer checking, 50/50 hint elimination, clue toggle, score, streak, history, and completion.
- Actions: selectCard, checkAnswer, pplyFiftyFifty, 	oggleClue, 
extQuestion, esetGame.

---

### Task 4: Interactive Cards & Grid UI Components
**Files:**
- Create: src/app/games/odd-one-out/components/SemanticWordCard.tsx
- Create: src/app/games/odd-one-out/components/WordCardGrid.tsx
- Create: src/app/games/odd-one-out/components/ExplanationBanner.tsx
- Test: 	ests/components/odd-one-out/OddOneOutUI.test.tsx

**Specifications:**
- SemanticWordCard: Visual 3D card with emoji, word, phonetic, audio button, eliminated state (greyed out), selected/correct/incorrect states. Min 44px touch targets.
- WordCardGrid: 2x2 grid layout responsive for mobile/tablet/desktop.
- ExplanationBanner: Educational explanation displaying Vietnamese & English reasons.

---

### Task 5: Header, Result Dialog, Audio Synthesizer & Main Page Route
**Files:**
- Create: src/lib/odd-one-out/sound.ts
- Create: src/app/games/odd-one-out/components/OddOneOutHeader.tsx
- Create: src/app/games/odd-one-out/components/OddOneOutResultDialog.tsx
- Create: src/app/games/odd-one-out/components/OddOneOutGuideModal.tsx
- Create: src/app/games/odd-one-out/components/index.ts
- Create: src/app/games/odd-one-out/page.tsx
- Test: 	ests/app/games/odd-one-out/page.test.tsx

**Specifications:**
- Web Audio API procedural sound synthesizer (click, correct, wrong, 50/50 whoosh, completion fanfare).
- Integration with useGameTracking and useSpeech.
- Keyboard navigation (1-4 number keys to select card, Enter to check/continue, Space for speech).

---

### Task 6: Platform Registration, Instructions Guide & Config Schema
**Files:**
- Modify: src/data/games.json (id: odd-one-out, priority: 16)
- Modify: src/data/game-instructions.ts
- Modify: src/types/config.ts
- Modify: src/lib/game-config-schema.ts
- Test: 	ests/unit/odd-one-out/odd-one-out-integration.test.ts
- Full regression verification across repository (
pm test -- --run and 
pm run lint).
