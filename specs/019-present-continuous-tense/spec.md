# Feature Specification: Present Continuous Tense

**Feature Branch**: `019-present-continuous-tense`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "I want to add the Present Continuous tense following the existing pattern and data structure already present in the repository (like Present Simple). The spec must not depend on conversation history."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tense Discovery (Priority: P1)

Users should be able to see the Present Continuous tense listed as an active, playable tense on the main tenses hub/dashboard.

**Why this priority**: If users cannot find or access the tense, they cannot learn it. This is the entry point.

**Independent Test**: Can be fully tested by loading the tenses list page and verifying that Present Continuous is visible and its status is "active" instead of "coming_soon".

**Acceptance Scenarios**:

1. **Given** the user is on the tenses selection page, **When** they view the list of present tenses, **Then** they see "Present Continuous" with an "active" status and can click on it.

---

### User Story 2 - Learn Rules and Complete Challenges (Priority: P2)

Users should be able to click into the Present Continuous tense, read the grammatical rules (Quick Rules), and complete a set of interactive challenges to test their knowledge.

**Why this priority**: This is the core educational value of the feature.

**Independent Test**: Can be fully tested by navigating directly to the Present Continuous tense page and verifying that the rules render correctly and the challenges can be played through to completion.

**Acceptance Scenarios**:

1. **Given** the user is on the Present Continuous tense page, **When** they view the content, **Then** they see the quick rules (e.g., "To Be + V-ing") and tips.
2. **Given** the user has started the Present Continuous challenges, **When** they answer questions (fill-in-the-blank, sentence building, etc.), **Then** they receive immediate feedback and can progress to the end.

---

### Edge Cases

- What happens if a user's progress for this tense was previously corrupted or empty? (Should initialize safely).
- What happens if the `present-continuous.json` file is missing a required field expected by the UI components?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST list "Present Continuous" as an active tense in the tenses index data (`src/data/tenses/index.json`).
- **FR-002**: The system MUST provide a new data file (`src/data/tenses/present-continuous.json`) containing the metadata, quick rules, and challenges for the Present Continuous tense.
- **FR-003**: The data schema for the new tense MUST perfectly match the existing schema used by `present-simple.json` to ensure compatibility with existing UI components.
- **FR-004**: The tense MUST include at least 10 interactive challenges covering different challenge types (e.g., conjugation, sentence building, error hunting).
- **FR-005**: The grammatical rules MUST focus on workplace/business contexts, matching the theme of the application.

### Key Entities

- **Tense Index Entry**: Defines the ID, slug, name, group, status, and descriptive metadata for the tense.
- **Quick Rules**: Grammatical rules (formulas, examples in business English, exceptions).
- **Challenges**: Interactive questions with specific types, scenarios, correct answers, options, and explanations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully launch the Present Continuous tense from the UI.
- **SC-002**: Users can complete all provided challenges for the Present Continuous tense without encountering application crashes or data schema errors.
- **SC-003**: The Present Continuous tense data is parsed and rendered correctly by the existing generic tense page component (`src/app/tenses/[slug]/page.tsx`).

## Assumptions

- The existing UI components for displaying tenses and challenges are fully generic and data-driven, meaning no React/Next.js code changes are required beyond creating the JSON data files.
- An initial set of 10 challenges is sufficient for the first release, with more to be added later if needed.
- The user interface supports the `active` status flag to enable click-through.
