# Implementation Tasks: Reading Comprehension

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project directories for reading game: `src/app/games/reading/`, `src/components/reading/`, `src/data/reading/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T002 [P] Create `ReadingModule`, `VocabularyTerm`, and `ReadingQuestion` interfaces in `src/types/reading.ts`
- [ ] T003 [P] Create `ReadingGameState` interface in `src/types/reading.ts`
- [ ] T004 Create initial mock data file in `src/data/reading/a-day-at-the-park.json`
- [ ] T005 Update `src/types/config.ts` to include `reading` in `GameSettingsMap` if necessary

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Reading Passage and Quiz (Priority: P1)

**Goal**: Display text passage and multiple-choice questions for the user to answer.

**Independent Test**: Load a module, read text, select an answer, and receive feedback.

### Implementation for User Story 1

- [ ] T006 [P] [US1] Create basic responsive layout (Grid/Flexbox for desktop vs mobile) in `src/app/games/reading/page.tsx`
- [ ] T007 [P] [US1] Create `PassageText` component in `src/components/reading/PassageText.tsx`
- [ ] T008 [P] [US1] Create `QuestionList` and `QuestionItem` components in `src/components/reading/QuestionList.tsx`
- [ ] T009 [US1] Create custom hook `useReadingGame` in `src/hooks/useReadingGame.ts` to manage state (current question, answers, score)
- [ ] T010 [US1] Integrate state hook and UI components in `src/app/games/reading/page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Vocabulary Highlighting (Priority: P2)

**Goal**: Highlight difficult vocabulary words in the text and show definitions on click.

**Independent Test**: Click a highlighted word in the passage to see its definition tooltip.

### Implementation for User Story 2

- [ ] T011 [P] [US2] Install Radix UI Popover/Tooltip or create a custom `VocabularyTooltip` component in `src/components/reading/VocabularyTooltip.tsx`
- [ ] T012 [P] [US2] Implement a text parsing utility `parseTextWithVocabulary(text, vocabularyList)` in `src/lib/textParser.ts`
- [ ] T013 [US2] Update `PassageText.tsx` to use the parser utility and render `VocabularyTooltip` around matched words

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T014 [P] Refine responsive design for mobile (ensure passage is scrollable independently of questions) in `src/app/games/reading/page.tsx`
- [ ] T015 [P] Update UI to handle completed scenario (Score Screen)
- [ ] T016 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup**: No dependencies.
- **Foundational**: Depends on Setup.
- **User Stories**: Depend on Foundational.
- **Polish**: Depends on User Stories.

### Parallel Opportunities
- Foundational types and mock data (T002, T003, T004) can be created in parallel.
- UI components (T007, T008) can be built in parallel.
- Vocabulary parsing logic (T012) can be built in parallel with UI components.
