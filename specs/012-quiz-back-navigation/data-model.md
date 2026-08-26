# Phase 1: Data Model

## Entities

### `QuizEngine` State

We need to track the user's answers across questions.

**Current State**:
- `currentIndex`: `number` - The currently displayed question index.
- `selectedOption`: `number | null` - The option selected for the *current* question.
- `score`: `number` - A running integer of correct answers.

**Target State**:
- `currentIndex`: `number` - Same.
- `answers`: `Record<number, number>` - A map where the key is the question index and the value is the selected option index.
- `score`: Can either be derived dynamically or updated securely based on previous vs new answers.

**Validation Rules**:
- When `answers[currentIndex]` exists, the UI should pre-select that option.
- Users can change `answers[currentIndex]`.
- The final score is `count(answers[i] === questions[i].correctIndex)`.

**State Transitions**:
- On select option `o` at index `i`: `answers = { ...answers, [i]: o }`.
- On click "Back": `currentIndex = max(0, currentIndex - 1)`.
- On click "Continue" (or auto-advance): `currentIndex = min(total - 1, currentIndex + 1)`. If `currentIndex === total - 1`, complete the quiz.
