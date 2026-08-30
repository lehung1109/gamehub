# Research & Architecture Decisions

## Decisions

### Decision 1: Project Structure
**Decision**: Create a standalone feature matching the "Tenses" structure.
- **Route**: `src/app/parts-of-speech` and `src/app/parts-of-speech/[slug]`
- **Components**: `src/components/parts-of-speech/`
- **Data**: `src/data/parts-of-speech/`
- **Types**: `src/types/parts-of-speech.ts`
**Rationale**: Reuses the proven architecture from the existing "Tenses" module, satisfying the requirement for standalone hubs while keeping code organized.
**Alternatives considered**: Integrating into `tenses/` was rejected as it blurs the domain boundaries between Tenses and Parts of Speech.

### Decision 2: Word Family Interaction (Drag and Drop)
**Decision**: Use `@dnd-kit/core` and `@dnd-kit/sortable` for the "Word Family" stage.
**Rationale**: Principle IV of the Constitution mandates `dnd-kit` for all drag-and-drop interactions. The UI will allow users to drag suffixes/prefixes to base words or sort them into categories.
**Alternatives considered**: HTML5 native drag-and-drop was rejected (violates constitution).

### Decision 3: Error Hunting & Fill-in Blank
**Decision**: Adapt the existing Tenses components (`ErrorHuntingItem`, etc.) logic for these stages.
**Rationale**: Code reuse speeds up development. We can create generic UI components if they are identical, or just clone and adapt them into `src/components/parts-of-speech/stages/`.
**Alternatives considered**: Building entirely new UI from scratch was rejected (YAGNI).

### Decision 4: Progress Storage
**Decision**: Local Storage.
**Rationale**: The spec explicitly assumes local storage is sufficient, matching the current Tenses implementation (`ITenseProgressStorage`). We'll create `IPartsOfSpeechProgressStorage`.
**Alternatives considered**: Supabase/Backend storage was rejected as it's out of scope for the current feature requirements.
