---
description: "Task list for English Learning Games for Kids feature implementation"
---

# Tasks: English Learning Games for Kids

**Input**: Design documents from `/specs/001-english-learning-games/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: Tests are OPTIONAL. No specific testing tasks are generated as TDD was not explicitly requested, but unit/component/E2E testing libraries (Vitest, Playwright) are set up in Phase 1 per plan.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router paths: `src/app/`
- Custom/shared components: `src/components/custom/`, `src/components/game/`
- shadcn/ui components: `src/components/ui/`
- Static data files: `src/data/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, toolchain, and basic structure

- [X] T001 Initialize Next.js 16 project with App Router, TypeScript, and Tailwind CSS v4 in `gamehub/` (package.json, tsconfig.json, next.config.ts)
- [X] T002 Install dependencies: `lucide-react`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- [X] T003 [P] Initialize shadcn/ui via CLI (`npx shadcn@latest init`) and configure OKLCH theming in `src/app/globals.css` with Tailwind v4 `@theme` directive
- [X] T004 Add required shadcn/ui components: `npx shadcn@latest add button card tabs badge dialog progress toggle toggle-group separator tooltip`
- [X] T005 Create base directory structure: `src/app/games/`, `src/components/custom/`, `src/components/game/`, `src/data/`, `src/hooks/`, `src/types/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 [P] Define shared TypeScript types in `src/types/index.ts` (Game, Topic, Word, Letter, GameNumber, Color, Sentence)
- [ ] T007 [P] Implement `src/lib/utils.ts` for shadcn (`cn` function with `clsx` and `tailwind-merge`)
- [ ] T008 [P] Implement `src/lib/shuffle.ts` utility for quiz randomization
- [ ] T009 [P] Implement `src/lib/speech-check.ts` (browser speech API support detection)
- [ ] T010 [P] Implement `src/hooks/useSpeech.ts` custom hook wrapping Web Speech API (`speechSynthesis.cancel()` before new utterance, rate 0.8)
- [ ] T011 Create layout shell in `src/app/layout.tsx` (global styles, fonts, meta tags)
- [ ] T012 Create `src/app/not-found.tsx` (custom 404 page)
- [ ] T013 [P] Create custom component `src/components/custom/BackButton.tsx` (using shadcn Button)
- [ ] T014 [P] Create custom component `src/components/custom/SpeakButton.tsx` (using shadcn Button and `useSpeech` hook)
- [ ] T015 [P] Create custom component `src/components/custom/FeedbackOverlay.tsx` (using shadcn Dialog for correct/wrong feedback animations)
- [ ] T016 [P] Create custom component `src/components/custom/SpeechUnsupportedBanner.tsx`
- [ ] T017 Create reusable game component `src/components/game/QuizEngine.tsx` (state machine for quizzes)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Khám phá và chọn game từ trang chủ (Priority: P1) 🎯 MVP

**Goal**: Students can discover and launch games from a main hub page.

**Independent Test**: Load the homepage and verify the game cards are displayed in a responsive grid, tapping them navigates to the correct game.

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create `src/data/games.json` with metadata for all 6 games
- [ ] T019 [P] [US1] Create `src/components/custom/GameCard.tsx` (using shadcn Card to display game icon, title, description)
- [ ] T020 [US1] Implement homepage `src/app/page.tsx` (load games from JSON, display in responsive grid of GameCards)

**Checkpoint**: Game hub fully functional

---

## Phase 4: User Story 2 - Học từ vựng qua Flashcard (Priority: P1)

**Goal**: Students can learn vocabulary words through flashcards with pronunciation.

**Independent Test**: Load the Flashcard game, select a topic, tap a card to flip it and hear the pronunciation.

### Implementation for User Story 2

- [ ] T021 [US2] Create vocabulary JSON data: `src/data/topics.json` and `src/data/words/animals.json`, `fruits.json`, `family.json`, `school.json`, `body-parts.json`
- [ ] T022 [US2] Create game component `src/components/game/FlashcardStack.tsx` (using shadcn Card, handles CSS 3D flip, prev/next navigation, integrates SpeakButton)
- [ ] T023 [US2] Implement topic selection page `src/app/games/flashcard/page.tsx` (list available topics to start game)
- [ ] T024 [US2] Implement flashcard game page `src/app/games/flashcard/[topicId]/page.tsx` (generateStaticParams, load words for topic, render FlashcardStack)

**Checkpoint**: Flashcard game fully functional

---

## Phase 5: User Story 3 - Nhận diện chữ cái & Phonics (Priority: P1)

**Goal**: Students can learn the alphabet, hear letter sounds, and test their knowledge.

**Independent Test**: Load Alphabet game, tap letters to hear sounds. Switch to Quiz mode and answer questions.

### Implementation for User Story 3

- [ ] T025 [US3] Create letter data `src/data/letters.json` (A-Z with phonetic, example word, example emoji)
- [ ] T026 [P] [US3] Create game component `src/components/game/LetterGrid.tsx` (using shadcn Button/Toggle Group for A-Z grid)
- [ ] T027 [US3] Implement alphabet game page `src/app/games/alphabet/page.tsx` (Learn mode: click letter to hear and see example; Quiz mode: hear letter and select from grid)

**Checkpoint**: Alphabet & Phonics game fully functional

---

## Phase 6: User Story 4 - Nghe và chọn đáp án đúng (Priority: P2)

**Goal**: Students listen to a spoken word and pick the matching image.

**Independent Test**: Load Listening game, hear the spoken word, and tap the correct image from 3-4 options.

### Implementation for User Story 4

- [ ] T028 [US4] Implement listening game page `src/app/games/listening/page.tsx` (uses `src/data/words/*.json`, `QuizEngine.tsx`, speaks word, presents 3-4 image options, feedback overlay)

**Checkpoint**: Listening Comprehension game fully functional

---

## Phase 7: User Story 5 - Ghép từ / Đánh vần (Priority: P2)

**Goal**: Students can drag and drop letters to spell words based on a picture.

**Independent Test**: Load Spelling game, drag scrambled letters into the correct slots to spell the word shown.

### Implementation for User Story 5

- [ ] T029 [P] [US5] Create drag-and-drop components `src/components/game/LetterBank.tsx` (draggable letter tiles) and `src/components/game/DropSlots.tsx` (droppable target slots) using @dnd-kit
- [ ] T030 [US5] Create `src/components/game/DragDropBoard.tsx` (orchestrates @dnd-kit DndContext, sensors, checking logic)
- [ ] T031 [US5] Implement spelling game page `src/app/games/spelling/page.tsx` (uses `src/data/words/*.json`, display image/emoji, scrambled letters, DragDropBoard for arrangement)

**Checkpoint**: Spelling game fully functional

---

## Phase 8: User Story 6 - Học số đếm & màu sắc bằng tiếng Anh (Priority: P3)

**Goal**: Students can learn numbers (1-20) and basic colors.

**Independent Test**: Load Numbers & Colors game, switch between tabs, tap numbers/colors to hear sounds, and answer quiz mode questions.

### Implementation for User Story 6

- [ ] T032 [US6] Create numbers and colors data: `src/data/numbers.json` (1-20) and `src/data/colors.json` (10 colors with hex)
- [ ] T033 [P] [US6] Create game component `src/components/game/TabSwitcher.tsx` (using shadcn Tabs to switch between Numbers and Colors views)
- [ ] T034 [US6] Implement numbers and colors game page `src/app/games/numbers-colors/page.tsx` (tab switching, learn mode for numbers/colors, quiz mode)

**Checkpoint**: Numbers & Colors game fully functional

---

## Phase 9: User Story 7 - Luyện câu đơn giản (Priority: P3)

**Goal**: Students can drag words to form simple sentences based on a picture.

**Independent Test**: Load Sentences game, arrange scrambled words to form the correct sentence.

### Implementation for User Story 7

- [ ] T035 [US7] Create sentences data `src/data/sentences.json` (simple sentences with scrambled words and emoji)
- [ ] T036 [US7] Implement sentences game page `src/app/games/sentences/page.tsx` (re-use `DragDropBoard.tsx` and @dnd-kit sortable for word reordering instead of letters, speak full sentence on correct)

**Checkpoint**: Simple Sentences game fully functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T037 [P] Implement Next.js static export config in `next.config.ts` (`output: 'export'`)
- [ ] T038 [P] Enhance UI with Duolingo-style flat design styling (chunky 3D buttons, vivid colors) in `src/app/globals.css` and shadcn component overrides
- [ ] T039 [P] Ensure mobile-first responsive design works on 360px+ screens for all game pages
- [ ] T040 [P] Add CSS animations for feedback (`animate-celebrate`, `animate-pop`, `animate-shake`, `animate-wiggle`)
- [ ] T041 [P] Review and apply zero-tracking policy (ensure no external analytics or scripts are loaded)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phases 3–9)**: All depend on Foundational phase completion
  - User stories can proceed in parallel or sequentially in priority order (P1 → P2 → P3)
  - Specifically: US2, US4, US5 depend on vocabulary data (T021)
  - US7 depends on the DragDropBoard created in US5 (T030)
- **Polish (Phase 10)**: Can run anytime, but ideally after core UI components are built

### Parallel Opportunities

- All Setup tasks (T003) can run in parallel with initialization.
- All Foundational utility/hook tasks (T006-T010) marked [P] can run in parallel.
- Foundational custom components (T013-T016) marked [P] can run in parallel.
- US1, US2, US3, US6 can all start in parallel once Foundation is complete.
- All Polish tasks (T037-T041) marked [P] can run in parallel.

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3 (US1 - Hub), Phase 4 (US2 - Flashcards), Phase 5 (US3 - Alphabet)
4. **STOP and VALIDATE**: Test hub navigation, flashcard game, and alphabet game.
5. Deploy MVP to Vercel (free tier) as static export.

### Incremental Delivery

1. Deploy MVP (Hub + Flashcards + Alphabet).
2. Add US4 (Listening) + US5 (Spelling) → Test → Deploy
3. Add US6 (Numbers & Colors) + US7 (Sentences) → Test → Deploy
4. Apply Polish (Phase 10) → Final release.
