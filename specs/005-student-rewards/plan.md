# Implementation Plan: Student Rewards & Leveling

**Branch**: `005-student-rewards` | **Date**: 2026-08-23 | **Spec**: [005-student-rewards/spec.md](./spec.md)

**Input**: Feature specification from `specs/005-student-rewards/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Implement a Gamification feature that calculates a student's total stars dynamically from their game sessions and displays a progression badge (stars + level avatar) in the Navbar. The system will sync data across devices using the class code and student name.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Next.js 16.x, React 19.x, Tailwind CSS 4.x, Supabase

**Storage**: PostgreSQL (via Supabase - no new tables required, uses `game_sessions`)

**Testing**: Vitest (Unit), Playwright (E2E)

**Target Platform**: Web browsers (Mobile & Desktop)

**Project Type**: Next.js App Router Web Application

**Performance Goals**: < 1s for badge display, < 200ms latency for saving score

**Constraints**: Dynamically calculate total score without creating new storage schemas. Real-time UI updates on game completion.

**Scale/Scope**: Classroom scale (typically <50 students per class, <1000 sessions per student).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Next.js App Router**: Compliant. Will use Server Actions for data fetching.
- **TypeScript-First**: Compliant. Strict types will be used for Context and API calls.
- **Component-Driven UI**: Compliant. `StudentProfileBadge` will use Tailwind and standard composition.
- **Test-First**: Compliant. Will write unit tests for the Server Action and level logic, E2E for the complete flow.
- **Zero Tracking**: Compliant. Uses only session storage for the required display, no 3rd-party analytics.

## Project Structure

### Documentation (this feature)

```text
specs/005-student-rewards/
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
│   ├── actions/
│   │   └── student-progress.ts  # Server Action for total stars
│   ├── api/
│   │   └── track/route.ts       # Updated to handle fixed scores
│   ├── (games)/                 # Update non-scoring games to pass score: 5
│   └── layout.tsx               # Add StudentSessionProvider and StudentProfileBadge
├── components/
│   └── StudentProfileBadge.tsx  # Navbar badge UI
├── contexts/
│   └── StudentSessionContext.tsx# State management for totalStars and levels
└── lib/
    └── levels.ts                # Level thresholds and badges

tests/
├── e2e/
│   └── student-rewards.spec.ts  # End-to-end tests for gamification
└── unit/
    ├── actions/
    │   └── student-progress.test.ts # Unit tests for calculation
    └── lib/
        └── levels.test.ts       # Unit tests for level calculation
```

**Structure Decision**: Integrated seamlessly into the existing Next.js App Router structure. `StudentProfileBadge` will live in `src/components/`, `levels.ts` config in `src/lib/`, and the server action in `src/app/actions/`.

## Complexity Tracking
*No constitution violations requiring justification.*
