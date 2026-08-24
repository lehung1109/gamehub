# Phase 1: Data Model

## 1. Static Question Bank (JSON Data)

The structure of the question bank in `src/data/tenses/present-simple.json` will remain identical to the current `TenseModuleData` schema, specifically the `challenges` field. The only change is the addition of more items to each array.

### Schema (Existing)

```typescript
type TenseModuleData = {
  id: string; // e.g. "present-simple"
  title: string;
  // ... other metadata
  challenges: {
    conjugation: ConjugationItem[];   // Expanded to >= 15 items
    errorHunting: ErrorHunterItem[];  // Expanded to >= 12 items
    sentenceBuilding: SentenceBuilderItem[]; // Expanded to >= 12 items
  }
}
```

- **`ConjugationItem`**: Contains `id`, `text` (with blank), `verb` (base form), `options` (multiple choice), `correctAnswer`, `explanation`.
- **`ErrorHunterItem`**: Contains `id`, `text` (with error), `errorIndex`, `options` (words), `correctAnswer`, `explanation`.
- **`SentenceBuilderItem`**: Contains `id`, `tokens` (words to arrange), `correctOrder`, `explanation`.

## 2. Session Question Set (sessionStorage)

When a stage is initialized, a subset of IDs will be selected and stored in `sessionStorage` to maintain stability during a session (e.g., page reloads).

### Storage Format

- **Key**: `gamehub-session-[moduleId]-[stageType]` (e.g., `gamehub-session-present-simple-conjugation`)
- **Value**: JSON stringified array of string IDs.

```json
// Example value for gamehub-session-present-simple-conjugation
["conj_04", "conj_12", "conj_01", "conj_08", "conj_15", "conj_03", "conj_07", "conj_09"]
```

## 3. Metadata

The `index.json` and module JSON file contain a `challengeCount` property. 

- `challengeCount`: Must be exactly `20` (8 + 6 + 6), representing the number of challenges the user *actually faces* in a single complete run, NOT the total size of the expanded question bank (which is >= 39). This ensures the progress dashboard calculates correctly out of 20.
