# Technical Research: Grammar Detective Game

**Feature**: `028-grammar-detective`
**Status**: Completed
**Date**: 2026-09-08

---

## 1. Document Tokenization & Inline Replacement

### Decision
Implement a pure deterministic tokenizer utility `tokenizeCaseDocument(text: string, errors: CaseError[])` that splits raw document strings using regex word boundary matching (`/(\s+|[^\w\s]+|\w+)/g`) to produce an immutable array of `TokenItem` objects.
Each token has:
- `id`: unique token identifier (e.g. `t-0`, `t-1`)
- `text`: raw string slice
- `isWord`: boolean (true if contains word characters)
- `errorId`: string | null (matched against target error indices)
- `isCorrected`: boolean

### Rationale
- Splitting by words and whitespace preserves the original document layout, indentations, and punctuation without layout glitches.
- Tagging error tokens by deterministic indices avoids brittle text searching or accidental collision with duplicate words elsewhere in the paragraph (e.g., matching the second "have" instead of the first).
- Pure function tokenization is trivial to unit test with Vitest.

### Alternatives Considered
- `window.getSelection()` range inspection: Rejected because mobile browsers (iOS Safari, Android Chrome) trigger native context menus (Copy/Look Up/Share), causing severe UX disruption and gesture clashes.
- HTML tag parsing (e.g. `<span data-error="1">`): Rejected because storing raw markup in JSON files increases data authoring overhead and introduces XSS risks.

---

## 2. Touch & Click Highlighter Interaction Model

### Decision
Provide a dual-mode interaction:
1. **Highlighter Tool Button** (with neon marker visual indicator and sound toggle). When active, tokens receive interactive styling (`cursor-pointer`, hover glow, touch-target expansion with `p-1 -m-1`, `select-none`).
2. Tapping any word token triggers `handleTokenTap(tokenId)`:
   - If the token is linked to an active `CaseError`, open the `DeductionCard` dialog and play a distinct "Clue Discovered" audio tone.
   - If the token is an already resolved error, show a brief "Resolved" tooltip/toast and speech icon without penalty.
   - If the token is a valid English word (no error), trigger a gentle "No Clue Found" shake animation, deduct 1 Credibility point, and show a brief non-blocking notification.
   - Punctuation and whitespace are non-interactive.

### Rationale
- Touch targets with `select-none` (`user-select: none` via Tailwind) eliminate unwanted OS text-selection popups.
- Immediate visual and auditory feedback gives learners a game-like "investigation" sensation.
- Dedicated button toggle clarifies whether the user is in "Reading Mode" or "Investigation/Marking Mode".

### Alternatives Considered
- Free-form drag painting: Rejected due to touch latency, accidental selection of adjacent whitespace, and high implementation complexity on small mobile screens.
- Auto-highlighting all errors upfront: Rejected because it turns the game into a passive quiz rather than an active proofreading investigation.

---

## 3. Game State Machine & Progression

### Decision
Manage game state with a dedicated hook `useGrammarDetective(cases: CaseFile[])` implementing a robust state machine:
- States:
  - `IDLE_SELECTING`: Browsing dossier / case files by rank tier.
  - `INVESTIGATING`: Examining document, highlighter active/inactive, tracking elapsed timer.
  - `DEDUCTION_OPEN`: Modal open showing 3-4 options for a discovered error token.
  - `CASE_SOLVED`: All errors corrected with Credibility > 0.
  - `CASE_COLD`: Credibility exhausted (0 lives).
  - `ENDLESS_ROUND`: Continuous single-snippet round with streak scoring.

### Rationale
- Keeps state transitions explicit, predictable, and fully testable without rendering UI.
- Decouples business rules (credibility deduction, star calculation, rank unlocks) from Next.js presentation components.
- Compatible with existing GameHub hooks (`useGameTracking`, `useSpeech`, `useGameConfig`).

### Alternatives Considered
- Global Redux/Zustand store: Rejected per Constitution Principle VI (avoid external state libraries when React useState/useReducer suffices).

---

## 4. Audio Feedback & Speech Synthesis

### Decision
Leverage GameHub's established Web Speech API hook `useSpeech()` for native English pronunciation of sentences and corrected phrases, supplemented by lightweight Web Audio API synthesize tones (chime, soft buzzer, victory fanfare) already present in GameHub's utility helpers (`src/lib/audio.ts` or inline AudioContext oscillator).

### Rationale
- No external heavy audio asset files needed.
- Zero network latency for sound effects.
- Speech synthesis handles natural accent reinforcement (US/UK) for ESL learners.

### Alternatives Considered
- Large MP3 soundpacks: Rejected to prevent asset bloat and avoid HTTP request failures on slow mobile connections.

---

## 5. Storage, Leaderboard & Progress Sync

### Decision
- **Local Progress**: Stored in `localStorage` under `gamehub_grammar_detective_progress` (completed case IDs, stars per case, current detective rank, highest endless streak).
- **Classroom / Teacher Analytics**: Integrates with existing `useGameTracking("grammar-detective")` to record completed attempts, accuracy rate, mistake counts, and time elapsed into Supabase for authenticated student/classroom sessions.

### Rationale
- Ensures anonymous guest students can play instantly with zero friction (Pillar 1 of GameHub).
- Classroom students have their proofreading analytics automatically sent to their teacher's dashboard without changing existing database schemas.

### Alternatives Considered
- Forcing user authentication to play: Violates GameHub's core pillar of "Zero-Friction Learner Experience".
