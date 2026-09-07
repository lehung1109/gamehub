# Interface Contract: Memory Match Game

## 1. Game Route & Parameters

- **Primary Route**: `/games/memory-match`
- **Query Parameters**:
  - `?config=<configId>`: Optional Teacher configuration ID loaded via `useGameConfig`.
  - `?preview=<base64Settings>`: Optional preview mode for teacher configuration testing.
  - `?topic=<topicId>`: Optional pre-selected topic (e.g., `animals`, `fruits`).
  - `?pairs=4|6|8`: Optional pre-selected pair count.

## 2. Component Interface Contracts

### `<MemoryBoard />`
```typescript
export interface MemoryBoardProps {
  cards: MemoryCard[];
  onCardClick: (index: number) => void;
  disabled?: boolean;
}
```

### `<MemoryCard />`
```typescript
export interface MemoryCardProps {
  card: MemoryCard;
  onClick: () => void;
  disabled?: boolean;
}
```

### `<MemoryMatchConfigForm />`
```typescript
export interface MemoryMatchConfigFormProps {
  settings: MemoryMatchSettings;
  onChange: (settings: MemoryMatchSettings) => void;
  disabled?: boolean;
}
```

## 3. Configuration Schema Contract

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MemoryMatchSettings",
  "type": "object",
  "properties": {
    "topics": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1
    },
    "pairCount": {
      "type": "number",
      "enum": [4, 6, 8]
    },
    "autoSpeak": {
      "type": "boolean"
    },
    "showTimer": {
      "type": "boolean"
    }
  },
  "required": ["topics", "pairCount", "autoSpeak", "showTimer"],
  "additionalProperties": false
}
```

## 4. Tracking Payload Contract (`/api/track`)

```typescript
{
  classCode: string;
  studentName: string;
  gameType: "memory-match";
  topic: string;
  score: number; // 1, 2, or 3 stars
  totalQuestions: number; // pairCount (4, 6, or 8)
  startedAt: string; // ISO 8601
  completedAt: string; // ISO 8601
  configId?: string;
  details: [
    {
      prompt: string; // e.g. "Completed Animals in 8 flips"
      isCorrect: true;
      timeTakenMs: number;
      attempts: number; // total flips
    }
  ]
}
```
