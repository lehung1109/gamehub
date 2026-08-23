# Tasks: CI/CD Pipelines

**Input**: Design documents from `/specs/007-ci-cd-pipelines/`

**Prerequisites**: [plan.md](file:///F:/projects/gamehub/specs/007-ci-cd-pipelines/plan.md) (required), [spec.md](file:///F:/projects/gamehub/specs/007-ci-cd-pipelines/spec.md) (required for user stories), [research.md](file:///F:/projects/gamehub/specs/007-ci-cd-pipelines/research.md), [data-model.md](file:///F:/projects/gamehub/specs/007-ci-cd-pipelines/data-model.md), [contracts/](file:///F:/projects/gamehub/specs/007-ci-cd-pipelines/contracts/workflows.md)

**Tests**: CI workflows are infrastructure (YAML definitions) tested via validation, schema checks, and contract verification against existing project test suites (`npm run test:run`, `npm run test:e2e`). No new unit test files are required for workflow YAML definitions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **CI Workflows**: `.github/workflows/` at repository root
- **Configuration**: `package.json` at repository root
- **Specs & Contracts**: `specs/007-ci-cd-pipelines/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and prerequisite structure for CI workflows

- [ ] T001 Create `.github/workflows` directory structure in `.github/workflows`
- [ ] T002 Add `build:ci` npm script (`next build`) to `package.json` to decouple CI builds from remote Supabase type generation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core validation that MUST be complete before ANY user story workflow can be deployed

**⚠️ CRITICAL**: No user story workflow can be tested/verified until local build and test execution scripts are validated

- [ ] T003 Verify local execution of `npm run build:ci`, `npm run lint`, `npx tsc --noEmit`, and `npm run test:run` in `package.json`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Core CI Quality Gate on Pull Requests (Priority: P1) 🎯 MVP

**Goal**: Automatically run linting, TypeScript type checking, unit tests, and production build checks on PRs targeting `main` and pushes to `main`, blocking broken code from merging.

**Independent Test**: Trigger CI workflow on PR or push; verify that lint (`npm run lint`), typecheck (`npx tsc --noEmit`), unit test (`npm run test:run`), and build (`npm run build:ci`) execute sequentially with concurrency cancellation and pass/fail reporting.

### Implementation for User Story 1

- [ ] T004 [US1] Create core CI workflow in `.github/workflows/ci.yml` with PR and push triggers, concurrency cancellation, Node 20 setup with npm cache, and execution of lint, typecheck, test:run, and build:ci steps
- [ ] T005 [US1] Validate `.github/workflows/ci.yml` syntax, trigger events, and step sequences against workflow contract in `specs/007-ci-cd-pipelines/contracts/workflows.md`

**Checkpoint**: At this point, User Story 1 (Core CI) should be fully functional and testable independently

---

## Phase 4: User Story 2 - End-to-End Testing Pipeline (Priority: P2)

**Goal**: Automatically run the Playwright E2E test suite in headless Chromium on PRs targeting `main` and pushes to `main`, uploading test report and result artifacts when failures occur.

**Independent Test**: Trigger E2E workflow on PR or push; verify Chromium browser installation (`npx playwright install --with-deps chromium`), test execution (`npm run test:e2e`), concurrency cancellation, and artifact uploads (`playwright-report/` and `test-results/`) with 30-day retention.

### Implementation for User Story 2

- [ ] T006 [P] [US2] Create Playwright E2E testing workflow in `.github/workflows/e2e.yml` with PR and push triggers, concurrency cancellation, Node 20 setup with npm cache, Playwright Chromium installation, test:e2e execution, and artifact upload on failure
- [ ] T007 [US2] Validate `.github/workflows/e2e.yml` artifact upload paths, upload conditions, and retention against workflow contract in `specs/007-ci-cd-pipelines/contracts/workflows.md`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Supabase Migration Validation (Priority: P3)

**Goal**: Automatically validate Supabase database migration syntax using `supabase db lint` when migration files change in `supabase/migrations/**`, skipping execution when non-migration files change.

**Independent Test**: Trigger Supabase workflow on PR modifying `supabase/migrations/**`; verify `npx supabase db lint` execution, concurrency cancellation, and path-filtering behavior.

### Implementation for User Story 3

- [ ] T008 [P] [US3] Create Supabase migration validation workflow in `.github/workflows/supabase.yml` with path filtering on `supabase/migrations/**`, concurrency cancellation, Node 20 setup with npm cache, and `npx supabase db lint` execution step
- [ ] T009 [US3] Validate `.github/workflows/supabase.yml` path filter rules and lint step against workflow contract in `specs/007-ci-cd-pipelines/contracts/workflows.md`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation updates and comprehensive validation across all workflows

- [ ] T010 [P] Document CI/CD pipeline architecture, npm scripts (`build:ci`), and PR status checks in `README.md`
- [ ] T011 Run quickstart validation checklist against all workflow definitions per `specs/007-ci-cd-pipelines/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user stories
- **User Stories (Phases 3–5)**: All depend on Foundational (Phase 2)
  - User Story 1 (P1), User Story 2 (P2), and User Story 3 (P3) can proceed in parallel once Phase 2 is complete
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other user stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Runs independently of US1 in parallel workflow
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Runs independently with path-based triggering

### Within Each User Story

- Workflow configuration file created before contract validation
- Step commands match approved project dependencies and scripts
- Story complete before marking checkpoint verified

### Parallel Opportunities

- Phase 1 tasks (T001, T002) can be prepared in parallel
- Once Phase 2 (T003) is complete, all three user story workflows (T004/T005, T006/T007, T008/T009) can be authored in parallel
- Polish tasks (T010, T011) can run in parallel

---

## Parallel Example: User Story 2 & User Story 3

```bash
# After completing Foundational phase, implement independent workflows in parallel:
Developer A / Subagent 1: "Create Playwright E2E testing workflow in .github/workflows/e2e.yml" (T006)
Developer B / Subagent 2: "Create Supabase migration validation workflow in .github/workflows/supabase.yml" (T008)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`.github/workflows`, `package.json` `build:ci`)
2. Complete Phase 2: Foundational (validate local script execution)
3. Complete Phase 3: User Story 1 (`.github/workflows/ci.yml`)
4. **STOP and VALIDATE**: Verify CI workflow syntax and contract conformance
5. PR ready for Core CI quality gate enforcement (MVP!)

### Incremental Delivery

1. Setup + Foundational → Tooling and `build:ci` script ready
2. Add User Story 1 (`ci.yml`) → Test independently → Core CI MVP operational
3. Add User Story 2 (`e2e.yml`) → Test independently → E2E browser tests and artifact collection active
4. Add User Story 3 (`supabase.yml`) → Test independently → Migration safety validation active
5. Polish → Documentation updated in `README.md` and quickstart scenarios verified

---

## Notes

- `[P]` tasks = different files, no dependencies
- `[Story]` label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Workflows use GitHub Actions standard runner environment (`ubuntu-latest`) and Node 20 LTS with npm cache
- Concurrency group format: `${{ github.workflow }}-${{ github.ref }}` with `cancel-in-progress: true`
