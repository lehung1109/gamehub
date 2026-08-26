# Data Model

## `DevOpsItem` (TypeScript Type)
A discriminated union extending existing item types.

```typescript
export type DevOpsChallengeType = "conjugation" | "errorHunting" | "sentenceBuilding";

export type DevOpsConjugationItem = ConjugationItem & { challengeType: "conjugation" };
export type DevOpsErrorHunterItem = ErrorHunterItem & { challengeType: "errorHunting" };
export type DevOpsSentenceBuilderItem = SentenceBuilderItem & { challengeType: "sentenceBuilding" };

export type DevOpsItem = DevOpsConjugationItem | DevOpsErrorHunterItem | DevOpsSentenceBuilderItem;
```

## `TenseChallenges` (Update)
```typescript
export interface TenseChallenges {
  conjugation: ConjugationItem[];
  errorHunting: ErrorHunterItem[];
  sentenceBuilding: SentenceBuilderItem[];
  devOpsChallenge?: DevOpsItem[]; // Added (Optional)
}
```

## `StageType` (Update)
```typescript
export type StageType = "conjugation" | "errorHunting" | "sentenceBuilding" | "devOpsChallenge";
```

## `TenseUserProgressRecord` (Update)
```typescript
export interface TenseUserProgressRecord {
  tenseId: string;
  completed: boolean;
  stageScores: {
    conjugation: StageProgress;
    errorHunting: StageProgress;
    sentenceBuilding: StageProgress;
    devOpsChallenge?: StageProgress; // Added (Optional)
  };
  totalScore: number;
  maxPossibleScore: number;
  accuracyPercentage: number;
  lastStudiedAt: string;
}
```
