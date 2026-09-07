# Interface Contract: Word Search Game (Trò chơi Săn Tìm Từ Vựng)

**Feature**: `027-word-search-game` | **Date**: 2026-09-07

## 1. Game Route & Parameters

- **Primary Route**: `/games/word-search`
- **Query Parameters**:
  - `?config=<configId>`: Optional Teacher configuration ID loaded via `useGameConfig`.
  - `?preview=<base64Settings>`: Optional preview mode for teacher configuration testing.
  - `?topic=<topicId>`: Optional pre-selected topic (e.g., `animals`, `fruits`).
  - `?words=4|5|6`: Optional pre-selected target word count.

---

## 2. Component Interface Contracts

### `<WordSearchBoard />`
Renders the 8x8 matrix grid with Pointer Event handlers.

```typescript
export interface WordSearchBoardProps {
  grid: WordSearchCell[][];
  onCellPointerDown: (row: number, col: number) => void;
  onCellPointerEnter: (row: number, col: number) => void;
  onCellPointerUp: () => void;
  onCellClick: (row: number, col: number) => void;
  disabled?: boolean;
}
```

### `<WordSearchCellItem />`
Renders an individual character cell on the 8x8 grid with selection and multi-color gradient support.

```typescript
export interface WordSearchCellItemProps {
  cell: WordSearchCell;
  onPointerDown: () => void;
  onPointerEnter: () => void;
  onPointerUp: () => void;
  onClick: () => void;
  disabled?: boolean;
}
```

### `<WordSearchWordList />`
Renders target vocabulary words with emoji, English, Vietnamese meaning, strike-through found state, and replay speaker button.

```typescript
export interface WordSearchWordListProps {
  words: WordSearchTargetWord[];
  onPlayPronunciation: (english: string) => void;
}
```

### `<WordSearchConfigForm />`
Teacher Admin form component for customizing Word Search settings.

```typescript
export interface WordSearchConfigFormProps {
  settings: WordSearchSettings;
  onChange: (settings: WordSearchSettings) => void;
  disabled?: boolean;
}
```

---

## 3. Configuration Schema Contract

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "WordSearchSettings",
  "type": "object",
  "properties": {
    "topics": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1
    },
    "wordCount": {
      "type": "number",
      "enum": [4, 5, 6]
    },
    "enableHints": {
      "type": "boolean"
    },
    "autoSpeak": {
      "type": "boolean"
    },
    "showTimer": {
      "type": "boolean"
    }
  },
  "required": ["topics", "wordCount", "enableHints", "autoSpeak", "showTimer"],
  "additionalProperties": false
}
```

---

## 4. Tracking Payload Contract (`/api/track`)

```typescript
{
  classCode: string;
  studentName: string;
  gameType: "word-search";
  topic: string;
  score: number;             // 1, 2, or 3 stars
  totalQuestions: number;    // wordCount (4, 5, or 6)
  startedAt: string;         // ISO 8601
  completedAt: string;       // ISO 8601
  configId?: string;
  details: [
    {
      prompt: string;        // e.g. "Found 5 words with 0 hints"
      isCorrect: true;
      timeTakenMs: number;
      attempts: number;      // hintCount used
    }
  ]
}
```
