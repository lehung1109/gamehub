# Data Model: Reading Comprehension

## Static Data Models (JSON)

### ReadingModule (`src/data/reading/*.json`)

```typescript
export interface ReadingModule {
  id: string; // e.g., "a-day-at-the-park"
  title: string;
  difficulty: 1 | 2 | 3;
  passageText: string; 
  vocabulary: VocabularyTerm[];
  questions: ReadingQuestion[];
}

export interface VocabularyTerm {
  word: string; // The exact string in the passage text
  definition: string; // e.g., "a large public green area"
  translationVi?: string; // e.g., "công viên"
}

export interface ReadingQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}
```

## State Model (React State)

### GameState

```typescript
export interface ReadingGameState {
  status: 'reading' | 'completed';
  currentQuestionIndex: number;
  score: number;
  // Answers tracking
  answers: Array<{
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }>;
}
```
