# Research & Technical Decisions: Word Search Game (Trò chơi Săn Tìm Từ Vựng)

**Feature**: `027-word-search-game` | **Date**: 2026-09-07

## 1. Grid Generation Algorithm & Word Placement

### Decision
Implement a pure, deterministic backtracking placement utility (`src/lib/word-search-generator.ts`):
- Filter vocabulary words from the selected topic to those with lengths between 3 and 7 characters (fitting comfortably inside an 8x8 grid).
- Randomly select 4 to 6 target words.
- For each target word, attempt to place it on the 8x8 matrix in one of two directions:
  - Horizontal: left-to-right (`dx = 1, dy = 0`)
  - Vertical: top-to-bottom (`dx = 0, dy = 1`)
- An overlap is valid **only if** the overlapping cell already has the identical letter.
- If an attempt fails after max retries (e.g. 100 iterations), back off and re-seed. Given an 8x8 grid (64 cells) and 4-6 words totaling ~20-30 characters, placement success rate is > 99.9% on first attempt in < 5ms.
- Once all target words are placed, all empty cells are filled with uppercase English letters (`A-Z`) weighted or uniformly distributed.

### Rationale
- Pure TypeScript utility function with no browser API dependencies, making it 100% unit-testable in Vitest with fast execution (< 50ms).
- Predictable and bug-free placement without infinite loops.
- Generates exact coordinate maps for each word (`coordinates: Array<{ row: number, col: number }>`), simplifying collision and match verification.

### Alternatives Considered
- *Full-directional generator (including diagonals and backwards)*: Rejected because the feature spec and user feedback specifically target primary school / ESL learners (Kiddie mode), where backwards and diagonals cause cognitive overload and frustration.
- *Canvas-based puzzle generator library*: Rejected to avoid third-party bloat and ensure server/client hydration compatibility and testability.

---

## 2. Pointer Events & Multi-Input Interaction Model

### Decision
Implement interaction using standard W3C **Pointer Events** (`onPointerDown`, `onPointerEnter` / `PointerCapture` with `document.elementFromPoint`, and `onPointerUp`) combined with an optional **Two-Tap** mode:
- When a user presses down on an initial cell (`startCell`), an active drag selection begins.
- As the pointer moves across cells, the vector direction is locked based on the second cell reached (either horizontal `row === start.row` or vertical `col === start.col`).
- Diagonal or erratic movements are ignored, keeping the selection strictly straight.
- On `pointerUp`, the highlighted path of cells is verified against all remaining target words.
- In addition, clicking `startCell` and then clicking `endCell` (Two-Tap) selects the same straight-line range, providing full accessibility for users with fine-motor difficulty or trackpads.

### Rationale
- Pointer Events unify mouse, touch, and stylus events into a single API without touch-action delays or 300ms click lag.
- Directly manipulates React component state or CSS classes for instant visual feedback (< 50ms).
- Highly testable with `@testing-library/react` (`fireEvent.pointerDown`, `fireEvent.pointerEnter`, `fireEvent.pointerUp`).

### Alternatives Considered
- *HTML5 Drag and Drop (`dnd-kit`)*: While GameHub uses `dnd-kit` for reordering tokens and cards, `dnd-kit` is designed for moving draggable items into drop containers, not drawing coordinate selection paths across a matrix grid.
- *HTML5 `<canvas>` rendering*: Hard to inspect in DOM, inaccessible for screen readers, difficult to test with React Testing Library / Playwright locators.

---

## 3. Intersecting Cells Multi-Color Gradient

### Decision
When two words intersect at a shared letter and both words have been found:
- Each target word is assigned a distinct pastel color token (e.g., Emerald `#10B981`, Sky `#0EA5E9`, Amber `#F59E0B`, Purple `#8B5CF6`, Rose `#F43F5E`, Teal `#14B8A6`).
- Each cell stores an array of matched color hexes: `matchedColors: string[]`.
- If `matchedColors.length === 1`, the cell has a solid pastel background `bg-[color]/25` and border `border-[color]`.
- If `matchedColors.length > 1`, the cell renders a CSS linear gradient: `background: linear-gradient(135deg, color1 50%, color2 50%)`.

### Rationale
- Satisfies spec clarification decision (Option A).
- Graphically communicates that the letter belongs to both completed words without visual occlusion or overwriting.

### Alternatives Considered
- *Overwriting with latest found word color*: Rejected per user clarification; obscures previous word.
- *Striped background*: More visually jarring for young children than a clean diagonal split gradient.

---

## 4. Hint System & Visual Cue Animation

### Decision
The Hint button (`💡 Gợi ý`):
- Identifies the first remaining uncompleted target word.
- Retrieves its starting cell coordinate `(row, col)`.
- Activates a pulsing ring / bounce CSS animation (`animate-pulse ring-4 ring-amber-400 scale-110`) on that starting cell for 2.5 seconds.
- Increments `hintCount` in game state.
- Disables itself when 0 words remain.
- Star rating formula:
  - 0 hints used → 3 Stars ⭐⭐⭐
  - 1 hint used → 2 Stars ⭐⭐
  - 2 or more hints used → 1 Star ⭐

### Rationale
- Non-punitive: Gives learners a gentle nudge without giving away the entire word.
- Directly aligns with the clarified star rating criteria.

---

## 5. Teacher Admin Configuration & Live Preview Architecture

### Decision
- Add `word-search` to `src/types/config.ts`:
  ```typescript
  export interface WordSearchSettings {
    wordCount: 4 | 5 | 6;
    allowedTopics: string[];
    enableHints: boolean;
    autoPronounce: boolean;
    showTimer: boolean;
  }
  ```
- Register schema validation in `src/lib/game-config-schema.ts`.
- Build `src/components/config/WordSearchConfigForm.tsx` conforming to existing config forms (`MemoryMatchConfigForm.tsx`, `ListeningConfigForm.tsx`).
- Register `WordSearchConfigForm` in `ConfigCreateForm.tsx` and `ConfigEditForm.tsx`.
- Enable live preview at `/games/word-search?preview=true&config=<encoded_or_id>`.

### Rationale
- Matches 100% of existing admin architecture across GameHub.
- Enables teachers to customize vocabulary practice for their students with real-time sandbox preview.
