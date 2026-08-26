# Implementation Tasks: readme-comprehensive-update

**Feature**: 014-readme-comprehensive-update
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Phase 1: Setup & Worktree

**Purpose**: Workspace isolation (Constitution Principle VI.1)

- [x] T001 Ask the user to confirm the creation of a new git worktree for this feature.
- [x] T002 Create a new git worktree for `014-readme-comprehensive-update` and switch context to it.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Basic file setup

- [x] T003 Backup `README.md` to `README.old.md` to preserve existing content for reference.
  - **Verification**: `cat README.old.md` should display the original README content.

**Checkpoint**: Foundation ready - user story implementation can begin.

---

## Phase 3: User Story 1 - Developer Onboarding (Priority: P1) 🚀 MVP

**Goal**: Detailed technical setup, tech stack, and CI/CD documentation.

**Independent Test**: A developer can follow the instructions and run the app.

### Implementation for User Story 1

- [x] T004 [US1] Spawn a subagent to append "Tech Stack", "Project Structure", "Getting Started" (Node + Supabase), and "NPM Scripts & CI/CD" sections to `README.md`.
  - **Pseudocode**: Write clear Markdown sections explaining `npm install`, Supabase CLI setup (`npx supabase start`), and listing `.github/workflows/` files.
  - **Verification**: `cat README.md` shows the newly appended technical sections.
- [x] T005 [US1] Spawn an iterative review subagent to bug-hunt the written sections in `README.md` against actual codebase files (`package.json`, `.github/workflows/*.yml`).
  - **Verification**: Review subagent reports zero discrepancies.
- [x] T006 [US1] Phase-end commit: `git commit -m "docs: add developer onboarding sections to README.md"`.

**Checkpoint**: Developer onboarding sections are complete and verified.

---

## Phase 4: User Story 2 - Stakeholder/User Overview (Priority: P2)

**Goal**: High-level summary of features and educational games.

**Independent Test**: A non-technical user can understand the platform's features.

### Implementation for User Story 2

- [ ] T007 [US2] Spawn a subagent to prepend the "Project Overview" and "Key Features" sections at the top of `README.md`.
  - **Pseudocode**: Write Markdown explaining Student profiles, game varieties (Alphabet, Flashcards, Tenses), and Teacher/Admin features.
  - **Verification**: `head -n 50 README.md` displays the overview and feature lists.
- [ ] T008 [US2] Spawn an iterative review subagent to verify the described features match `src/data/games.json` and the existing components.
  - **Verification**: Review subagent confirms accuracy.
- [ ] T009 [US2] Phase-end commit: `git commit -m "docs: add project overview and features to README.md"`.

**Checkpoint**: Both user stories are complete.

---

## Phase 5: Final Feature-Level Review & Polish

**Purpose**: Comprehensive review (Constitution Principle VI.6)

- [ ] T010 Spawn a subagent to conduct a final feature-level review of `README.md` (check markdown links, formatting, and overall flow).
  - **Verification**: Subagent reports zero markdown syntax errors.
- [ ] T011 Run quickstart validation. Open `README.md` in a previewer to confirm visual rendering is perfect.
- [ ] T012 Remove backup file `README.old.md`.
  - **Verification**: `ls README.old.md` returns an error.
- [ ] T013 Final comprehensive commit: `git commit -m "docs: complete comprehensive README update"`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup
- **User Stories (Phase 3+)**: US1 (P1) -> US2 (P2). US2 appends to US1's document, so sequential execution is preferred for a single file.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### Parallel Opportunities

- Due to this being a single-file documentation update (`README.md`), tasks should generally be executed sequentially to avoid merge conflicts.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2
2. Complete Phase 3 (US1)
3. The README will now have full developer onboarding instructions, solving the biggest technical hurdle.

### Incremental Delivery

1. Deliver Developer setup instructions.
2. Deliver high-level Overview and Features.
3. Polish and review as a whole.
