# Feature Specification: Complete Present Perfect and Present Perfect Continuous Tenses

**Feature Branch**: `020-present-perfect-tenses`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "hoàn thiện thì hiện tại hoàn thành và hiện tại hoàn thành tiếp diễn trong 12 thì hiện tại. dựa theo ý tưởng bên trên, và đảm bảo mỗi thì sẽ có 20 câu hỏi mỗi loại. Đảm bảo các file .md ko phụ thuộc vào lịch sử chat"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Practice Present Perfect Tense (Priority: P1)

Users learning English grammar should be able to practice the Present Perfect tense through various interactive workplace-themed challenges.

**Why this priority**: Core functionality needed to complete the current learning module for the "Present" tense group.

**Independent Test**: Can be fully tested by navigating to the Present Perfect tense lesson and successfully playing through Conjugation, Error Hunting, Sentence Building, and DevOps challenge stages.

**Acceptance Scenarios**:

1. **Given** the user is on the Tense Hub map, **When** they look at the "Present Perfect" node, **Then** it should be active and clickable instead of "coming soon".
2. **Given** the user enters the Present Perfect lesson, **When** they start practicing, **Then** they should receive questions randomly drawn from a pool of 80 total challenges (20 per category: conjugation, error hunting, sentence building, devops).

---

### User Story 2 - Practice Present Perfect Continuous Tense (Priority: P1)

Users learning English grammar should be able to practice the Present Perfect Continuous tense with an equivalent depth of content.

**Why this priority**: Essential to complete the final tense in the "Present" tense group module.

**Independent Test**: Can be fully tested by navigating to the Present Perfect Continuous tense lesson and interacting with its unique set of 80 workplace-themed challenges.

**Acceptance Scenarios**:

1. **Given** the user is on the Tense Hub map, **When** they look at the "Present Perfect Continuous" node, **Then** it should be active and clickable.
2. **Given** the user enters the Present Perfect Continuous lesson, **When** they play the challenges, **Then** the questions accurately reflect the grammar rules for the continuous form.

### Edge Cases

- What happens if the `challenges` array is malformed or missing a specific stage category? The application must load fallback questions or handle the missing data gracefully (though generating valid JSON ensures this edge case is mitigated).
- Are the sentences contextually appropriate for the workplace setting? They must follow the IT/Workplace theme established by `present-simple.json`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a data file `src/data/tenses/present-perfect.json` containing `metadata`, `quickRules`, and exactly 80 challenges (20 `conjugation`, 20 `errorHunting`, 20 `sentenceBuilding`, 20 `devOpsChallenge`).
- **FR-002**: The system MUST provide a data file `src/data/tenses/present-perfect-continuous.json` containing `metadata`, `quickRules`, and exactly 80 challenges (20 per category).
- **FR-003**: The `src/data/tenses/index.json` file MUST update the status of `present-perfect` and `present-perfect-continuous` to `"active"`.
- **FR-004**: All generated sentences and explanations MUST follow an IT/Workplace context, consistent with the existing game's theme.
- **FR-005**: All challenges MUST be valid according to the existing Typescript interfaces for tenses data.

### Key Entities

- **Tense JSON Data**: Contains `metadata` (id, status, level), `quickRules` (grammar formulas and examples), and `challenges` (arrays of question objects for 4 distinct game stages).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `src/data/tenses/present-perfect.json` is successfully created and contains precisely 20 items in each of the 4 challenge categories.
- **SC-002**: `src/data/tenses/present-perfect-continuous.json` is successfully created and contains precisely 20 items in each of the 4 challenge categories.
- **SC-003**: `src/data/tenses/index.json` reflects `"status": "active"` for both tenses.
- **SC-004**: The application compiles and runs without any TypeScript or JSON parsing errors regarding the newly added data.

## Assumptions

- The existing UI components (`TenseLessonContainer`, stages UI) are already fully capable of handling 20 questions per category without performance degradation, as they currently handle `present-simple` which has 20 questions per category.
- Translating the game context (IT/Workplace) into Vietnamese explanations is the expected format, matching existing JSON files.
