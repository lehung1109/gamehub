# Implementation Tasks: Word Search Game (Trò chơi Săn Tìm Từ Vựng)

**Feature**: Word Search Game (`027-word-search-game`)  
**Specification**: [spec.md](./spec.md) | **Implementation Plan**: [plan.md](./plan.md)  
**Governance**: Conforms strictly to GameHub Constitution Principles V (Test-First) and VI (Task Generation Standards).

---

## Phase 1: Setup & Workspace Isolation

**Purpose**: Initialize feature workspace, directory structure, and isolate environment.

- [x] T001 Create git worktree or verify workspace isolation for feature branch `027-word-search-game`
- [x] T002 [P] Create directory structure for word search components: `src/app/games/word-search/`, `src/components/game/`, `src/components/config/`
- [x] T003 Dedicated subagent execution to verify Phase 1 setup and workspace isolation
- [x] T004 Phase 1 review loop & commit: `chore(setup): initialize word-search game workspace and directories`

**Checkpoint**: Workspace and directory scaffolding ready.

---

## Phase 2: Foundational (Types, Schema, Catalog)

**Purpose**: Core types, validation schemas, and game registry required by all user stories.

- [x] T005 [P] Create Word Search domain models (`Coordinate`, `WordSearchCell`, `WordSearchTargetWord`, `WordSearchGameState`, `WordSearchSettings`) in `src/types/word-search.ts` and re-export in `src/types/index.ts`
- [x] T006 [P] Update `src/types/config.ts` to register `word-search` in `GameSettingsMap` and `GameId`
- [x] T007 [P] Update `src/lib/game-config-schema.ts` to add `wordSearchSettingsSchema` with validation for `topics`, `wordCount` (4, 5, 6), `enableHints`, `autoSpeak`, `showTimer`, and implement `getDefaultSettings('word-search')`
- [x] T008 [P] Add Word Search game catalog entry to `src/data/games.json` with id `word-search`, slug `word-search`, titleVi `Săn tìm từ vựng`, titleEn `Word Search`, description `Tìm và quét các từ tiếng Anh ẩn giấu trên lưới chữ cái`, emoji `🔍`, route `/games/word-search`, and priority 8
- [x] T009 Dedicated subagent execution to verify Phase 2 typecheck (`npx tsc --noEmit`) and lint (`npm run lint`)
- [x] T010 Phase 2 review loop & commit: `feat(word-search): add foundational data types, schema, and game catalog entry`

**Checkpoint**: Foundation ready - User Story implementation can proceed in parallel.

---

## Phase 3: User Story 1 - Core Word Search Gameplay & Generator (Priority: P1) [MVP]

**Goal**: Primary learners find English vocabulary words hidden on an 8x8 letter grid (arranged horizontally L→R and vertically T→B) via pointer drag or two-tap coordinate selection, with audio pronunciation, hint assistance, multi-color gradient intersecting cells, and star rating calculations.

**Independent Test**: Load `/games/word-search`, choose topic "Fruits" and 5 words, find words by dragging/tapping, verify Web Speech audio playback on match, click hint 💡 to see initial letter pulse, verify multi-color gradient on intersecting words, and complete game to see celebratory star modal.

### Tests for User Story 1 (TDD - Write First)
- [ ] T011 [P] [US1] Unit Test (TDD): Create failing unit test `tests/unit/lib/word-search-generator.test.ts` verifying 8x8 matrix generation, horizontal (L→R) and vertical (T→B) word placements, non-conflicting intersections, 100% placement rate for 4-6 words, and random uppercase filler padding (A-Z)
- [ ] T012 [P] [US1] Unit Test (TDD): Create failing unit test `tests/unit/hooks/useWordSearchGame.test.ts` verifying game initialization, active drag selection along horizontal/vertical lines, two-tap selection, word match detection, cell highlight persistence, multi-color intersecting cell handling, hint activation (start cell pulse), stopwatch timer, and star rating calculation (0 hints: 3 stars, 1 hint: 2 stars, ≥ 2 hints: 1 star)
- [ ] T013 [P] [US1] Unit Test (TDD): Create failing unit test `tests/unit/components/WordSearchBoard.test.tsx` verifying 8x8 grid rendering, touch targets (≥ 36x36px), Pointer Events (`pointerDown`, `pointerEnter`, `pointerUp`), click handler triggers, active selection highlights, and multi-color gradient display for intersecting cells

### Implementation for User Story 1
- [ ] T014 [US1] Implement deterministic placement utility in `src/lib/word-search-generator.ts` with retry/backtracking logic, word length filtering (3-7 characters), coordinate calculation, and random filler to make `tests/unit/lib/word-search-generator.test.ts` pass
- [ ] T015 [US1] Implement core game engine hook `src/hooks/useWordSearchGame.ts` managing active round state (`grid`, `targetWords`, `selectedCoordinates`, `hintedCoordinate`, `hintCount`, `elapsedSeconds`, `stars`) and make `tests/unit/hooks/useWordSearchGame.test.ts` pass
- [ ] T016 [P] [US1] Implement `src/components/game/WordSearchCellItem.tsx` with Pointer Event triggers, accessible `aria-label`, selection styling, pulsing hint keyframe, and linear gradient background for intersecting words to make `tests/unit/components/WordSearchBoard.test.tsx` pass
- [ ] T017 [P] [US1] Implement `src/components/game/WordSearchBoard.tsx` rendering the responsive 8x8 CSS Grid layout
- [ ] T018 [P] [US1] Implement `src/components/game/WordSearchWordList.tsx` displaying target words with emoji, English word, Vietnamese definition, strike-through found state, and audio replay speaker button
- [ ] T019 [US1] Implement `src/app/games/word-search/page.tsx` integrating topic selector, word count selector (4, 5, 6), `useSpeech`, hint button, celebration dialog with star rating, confetti, "Chơi lại ván mới", and "Chọn chủ đề khác"
- [ ] T020 [US1] E2E Test (Playwright): Create `tests/e2e/word-search.spec.ts` covering full gameplay user journey: navigation from home, selecting topic, dragging/tapping cells to find words, audio pronunciation playback, hint usage, and completing round
- [ ] T021 [US1] Dedicated subagent execution for Phase 3 review, spec compliance verification, lint check, and iterative bug hunt loop
- [ ] T022 [US1] Phase 3 review loop & commit: `feat(word-search): implement core gameplay, 8x8 generator, board, pointer events, and unit/e2e tests`

**Checkpoint**: User Story 1 (MVP) is fully functional and testable independently.

---

## Phase 4: User Story 2 - Student Progress Tracking (Priority: P2)

**Goal**: Automatically record word search completion metrics (score/stars, target word count, time elapsed, hint usage) into student profiles when participating in a classroom session.

**Independent Test**: Play a game session with active `classCode` and `studentName`, complete all words, and verify tracking payload with `gameType: 'word-search'`, stars, and elapsed time successfully sent to `/api/track`.

### Implementation for User Story 2
- [ ] T023 [P] [US2] Unit Test (TDD): Add unit test in `tests/unit/hooks/useWordSearchGame.test.ts` verifying progress tracking payload generation for `/api/track`
- [ ] T024 [US2] Integrate `useGameTracking` in `src/app/games/word-search/page.tsx` to automatically dispatch session results on game completion when `classCode` and `studentName` exist, with graceful fallback in standalone mode
- [ ] T025 [US2] Dedicated subagent execution for Phase 4 review, spec compliance verification, eslint check, and iterative bug hunt loop
- [ ] T026 [US2] Phase 4 review loop & commit: `feat(word-search): integrate student progress tracking for classroom sessions`

**Checkpoint**: User Stories 1 AND 2 are fully functional and testable independently.

---

## Phase 5: User Story 3 - Teacher Admin Configuration & Live Preview Mode (Priority: P3)

**Goal**: Teachers can create, customize (allowed topics, word count 4-6, hints toggle, audio toggle, timer toggle), and preview Word Search configurations.

**Independent Test**: Navigate to `/admin/configs/new`, select Word Search, configure parameters, click "Xem trước" to verify live 8x8 board preview at `/games/word-search?preview=...`, and save config.

### Tests for User Story 3 (TDD - Write First)
- [ ] T027 [P] [US3] Unit Test (TDD): Create failing unit test `tests/unit/components/WordSearchConfigForm.test.tsx` verifying form inputs for topic selection, word count (4, 5, 6), enableHints toggle, autoSpeak toggle, showTimer toggle, and preview action

### Implementation for User Story 3
- [ ] T028 [US3] Implement `src/components/config/WordSearchConfigForm.tsx` with topic multi-select, word count selector (4, 5, 6), hints toggle, audio toggle, timer toggle, and PreviewButton integration to make `tests/unit/components/WordSearchConfigForm.test.tsx` pass
- [ ] T029 [US3] Register `WordSearchConfigForm` in `src/components/config/ConfigCreateForm.tsx` and `src/components/config/ConfigEditForm.tsx` switch blocks for gameId `'word-search'`
- [ ] T030 [US3] Integrate `useGameConfig` and `PreviewBanner` in `src/app/games/word-search/page.tsx` to load teacher config (`?config=...`) and handle live preview (`?preview=...`)
- [ ] T031 [US3] E2E Test: Extend `tests/e2e/word-search.spec.ts` to cover teacher config creation and preview mode workflow
- [ ] T032 [US3] Dedicated subagent execution for Phase 5 review, spec compliance verification, eslint check, and iterative bug hunt loop
- [ ] T033 [US3] Phase 5 review loop & commit: `feat(word-search): implement teacher admin configuration and live preview mode`

**Checkpoint**: All user stories (P1, P2, P3) are fully functional and testable independently.

---

## Phase 6: Holistic Review, Bug Hunt, and Final Verification

**Purpose**: Project-wide verification, lint, typecheck, accessibility checks, and final commit.

- [ ] T034 [P] Run full unit test suite: `npm run test:run` and verify 100% tests passing
- [ ] T035 [P] Run Playwright E2E suite: `npm run test:e2e tests/e2e/word-search.spec.ts`
- [ ] T036 [P] Run project static typecheck: `npx tsc --noEmit`
- [ ] T037 [P] Run linter: `npm run lint`
- [ ] T038 Run production build check: `npm run build:ci`
- [ ] T039 Dedicated subagent execution for holistic code review, accessibility check, mobile touch target verification, and edge case hardening
- [ ] T040 Phase 6 review loop & commit: `chore(word-search): finalize word search game feature and verification`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: No dependencies - starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 completion - blocks all user stories.
- **Phase 3 (User Story 1 - MVP)**: Depends on Phase 2 completion.
- **Phase 4 (User Story 2)**: Depends on Phase 3 completion.
- **Phase 5 (User Story 3)**: Depends on Phase 3 completion (can run in parallel with Phase 4).
- **Phase 6 (Holistic Review)**: Depends on all user stories (Phase 3, 4, 5) completion.

### User Story Dependencies
- **User Story 1 (P1)**: Independent core engine and UI.
- **User Story 2 (P2)**: Integrates progress tracking into US1 gameplay completion.
- **User Story 3 (P3)**: Provides admin configuration form and links into US1 page query params.

### Parallel Opportunities
- **Phase 2 Foundational**: T005, T006, T007, T008 can be executed in parallel across independent files.
- **Phase 3 Tests (TDD)**: T011, T012, T013 can be authored in parallel before implementation.
- **Phase 3 Components**: T016, T017, T018 can be implemented in parallel once hook/generator are established.
- **Phase 4 and Phase 5**: Can proceed concurrently once Phase 3 is delivered.

---

## Implementation Strategy (MVP First)

1. **Phase 1 & 2**: Establish isolated environment, shared types, catalog entry, and schema.
2. **Phase 3 (MVP)**: Deliver 8x8 generator, board, pointer drag/tap selection, Web Speech pronunciation, hints, and star ratings. Stop and independently test via `quickstart.md` Scenario 1 & 2.
3. **Phase 4**: Add classroom student session tracking. Validate via `quickstart.md` Scenario 3.
4. **Phase 5**: Add Teacher admin config and preview mode. Validate via `quickstart.md` Scenario 4.
5. **Phase 6**: Execute automated test matrix (Vitest, Playwright, lint, typecheck, build).
