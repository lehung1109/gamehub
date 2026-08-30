# Feature Specification: Expand Sentence Sorting Data

**Feature Branch**: `018-longer-sorting-sentences`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "expand the sentence sorting game data to 50 sentences, each 10-12 words long, including noun phrases, adjectives, adverbs, and prepositional phrases. The spec must be self-contained and not rely on conversation history."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sorting complex English sentences (Priority: P1)

As an English learner, I want to practice sorting longer and more complex sentences (10-12 words) containing varied parts of speech (noun phrases, adjectives, adverbs, prepositional phrases) so that I can improve my reading comprehension and grammar skills at a higher level.

**Why this priority**: The primary goal is to provide a more challenging and engaging experience for users by upgrading the existing simple sentence data to more advanced sentences.

**Independent Test**: Can be fully tested by verifying the content of the sentence data source and ensuring that exactly 50 sentences meet the length and complexity requirements and render properly in the sorting game UI.

**Acceptance Scenarios**:

1. **Given** a user plays the sentence sorting game, **When** they load the level, **Then** they are presented with a scrambled sentence that is 10-12 words long.
2. **Given** the sentence data is loaded, **When** validating its contents, **Then** it must contain exactly 50 sentences, incorporating complex structures like noun phrases, adjectives, adverbs, and prepositional phrases.
3. **Given** the user encounters different sentences, **When** completing multiple rounds, **Then** the sentences span various familiar categories (e.g., daily-actions, nature, hobbies).

---

### Edge Cases

- What happens when a sentence contains exactly 10 words vs 12 words? (It should fit comfortably on most mobile and desktop screens, but responsive layout testing is required).
- How does the system handle very long individual words within the 10-12 word constraint? (The UI must wrap words appropriately without breaking the sorting tile visual).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide exactly 50 distinct English sentences for the sorting game.
- **FR-002**: Each sentence MUST have a length between 10 and 12 words.
- **FR-003**: The sentences MUST include a mix of grammatical structures including noun phrases, adjectives, adverbs, and prepositional phrases.
- **FR-004**: Each sentence MUST include a Vietnamese translation for reference.
- **FR-005**: Each sentence MUST include an associated emoji.
- **FR-006**: Each sentence MUST be assigned a category (e.g., `daily-actions`, `nature`, `hobbies`, `animals`, `school`).

### Key Entities

- **Sentence Item**: Represents a single sentence data entry containing an ID, an array of ordered words, the full sentence string, a Vietnamese translation, an emoji, and a category.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The total sentence count in the sorting data source is exactly 50.
- **SC-002**: 100% of the sentences are between 10 and 12 words in length.
- **SC-003**: 100% of the sentences correctly display their translation, category, and emoji in the UI without visual clipping.

## Assumptions

- The existing sentence sorting UI and logic are fully capable of handling 10-12 word arrays without requiring codebase modifications outside of data/layout styling.
- The categories used will be mostly familiar, standard topics suitable for language learners.
