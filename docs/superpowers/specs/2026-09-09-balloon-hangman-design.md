# Word Explorer: Balloon Hangman — Design Specification

**Feature:** Word Explorer: Balloon Hangman (Giải Cứu Nhà Thám Hiểm) Mini-Game  
**Route:** `/games/hangman`  
**Catalog Priority:** `13` (following `falling-words` at 12)  
**Target Audience:** K-12 ESL students, teachers, and English language learners  
**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React, Web Speech API (`useSpeech`), Vitest, Playwright

---

## 1. Executive Summary & Pedagogical Value

"Word Explorer: Balloon Hangman" (Giải Cứu Nhà Thám Hiểm) is a friendly, child-safe, and educational re-imagining of the classic word-guessing game (Hangman) tailored for ESL learners.

Instead of traditional gallows imagery, a cheerful floating explorer is lifted high in the sky by 6 colorful balloons (Red, Orange, Yellow, Green, Blue, Purple). As learners guess letters on their physical or virtual keyboard, each incorrect letter pops one balloon with a playful animation. Guessing all letters correctly safely guides the explorer to victory and triggers native English pronunciation!

### Educational Value:
1. **Phonetic & Orthographic Deductive Reasoning:** Encourages learners to recognize common English vowel-consonant clusters, word stems, and prefixes/suffixes.
2. **Contextual Semantic Reinforcement:** Each word is accompanied by its Vietnamese definition, topic category, and phonetic transcription.
3. **Low-Stress, School-Safe Gamification:** Completely removes violent imagery while retaining the suspense, tactical guessing, and problem-solving thrill of classic Hangman.
4. **Pronunciation Audio Integration:** Automatic Web Speech API audio reinforces correct listening comprehension upon completing each word.

---

## 2. Core Gameplay Mechanics

### 2.1 Round Structure: 5-Word Challenge
- Each game session consists of **5 vocabulary words** drawn from the selected topic (Animals, Fruits, School, Family, Body Parts).
- Progression tracker: Displays current word (e.g. `Từ 2/5`) and round score.
- When a word is solved or all 6 balloons pop:
  - The full word is revealed along with phonetic transcription and audio pronunciation.
  - A "Từ tiếp theo" (Next Word) button advances to the next word.
  - After word 5, the **Round Summary Modal** appears with stars, statistics, and a full vocabulary review list.

### 2.2 Guessing & Balloon States
- The explorer starts with **6 Balloons**:
  1. 🔴 Red
  2. 🟠 Orange
  3. 🟡 Yellow
  4. 🟢 Green
  5. 🔵 Blue
  6. 🟣 Purple
- The player guesses letters via:
  - **Physical Keyboard:** Pressing keys A–Z.
  - **Virtual Keyboard:** 3-row QWERTY keyboard with $\ge 44\text{px}$ touch targets.
- **Letter States:**
  - **Unused:** Neutral slate button, clickable.
  - **Correct:** Emerald button with checkmark, disabled. Unveils all instances of the letter in the word.
  - **Incorrect:** Red/slate button with cross/dimmed styling, disabled. Pops 1 balloon.
- **Loss Condition for Current Word:** If 6 mistakes occur, the last balloon pops, the explorer deploys a mini parachute safely to the ground, and the secret word is revealed in amber.

### 2.3 Hint Assist System
- Each word allows **1 Letter Hint**:
  - Clicking "Gợi ý 1 chữ cái" (-100 điểm) reveals one unrevealed letter in the word.
  - Docks 100 points from the current word score.
  - Disabled if only 1 letter remains or already used on current word.

---

## 3. Scoring & Star Rating

### 3.1 Word Score Formula
For each solved word:
$$\text{Word Score} = \max(50, 200 - (\text{Mistakes} \times 20) + (\text{Remaining Balloons} \times 30) - (\text{Hint Used} ? 100 : 0))$$
- Base score: $200$ points.
- Penalty per mistake: $-20$ points.
- Bonus per remaining balloon: $+30$ points (up to $+180$ for 0 mistakes).
- Hint penalty: $-100$ points.
- Unsolved word (all balloons popped): $0$ points awarded.

### 3.2 Round Star Rating (Out of 5 Words)
- ⭐⭐⭐ **3 Stars:** Total score $\ge 1200$ points AND 5/5 words solved without losing all balloons.
- ⭐⭐ **2 Stars:** Total score $\ge 700$ points AND at least 3/5 words solved.
- ⭐ **1 Star:** Finished the 5-word round with score $> 0$.

---

## 4. Architecture & State Engine Hook (`useHangmanEngine`)

Defined in `src/hooks/useHangmanEngine.ts`:

```typescript
export interface HangmanWord {
  id: string;
  word: string; // Uppercase
  clue: string;
  phonetic?: string;
  emoji?: string;
}

export interface HangmanState {
  topicId: string;
  wordList: HangmanWord[];
  currentIndex: number; // 0 to 4
  currentWord: HangmanWord | null;
  guessedLetters: Set<string>;
  mistakesCount: number; // 0 to 6
  maxMistakes: number; // 6
  hintUsed: boolean;
  score: number;
  wordStatus: "playing" | "won" | "lost";
  isRoundComplete: boolean;
  history: Array<{
    word: HangmanWord;
    solved: boolean;
    mistakes: number;
    score: number;
  }>;
}
```

#### Hook Outputs:
- **State:** `topicId`, `currentIndex`, `totalWords` (5), `currentWord`, `guessedLetters`, `mistakesCount`, `maxMistakes`, `hintUsed`, `score`, `wordStatus`, `isRoundComplete`, `history`.
- **Actions:**
  - `guessLetter(char: string)`: Validates letter, updates guessedLetters, checks win/loss.
  - `useHint()`: Reveals 1 unrevealed letter and applies penalty.
  - `nextWord()`: Advances to next word in the 5-word queue or triggers round completion.
  - `restartRound(newTopicId?: string)`: Resets round with fresh 5-word shuffled batch.
  - `setTopicId(topicId: string)`: Switches topic and restarts round.

---

## 5. UI Component Hierarchy

```
src/app/games/hangman/page.tsx
├── HangmanHeader (Back link, topic selector, current word index "Từ 2/5", round score, hint button)
├── BalloonStage (Visual sky illustration with floating explorer and 6 colorful SVG balloons)
├── WordDisplay (Interactive letter slot boxes with revealed letters and underscores)
├── ClueBanner (Vietnamese clue, topic emoji, and phonetic pronunciation bar)
├── VirtualKeyboard (3-row QWERTY keyboard with min 44px touch targets and letter status indicators)
└── HangmanSummaryModal (5-word round review modal with stars, score, word review list, and restart button)
```

---

## 6. Accessibility & Global Constraints

- **Typography Standard:** Every single rendered text element (slots, hints, timer, headers, keyboard letters, clues) MUST compute to $\ge 16\text{px}$ font size (`text-base`, `text-lg`, `text-xl`). No sub-16px utility classes.
- **Touch Target Compliance:** All interactive buttons (all 26 keyboard keys, hint button, next word button, restart button) MUST have a minimum 44px vertical touch target (`min-h-[44px]`).
- **W3C ARIA Standards:**
  - Game stage has `role="region"` and `aria-label="Khu vực khinh khí cầu"`.
  - Letter slots have `aria-label="Từ gồm X chữ cái: [revealed status]"`.
  - Summary modal has `role="dialog"` and `aria-modal="true"`.
- **SSR Hydration Safety:** Client-only mount via `React.useSyncExternalStore(emptySubscribe, () => true, () => false)` to avoid random queue hydration mismatches.

---

## 7. Testing Strategy

1. **Unit Tests (`tests/unit/hangman/`):**
   - Spawner & Queue tests: 5 unique words selected, topic fallback.
   - State engine tests (`useHangmanEngine.test.ts`):
     - Initial state (6 balloons, 0 score, 0 mistakes).
     - Correct letter reveal without mistake increment.
     - Wrong letter increments mistake and pops balloon.
     - 6 mistakes triggers `wordStatus = "lost"`.
     - Completing all letters triggers `wordStatus = "won"` and awards points.
     - Hint reveals unrevealed letter and docks 100 points.
     - 5-word round completion and summary calculation.
2. **Component Tests (`tests/components/hangman/`):**
   - `BalloonStage.test.tsx`: Correct number of balloons rendered based on mistake count.
   - `WordDisplay.test.tsx`: Letters shown vs blanks.
   - `VirtualKeyboard.test.tsx`: Key status (default, correct, incorrect) and touch targets.
   - `HangmanSummaryModal.test.tsx`: Stars, score, review list with speech replay.
3. **E2E Tests (`tests/e2e/hangman.spec.ts`):**
   - Playwright E2E testing load, letter clicking/typing, hint button, next word transition, and mobile viewport responsiveness.

---

## 8. Catalog Integration

Entry in `src/data/games.json` with `priority: 13`:
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
Update `tests/data/games.test.ts` to expect 13 games.
