<!--
  Sync Impact Report
  Version change: 2.1.0 → 2.1.1 (PATCH — added eslint verification to the Iterative Review & Bug Hunt Subagent Loop)
  Modified principles:
    - Principle VI: Task Generation Standards (updated Iterative Review & Bug Hunt Subagent Loop to include eslint verification)
  Added sections: (none)
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

### VI. Task Generation Standards

The `speckit-tasks` agent skill MUST follow rigorous planning and phase-level
decomposition standards when generating `tasks.md`. The generated tasks MUST
incorporate the following requirements:

1. **Phase 1 Worktree Creation**:
   - Phase 1 MUST prioritize creating a new git worktree for workspace isolation
     before starting implementation tasks.
   - It MUST ask the user to confirm the creation of the new worktree, defaulting
     to creating a new one.
2. **Dedicated Subagent Execution per Phase**:
   - Each phase MUST be executed within a dedicated subagent session to maintain
     clean context boundaries and isolated task execution.
3. **Mandatory Test-Driven Development (TDD)**:
   - Implementation tasks within each phase MUST strictly follow TDD
     (Red-Green-Refactor): write a failing test first, verify failure, implement
     minimal code to make it pass, and refactor while maintaining green tests.
4. **Iterative Review & Bug Hunt Subagent Loop**:
   - At the end of each phase, a dedicated subagent MUST be spawned to conduct
     thorough code review, spec compliance verification, verify eslint, and bug hunting.
   - If any bugs or discrepancies are found, they MUST be resolved immediately.
   - After resolving identified issues, another review subagent MUST be spawned
     to re-evaluate and hunt for remaining bugs.
   - This cycle (Review Subagent → Fix Bugs → Re-review Subagent) MUST repeat
     iteratively until zero bugs remain.
5. **Phase-End Commit**:
   - Once all tasks in the phase are verified and the review loop confirms zero
     bugs, all phase changes MUST be committed with a descriptive conventional
     commit message.
6. **Final Feature-Level Review Phase**:
   - The final phase in `tasks.md` MUST be dedicated entirely to a holistic,
     feature-level review encompassing all previous phases.
   - A subagent MUST be spawned to conduct a comprehensive bug hunt and
     integration review across the entire implemented feature.
   - Any bugs found MUST be fixed, followed by another review subagent execution,
     repeating this cycle until zero bugs remain across the entire feature.
   - Once the final review loop confirms zero bugs, a final comprehensive commit
     MUST be made to finalize the feature implementation.
7. **Task Specification Quality**:
   - Every task MUST specify exact file paths for all files to be created or
     modified (vague references are prohibited).
   - Every task MUST include complete code or detailed pseudocode, not high-level
     summaries.
   - Every task MUST include explicit verification steps (exact test commands,
     expected outputs, or acceptance criteria).
   - Tasks MUST be ordered by dependency; referencing unbuilt upstream
     dependencies without declaring them first is prohibited.
   - The spec (`spec.md`) and plan (`plan.md`) MUST both be read before
     generating tasks; partial context generation is prohibited.
   - All phase workflow requirements (worktree creation in Phase 1, subagent
     execution, TDD steps, iterative review subagent loop, phase-end commit,
     and the final feature-level review phase) MUST be explicitly listed as
     actionable checklist items in `tasks.md`.

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
  Test-First > TypeScript-First > Component-Driven UI > App Router > Task Generation Standards > dnd-kit
- The `speckit-tasks` and implementation agents MUST verify that Principle VI
  is satisfied when creating and executing task lists

**Version**: 2.1.1 | **Ratified**: 2026-08-21 | **Last Amended**: 2026-08-30
