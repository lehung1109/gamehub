# Phase 0: Research

## 1. Randomization Implementation

**Decision**: Use the Fisher-Yates shuffle algorithm to randomly select a subset of questions from the expanded question bank.

**Rationale**: The requirement (FR-004) asks for a "basic random shuffle" with no complex anti-duplication logic between consecutive sessions. Fisher-Yates is the standard, most efficient (O(n)) algorithm for unbiased shuffling. We will shuffle the array of questions and slice the first N items (8 for Conjugation, 6 for Error Hunting, 6 for Sentence Building).

**Alternatives considered**: 
- `Math.random() - 0.5` sorting: Known to be biased and inconsistent across JavaScript engines. Rejected in favor of Fisher-Yates.
- Complex PRNG (Pseudo-Random Number Generator) with seeds: Overkill for this requirement.

## 2. Session Persistence for Question Set

**Decision**: Persist the randomly selected list of question IDs in `sessionStorage` at the start of a stage, keyed by the stage ID (e.g., `present-simple-conjugation-session`).

**Rationale**: The requirement (FR-005) dictates that the question set remains stable if the user reloads the page (F5) during a session. `sessionStorage` is perfectly suited for this, as it persists across reloads but clears when the tab/window is closed, neatly defining a "session" matching the user's mental model. When a stage component mounts, it checks `sessionStorage`. If valid data exists, it uses it; otherwise, it generates a new random set and saves it.

**Alternatives considered**:
- `localStorage`: Rejected because we want a new random set if the user closes and re-opens the app, or explicitly starts a "new" session.
- URL Query Parameters: Would require updating the URL continuously, which is complex and pollutes the history.
- React state only: Lost on hard refresh.

## 3. Backward Compatibility of Progress Data

**Decision**: Keep the progress calculation logic dependent on the *session length* (20 questions total per module completion) rather than the *bank size*. 

**Rationale**: The `challengeCount` metadata will remain 20 (8+6+6). The `localStorage` progress saves how many challenges the user passed out of the total. By keeping the runtime length identical to the previous fixed length, old progress calculations and dashboards will continue to function correctly and calculate the same percentage. (FR-007, FR-008).

**Alternatives considered**:
- Migrating old data: Unnecessary risk since the required questions per session doesn't change.
