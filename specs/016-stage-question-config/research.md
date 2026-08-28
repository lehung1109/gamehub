# Research: Tùy Chọn Số Lượng Câu Hỏi Từng Chặng & Đảm Bảo Không Trùng Lặp

## Decision: History Tracking Persistence

**Decision**: We will use `sessionStorage` to persist the history of seen questions (`historyKey = storageKey + '-history'`) for each stage.

**Rationale**:
- `sessionStorage` is tied to the current browser tab. If a user replays a stage multiple times in one sitting, the history will prevent duplicates until the pool is exhausted.
- If the user leaves the application and returns the next day, the history resets, allowing them to experience the questions again. This is desired behavior since long-term progress (scores, completion status) is already tracked via `localStorage`.
- Using `sessionStorage` avoids unbounded growth of `localStorage` and eliminates the need for complex TTL or manual cache invalidation.

**Alternatives considered**:
- `localStorage`: Would persist seen questions across browser sessions. However, a user returning after a week might want to practice the whole pool again. If we used `localStorage`, we would need complex logic to determine when to "reset" the pool automatically (e.g., based on timestamps).
- Integrating `seenQuestionIds` into `TenseUserProgressRecord`: This mixes transient learning state (what questions I just saw 2 minutes ago) with persistent achievement state (my best score). Keeping them separate is cleaner.

## Decision: Dynamic Question Count Selection

**Decision**: We will calculate valid options dynamically based on the total items available in the stage's question bank (`stage.itemCount`). Options will be a deduplicated subset of `[5, 10, 15, stage.itemCount]` where elements are `> 0` and `<= stage.itemCount`.

**Rationale**:
- If a stage only has 8 questions, the options will cleanly resolve to `[5, 8]`.
- If a stage has 20 questions, the options will be `[5, 10, 15, 20]`.
- This ensures the UI never promises more questions than exist in the database, avoiding index out of bounds or repeated items in a single session.

**Alternatives considered**:
- Hardcoding `[5, 10, 15, Tất cả]`: Would lead to invalid states if a stage has fewer than 15 questions.
- A free-form numeric input: Provides too much freedom and violates the design requirement of "Chip/Segmented buttons" for quick selection on mobile devices.

## Decision: Unseen Pool Exhaustion Strategy

**Decision**: When $0 < \text{unseen} < N$, we will pick all remaining unseen questions, then reset the `historyKey` to mark the entire pool as available again, and pick the remaining $(N - \text{unseen})$ questions from the newly refreshed pool (excluding the ones we just picked).

**Rationale**:
- Ensures the user always gets exactly $N$ questions in their session, even if they only have 2 unseen questions left but requested 10.
- Guarantees 0 duplicates *within* the single session (the $N$ questions are strictly unique).
- Seamlessly wraps around the pool without requiring manual user intervention or showing an error.

**Alternatives considered**:
- Terminating the session early (e.g., returning only 2 questions instead of 10): Disrupts the expected UX and breaks progress calculations which expect a denominator of 10.
- Throwing an error: Terrible UX.
