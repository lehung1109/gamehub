# Research & Technical Decisions: Typing / Fill-in-the-Blanks

## Decision: Data Source
- **Decision**: Reuse the existing `src/data/tenses/*.json` files.
- **Rationale**: The existing data already contains `sentence` (often with underscores or brackets) and answers. We just need to parse the sentence format dynamically.
- **Alternatives considered**: Creating a new data folder `src/data/typing/`. Rejected to avoid data duplication.

## Decision: Input Field UX on Mobile
- **Decision**: Use `<input type="text" autoCapitalize="none" autoComplete="off" autoCorrect="off" spellCheck="false" />`.
- **Rationale**: Mobile keyboards often auto-capitalize the first letter, which might confuse users if they think case matters (even though our validation will ignore it). Disabling auto-correct prevents the OS from changing the user's intended spelling, which is critical for a spelling/grammar test.

## Decision: Validation Logic
- **Decision**: Implement a pure utility function `validateAnswer(input: string, correctAnswers: string[]): boolean` that trims whitespace, converts to lowercase, and checks for inclusion.
- **Rationale**: Easy to unit test with Vitest.
