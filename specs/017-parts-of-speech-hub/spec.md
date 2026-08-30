# Feature Specification: Parts of Speech Hub

**Feature Branch**: `017-parts-of-speech-hub`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "theo hướng 1 bên trên" (Standalone Parts of Speech Hub with Noun, Verb, Adjective, Adverb, Mixed lessons and 3 stages: Word Family, Fill-in Blank, Error Hunting, targeting working adults)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate Parts of Speech Hub (Priority: P1)

As a working adult/student, I want to see a Hub page listing all Parts of Speech lessons so that I can choose which word type to practice.

**Why this priority**: Without the hub, users cannot access the lessons. It's the entry point to the feature.

**Independent Test**: Can be fully tested by verifying the Hub page renders the lessons (Noun, Verb, Adjective, Adverb, Mixed) and allows navigation to a specific lesson, even if the lesson itself is empty.

**Acceptance Scenarios**:

1. **Given** I am on the main GameHub page, **When** I click the "Parts of Speech" link, **Then** I am taken to the Parts of Speech Hub map.
2. **Given** I am on the Parts of Speech Hub, **When** I select "Danh từ (Noun)", **Then** I am navigated to the Noun lesson page.

---

### User Story 2 - Practice Word Families (Priority: P1)

As a learner, I want to practice identifying word families (e.g., adding suffixes like -ment, -tion, -ly) so that I can recognize word types quickly.

**Why this priority**: Word formation is the foundational skill for mastering parts of speech.

**Independent Test**: Can be fully tested by implementing the "Word Family" stage in isolation, loading mock data, and verifying the drag-and-drop or matching interactions work correctly.

**Acceptance Scenarios**:

1. **Given** I am in the Word Family stage, **When** I match a base word with the correct suffix to form a noun, **Then** the system marks it as correct and shows an explanation.
2. **Given** I complete all questions in the Word Family stage, **Then** I see my score and can proceed to the next stage.

---

### User Story 3 - Practice Fill-in Blanks in Context (Priority: P2)

As a learner, I want to practice choosing the correct word form to fill in the blanks in workplace sentences/emails so that I know where each word type belongs in a sentence.

**Why this priority**: Applying word types in context is the practical application of the foundational skill.

**Independent Test**: Can be fully tested by implementing the "Fill-in Blank" stage independently and verifying the multiple-choice logic works.

**Acceptance Scenarios**:

1. **Given** I am presented with an email sentence with a missing word, **When** I select the correct part of speech option, **Then** the blank is filled and marked correct.

---

### User Story 4 - Error Hunting (Priority: P2)

As a learner, I want to find and correct words that are used in the wrong form in a sentence so that I can self-edit my workplace writing.

**Why this priority**: Error hunting reinforces the knowledge and mimics real-world proofreading.

**Independent Test**: Can be fully tested by implementing the "Error Hunting" stage, reusing logic from the Tenses Error Hunting if possible.

**Acceptance Scenarios**:

1. **Given** I see a sentence with an incorrect word form, **When** I click the wrong word and select the correct form from the options, **Then** the sentence is fixed and marked correct.

### Edge Cases

- What happens when the user abandons a stage halfway through? (Should progress be saved or reset?)
- How does system handle lessons that have no data prepared yet? (Should they be marked "Coming Soon"?)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dedicated Hub route `/parts-of-speech` (or similar) listing the lessons: Noun, Verb, Adjective, Adverb, Mixed.
- **FR-002**: System MUST structure each lesson into 3 stages: Word Family, Fill-in Blank, Error Hunting.
- **FR-003**: System MUST provide a "Word Family" interactive stage where users can construct or identify word forms.
- **FR-004**: System MUST provide a "Fill-in Blank" stage presenting workplace contexts (emails/messages).
- **FR-005**: System MUST provide an "Error Hunting" stage where users identify grammar mistakes related to parts of speech.
- **FR-006**: System MUST track and persist the user's progress through each stage of a lesson.
- **FR-007**: System MUST provide a Quick Rules/Grammar summary section for each lesson before the challenges begin.

### Key Entities

- **LessonMetadata**: Information about the lesson (e.g., id: "noun", name: "Danh từ", status).
- **WordFamilyItem**: A challenge item requiring the user to match base words with suffixes/prefixes or identify the word family.
- **FillInBlankItem**: A challenge item with a context sentence and multiple-choice options for the blank.
- **ErrorHuntingItem**: A challenge item with an incorrect sentence, requiring identification of the wrong token and its correction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate to the Parts of Speech Hub and access all 5 lesson placeholders.
- **SC-002**: Users can complete a full 3-stage lesson (with mock or real data) from start to finish without errors.
- **SC-003**: User progress for each stage is accurately recorded and displayed upon returning to the Hub.

## Assumptions

- We assume the existing UI components and data structures from the "Tenses" feature can be heavily reused or adapted for this feature.
- We assume local storage is sufficient for progress tracking (matching the current Tenses implementation).
- We assume data for at least one lesson (e.g., Noun) will be created as part of the initial implementation to verify the system works.
