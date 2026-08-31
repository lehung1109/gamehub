# Data Model: Typing / Fill-in-the-Blanks

## Derived Data Model (Parsed at runtime)

### FillBlankQuestion
Parsed from the existing Tense data structures.

```typescript
export interface FillBlankQuestion {
  id: string;
  // e.g., ["I ", " to the store yesterday."]
  // The blanks are between the text segments. Length of textSegments is always blanks + 1.
  textSegments: string[]; 
  blanks: Array<{
    hint?: string; // e.g., "(to go)"
    correctAnswers: string[]; // e.g., ["went"]
  }>;
  explanation?: string;
}
```

## State Model (React State)

### GameState

```typescript
export interface TypingGameState {
  status: 'playing' | 'completed';
  currentQuestionIndex: number;
  userInputs: string[]; // Array of inputs corresponding to the blanks in the current question
  isChecking: boolean;
  score: number;
}
```
