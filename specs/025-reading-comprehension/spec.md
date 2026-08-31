# Feature Specification: Reading Comprehension

**Feature Branch**: `[025-reading-comprehension]`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Ý tưởng 3: Dự án 3: Reading Comprehension (Đọc hiểu - C): Dạng bài cung cấp một đoạn văn ngắn, email hoặc câu chuyện, kèm theo một chuỗi câu hỏi trắc nghiệm (Multiple Choice) kiểm tra mức độ hiểu từ vựng và ngữ cảnh."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reading Passage and Quiz (Priority: P1)

As a learner, I want to read a short English text and answer related multiple-choice questions, so that I can practice and test my reading comprehension skills.

**Why this priority**: This is the core MVP of the reading comprehension module, validating the ability to understand context.

**Independent Test**: Can be tested by loading a reading module, displaying a passage on one side of the screen (or top), and rendering multiple-choice questions that can be answered and scored.

**Acceptance Scenarios**:

1. **Given** a learner opens a reading module, **When** the page loads, **Then** a text passage (story, email, article) is displayed clearly.
2. **Given** the learner has read the text, **When** they scroll or look at the question section, **Then** they see multiple-choice questions related to the text.
3. **Given** the learner selects an answer, **Then** the system immediately marks it as correct or incorrect and provides a brief explanation referencing the text.

### User Story 2 - Vocabulary Highlighting (Priority: P2)

As a learner, I want to see difficult vocabulary words highlighted in the text, so that I can tap/click them to see their definition without leaving the passage.

**Why this priority**: Encourages learning new words in context rather than just guessing, improving vocabulary retention.

**Independent Test**: Can be tested by clicking a highlighted word in the reading passage and verifying a small tooltip or modal appears with the definition.

**Acceptance Scenarios**:

1. **Given** a reading passage with difficult words, **When** the learner views the text, **Then** these words are visually distinct (e.g., underlined or bolded).
2. **Given** a visually distinct word, **When** the learner taps/clicks it, **Then** a definition and translation appear.

### Edge Cases

- How does the layout handle long reading passages on mobile devices? (The passage and questions should be presented in a scrollable, stacked view, or a tabbed interface on smaller screens).
- What happens if the user tries to submit without answering all questions? (The system should prompt the user to complete all questions if it's a batch-submission mode, or allow answering one by one).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a reading passage (paragraphs, emails, etc.) with proper formatting (line breaks, bold text).
- **FR-002**: System MUST render a list of multiple-choice questions associated with the current reading passage.
- **FR-003**: System MUST provide a responsive layout where both the text and the questions are accessible (e.g., side-by-side on desktop, stacked on mobile).
- **FR-004**: System MUST allow tapping/clicking on predefined vocabulary words within the text to display a definition tooltip.
- **FR-005**: System MUST track the user's score based on correct answers and save the module as completed.

### Key Entities

- **ReadingPassage**: Represents the text content. Contains a title, difficulty level, the main text body (potentially formatted with HTML/Markdown), and a list of predefined vocabulary words.
- **ReadingQuestion**: Represents a single multiple-choice question. Contains the question text, 3-4 options, the correct option index, and explanation text.
- **VocabularyGlossary**: A mapping of words in the passage to their definitions/translations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Learners can comfortably read passages and answer questions on both desktop and mobile devices without losing context (verified by usability testing).
- **SC-002**: 80% of learners score at least 60% on their first attempt of a reading module appropriate for their level.
- **SC-003**: Vocabulary tooltips open in under 50ms upon click/tap.

## Assumptions

- Users have a basic level of English to read short passages.
- Reading materials will be pre-authored and stored as JSON or Markdown data in the project structure.
- The questions will be answered one by one (immediate feedback) rather than all at once at the end, consistent with typical interactive learning apps.
