# Feature Specification: Conversational Roleplay

**Feature Branch**: `[023-conversational-roleplay]`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Ý tưởng 1: Dự án 1: Conversational Roleplay (Giao tiếp thực tế - A): Một dạng game mô phỏng hội thoại (ví dụ: giao diện tin nhắn chat). Người học đọc ngữ cảnh và phải chọn hoặc tự gõ câu phản hồi phù hợp. Trọng tâm là tính ứng dụng thực tế."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interactive Chat Roleplay (Priority: P1)

As a learner, I want to participate in a simulated chat conversation by choosing the correct response to a given context, so that I can practice real-life communication.

**Why this priority**: This is the core MVP of the conversational roleplay feature, allowing users to practice realistic dialogues.

**Independent Test**: Can be fully tested by starting a game session, reading a prompt from a virtual character, selecting a response, and receiving feedback on the choice.

**Acceptance Scenarios**:

1. **Given** a learner is in a conversational roleplay game, **When** the virtual character sends a message, **Then** the learner is presented with multiple response options.
2. **Given** the learner sees response options, **When** they select the correct response, **Then** the chat continues logically and the learner earns points.
3. **Given** the learner sees response options, **When** they select an incorrect response, **Then** the game provides immediate corrective feedback and explains why the choice was wrong.

### User Story 2 - Audio Playback for Chat Messages (Priority: P2)

As a learner, I want to hear the chat messages spoken aloud, so that I can improve my listening skills along with my reading skills.

**Why this priority**: Enhances the realism of the conversation and helps with pronunciation and listening comprehension.

**Independent Test**: Can be independently tested by clicking an audio icon next to a message bubble and verifying that the correct text-to-speech audio plays.

**Acceptance Scenarios**:

1. **Given** a message is displayed in the chat, **When** the learner clicks the audio icon, **Then** the text is read aloud clearly.
2. **Given** the auto-speak setting is enabled, **When** a new message appears, **Then** the audio plays automatically.

### Edge Cases

- What happens when a conversation reaches the end? (Should show a completion screen with a score summary).
- How does system handle rapid clicking on response options? (Should disable other options once an answer is selected until the next turn).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present a chat-like interface displaying a conversation history between the learner and a virtual character.
- **FR-002**: System MUST load conversational scenarios (context, character messages, correct/incorrect response options) from structured data.
- **FR-003**: System MUST evaluate the learner's selected response and provide visual feedback (correct/incorrect).
- **FR-004**: System MUST play audio for chat messages using text-to-speech.
- **FR-005**: System MUST track the learner's score based on correct responses and save progress when the conversation is completed.

### Key Entities

- **ConversationScenario**: Represents a complete roleplay module (e.g., "Ordering Food", "Meeting a New Friend"). Contains title, description, and an array of dialogue turns.
- **DialogueTurn**: Represents one step in the conversation. Contains the character's prompt and a list of possible learner responses.
- **LearnerResponse**: Represents an option the learner can choose. Contains the text, a boolean indicating if it's correct, and optional feedback text for incorrect choices.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Learners can complete a standard 5-turn conversation scenario in under 3 minutes.
- **SC-002**: 85% of learners who start a conversation module successfully reach the end.
- **SC-003**: The chat interface feels responsive with no noticeable lag (under 100ms) between selecting an answer and the next character message appearing.

## Assumptions

- Users have stable internet connectivity to load scenarios and play audio.
- The existing text-to-speech mechanism used in other games (like Flashcard) will be reused here.
- The initial version will use multiple-choice selection rather than free-text typing for responses, to ensure accurate validation.
