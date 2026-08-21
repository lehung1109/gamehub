# Route Contracts: English Learning Games for Kids

**Feature Branch**: `001-english-learning-games` | **Date**: 2026-08-20

## Overview

This is a statically-exported Next.js web application. All routes are pre-rendered at build time. There are no API endpoints — all data comes from static JSON imports. The contracts below define the URL structure, page parameters, and component interfaces.

## Route Map

```text
/                                    → Homepage (game hub)
/games/flashcard                     → Flashcard game
/games/flashcard/[topicId]           → Flashcard game with specific topic
/games/alphabet                      → Alphabet & Phonics game
/games/listening                     → Listening comprehension game
/games/spelling                      → Spelling / word building game
/games/numbers-colors                → Numbers & Colors game
/games/sentences                     → Simple sentences game
```

## Route Details

### `GET /` — Homepage

**File**: `src/app/page.tsx`

**Response**: Static HTML page displaying all 6 game cards.

**Behavior**:
- Renders a grid of `GameCard` components
- Each card displays: emoji, Vietnamese title, short description
- Cards are ordered by `game.priority`
- Click/tap on card navigates to `game.route`
- Responsive: 1 column mobile, 2 columns tablet, 3 columns desktop

**Data Source**: `src/data/games.json`

---

### `GET /games/flashcard` — Flashcard Topic Selection

**File**: `src/app/games/flashcard/page.tsx`

**Response**: Static HTML page showing available topics.

**Behavior**:
- Renders topic selection grid
- Each topic shows: emoji, Vietnamese name, word count
- Click/tap navigates to `/games/flashcard/[topicId]`

**Data Source**: `src/data/topics.json`, `src/data/words/*.json`

---

### `GET /games/flashcard/[topicId]` — Flashcard Game

**File**: `src/app/games/flashcard/[topicId]/page.tsx`

**Static Params**: Generated from `topics.json` via `generateStaticParams()`

**Response**: Static HTML page with interactive flashcard game (client-side).

**Behavior**:
- Shows one card at a time from the selected topic
- Front: emoji illustration
- Back (on tap): English word + phonetic + Vietnamese
- Speaker button: triggers Web Speech API
- Navigation: swipe or arrow buttons for next/previous
- Progress indicator showing current card / total

**Data Source**: `src/data/words/[topicId].json`

---

### `GET /games/alphabet` — Alphabet & Phonics

**File**: `src/app/games/alphabet/page.tsx`

**Response**: Static HTML page with interactive alphabet grid (client-side).

**Behavior**:
- Default mode: 26-letter grid (A-Z)
- Tap letter → display example word, emoji, play pronunciation
- Toggle to Quiz mode:
  - System speaks a letter
  - User selects from grid
  - Feedback: correct (green + animation) / wrong (red + show answer)

**Data Source**: `src/data/letters.json`

---

### `GET /games/listening` — Listening Comprehension

**File**: `src/app/games/listening/page.tsx`

**Response**: Static HTML page with interactive listening quiz (client-side).

**Behavior**:
- System speaks an English word
- Display 3-4 emoji options (1 correct + 2-3 distractors)
- Replay button to hear word again
- Correct: green feedback + auto-advance (1.5s)
- Wrong: red feedback + highlight correct answer + "Continue" button
- Randomized question order from word pool

**Data Source**: `src/data/words/*.json` (all topics combined)

---

### `GET /games/spelling` — Spelling / Word Building

**File**: `src/app/games/spelling/page.tsx`

**Response**: Static HTML page with interactive drag-and-drop spelling (client-side).

**Behavior**:
- Show emoji illustration of target word
- Display scrambled letters (correct letters + 2-3 distractors)
- Drag & drop or tap-to-place letters into slots
- Wrong letter placement: letter returns to bank (animated)
- Complete word: play pronunciation + celebration animation
- Filter words to 3-5 letter words only

**Data Source**: `src/data/words/*.json` (filtered for short words)

---

### `GET /games/numbers-colors` — Numbers & Colors

**File**: `src/app/games/numbers-colors/page.tsx`

**Response**: Static HTML page with interactive number/color learning (client-side).

**Behavior**:
- Two tabs: "Số đếm" (Numbers) / "Màu sắc" (Colors)
- Numbers tab: grid of 1-20, tap to see emoji illustration + hear pronunciation
- Colors tab: grid of color swatches, tap to see name + hear pronunciation
- Quiz mode for each tab:
  - System speaks number/color name
  - User selects correct option
  - Standard correct/wrong feedback

**Data Source**: `src/data/numbers.json`, `src/data/colors.json`

---

### `GET /games/sentences` — Simple Sentences

**File**: `src/app/games/sentences/page.tsx`

**Response**: Static HTML page with interactive sentence building (client-side).

**Behavior**:
- Show situation emoji
- Display scrambled word cards
- Drag & drop or tap-to-place words in order
- "Kiểm tra" (Check) button to validate
- Correct: play full sentence + show Vietnamese translation + celebration
- Wrong: highlight misplaced words + allow rearrangement

**Data Source**: `src/data/sentences.json`

## Shared Component Contracts

### `GameCard`

**Built on**: shadcn `Card` + `CardHeader` + `CardContent`

```typescript
interface GameCardProps {
  game: Game;
}
```
- Extends shadcn `Card` with `rounded-3xl shadow-lg` for kid-friendly styling
- Renders a clickable card with emoji, title (Vietnamese), and description
- Links to `game.route` via Next.js `Link`
- Touch/click interaction with `hover:scale-105 transition-transform`
- Responsive sizing

### `BackButton`

**Built on**: shadcn `Button` (variant `outline`, size `lg`)

```typescript
interface BackButtonProps {
  href?: string; // defaults to "/"
  label?: string; // defaults to "Về trang chủ"
}
```
- Uses shadcn `Button` with `variant="outline"` and `size="lg"`
- Fixed position, always visible (FR-017)
- Large touch target (48px minimum, `h-14` on mobile)

### `SpeakButton`

**Built on**: shadcn `Button` (variant `secondary`, size `icon`)

```typescript
interface SpeakButtonProps {
  text: string;
  lang?: string; // defaults to "en-US"
  disabled?: boolean;
}
```
- Uses shadcn `Button` with `variant="secondary"` and `size="icon"` (🔊 emoji)
- Triggers `useSpeech().speak(text)`
- Cancels previous utterance before speaking (FR-016)
- Shows unsupported message if Web Speech API unavailable (FR-018)

### `FeedbackOverlay`

**Built on**: shadcn `Dialog` (modal overlay)

```typescript
interface FeedbackOverlayProps {
  type: 'correct' | 'wrong';
  onContinue: () => void;
  autoAdvance?: boolean; // defaults to false
  autoAdvanceMs?: number; // defaults to 1500
}
```
- Uses shadcn `Dialog` as a modal overlay for feedback display
- Correct: green background + ⭐🎉 emoji animation (FR-008)
- Wrong: red background + show correct answer + encourage retry (FR-008)
- No sound effects (FR-008)
- Continue button uses shadcn `Button`

### `QuizEngine`

**Built on**: shadcn `Button` + `Progress` + `Toggle Group`

```typescript
interface QuizQuestion<T> {
  prompt: T; // what to display/speak
  options: T[]; // answer choices (3-4)
  correctIndex: number;
}

interface QuizEngineProps<T> {
  questions: QuizQuestion<T>[];
  renderOption: (option: T, index: number) => React.ReactNode;
  onSpeak?: (prompt: T) => void;
  onComplete: (score: number, total: number) => void;
}
```
- Uses shadcn `Progress` for question progress bar
- Quiz options rendered as shadcn `Toggle Group` items or custom `Button` variants
- Manages quiz state machine (presenting → waiting → feedback → next)
- Tracks correct/wrong answers
- Calls `onSpeak` for audio questions
- Reports final score via `onComplete`

### `SpeechUnsupportedBanner`

**Built on**: shadcn `Dialog` (alert variant)

```typescript
interface SpeechUnsupportedBannerProps {
  show: boolean;
}
```
- Uses shadcn `Dialog` as a dismissible alert banner
- Renders when Web Speech API is not available (FR-018)
- Suggests using Chrome, Edge, or Safari
