# Implementation Tasks: Memory Match Game (Trò chơi Lật Thẻ Tìm Cặp)

**Feature**: Memory Match Game (`026-memory-match-game`)  
**Specification**: [spec.md](./spec.md) | **Implementation Plan**: [plan.md](./plan.md)  
**Governance**: Conforms strictly to GameHub Constitution Principles V (Test-First) and VI (Task Generation Standards).

---

## Phase 1: Setup & Workspace Isolation

**Purpose**: Initialize feature workspace, directory structure, and isolate environment.

- [x] T001 Create git worktree or verify workspace isolation for feature branch `026-memory-match-game`
- [x] T002 [P] Create directory structure for memory match components: `src/app/games/memory-match/`, `src/components/game/`, `src/components/config/`
- [x] T003 Dedicated subagent execution to verify Phase 1 setup and workspace isolation
- [x] T004 Phase 1 review loop & commit: `chore(setup): initialize memory-match game workspace and directories`

**Checkpoint**: Workspace and directory scaffolding ready.

---

## Phase 2: Foundational (Types, Schema, Catalog)

**Purpose**: Core types, validation schemas, and game registry required by all user stories.

- [x] T005 [P] Create Memory Match TypeScript models (`MemoryCard`, `MemoryGameState`, `MemoryMatchSettings`) in `src/types/memory-match.ts` and re-export in `src/types/index.ts`
- [x] T006 [P] Update `src/types/config.ts` to register `memory-match` in `GameSettingsMap` and `GameId`
- [x] T007 [P] Update `src/lib/game-config-schema.ts` to add `memoryMatchSettingsSchema` with validation for `topics`, `pairCount` (4, 6, 8), `autoSpeak`, `showTimer`, and implement `getDefaultSettings('memory-match')`
- [x] T008 Add Memory Match game entry to `src/data/games.json` with id `memory-match`, slug `memory-match`, titleVi `Lật thẻ tìm cặp`, titleEn `Memory Match`, emoji `🧠`, route `/games/memory-match`, and priority 7
- [x] T009 Dedicated subagent execution to verify Phase 2 typecheck (`npx tsc --noEmit`) and lint (`npm run lint`)
- [x] T010 Phase 2 review loop & commit: `feat(memory-match): add foundational data types, schema, and game catalog entry`

**Checkpoint**: Foundation ready - User Story implementation can proceed in parallel.

---

## Phase 3: User Story 1 - Core Memory Match Gameplay (Priority: P1) [MVP]

**Goal**: Learners play card-matching games (4, 6, or 8 pairs) with smooth 3D flip animations, automatic audio pronunciation on English words, delay on mismatch, pronunciation replay on matched cards, and proportional star ratings.

**Independent Test**: Load `/games/memory-match`, select topic "Animals" and 6 pairs, flip cards to find all pairs, hear English audio, verify star rating and play again with new words.

### Tests for User Story 1 (TDD - Write First)
- [x] T011 [P] [US1] Unit Test (TDD): Create failing unit test `tests/unit/hooks/useMemoryGame.test.ts` verifying deck generation, card shuffling, match detection, 1000ms mismatch delay, click lock during mismatch, audio replay on matched cards without flip increment, and proportional star calculation (3 stars: ≤ N+2, 2 stars: N+3 to 2N, 1 star: > 2N)
- [x] T012 [P] [US1] Unit Test (TDD): Create failing unit test `tests/unit/components/MemoryCard.test.tsx` verifying card face-down/face-up rendering, CSS 3D transform flip classes (`perspective`, `rotate-y-180`), click handler invocation, and audio replay triggers

### Implementation for User Story 1
- [x] T013 [US1] Implement `src/hooks/useMemoryGame.ts` managing active session state (`cards`, `flippedIndices`, `matchedWordIds`, `flips`, `isLocked`, `elapsedSeconds`, `stars`) and make `tests/unit/hooks/useMemoryGame.test.ts` pass
- [x] T014 [P] [US1] Implement `src/components/game/MemoryCard.tsx` with responsive dimensions (≥ 72px touch targets) and Tailwind CSS 3D flip animation to make `tests/unit/components/MemoryCard.test.tsx` pass
- [x] T015 [P] [US1] Implement `src/components/game/MemoryBoard.tsx` rendering responsive grid layout (2x4 for 8 cards, 3x4 for 12 cards, 4x4 for 16 cards)
- [x] T016 [US1] Implement `src/app/games/memory-match/page.tsx` integrating topic selector, pair count selector (4, 6, 8), `useSpeech`, win celebration modal with star rating, confetti, "Chơi lại" (bốc từ mới), and "Đổi chủ đề"
- [x] T017 [US1] E2E Test (Playwright): Create `tests/e2e/memory-match.spec.ts` covering end-to-end user journey: navigation from home, selecting topic, flipping cards, audio playback verification, and completing game
- [x] T018 [US1] Dedicated subagent execution for Phase 3 review, spec compliance verification, eslint check, and iterative bug hunt loop
- [x] T019 [US1] Phase 3 review loop & commit: `feat(memory-match): implement core gameplay, board, card flip animation, and unit/e2e tests`

**Checkpoint**: User Story 1 (MVP) is fully functional and testable independently.

---

## Phase 4: User Story 2 - Student Progress Tracking (Priority: P2)

**Goal**: Automatically synchronize and record game completion results into student profiles when playing within a classroom.

**Independent Test**: Complete a game with `classCode` and `studentName` active, verify payload with `gameType: 'memory-match'`, stars, and elapsed time sent to `/api/track`.

### Implementation for User Story 2
- [x] T020 [P] [US2] Unit Test (TDD): Add unit test in `tests/unit/hooks/useMemoryGame.test.ts` verifying progress tracking payload generation for `/api/track`
- [x] T021 [US2] Integrate `useGameTracking` in `src/app/games/memory-match/page.tsx` to automatically dispatch session results on game completion when `classCode` and `studentName` exist, with graceful fallback in standalone mode
- [x] T022 [US2] Dedicated subagent execution for Phase 4 review, spec compliance verification, eslint check, and iterative bug hunt loop
- [x] T023 [US2] Phase 4 review loop & commit: `feat(memory-match): integrate student progress tracking for classroom sessions`

**Checkpoint**: User Stories 1 AND 2 are fully functional and testable independently.

---

## Phase 5: User Story 3 - Teacher Admin Configuration & Preview Mode (Priority: P3)

**Goal**: Teachers can create, edit, customize (topics, pair count 4/6/8, autoSpeak, timer), and preview Memory Match configurations.

**Independent Test**: Navigate to `/admin/configs/new`, select Memory Match, configure parameters, click "Xem trước" to verify live board preview at `/games/memory-match?preview=...`, and save config.

### Tests for User Story 3 (TDD - Write First)
- [ ] T024 [P] [US3] Unit Test (TDD): Create failing unit test `tests/unit/components/MemoryMatchConfigForm.test.tsx` verifying form inputs for topic selection, pair count (4, 6, 8), autoSpeak toggle, showTimer toggle, and preview action

### Implementation for User Story 3
- [ ] T025 [US3] Implement `src/components/config/MemoryMatchConfigForm.tsx` with topic multi-select, pair count selector (4, 6, 8), audio toggle, timer toggle, and PreviewButton integration to make `tests/unit/components/MemoryMatchConfigForm.test.tsx` pass
- [ ] T026 [US3] Register `MemoryMatchConfigForm` in `src/components/config/ConfigCreateForm.tsx` and `src/components/config/ConfigEditForm.tsx` switch blocks for gameId `'memory-match'`
- [ ] T027 [US3] Integrate `useGameConfig` and `PreviewBanner` in `src/app/games/memory-match/page.tsx` to load teacher config (`?config=...`) and handle live preview (`?preview=...`)
- [ ] T028 [US3] E2E Test: Extend `tests/e2e/memory-match.spec.ts` to cover teacher config creation and preview mode workflow
- [ ] T029 [US3] Dedicated subagent execution for Phase 5 review, spec compliance verification, eslint check, and iterative bug hunt loop
- [ ] T030 [US3] Phase 5 review loop & commit: `feat(memory-match): implement teacher admin configuration and live preview mode`

**Checkpoint**: All user stories (P1, P2, P3) are fully functional and testable independently.

---

## Phase 6: Holistic Review, Bug Hunt, and Final Verification

**Purpose**: Project-wide verification, lint, typecheck, accessibility checks, and final commit.

- [ ] T031 Run complete unit test suite: `npm run test:run`
- [ ] T032 Run complete end-to-end test suite: `npm run test:e2e`
- [ ] T033 Run static analysis quality gates: `npm run lint` and `npx tsc --noEmit`
- [ ] T034 Execute manual verification scenarios in `specs/026-memory-match-game/quickstart.md`
- [ ] T035 Dedicated final review subagent execution for holistic bug hunt across all implemented code
- [ ] T036 Final feature-level review commit: `chore(memory-match): finalize memory match game feature and verification`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: No dependencies - can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all User Stories.
- **Phase 3 (User Story 1 - MVP)**: Depends on Phase 2.
- **Phase 4 (User Story 2 - Progress Tracking)**: Depends on Phase 3 completion.
- **Phase 5 (User Story 3 - Admin Config)**: Depends on Phase 2 & Phase 3 completion.
- **Phase 6 (Final Holistic Review)**: Depends on all User Stories being complete.

### Parallel Opportunities
- **Foundational**: T005 (`src/types/memory-match.ts`), T006 (`src/types/config.ts`), and T007 (`src/lib/game-config-schema.ts`) can be authored in parallel.
- **User Story 1**: T011 (Hook test) and T012 (Card test) can be written in parallel.
- **User Story 1 Components**: T014 (`MemoryCard.tsx`) and T015 (`MemoryBoard.tsx`) can be built in parallel.
- **User Story 3**: T024 (Form test) can be written in parallel with User Story 2.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) & Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1): Core gameplay loop, card flipping, audio pronunciation, and star rating.
3. Validate User Story 1 independently with `tests/unit/hooks/useMemoryGame.test.ts` and `tests/unit/components/MemoryCard.test.tsx`.
4. Deploy / Demo MVP increment.

### Incremental Delivery
1. Foundation Ready (Phase 1 & 2)
2. Add Core Gameplay (Phase 3 - MVP)
3. Add Classroom Tracking (Phase 4)
4. Add Teacher Customization & Preview (Phase 5)
5. Final holistic quality review and zero-bug verification (Phase 6)
