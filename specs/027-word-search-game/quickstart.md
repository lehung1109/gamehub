# Quickstart Validation Guide: Word Search Game (Trò chơi Săn Tìm Từ Vựng)

**Feature**: `027-word-search-game` | **Date**: 2026-09-07

## Prerequisites
- Node.js (>= 20) / Bun installed.
- Dependencies installed via `npm install` or `bun install`.

---

## Validation Scenario 1: Standalone Gameplay & Interactive Word Selection
1. Start development server:
   ```bash
   npm run dev
   ```
2. Open browser at `http://localhost:3000/`.
3. Verify "Săn tìm từ vựng" (Word Search) appears in the homepage game catalog with emoji `🔍` and route `/games/word-search`.
4. Navigate to `http://localhost:3000/games/word-search`.
5. Select topic "Hoa quả" (Fruits) and word count 5.
6. **Expected Outcome**:
   - An 8x8 character matrix renders with clear, large touch targets (≥ 36x36px).
   - Beside or above the board, 5 target words are listed with emoji, English, Vietnamese definition, and speaker icons.
   - Drag or click first cell + click last cell of a target word:
     - The straight path of cells highlights actively.
     - Upon completion, cells receive a distinct pastel color.
     - The word in the list is marked with a checkmark and struck through.
     - English pronunciation plays automatically via Web Speech API.

---

## Validation Scenario 2: Hint Button & Intersecting Letter Multi-Color Gradient
1. During an active round, click the `💡 Gợi ý` (Hint) button.
2. **Expected Outcome**:
   - The starting letter cell of the first uncompleted target word pulses with an amber glow for 2.5 seconds.
   - Hint counter increments by 1.
3. If two target words intersect at a shared letter and both are found:
   - **Expected Outcome**:
     - The shared cell renders a 2-color diagonal gradient combining the distinct pastel colors of both completed words.

---

## Validation Scenario 3: Game Completion & Star Rating Calculation
1. Locate and highlight all target words on the board.
2. **Expected Outcome**:
   - Confetti animation triggers.
   - Celebration dialog appears showing:
     - Total words found.
     - Elapsed playtime.
     - Total hints used.
     - Star rating:
       - 0 hints used → 3 Stars ⭐⭐⭐
       - 1 hint used → 2 Stars ⭐⭐
       - ≥ 2 hints used → 1 Star ⭐
     - Action buttons: "Chơi lại ván mới" (Play Again) and "Chọn chủ đề khác" (Change Topic).

---

## Validation Scenario 4: Teacher Admin Config & Live Preview Mode
1. Log in as teacher/admin at `http://localhost:3000/login`.
2. Navigate to `http://localhost:3000/admin/configs/new`.
3. Select "Săn tìm từ vựng" (Word Search).
4. Fill configuration form:
   - Config Name: "Luyện từ vựng Động vật & Hoa quả"
   - Topics: Animals, Fruits
   - Word count: 4
   - Toggle Auto-speak: Enabled
   - Toggle Hints: Enabled
   - Toggle Timer: Enabled
5. Click "Xem trước" (Preview).
6. **Expected Outcome**:
   - Opens `/games/word-search?preview=...` showing 4 words, preview banner, and the customized configuration.
   - Saving config displays it in the teacher config roster with a direct join link.

---

## Validation Scenario 5: Automated Verification
Run automated test suites and linters:
```bash
# Unit tests
npm run test:run tests/unit/lib/word-search-generator.test.ts tests/unit/hooks/useWordSearchGame.test.ts tests/unit/components/WordSearchBoard.test.tsx tests/unit/components/WordSearchConfigForm.test.tsx

# End-to-end tests
npm run test:e2e tests/e2e/word-search.spec.ts

# Static analysis & Typecheck
npm run lint
npx tsc --noEmit
```
**Expected Outcome**: All unit tests, E2E tests, TypeScript checks, and ESLint pass with 0 errors.
