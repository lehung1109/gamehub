# Feature Specification: Typing / Fill-in-the-Blanks

**Feature Branch**: `[024-typing-fill-in-blanks]`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Ý tưởng 2: Dự án 2: Fill-in-the-Blanks / Typing (Ngữ pháp & Chủ động - B): Dạng game khai thác tối đa kho dữ liệu về Tenses của bạn. Người học đọc một câu chưa hoàn chỉnh và phải tự gõ (typing) từ/cụm từ bị thiếu vào chỗ trống (thay vì kéo thả dễ dàng). Trọng tâm là ghi nhớ chính xác cấu trúc."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Active Grammar Recall via Typing (Priority: P1)

As a learner, I want to read an incomplete sentence and type the missing word(s) into a blank space, so that I can actively practice English grammar rules and tenses.

**Why this priority**: This is the core MVP, focusing on active recall rather than passive recognition (multiple choice/drag and drop).

**Independent Test**: Can be fully tested by loading a question, typing an answer into an input field, submitting it, and seeing whether it is correct or incorrect.

**Acceptance Scenarios**:

1. **Given** an incomplete sentence is displayed with a blank space, **When** the learner types a word and submits, **Then** the system checks the input against the correct answer.
2. **Given** the learner submits the correct word, **Then** the blank is filled with green text and a success sound plays.
3. **Given** the learner submits an incorrect word, **Then** the input is marked in red, and the correct answer is revealed along with a brief grammar explanation.

### User Story 2 - Contextual Hints (Priority: P2)

As a learner, I want to see a hint (such as the base form of a verb) near the blank, so that I know what word I am supposed to conjugate.

**Why this priority**: Helps guide the learner without giving away the exact answer, essential for practicing specific tenses.

**Independent Test**: Can be tested by verifying that hints are visible for applicable questions and accurately reflect the base word required.

**Acceptance Scenarios**:

1. **Given** a question testing the past continuous tense, **When** the blank appears, **Then** the base verb (e.g., "(to play)") is displayed in parentheses next to or under the blank.

### Edge Cases

- What happens if the user accidentally types extra spaces or uses different capitalization? (The system should trim whitespace and be case-insensitive during validation).
- What happens if there are multiple valid answers (e.g., contractions like "don't" vs "do not")? (System should accept a list of valid aliases).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a sentence with one or more interactive text input fields representing blanks.
- **FR-002**: System MUST allow learners to type their answers using a physical or on-screen keyboard.
- **FR-003**: System MUST evaluate the typed input by ignoring case and trailing/leading whitespace.
- **FR-004**: System MUST support multiple valid correct answers for a single blank (e.g., allowing both "cannot" and "can't").
- **FR-005**: System MUST provide immediate feedback and display the underlying grammar rule (e.g., tense structure) upon answering.
- **FR-006**: System MUST draw questions from the existing `src/data/tenses` data structure.

### Key Entities

- **FillBlankQuestion**: Represents a single grammar question. Contains the sentence with a placeholder, the base word hint, a list of acceptable answers, and an explanation of the grammar rule.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The game correctly validates inputs with varying capitalization and whitespace 100% of the time.
- **SC-002**: Users can complete a 10-question quiz in under 5 minutes.
- **SC-003**: 90% of learners report that the typing mechanism helps them remember grammar better than multiple choice.

## Assumptions

- Users have a keyboard (physical or virtual on mobile devices) to type answers.
- The existing Tenses data structure can be mapped or slightly extended to provide the "sentence with blank" format and acceptable answers.
