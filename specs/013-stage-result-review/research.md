# Research: Stage Result Review

Since the project uses a highly constrained and well-defined technical stack per the `constitution.md`, there are no unresolved clarifications required regarding technology choices or architectural patterns. 

## Decisions

### Storage Mechanism
- **Decision**: Persist detailed attempt histories inside the existing `localStorage` wrapper in `src/lib/tenses/storage.ts`.
- **Rationale**: The spec requires persisting detailed attempt data across browser sessions. Since user progress is already tracked locally using `localStorage`, extending the `TenseUserProgressRecord` type is the most cohesive approach. It avoids introducing new state management or backend databases, which adheres to the YAGNI principle in the constitution.
- **Alternatives considered**: 
  - Using IndexedDB: Overkill for the small amount of textual data (10 questions per stage).
  - Backend/Supabase: Forbidden by the constitution (zero tracking, auth is admin-only).

### Component Architecture
- **Decision**: Create `StageResultUI` and `HistoryReviewUI` as composable presentational components in `src/components/tenses/stages/ui/`.
- **Rationale**: Keeps the business logic (in `TenseLessonContainer` and individual stage components like `ConjugationStage`) separated from the rendering of results. This aligns with React component-driven best practices.

### Randomization
- **Decision**: Update `useSessionQuestions` hook to select `count: 10` questions dynamically.
- **Rationale**: The hook currently accepts a `count` argument but caches the selected IDs to `sessionStorage` to prevent re-randomizing on component remounts. We will use this existing functionality and simply update the count and ensure the seed data contains 20 items.
