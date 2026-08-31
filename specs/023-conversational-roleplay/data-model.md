# Data Model: Conversational Roleplay

## Static Data Models (JSON)

### ConversationScenario (`src/types/roleplay.ts`)
Represents a complete conversation module.

```typescript
export interface ConversationScenario {
  id: string; // e.g., "ordering-food"
  titleVi: string;
  titleEn: string;
  description: string;
  difficulty: 1 | 2 | 3;
  turns: DialogueTurn[];
}

export interface DialogueTurn {
  id: string;
  characterName: string;
  avatarUrl?: string;
  message: string;
  audioText?: string; // Optional: custom text to speak instead of message
  options: LearnerResponse[];
}

export interface LearnerResponse {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string; // Displayed if the user picks a wrong answer
}
```

## State Model (React State)

### GameState
Tracks the progress of the current session.

```typescript
export interface RoleplayGameState {
  status: 'intro' | 'playing' | 'completed';
  currentTurnIndex: number;
  messageHistory: Array<{
    sender: 'character' | 'learner';
    text: string;
    isCorrect?: boolean;
  }>;
  score: number;
  mistakes: number;
}
```
