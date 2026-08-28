# Data Model: Tùy Chọn Số Lượng Câu Hỏi Từng Chặng & Đảm Bảo Không Trùng Lặp

## Entities

### `StageQuestionConfig` (Transient State)
Tracks the user's selected question count for each stage before they start the practice.

**Location**: React State in `TenseLessonContainer.tsx`

**Structure**:
```typescript
type SelectedCountsMap = Record<StageType, number>;
```

**Attributes**:
- Key: `StageType` (e.g., `"conjugation"`, `"errorHunting"`)
- Value: `number` (The selected question count $N$, defaulting to `Math.min(10, stage.itemCount)`).

### `QuestionHistoryTracker` (Persistence)
Tracks the IDs of questions that have been seen in previous sessions to prevent duplicates across replays.

**Location**: `sessionStorage`
**Key Format**: `gamehub-history-[tenseId]-[stageId]` (e.g., `gamehub-history-present-simple-conjugation`)

**Structure**:
```json
[
  "conj-01",
  "conj-04",
  "conj-07"
]
```

**Attributes**:
- A simple array of strings representing the unique IDs of items that have already been presented to the user.

### `SessionQuestionSet` (Persistence)
Tracks the exact list of selected questions for the *current* active session to survive page reloads. This entity already exists but will be extended to work in tandem with the history tracker.

**Location**: `sessionStorage`
**Key Format**: `gamehub-session-[tenseId]-[stageId]` (e.g., `gamehub-session-present-simple-conjugation`)

**Structure**:
```json
[
  "conj-09",
  "conj-12",
  "conj-15"
]
```

## State Transitions

### History Pool Wrap-Around Logic
1. User requests $N$ questions.
2. Load `seenIds` from `historyKey`.
3. Filter `pool` to find `unseen = pool.filter(q => !seenIds.includes(q.id))`.
4. If `unseen.length >= N`:
   - Shuffle `unseen`, pick $N$.
   - Append to `seenIds`.
5. If `0 < unseen.length < N`:
   - Pick all `unseen`.
   - Set `remainingNeeded = N - unseen.length`.
   - Reset `seenIds` to empty.
   - Filter `pool` to exclude the newly picked `unseen`.
   - Shuffle, pick `remainingNeeded`.
   - Set `seenIds` to the combined $N$ picked IDs.
6. If `unseen.length === 0`:
   - Reset `seenIds` to empty.
   - Shuffle `pool`, pick $N$.
   - Set `seenIds` to the $N$ picked IDs.
7. Save final $N$ picked IDs to `sessionKey`.
8. Save final `seenIds` to `historyKey`.
