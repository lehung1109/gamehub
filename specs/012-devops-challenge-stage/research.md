# Phase 0: Research & Technical Decisions

## Unknowns Resolved

1. **Storage Compatibility (`devOpsChallenge` field in LocalStorage)**
   - **Decision**: Update `StageType` in `types/tenses.ts` to include `"devOpsChallenge"`. Make it an optional property in `TenseUserProgressRecord["stageScores"]` to avoid breaking existing users. Update `calculateAggregates` in `storage.ts` to safely iterate over it if present.
   - **Rationale**: The spec requires backward compatibility. Since `devOpsChallenge` is an optional stage, making its score tracking optional aligns perfectly.
   - **Alternatives considered**: Migrating all local storage on startup (unnecessary complexity for just adding an optional stage).

2. **Refactoring Single Question UI**
   - **Decision**: Extract `ConjugationQuestionUI`, `ErrorHunterQuestionUI`, and `SentenceBuilderQuestionUI` from their respective stage components. These new components will accept strictly controlled props (`currentItem`, `selectedAnswer`, `onAnswerChange`, `onSubmit`, `onNext`, etc.) and will be reused by both the individual stages and the new `DevOpsChallengeStage`.
   - **Rationale**: Meets the DRY requirement of SC-003. Prevents duplicating the complex interactive markup.
   - **Alternatives considered**: Rendering the entire `<ConjugationStage items={[singleItem]} />` inside the mixed stage (messy state management).

3. **Data Model Structure for Mixed Stage**
   - **Decision**: `DevOpsItem` will be defined as `(ConjugationItem | ErrorHunterItem | SentenceBuilderItem) & { challengeType: "conjugation" | "errorHunting" | "sentenceBuilding" }`. The array `devOpsChallenge?: DevOpsItem[]` will be added to `TenseChallenges`.
   - **Rationale**: Allows 100% type safety while keeping all IT/DevOps questions in a single cohesive array.
