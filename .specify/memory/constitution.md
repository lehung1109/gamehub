<!--
  Sync Impact Report
  Version change: 1.0.0 → 1.1.0 (MINOR — new principles added)
  Modified principles: (none — existing principles I–V unchanged)
  Added sections:
    - Principle VI: Spec-Driven Development
    - Principle VII: Superpowers Implementation Workflow
    - Principle VIII: Task Generation Standards
  Removed sections: (none)
  Follow-up TODOs: none
-->

# GameHub Constitution

## Core Principles

### I. Next.js App Router

GameHub is a Next.js application using the App Router exclusively.
- All routes MUST use the `app/` directory convention (no `pages/` directory)
- Server Components MUST be the default; Client Components (`"use client"`)
  are used only when interactivity or browser APIs are required
- Data fetching MUST prefer server-side patterns; client-side fetching is
  permitted only when server-side is not feasible (e.g., real-time updates)
- Static generation (SSG) MUST be preferred over server-side rendering (SSR)
  wherever content allows

### II. TypeScript-First

All application code MUST be written in TypeScript with strict mode enabled.
- `any` type MUST NOT be used; `unknown` with type narrowing is the required
  alternative when the type is truly dynamic
- Shared types MUST live in `src/types/` and be reused across components,
  hooks, and utilities
- Type assertions (`as`) MUST be avoided unless accompanied by a runtime
  guard or an explicit justification comment

### III. Component-Driven UI (Tailwind CSS + shadcn/ui)

All UI MUST be built with Tailwind CSS utility classes and shadcn/ui
components as the design system foundation.
- Custom CSS files MUST NOT be created; all styling MUST use Tailwind
  utilities or CSS variables defined in the global stylesheet
- shadcn/ui components MUST be used for standard UI elements (buttons,
  dialogs, forms, etc.) before creating custom alternatives
- Custom components MUST follow the shadcn/ui composition pattern: accept
  `className` prop, use `cn()` for class merging, and expose a composable API
- Visual design MUST follow flat design principles with child-friendly
  aesthetics (large touch targets, high contrast, emoji-based illustrations)

### IV. Drag-and-Drop with dnd-kit

All drag-and-drop interactions MUST use the dnd-kit library exclusively.
- `@dnd-kit/core` MUST be used for base drag-and-drop functionality
- `@dnd-kit/sortable` MUST be used for sortable list interactions
- Custom drag-and-drop implementations (native HTML5 drag events, other
  libraries) MUST NOT be introduced
- Drag-and-drop components MUST be accessible: keyboard navigation and
  screen reader announcements are required

### V. Test-First (NON-NEGOTIABLE)

Every feature and bug fix MUST have both unit tests and end-to-end tests.
This is non-negotiable.
- Unit tests MUST be written with Vitest and React Testing Library
- End-to-end tests MUST be written with Playwright
- Tests MUST be written before or alongside implementation — no feature is
  considered complete without passing tests
- Unit tests MUST cover: component rendering, user interactions, hook
  behavior, utility functions, and edge cases
- E2E tests MUST cover: complete user flows, page navigation, and critical
  business scenarios
- Test commands: `npm run test:run` (unit), `npm run test:e2e` (e2e)
- All tests MUST pass before code is merged; CI failures block merges

### VI. Spec-Driven Development (NON-NEGOTIABLE)

Every implementation MUST be based on an approved specification, technical
plan, and task list. Undefined requirements MUST NOT be implemented.
- A feature MUST have an approved `spec.md` before any planning begins
- A feature MUST have an approved `plan.md` before any task breakdown begins
- A feature MUST have an approved `tasks.md` before any code is written
- The Spec Kit workflow MUST be followed in order: specify → plan → tasks →
  implement. Skipping or reordering phases is prohibited
- Requirements not captured in the approved specification MUST be deferred
  to a new spec cycle; ad-hoc implementation is prohibited
- Changes to approved specifications MUST go through a formal amendment
  process before implementation resumes

### VII. Superpowers Implementation Workflow (NON-NEGOTIABLE)

The `speckit-implement` agent skill MUST follow the Superpowers workflow.
Each phase activates a specific skill in a defined sequence. Skipping
phases or reordering is prohibited.

**Phase 1 — Workspace Isolation (`using-git-worktrees`)**
Activates when `speckit-implement` starts.
- MUST create an isolated workspace on a new branch (prefer native
  workspace branching; fall back to `git worktree add`)
- MUST run project setup commands (e.g., `npm install`) in the new
  workspace
- MUST verify a clean test baseline — all existing tests MUST pass before
  any implementation begins
- MUST NOT work directly on the main/default branch

**Phase 2 — Task Execution (`subagent-driven-development` or
`executing-plans`)**
Activates when the implementation phase of `tasks.md` begins.
- When using `subagent-driven-development`: MUST dispatch a fresh subagent
  per task with two-stage review (spec compliance first, then code quality).
  Spec compliance MUST pass before code quality review proceeds
- When using `executing-plans`: MUST execute tasks in batches with human
  checkpoints between batches. MUST NOT skip human review at checkpoints.
  Batches MUST follow the dependency order defined in the plan
- The choice between subagent-driven or batch execution is determined by
  task independence: independent tasks use subagents, sequential tasks use
  batch execution

**Phase 3 — Test-Driven Development (`test-driven-development`)**
Activates during implementation of each task.
- MUST enforce the RED-GREEN-REFACTOR cycle strictly:
  1. RED: Write a failing test for the feature/fix
  2. Verify the test fails
  3. GREEN: Write the minimum code to make the test pass
  4. Verify the test passes
  5. REFACTOR: Clean up code while keeping tests green
  6. Commit after the GREEN or REFACTOR step
- Code written before a corresponding failing test MUST be deleted
- Tests MUST be observed failing before implementation code is written

**Phase 4 — Code Review (`requesting-code-review`)**
Activates between phases in `tasks.md`.
- MUST review the diff against the plan/spec for compliance
- Issues MUST be categorized by severity: Critical, Major, Minor, Nit
- Critical issues MUST block progress — they MUST be resolved before
  proceeding to the next phase
- A review summary MUST be produced after each phase

**Phase 5 — Branch Completion (`finishing-a-development-branch`)**
Activates when all tasks in `tasks.md` are complete.
- MUST verify all tests pass on the branch
- MUST verify the build succeeds
- MUST present integration options to the user: merge, create PR, keep
  branch, or discard. Auto-merge is prohibited
- Worktree cleanup MUST occur after the chosen integration action

### VIII. Task Generation Standards

The `speckit-tasks` agent skill MUST follow the `writing-plans` skill
standards when generating `tasks.md`.
- Every task MUST specify exact file paths for all files to be created or
  modified — vague references (e.g., "update the component") are prohibited
- Every task MUST include complete code or detailed pseudocode, not summary
  descriptions. The implementation agent MUST be able to execute the task
  without guessing intent
- Every task MUST include explicit verification steps that define how to
  confirm the task is done (e.g., specific test commands, expected outputs,
  or acceptance criteria)
- Tasks MUST be ordered by dependency — a task MUST NOT reference artifacts
  that are produced by a later task
- The spec (`spec.md`) and plan (`plan.md`) MUST both be read before
  generating tasks; generating tasks from partial context is prohibited

## Technology Stack

Approved technologies for GameHub — additions require a constitution
amendment.

| Layer | Technology | Version Constraint |
|-------|-----------|-------------------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript (strict) | 5.x |
| UI Runtime | React | 19.x |
| Styling | Tailwind CSS | 4.x |
| Component Library | shadcn/ui | 4.x |
| Drag-and-Drop | dnd-kit | 6.x |
| Icons | Lucide React | latest |
| Unit Testing | Vitest + Testing Library | latest |
| E2E Testing | Playwright | latest |
| Deployment | Vercel (free tier) | — |

**Constraints**:
- New dependencies MUST be justified; prefer existing stack capabilities
- No CSS-in-JS libraries (styled-components, Emotion, etc.)
- No state management libraries unless complexity demands it — React state
  and context are the default
- Zero tracking, zero cookies, zero analytics for end users (students);
  authentication is admin-only

## Development Workflow

### Quality Gates

Every change MUST pass these gates before being considered complete:

1. **Lint**: `npm run lint` passes with zero errors
2. **Type Check**: `npx tsc --noEmit` passes with zero errors
3. **Unit Tests**: `npm run test:run` — all tests pass
4. **E2E Tests**: `npm run test:e2e` — all tests pass
5. **Build**: `npm run build` succeeds without errors

### Testing Requirements

- **New component** → unit test for rendering + interaction + e2e for user
  flow
- **New page/route** → e2e test covering navigation and primary scenario
- **Bug fix** → regression test (unit or e2e) reproducing the bug before fix
- **Utility/hook** → unit test covering normal and edge cases
- Test files MUST be co-located or in the `tests/` directory following
  existing project conventions

### Code Organization

- `src/app/` — Routes and page components (App Router)
- `src/components/` — Reusable UI components
- `src/data/` — Static JSON data files
- `src/hooks/` — Custom React hooks
- `src/lib/` — Utility functions and shared logic
- `src/types/` — TypeScript type definitions
- `tests/` — E2E test files (Playwright)

## Governance

This constitution supersedes all other development practices for the
GameHub project.

- Amendments MUST be documented with rationale and versioned
- Technology additions MUST be proposed as constitution amendments before
  adoption
- All code reviews MUST verify compliance with these principles
- Complexity MUST be justified — start simple, apply YAGNI
- When principles conflict, priority order is:
  Spec-Driven > Test-First > Superpowers Workflow > TypeScript-First >
  Component-Driven UI > App Router > Task Generation > dnd-kit
- The `speckit-implement` agent MUST NOT begin work without confirming that
  Principles VI, VII, and VIII are satisfied

**Version**: 1.1.0 | **Ratified**: 2026-08-21 | **Last Amended**: 2026-08-24
