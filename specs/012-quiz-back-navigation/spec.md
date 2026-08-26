# Feature Specification: Quiz Back Navigation

**Feature Branch**: `[012-quiz-back-navigation]`

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: "Thêm tính năng cho phép quay lại các câu đã trả lời. Được phép chọn lại đáp án và cập nhật điểm số."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate Back to Previous Question (Priority: P1)

Users can navigate to a previously answered question to review it and possibly change their answer.

**Why this priority**: It fulfills the core feature request of allowing navigation to past questions.

**Independent Test**: Can be fully tested by answering a question, clicking back, and verifying the previous question is displayed.

**Acceptance Scenarios**:

1. **Given** the user is on question 2 or later, **When** they click the "Back" button, **Then** they are shown the previous question with their previous answer selected.
2. **Given** the user is on the first question, **Then** the "Back" button should not be visible or should be disabled.

---

### User Story 2 - Update Answer and Score (Priority: P1)

When navigating back to a previously answered question, users can select a different answer, which updates their overall score.

**Why this priority**: Core requirement for allowing users to correct mistakes.

**Independent Test**: Answer a question, go back, change the answer from wrong to right (or vice versa), and verify the final score reflects the latest choice.

**Acceptance Scenarios**:

1. **Given** the user is viewing a previously answered question, **When** they select a new option, **Then** the option is highlighted, feedback is shown, and the system proceeds to the next question.
2. **Given** the user changed their answer from incorrect to correct, **When** they finish the quiz, **Then** their final score includes the point for that question.
3. **Given** the user changed their answer from correct to incorrect, **When** they finish the quiz, **Then** their final score does not include the point for that question.

### Edge Cases

- **Fast clicking**: If the user clicks "Back" multiple times quickly, does it skip multiple questions? The system should handle this gracefully and navigate back sequentially.
- **Refresh page**: If the user refreshes the page, the state (including previous answers) might be lost. This is acceptable for now.
- **First question**: The user cannot navigate further back than the first question.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a "Back" navigation control when the user is on any question after the first one.
- **FR-002**: System MUST hide or disable the "Back" control on the first question.
- **FR-003**: System MUST remember the user's selected answer for every question.
- **FR-004**: When returning to a previous question, the system MUST display the previously selected answer.
- **FR-005**: System MUST allow the user to select a new answer on a previously answered question.
- **FR-006**: System MUST calculate the total score correctly based on the user's latest answers to all questions upon completion.
- **FR-007**: Upon selecting a new answer for a previous question, the system MUST automatically advance the user to the next sequential question after displaying feedback.

### Key Entities

- **Quiz State**: Represents the current progress, storing the index of the current question and a map of question indices to their selected answers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully return to any previously answered question.
- **SC-002**: Final score accurately reflects the latest answers provided, regardless of how many times an answer was changed.
- **SC-003**: The UI layout remains stable without shifting when the "Back" button appears or disappears.

## Assumptions

- Users navigate back one question at a time (no summary screen navigation required).
- When an answer is changed on a previous question, the user continues from that point sequentially; no "jump to furthest reached question" feature is required.
- The total number of questions remains constant during the quiz.
