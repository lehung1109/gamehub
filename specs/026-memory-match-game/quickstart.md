# Quickstart Validation Guide: Memory Match Game

## Prerequisites
- Node.js / Bun installed in local development environment.
- Dependencies installed via `npm install` or `bun install`.

## Validation Scenario 1: Standalone Game & Audio Pronunciation
1. Start development server:
   ```bash
   npm run dev
   ```
2. Open browser at `http://localhost:3000/`.
3. Verify "Lật thẻ tìm cặp" (Memory Match) card appears in the main game catalog with emoji `🧠` and link to `/games/memory-match`.
4. Click into `/games/memory-match`.
5. Select topic "Động vật" (Animals) and pair count 6 (12 cards).
6. **Expected Outcome**:
   - 12 face-down cards appear in a 3x4 (mobile) or 4x3 (desktop) grid.
   - Click card 1: Card flips face-up. If it is a Word card, pronunciation plays automatically.
   - Click card 2:
     - If matching pair: Both cards remain face-up with success indicator and English audio pronunciation.
     - If mismatch: Both cards remain visible for 1 second, then flip face-down.
   - Click a matched card: English pronunciation plays again without incrementing flip count.

## Validation Scenario 2: Game Completion & Star Rating
1. Match all pairs on the board.
2. **Expected Outcome**:
   - Confetti celebration triggers.
   - Completion modal displays:
     - Total flips made.
     - Total elapsed time.
     - Star rating: 3 stars (≤ N+2 flips), 2 stars (N+3 to 2N flips), 1 star (> 2N flips).
   - "Chơi lại" (Play Again) button draws a new random set of vocabulary from the topic.
   - "Đổi chủ đề" (Change Topic) button returns to topic selection.

## Validation Scenario 3: Teacher Admin Config & Preview Mode
1. Log in as teacher/admin at `http://localhost:3000/login`.
2. Navigate to `http://localhost:3000/admin/configs/new`.
3. Choose "Lật thẻ tìm cặp" (Memory Match).
4. Fill configuration form:
   - Config Name: "Luyện từ vựng Động vật & Trái cây"
   - Select topics: Animals, Fruits
   - Pair count: 4
   - Toggle Auto-speak: Enabled
   - Toggle Timer: Enabled
5. Click "Xem trước" (Preview).
6. **Expected Outcome**:
   - Opens `/games/memory-match?preview=...` showing exactly 8 cards (4 pairs) and preview banner.
   - Saving config adds it to teacher config list with shareable URL.

## Validation Scenario 4: Automated Verification
Run automated tests:
```bash
npm run test:run tests/unit/components/MemoryCard.test.tsx tests/unit/hooks/useMemoryGame.test.ts
npm run test:e2e tests/e2e/memory-match.spec.ts
npm run lint
npx tsc --noEmit
```
**Expected Outcome**: All tests pass with zero errors.
