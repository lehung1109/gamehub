---
description: "Task list for Complete Present Simple feature implementation"
---

# Tasks: Hoàn Thiện Thì Hiện Tại Đơn (Complete Present Simple)

**Input**: Design documents from `/specs/009-complete-present-simple/`

**Prerequisites**: plan.md, spec.md, data-model.md, research.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story, completely adhering to the GameHub Constitution.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup & Foundational (User Story 4 - Randomization Logic)

**Purpose**: Core infrastructure for selecting random questions and storing them in a session. MUST be complete before other stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 Evaluate worktree vs workspace branching for workspace isolation
  - Execute `git worktree list` to decide isolation strategy before starting development.
- [X] T002 Start a dedicated subagent for Phase 1 execution
  - Spawn subagent to perform the Phase 1 tasks.
- [X] T003 [P] [US4] Write failing unit tests for `shuffleArray` in `tests/unit/utils.test.ts`
  - Write test verifying the length is preserved, elements are preserved, and order changes.
  - Verify failure by running `npm run test:run -- tests/unit/utils.test.ts`.
- [X] T004 [US4] Implement `shuffleArray` in `src/lib/utils.ts` to make tests pass
  - Implement Fisher-Yates shuffle algorithm.
  - Verify pass by running `npm run test:run -- tests/unit/utils.test.ts`.
- [X] T005 [P] [US4] Write failing unit tests for `useSessionQuestions` in `tests/unit/useSessionQuestions.test.ts`
  - Write tests checking `sessionStorage` saving/retrieving and returning a stable list on re-renders.
  - Verify failure by running `npm run test:run -- tests/unit/useSessionQuestions.test.ts`.
- [X] T006 [US4] Implement `useSessionQuestions` hook in `src/hooks/useSessionQuestions.ts` to make tests pass
  - Hook signature: `function useSessionQuestions<T extends { id: string }>(questions: T[], count: number, storageKey: string): T[]`
  - Read `sessionStorage.getItem(storageKey)`, if valid parse IDs and filter `questions`. Else, `shuffleArray(questions)`, take first `count`, save mapped IDs to `sessionStorage`, and return the objects. Use `useEffect` or `useState` initialization appropriately for Next.js client component.
  - Verify pass by running `npm run test:run -- tests/unit/useSessionQuestions.test.ts`.
- [X] T007 Spawn review subagent to conduct code review and bug hunting for Phase 1
- [X] T008 Resolve any issues found by review subagent, and iteratively spawn re-review subagent until zero bugs
- [X] T009 Commit Phase 1 changes with descriptive conventional commit message (`git commit -m "feat(core): implement shuffle utility and session hook"`)

**Checkpoint**: Foundation ready - UI updates can now begin in parallel.

---

## Phase 2: User Story 1 - Conjugation Expansion (Priority: P1) 🎯 MVP

**Goal**: Expand conjugation question bank and integrate random selection.

**Independent Test**: Load the Conjugation stage. Verify exactly 8 questions appear. Reload the page, verify the same 8 questions persist. Go back and re-enter, verify a new set of 8 questions appears.

- [X] T010 Start a dedicated subagent for Phase 2 execution
- [X] T011 [US1] Write failing E2E tests for randomized Conjugation questions in `tests/e2e/present-simple.spec.ts`
  - Add test block for Conjugation stage checking that F5 reload preserves questions, but a new session resets them.
  - Verify failure: `npm run test:e2e`
- [X] T012 [P] [US1] Expand Conjugation questions in `src/data/tenses/present-simple.json`
  - Add >= 7 new Conjugation items to `challenges.conjugation` (Total >= 15).
  - Ensure diverse contexts: email, meeting, routine, report, chat. Validate schema correctness.
- [X] T013 [US1] Update `src/components/stages/ConjugationStage.tsx` to use `useSessionQuestions`
  - Replace direct use of `challenges.conjugation` with: `const sessionQuestions = useSessionQuestions(challenges.conjugation, 8, 'gamehub-session-present-simple-conjugation')`
  - Verify pass: `npm run test:run` and `npm run test:e2e`
- [X] T014 Spawn review subagent to conduct code review and bug hunting for Phase 2
- [X] T015 Resolve any issues found by review subagent, and iteratively spawn re-review subagent until zero bugs
- [X] T016 Commit Phase 2 changes with descriptive conventional commit message (`git commit -m "feat(conjugation): expand present simple conjugation questions and add randomization"`)

**Checkpoint**: User Story 1 should be fully functional and independently testable.

---

## Phase 3: User Story 2 - Error Hunting Expansion (Priority: P1)

**Goal**: Expand error hunting question bank and integrate random selection.

**Independent Test**: Load the Error Hunting stage. Verify exactly 6 questions appear. Reload the page, verify the same 6 questions persist. Re-enter, verify a new set of 6 appears.

- [ ] T017 Start a dedicated subagent for Phase 3 execution
- [ ] T018 [US2] Write failing E2E tests for randomized Error Hunting questions in `tests/e2e/present-simple.spec.ts`
  - Add test block for Error Hunting stage randomization behavior.
  - Verify failure: `npm run test:e2e`
- [ ] T019 [P] [US2] Expand Error Hunting questions in `src/data/tenses/present-simple.json`
  - Add $\ge$ 6 new Error Hunting items to `challenges.errorHunting` (Total $\ge$ 12).
  - Ensure 5 common mistakes coverage. Validate schema.
- [ ] T020 [US2] Update `src/components/stages/ErrorHunterStage.tsx` to use `useSessionQuestions`
  - Replace direct use of `challenges.errorHunting` with: `const sessionQuestions = useSessionQuestions(challenges.errorHunting, 6, 'gamehub-session-present-simple-errorHunting')`
  - Verify pass: `npm run test:run` and `npm run test:e2e`
- [ ] T021 Spawn review subagent to conduct code review and bug hunting for Phase 3
- [ ] T022 Resolve any issues found by review subagent, and iteratively spawn re-review subagent until zero bugs
- [ ] T023 Commit Phase 3 changes with descriptive conventional commit message (`git commit -m "feat(error-hunting): expand present simple error hunting questions and add randomization"`)

**Checkpoint**: User Story 2 should be fully functional and independently testable.

---

## Phase 4: User Story 3 - Sentence Building Expansion (Priority: P1)

**Goal**: Expand sentence building question bank and integrate random selection.

**Independent Test**: Load the Sentence Building stage. Verify exactly 6 questions appear. Reload the page, verify the same 6 questions persist. Re-enter, verify a new set of 6 appears.

- [ ] T024 Start a dedicated subagent for Phase 4 execution
- [ ] T025 [US3] Write failing E2E tests for randomized Sentence Building questions in `tests/e2e/present-simple.spec.ts`
  - Add test block for Sentence Building stage randomization behavior.
  - Verify failure: `npm run test:e2e`
- [ ] T026 [P] [US3] Expand Sentence Building questions in `src/data/tenses/present-simple.json`
  - Add $\ge$ 6 new Sentence Building items to `challenges.sentenceBuilding` (Total $\ge$ 12).
  - Ensure 4 sentence structures coverage. Validate schema.
- [ ] T027 [US3] Update `src/components/stages/SentenceBuilderStage.tsx` to use `useSessionQuestions`
  - Replace direct use of `challenges.sentenceBuilding` with: `const sessionQuestions = useSessionQuestions(challenges.sentenceBuilding, 6, 'gamehub-session-present-simple-sentenceBuilding')`
  - Verify pass: `npm run test:run` and `npm run test:e2e`
- [ ] T028 Spawn review subagent to conduct code review and bug hunting for Phase 4
- [ ] T029 Resolve any issues found by review subagent, and iteratively spawn re-review subagent until zero bugs
- [ ] T030 Commit Phase 4 changes with descriptive conventional commit message (`git commit -m "feat(sentence-building): expand present simple sentence building questions and add randomization"`)

**Checkpoint**: User Story 3 should be fully functional and independently testable.

---

## Phase 5: User Story 5 - Polish & Metadata (Priority: P2)

**Purpose**: Improvements, assertions on metadata, and cross-cutting concerns.

- [ ] T031 Start a dedicated subagent for Phase 5 execution
- [ ] T032 [US5] Verify `challengeCount` remains exactly `20` in `src/data/tenses/present-simple.json`
  - This ensures dashboards accurately reflect the required 20 answers per session run.
- [ ] T033 [US5] Verify `challengeCount` remains exactly `20` in `src/data/tenses/index.json` (if applicable)
- [ ] T034 [US5] Run `quickstart.md` validation
  - Test Scenario 1-4 manually or with fully automated scripts to ensure compliance.
- [ ] T035 Spawn review subagent to conduct code review and bug hunting for Phase 5
- [ ] T036 Resolve any issues found by review subagent, and iteratively spawn re-review subagent until zero bugs
- [ ] T037 Commit Phase 5 changes with descriptive conventional commit message (`git commit -m "chore(metadata): verify metadata metrics and perform final QA validation"`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately. BLOCKS all user stories.
- **User Stories (Phase 2, Phase 3, Phase 4)**: All depend on Foundational phase (Phase 1) completion. Can proceed in parallel.
- **Polish (Phase 5)**: Depends on all desired user stories being complete.

### Parallel Opportunities

- All tests for a user story marked [P] can run in parallel.
- Expansion of `src/data/tenses/present-simple.json` arrays in Phase 2, 3, and 4 can be done in parallel once Phase 1 is done.
- Phase 2, Phase 3, and Phase 4 can be worked on in parallel by different team members or parallel subagents.

---

## Implementation Strategy

1. **Complete Phase 1**: Setup Worktree and build Randomization hook (CRITICAL).
2. **Complete Phase 2**: Implement US1 + Verify -> Deploy/Demo (MVP ready).
3. **Complete Phase 3**: Implement US2 + Verify -> Deploy/Demo.
4. **Complete Phase 4**: Implement US3 + Verify -> Deploy/Demo.
5. **Complete Phase 5**: Final verification and metadata check.

Each Phase utilizes its own dedicated Subagent, enforces TDD, loops an Iterative Bug Hunt Subagent at the end, and concludes with a dedicated commit, directly aligning with GameHub Constitution Principle VI.
