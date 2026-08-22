# Implementation Plan: [FEATURE]

**Branch**: `004-student-progress-tracking` | **Date**: 2026-08-22 | **Spec**: `specs/004-student-progress-tracking/spec.md`

**Input**: Feature specification from `specs/004-student-progress-tracking/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

This feature adds student progress tracking to the GameHub platform. Teachers can create classes and share class codes. Students enter the code and their name to track their game results (score, time, wrong answers). Teachers view analytics and detailed results via an admin dashboard and can export CSV reports. The technical approach leverages Supabase for data storage, a secure Next.js API route for unauthenticated tracking submissions, and `sessionStorage` to maintain student session context across games without cookies.

## Technical Context

**Language/Version**: TypeScript 5.x (strict)

**Primary Dependencies**: Next.js (App Router) 16.x, React 19.x, Tailwind CSS 4.x, shadcn/ui 4.x, Supabase (Auth, Database)

**Storage**: Supabase (PostgreSQL), browser `sessionStorage`

**Testing**: Vitest + React Testing Library (Unit), Playwright (E2E)

**Target Platform**: Web application (Vercel)

**Project Type**: Next.js Web App

**Performance Goals**: N/A (Standard web app)

**Constraints**: Zero tracking/cookies for students, Admin-only authentication, `sessionStorage` used for student sessions.

**Scale/Scope**: 20-40 students per class, low abuse risk.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Next.js App Router**: Feature will use `app/` directory and server components where applicable.
- [x] **TypeScript-First**: Types will be strictly defined in `src/types/database.ts` (Supabase generated) and shared types.
- [x] **Component-Driven UI**: Tailwind CSS and shadcn/ui will be used for dashboard and student popups.
- [x] **Drag-and-Drop**: Not applicable for this feature's core logic (game recording works behind the scenes).
- [x] **Test-First**: Unit tests and E2E tests are required.

## Needs Clarification / Research Tasks

- **Supabase unauthenticated writes**: NEEDS CLARIFICATION on how students safely write session/game data without authentication.
- **sessionStorage with Next.js**: NEEDS CLARIFICATION on how to manage client-side state without disrupting server components.
- **CSV Export**: NEEDS CLARIFICATION on best practices for generating and downloading CSVs in Next.js 16.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   │   └── classes/         # Teacher dashboard and class management
│   ├── api/
│   │   └── export-csv/          # API route for CSV export
├── components/
│   ├── class/                   # Class management UI (creating class, viewing lists)
│   ├── dashboard/               # Dashboard components
│   └── student/                 # Student popup (class code + name)
├── hooks/
│   ├── use-student-session.ts   # sessionStorage hook
│   └── use-game-tracking.ts     # Hook to track game results
├── lib/
│   ├── supabase/                # Database and Auth clients
│   └── utils.ts
├── types/
│   └── database.ts              # Supabase database types
└── data/                        # existing files

tests/
├── e2e/
│   └── class-tracking.spec.ts   # E2E test for tracking flows
└── unit/
    ├── use-student-session.test.ts
    └── use-game-tracking.test.ts
```

**Structure Decision**: Using the standard Next.js App Router layout with features grouped by domain within the `app` and `components` directories.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
