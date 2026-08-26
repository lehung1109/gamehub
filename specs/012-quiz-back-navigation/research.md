# Phase 0: Research

**Feature**: Quiz Back Navigation

## State Management

- **Decision**: Use React `useState` to store the history of answers as a dictionary/record map of `questionIndex -> optionIndex`.
- **Rationale**: The Constitution mandates that no external state management libraries should be used unless complexity demands it. The scope of adding a map of answers to an existing component (`QuizEngine`) is small enough to be handled directly by React state.
- **Alternatives considered**: Redux, Zustand, React Context. Rejected because they violate the "start simple, apply YAGNI" and "no state management libraries" constitution clauses.

## Score Calculation

- **Decision**: Derive the score dynamically by iterating over the recorded answers map when the quiz completes, comparing them to the correct answers.
- **Rationale**: Currently, `score` is tracked as an integer that simply increments on correct answers. Because users can change answers from correct to incorrect, tracking a single integer becomes error-prone. By calculating the score from the raw answers at the end (or dynamically per render), we guarantee accuracy.
- **Alternatives considered**: Incrementing/decrementing a running score state when answers change. Rejected because computing it from the source of truth (the answers map) is more resilient and less prone to off-by-one or tracking bugs.
