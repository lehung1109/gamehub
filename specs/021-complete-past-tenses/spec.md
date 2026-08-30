# Feature Specification: Complete Past Tenses

**Feature Branch**: `021-complete-past-tenses`
**Created**: 2026-08-30
**Status**: Draft
**Input**: User description: "Hoàn thiện thì quá khứ"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Practice Past Simple Tense (Priority: P1)
Users learning English grammar should be able to practice the Past Simple tense through various interactive workplace-themed challenges.
**Independent Test**: Can be fully tested by navigating to the "Past Simple" node on the Tense Hub map and playing through the challenges.
**Acceptance Scenarios**:
1. **Given** the user is on the Tense Hub map, **When** they look at the "Past Simple" node, **Then** it should be active and clickable instead of "coming soon".
2. **Given** the user enters the Past Simple lesson, **When** they start practicing, **Then** they should receive questions reflecting workplace scenarios in the past.

### User Story 2 - Practice Past Continuous Tense (Priority: P1)
Users should be able to practice the Past Continuous tense through interactive challenges.
**Independent Test**: Can be fully tested by navigating to the "Past Continuous" node and playing through the lesson.
**Acceptance Scenarios**:
1. **Given** the user is on the Tense Hub map, **When** they look at the "Past Continuous" node, **Then** it should be active and clickable.

### User Story 3 - Practice Past Perfect Tense (Priority: P2)
Users should be able to practice the Past Perfect tense through interactive challenges.
**Independent Test**: Can be fully tested by navigating to the "Past Perfect" node and playing through the lesson.
**Acceptance Scenarios**:
1. **Given** the user is on the Tense Hub map, **When** they look at the "Past Perfect" node, **Then** it should be active and clickable.

### User Story 4 - Practice Past Perfect Continuous Tense (Priority: P2)
Users should be able to practice the Past Perfect Continuous tense through interactive challenges.
**Independent Test**: Can be fully tested by navigating to the "Past Perfect Continuous" node and playing through the lesson.
**Acceptance Scenarios**:
1. **Given** the user is on the Tense Hub map, **When** they look at the "Past Perfect Continuous" node, **Then** it should be active and clickable.

### Edge Cases
- Missing arrays or properties in JSON data must be avoided by rigorous pre-flight validation.
- All grammar rule cards and challenges must match the IT/Workplace context established in the app.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide four new static data files: `past-simple.json`, `past-continuous.json`, `past-perfect.json`, and `past-perfect-continuous.json`.
- **FR-002**: Each tense data file MUST contain `metadata`, `quickRules`, and precisely 80 challenges (20 `conjugation`, 20 `errorHunting`, 20 `sentenceBuilding`, 20 `devOpsChallenge`).
- **FR-003**: The `src/data/tenses/index.json` manifest MUST be updated to set the status of all 4 past tenses to `"active"`.
- **FR-004**: All generated sentences and explanations MUST follow an IT/Workplace context.

### Key Entities

- **Tense JSON Data**: Contains `metadata`, `quickRules`, and `challenges` representing different stages.
- **Tense Manifest (`index.json`)**: Tracks the overall status (`active` vs `coming_soon`) of all 12 English tenses.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Four new tense JSON files are successfully created and stored in `src/data/tenses/`.
- **SC-002**: Each new JSON file contains exactly 20 items for each of the 4 challenge categories (80 total per tense).
- **SC-003**: `index.json` correctly reflects `"status": "active"` for the 4 past tenses.
- **SC-004**: The application passes all schema validation and type-checking tests for the new data without errors.
- **SC-005**: Users can navigate to any of the 4 past tenses from the hub map and play the lessons continuously.

## Assumptions

- We assume the requirement of "20 challenges per category" from the previous "Present Tenses" feature carries over to ensure consistency across all tenses.
- We assume the existing UI components (which flawlessly handled present tenses) will support the past tenses without requiring structural code changes.
- The context is strictly IT/Workplace.
