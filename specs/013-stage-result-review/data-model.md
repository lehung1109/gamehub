# Data Model: Stage Result Review

## Type Extensions (`src/types/tenses.ts`)

To support detailed history review, we need to capture the user's answers and associate them with the original question context.

### 1. `AttemptItem`
Represents a single answered question within a stage session.
```typescript
export interface AttemptItem {
  questionId: string;
  contextVi: string;         // e.g., the scenario or sentence context
  userAnswer: string;       // the specific text or option the user chose
  correctAnswer: string;    // the correct text or option
  isCorrect: boolean;       // whether the user got it right
  explanationVi: string;    // the grammatical explanation for review
}
```

### 2. `StageProgress` (Extension)
Extend the existing `StageProgress` type to include the latest attempt history.
```typescript
export interface StageProgress {
  score: number;
  total: number;
  passed: boolean;
  completedAt?: string;
  attemptHistory?: AttemptItem[]; // NEW: holds the last 10 answers
}
```

## Data Updates (`src/data/tenses/present-simple.json`)

The JSON structure remains identical to its current schema. However, the arrays inside the `challenges` object will be expanded:

- `conjugation`: increased from 15 to 20+ items.
- `errorHunting`: increased from 12 to 20+ items.
- `sentenceBuilding`: increased from 12 to 20+ items.
- `devOpsChallenge`: increased from 9 to 20+ items.

No structural changes to the schemas of `ConjugationItem`, `ErrorHunterItem`, or `SentenceBuilderItem` are required.
