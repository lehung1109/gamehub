# Research: Present Continuous Tense Data

## Decisions

### 1. Data Schema Compatibility
*   **Decision**: Strictly adhere to the existing schema used in `src/data/tenses/present-simple.json`.
*   **Rationale**: The existing Next.js application (App Router) has generic UI components that consume this exact structure. Reusing the schema ensures zero code changes are required in the React components, honoring the "Test-First" and "Component-Driven UI" principles by minimizing risk.
*   **Alternatives considered**: Creating a new specific component for Present Continuous. Rejected because it violates DRY and adds unnecessary complexity to the codebase.

### 2. Testing Approach
*   **Decision**: Update or add data validation tests in Vitest to ensure the new `present-continuous.json` file meets structural constraints (e.g., has at least 10 challenges, correct `quickRules` structure). 
*   **Rationale**: Aligns with the Constitution's "Test-First (NON-NEGOTIABLE)" principle. We must verify the data structure before/during implementation to prevent UI crashes.
*   **Alternatives considered**: Relying purely on E2E or manual testing. Rejected because data validation is best done at the unit test level with Vitest.
