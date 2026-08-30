# Research: Complete Past Tenses

## Technical Choices & Unknowns

**Unknown**: JSON structure and validation for tense data.
- **Decision**: Use the exact JSON schema currently used for Present Tenses.
- **Rationale**: Reusing the existing structure ensures that the current UI components can consume the new Past Tense data without requiring any structural code changes, as per the assumptions in the spec.
- **Alternatives considered**: Defining a new schema for past tenses (rejected because it would require updating the UI and data fetching layers).

**Unknown**: Context and content generation.
- **Decision**: Generate content strictly focused on IT/Workplace scenarios.
- **Rationale**: The specification explicitly mandates an IT/Workplace context for all sentences and explanations to maintain consistency with the application's theme.
- **Alternatives considered**: General English context (rejected as it violates the core requirement of the app).
