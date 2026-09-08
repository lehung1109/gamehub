# Implementation Tasks: Grammar Detective Game

**Feature**: `028-grammar-detective` | **Branch**: `028-grammar-detective`
**Spec**: [specs/028-grammar-detective/spec.md](file:///F:/projects/gamehub/specs/028-grammar-detective/spec.md) | **Plan**: [specs/028-grammar-detective/plan.md](file:///F:/projects/gamehub/specs/028-grammar-detective/plan.md)

---

## Phase 1: Setup (Workspace & Infrastructure)

**Purpose**: Worktree isolation and catalog routing setup per Constitution Principle VI.

- [x] T001 Phase 1 Worktree: Confirm or create git worktree `028-grammar-detective` for workspace isolation.
- [x] T002 Dedicated Subagent: Initialize dedicated Phase 1 subagent context.
- [x] T003 [P] Add Grammar Detective route and catalog metadata to `src/data/games.json`.
- [x] T004 Phase 1 Review & Bug Hunt: Run linter `npm run lint` and verify zero syntax or type discrepancies.
- [x] T005 Phase 1 Commit: Commit setup changes with `chore(grammar-detective): setup route entry and workspace worktree`.

---

## Phase 2: Foundational (Types, Static Dataset & Tokenizer Engine)

**Purpose**: Core data models, static case library, and deterministic token segmentation engine.

- [x] T006 Dedicated Subagent: Initialize Phase 2 subagent context.
- [x] T007 [P] Define TypeScript interfaces in `src/types/grammar-detective.ts` (`CaseFile`, `CaseError`, `ErrorOption`, `TextToken`, `DetectiveSession`, `DetectiveRank`, `GameStatus`).
- [x] T008 [P] Author 12 authentic case files across 4 rank tiers with bilingual explanations in `src/data/grammar-detective.json`.
- [x] T009 [P] TDD Red: Write failing unit tests for regex word tokenization and error mapping in `src/app/games/grammar-detective/__tests__/tokenizer.test.ts`.
- [x] T010 TDD Green: Implement `tokenizeCaseDocument` pure function in `src/lib/grammar-detective-tokenizer.ts`.
- [x] T011 TDD Refactor & Verification: Run `npx vitest run src/app/games/grammar-detective/__tests__/tokenizer.test.ts` and verify all tests pass.
- [x] T012 Phase 2 Review Subagent: Spawn review subagent for data validity, schema adherence, and zero lint errors.
- [x] T013 Phase 2 Commit: Commit foundational data & tokenizer with `feat(grammar-detective): add data model, dataset, and tokenizer engine`.

---

## Phase 3: User Story 1 - Inspect and Solve Case with Token Highlighter (Priority: P1 - MVP)

**Goal**: Deliver the core playable loop: read document, toggle highlighter, tap suspect word, open deduction card, select fix, and update text in-place.

**Independent Test**: Load the first case, toggle highlighter, tap "deploy", select "deployed", verify in-place text replacement and audio playback.

- [x] T014 Dedicated Subagent: Initialize Phase 3 subagent context.
- [x] T015 [P] [US1] TDD Red: Write unit tests for core state transitions and token tapping in `src/app/games/grammar-detective/__tests__/useGrammarDetective.test.ts`.
- [x] T016 [US1] TDD Green: Implement core state machine hook in `src/hooks/useGrammarDetective.ts` (token tap, deduction modal open, option selection, in-place token replacement).
- [x] T017 [P] [US1] Implement Detective Desk document viewer with token-level highlighting in `src/components/game/grammar-detective/DetectiveDesk.tsx`.
- [x] T018 [P] [US1] Implement Deduction Card modal with multiple-choice options, bilingual explanations, and Web Speech audio button in `src/components/game/grammar-detective/DeductionCard.tsx`.
- [x] T019 [US1] Assemble MVP container page with highlighter toggle and audio playback in `src/app/games/grammar-detective/page.tsx`.
- [x] T020 [US1] Verification: Run unit tests `npx vitest run src/app/games/grammar-detective/__tests__/` and verify MVP interactive loop.
- [x] T021 Phase 3 Review Subagent: Spawn review subagent to inspect touch targets, text selection suppression (`select-none`), and error handling.
- [x] T022 Phase 3 Commit: Commit MVP implementation with `feat(grammar-detective): implement core detective desk, token highlighter, and deduction card`.

---

## Phase 4: User Story 2 - Detective Credibility & Debriefing Modals (Priority: P2)

**Goal**: Introduce gamified stakes with 3 Credibility points (hearts), false alarm warnings, and victory/failure debriefing modals.

**Independent Test**: Tap 3 innocent words to reduce Credibility to 0 and verify Case Cold dialog; conversely solve all errors with 3 Credibility and verify Case Solved dialog with 3 stars.

- [x] T023 Dedicated Subagent: Initialize Phase 4 subagent context.
- [x] T024 [P] [US2] TDD Red: Add unit tests for credibility depletion, false alarm detection, and star rating calculation in `src/app/games/grammar-detective/__tests__/credibility.test.ts`.
- [x] T025 [US2] TDD Green: Update `src/hooks/useGrammarDetective.ts` with Credibility mechanics (3 hearts, false alarm toast feedback, case over state).
- [x] T026 [P] [US2] Implement Case Solved victory modal with star rating, elapsed time, and rule recap in `src/components/game/grammar-detective/CaseSolvedModal.tsx`.
- [x] T027 [P] [US2] Implement Case Cold debriefing dialog with missed clues analysis and retry action in `src/components/game/grammar-detective/CaseColdModal.tsx`.
- [x] T028 [US2] Integrate credibility meter, toast notifications, and modals into `src/app/games/grammar-detective/page.tsx`.
- [x] T029 [US2] Verification: Run `npx vitest run src/app/games/grammar-detective/__tests__/` and verify all tests pass.
- [x] T030 Phase 4 Review Subagent: Spawn review subagent to verify game-over edge cases and non-blocking toast animations.
- [x] T031 Phase 4 Commit: Commit credibility & modal features with `feat(grammar-detective): add credibility lives system and case debriefing modals`.

---

## Phase 5: User Story 3 - Case Progression & Rank Tiers (Priority: P3)

**Goal**: Organize case files into thematic categories and progressive rank tiers (*Intern* to *Chief Inspector*) with persistence in `localStorage`.

**Independent Test**: Complete 3 Intern cases, verify Junior tier unlocks, and check that progress persists across page reloads.

- [ ] T032 Dedicated Subagent: Initialize Phase 5 subagent context.
- [ ] T033 [P] [US3] TDD Red: Add unit tests for rank unlock logic (Intern -> Junior -> Senior -> Chief) and local progress persistence in `src/app/games/grammar-detective/__tests__/progression.test.ts`.
- [ ] T034 [US3] TDD Green: Implement progression and rank unlock logic in `src/hooks/useGrammarDetective.ts` with `localStorage` key `gamehub_grammar_detective_v1`.
- [ ] T035 [P] [US3] Implement Dossier Selector component with category filters and rank badges in `src/components/game/grammar-detective/DossierSelector.tsx`.
- [ ] T036 [US3] Integrate dossier selection view and case switching into `src/app/games/grammar-detective/page.tsx`.
- [ ] T037 [US3] Verification: Run `npx vitest run src/app/games/grammar-detective/__tests__/` to verify rank progression and dossier filtering.
- [ ] T038 Phase 5 Review Subagent: Spawn review subagent for progression state persistence and responsive drawer/tab layout.
- [ ] T039 Phase 5 Commit: Commit progression system with `feat(grammar-detective): implement dossier browser and detective rank tiers`.

---

## Phase 6: User Story 4 - Endless Streak Audit Mode (Priority: P4)

**Goal**: Provide a fast-paced Endless Audit mode with continuous randomized snippets, countdown pressure, and streak tracking.

**Independent Test**: Launch Endless mode, resolve 3 consecutive snippets, verify streak increments to 3 and high score updates.

- [ ] T040 Dedicated Subagent: Initialize Phase 6 subagent context.
- [ ] T041 [P] [US4] TDD Red: Add unit tests for Endless mode round generation and streak tracking in `src/app/games/grammar-detective/__tests__/endless.test.ts`.
- [ ] T042 [US4] TDD Green: Implement Endless streak mechanics and randomized snippet generator in `src/hooks/useGrammarDetective.ts`.
- [ ] T043 [P] [US4] Implement Endless Audit HUD banner with current streak and highest streak in `src/components/game/grammar-detective/EndlessAuditHeader.tsx`.
- [ ] T044 [US4] Integrate Endless mode toggle and seamless next-round transitions into `src/app/games/grammar-detective/page.tsx`.
- [ ] T045 [US4] Verification: Run `npx vitest run src/app/games/grammar-detective/__tests__/` to verify Endless mode logic.
- [ ] T046 Phase 6 Review Subagent: Spawn review subagent to check memory leaks and endless round re-rendering.
- [ ] T047 Phase 6 Commit: Commit Endless mode with `feat(grammar-detective): add endless audit mode and streak multiplier`.

---

## Phase 7: Polish, Cross-Cutting & E2E Verification

**Purpose**: Integration with student tracking, automated Playwright E2E browser tests, and accessibility audit.

- [ ] T048 Dedicated Subagent: Initialize Phase 7 subagent context.
- [ ] T049 [P] Integrate `useGameTracking("grammar-detective")` in `src/app/games/grammar-detective/page.tsx` for classroom session recording.
- [ ] T050 [P] Write comprehensive Playwright E2E test suite in `tests/grammar-detective.spec.ts` covering full game loop on Desktop and Mobile viewports.
- [ ] T051 Execute Playwright test suite with `npx playwright test tests/grammar-detective.spec.ts` and verify 100% pass.
- [ ] T052 Execute full regression gates: `npm run lint`, `npx tsc --noEmit`, and `npm run test:run`.
- [ ] T053 Phase 7 Review Subagent: Verify code cleanliness, accessibility attributes (ARIA), and documentation alignment with `quickstart.md`.
- [ ] T054 Phase 7 Commit: Commit polish & E2E tests with `test(grammar-detective): add playwright e2e tests and session tracking`.

---

## Phase 8: Final Feature-Level Review & Holistic Bug Hunt

**Purpose**: Holistic multi-phase review and final verification per Constitution Principle VI (items 7 & 8).

- [ ] T055 Dedicated Subagent: Initialize Phase 8 holistic review subagent context.
- [ ] T056 Run comprehensive bug hunt across the entire Grammar Detective feature (`npm run build`, full unit tests, full linting, Playwright E2E).
- [ ] T057 Fix any discovered edge-case bugs, styling quirks, or UI discrepancies.
- [ ] T058 Re-run review subagent iteratively until zero bugs remain.
- [ ] T059 Make final comprehensive commit finalizing feature 028: `feat(grammar-detective): finalize grammar detective game`.

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: No dependencies — can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories.
- **Phase 3 (User Story 1 - MVP)**: Depends on Phase 2.
- **Phase 4 (User Story 2)**: Depends on Phase 3 (builds on active case investigation).
- **Phase 5 (User Story 3)**: Depends on Phase 4 (dossier selection wraps case files).
- **Phase 6 (User Story 4)**: Depends on Phase 3 & 4 (reuses token desk & deduction modal).
- **Phase 7 (Polish & E2E)**: Depends on Phases 3-6.
- **Phase 8 (Final Review)**: Depends on Phase 7.

### Parallel Opportunities
- In Phase 1: T003 (`games.json`) can be modified independently.
- In Phase 2: T007 (`types`), T008 (`data`), and T009 (`test`) can run in parallel.
- In Phase 3: T015 (`test`), T017 (`DetectiveDesk.tsx`), and T018 (`DeductionCard.tsx`) can be built in parallel once types exist.
- In Phase 4: T026 (`CaseSolvedModal.tsx`) and T027 (`CaseColdModal.tsx`) can be developed in parallel.
- In Phase 7: T049 (`useGameTracking`) and T050 (`playwright test`) can be authored in parallel.

---

## Implementation Strategy

### MVP Delivery (Phases 1, 2, and 3)
1. Complete Phase 1 (Worktree & Catalog route).
2. Complete Phase 2 (Types, Sample Data & Tokenizer with passing Vitest tests).
3. Complete Phase 3 (Detective Desk, Token tap highlighter, and Deduction Card modal).
4. **Validation Point**: At this point, the game is fully playable end-to-end for a single case!

### Full Game Delivery (Phases 4 through 8)
5. Add Phase 4 for gamified Credibility lives and win/loss modals.
6. Add Phase 5 for multi-case dossier browser and rank progression (*Intern* to *Chief*).
7. Add Phase 6 for fast-paced Endless mode.
8. Add Phase 7 & 8 for classroom analytics, Playwright E2E verification, and holistic bug hunting.
