# Feature Specification: stage-result-review

**Feature Branch**: `[013-stage-result-review]`

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: "sau submit 1 chặn thì luôn hiển thị kết quả, ngoài ta tăng số lượng câu hỏi lên 20, mỗi lần lấy random 10 câu. Cho phép xem lại những kết quả mình đã làm. Áp dụng cho cả 4 chặng (có DevOps). Lưu kết quả vào Local Storage để xem lại được các lần làm trước đó."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Stage Result Summary (Priority: P1)

As a learner, I want to see a summary of my performance immediately after finishing a stage so I know how well I did before moving on.

**Why this priority**: Immediate feedback is crucial for learning. Without this, users are abruptly dropped back to the menu without a clear sense of closure or achievement for the stage they just completed.

**Independent Test**: Can be fully tested by completing all questions in any stage and verifying that a summary screen appears displaying the correct score and evaluation, instead of returning to the stage selection menu.

**Acceptance Scenarios**:

1. **Given** a user is on the last question of a stage, **When** they submit their answer and click to proceed, **Then** a Stage Result Summary screen is displayed.
2. **Given** the Stage Result Summary screen is displayed, **When** the user checks their stats, **Then** the score, accuracy percentage, and an appropriate evaluation message are correctly shown.

---

### User Story 2 - Review Detailed Question History (Priority: P2)

As a learner, I want to review my specific answers for the questions I just completed, so I can understand my mistakes and learn from the explanations.

**Why this priority**: Seeing a score isn't enough; users need to know *what* they got wrong and *why* to actually improve their grammar skills.

**Independent Test**: Can be fully tested by clicking a "Review" button on the summary screen and verifying that all attempted questions, along with the user's answers and the correct answers, are displayed accurately.

**Acceptance Scenarios**:

1. **Given** a user is on the Stage Result Summary or Completion Dashboard, **When** they click "Xem chi tiết" (View Details), **Then** a list of all questions from that attempt is displayed.
2. **Given** the detailed history view, **Then** each item clearly shows the context, the user's submitted answer, the correct answer, a correct/incorrect visual indicator, and the grammar explanation.

---

### User Story 3 - Expanded Random Question Bank (Priority: P3)

As a learner, I want to encounter different questions when I replay a stage so I can continue practicing without simply memorizing the same set of answers.

**Why this priority**: Replayability is key for retention. Expanding the bank to 20 and selecting 10 randomly ensures varied practice sessions.

**Independent Test**: Can be fully tested by starting a stage multiple times and verifying that exactly 10 questions are presented each time, and the sets vary between sessions.

**Acceptance Scenarios**:

1. **Given** a user starts any of the 4 stages, **Then** exactly 10 questions are loaded for the session.
2. **Given** a user completes a stage and replays it (starting a new session), **Then** a new random selection of 10 questions is drawn from the 20-question bank.

---

### User Story 4 - Persisted History Across Sessions (Priority: P4)

As a learner, I want my detailed answer history saved so that if I close the app and come back later, I can still review my past mistakes.

**Why this priority**: Users shouldn't lose their learning history just because they refreshed the page or closed the browser.

**Independent Test**: Can be fully tested by completing a stage, closing the browser, reopening it to the dashboard, and verifying the detailed review data is still accessible.

**Acceptance Scenarios**:

1. **Given** a user completes a stage, **When** they reload the page and navigate to the Completion Dashboard, **Then** they can still access the detailed question history for their past attempt.

### Edge Cases

- What happens when the underlying question bank has fewer than 10 questions? (The system should gracefully load all available questions up to 10).
- How does the system handle storage limits if Local Storage fills up with detailed history? (It should only store the *latest* attempt history per stage to avoid unbounded growth).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a Stage Result Summary UI immediately after a user completes the final question in any of the 4 stages (Conjugation, ErrorHunting, SentenceBuilding, DevOpsChallenge).
- **FR-002**: The Stage Result Summary MUST display the user's score, total questions, accuracy percentage, and a qualitative evaluation.
- **FR-003**: The system MUST provide a Detailed Review UI that breaks down the user's attempt, showing the question scenario, the user's submitted answer, the correct answer, a correct/incorrect status indicator, and the explanation.
- **FR-004**: The system MUST persist the detailed attempt history (the specific questions and the user's answers) to Local Storage.
- **FR-005**: The Detailed Review UI MUST be accessible via buttons from both the Stage Result Summary and the overall Completion Dashboard.
- **FR-006**: The data source MUST contain at least 20 questions for each of the 4 stages.
- **FR-007**: The system MUST randomly select exactly 10 questions from the available bank each time a user starts a new practice session for a stage.
- **FR-008**: The storage mechanism MUST overwrite the previous attempt history for a stage with the new attempt history when a user replays a stage, to prevent Local Storage bloat.

### Key Entities *(include if feature involves data)*

- **AttemptHistory**: Represents a user's specific answers during a single session of a stage. Contains references to the questions asked, the user's submitted answers, and the correctness status.
- **TenseUserProgressRecord**: The overall progress record, which will be updated to hold or link to the `AttemptHistory` for each stage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate from completing the final question of a stage to viewing their detailed answer breakdown in 2 clicks or fewer.
- **SC-002**: 100% of new stage sessions load exactly 10 questions (or the maximum available if less than 10 exist).
- **SC-003**: A user can close the browser and reopen it, and successfully view their detailed answer history from their previous session 100% of the time.

## Assumptions

- Users have modern browsers supporting standard Local Storage limits (usually ~5MB), which is more than enough for storing text-based attempt histories.
- The 20 questions for each stage will be added directly to the existing JSON data file (`present-simple.json`).
