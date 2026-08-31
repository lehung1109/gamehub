# Implementation Tasks: Typing / Fill-in-the-Blanks

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directories for typing game: `src/app/games/typing/`, `src/components/typing/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 [P] Create `FillBlankQuestion` and `TypingGameState` interfaces in `src/types/typing.ts`
- [x] T003 [P] Implement utility function to parse existing tense JSON into `FillBlankQuestion` format in `src/lib/typingParser.ts`
- [x] T004 Update `src/types/config.ts` to include `typing` in `GameSettingsMap` if necessary

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Active Grammar Recall via Typing (Priority: P1)

**Goal**: Implement the core typing interface where learners fill in the blanks.

**Independent Test**: Load a question, type an answer, submit, and see validation feedback.

### Implementation for User Story 1

- [x] T005 [P] [US1] Create basic layout and routing in `src/app/games/typing/page.tsx`
- [x] T006 [P] [US1] Create `SentenceWithInput` component in `src/components/typing/SentenceWithInput.tsx` (ensure proper mobile keyboard attributes: autoCapitalize="none", etc.)
- [x] T007 [P] [US1] Implement `validateAnswer` utility in `src/lib/validation.ts`
- [x] T008 [US1] Create custom hook `useTypingGame` in `src/hooks/useTypingGame.ts` to manage state (current question, user input, score, validation)
- [x] T009 [US1] Integrate state hook and UI components in `src/app/games/typing/page.tsx` to handle the full interaction flow

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Contextual Hints (Priority: P2)

**Goal**: Display a hint near the blank so learners know what word to conjugate.

**Independent Test**: Verify that the base verb hint appears near the input field.

### Implementation for User Story 2

- [x] T010 [P] [US2] Create `HintBadge` component in `src/components/typing/HintBadge.tsx`
- [x] T011 [US2] Update `SentenceWithInput.tsx` to conditionally render `HintBadge` next to or under the input field based on the question data
- [x] T012 [US2] Update parser in `src/lib/typingParser.ts` to correctly extract hints from the existing tense JSON format if needed

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T013 [P] Add visual animations for correct/incorrect answers (green/red flash) in `SentenceWithInput.tsx`
- [x] T014 [P] Update UI to handle completed scenario (Score Screen) in `src/app/games/typing/page.tsx`
- [x] T015 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup**: No dependencies.
- **Foundational**: Depends on Setup.
- **User Stories**: Depend on Foundational.
- **Polish**: Depends on User Stories.

### Parallel Opportunities
- Foundational types and parsing logic (T002, T003) can be created in parallel.
- UI components (T006) and validation utility (T007) can be built in parallel.
