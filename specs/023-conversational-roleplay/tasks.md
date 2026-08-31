# Implementation Tasks: Conversational Roleplay

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directories for roleplay game: `src/app/games/roleplay/`, `src/components/roleplay/`, `src/data/conversations/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 [P] Create `ConversationScenario` and `DialogueTurn` interfaces in `src/types/roleplay.ts`
- [x] T003 [P] Create `RoleplayGameState` interface in `src/types/roleplay.ts`
- [x] T004 Create initial mock data file in `src/data/conversations/ordering-food.json` based on the data model
- [x] T005 Update `src/types/config.ts` to include `roleplay` in `GameSettingsMap` if necessary

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Interactive Chat Roleplay (Priority: P1)

**Goal**: Implement the core chat interface where learners read prompts and select responses.

**Independent Test**: Load the page, see the initial message, pick an answer, and get feedback.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create basic layout and routing in `src/app/games/roleplay/page.tsx`
- [x] T007 [P] [US1] Create `ChatBubble` component in `src/components/roleplay/ChatBubble.tsx`
- [x] T008 [P] [US1] Create `ResponseChoices` component in `src/components/roleplay/ResponseChoices.tsx`
- [x] T009 [US1] Create custom hook `useRoleplayGame` in `src/hooks/useRoleplayGame.ts` to manage game state (turns, score, validation)
- [x] T010 [US1] Integrate state hook and UI components in `src/app/games/roleplay/page.tsx` to handle the full chat flow

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Audio Playback for Chat Messages (Priority: P2)

**Goal**: Hear the chat messages spoken aloud using text-to-speech.

**Independent Test**: Click an audio icon next to a message bubble to hear it.

### Implementation for User Story 2

- [x] T011 [P] [US2] Create or extract an audio playback utility in `src/lib/speech.ts` (if not already existing from flashcard game)
- [x] T012 [US2] Update `ChatBubble.tsx` to include an audio playback icon that triggers the TTS engine
- [x] T013 [US2] Update `useRoleplayGame` state to handle auto-speak settings if configured
- [x] T014 [US2] Ensure speech synthesis works across different message turns without overlapping

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T015 [P] Add Framer Motion animations to `ChatBubble.tsx` for smooth message appearance
- [x] T016 [P] Update UI to handle completed scenario (Score Screen) in `src/app/games/roleplay/page.tsx`
- [x] T017 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup**: No dependencies.
- **Foundational**: Depends on Setup.
- **User Stories**: Depend on Foundational.
- **Polish**: Depends on User Stories.

### Parallel Opportunities
- Foundational types and mock data (T002, T003) can be created in parallel.
- UI components (T007, T008) can be built in parallel.
