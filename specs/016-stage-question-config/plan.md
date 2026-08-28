# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary
Feature allows users to select question counts (e.g. 5, 10, All) per stage from dynamic chip selectors in `TenseLessonContainer`. It introduces history pool tracking in `sessionStorage` via an updated `useSessionQuestions` hook to prevent duplicate questions across continuous replays until the question pool is exhausted, gracefully wrapping around when needed.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Next.js (App Router), React 19.x, `sessionStorage`

**Storage**: `sessionStorage` (for transient history and session state)

**Testing**: Vitest + React Testing Library (Unit tests for `useSessionQuestions` and Stage Cards)

**Target Platform**: Web (Desktop & Mobile)

**Project Type**: Next.js Web Application

**Performance Goals**: Instant question subsetting and array shuffling

**Constraints**: Must strictly adhere to `sessionStorage` API limits; handle SSR safely (e.g. `typeof window !== 'undefined'`)

**Scale/Scope**: ~20-50 questions per stage. Array operations are tiny and negligible.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Next.js App Router**: N/A for data layer, Client Components used effectively.
- [x] **II. TypeScript-First**: Hooks and state correctly typed using generics.
- [x] **III. Component-Driven UI**: Chip selectors will use Tailwind classes and adhere to Shadcn styles.
- [x] **V. Test-First**: Requires unit tests for new `useSessionQuestions` logic.
- [x] **VI. Task Generation Standards**: Will be observed during implementation phases.

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
├── components/tenses/
│   ├── TenseLessonContainer.tsx       # State & rendering for chip selectors
│   └── stages/                        # Receive questionCount prop
│       ├── ConjugationStage.tsx
│       ├── ErrorHunterStage.tsx
│       ├── SentenceBuilderStage.tsx
│       └── DevOpsChallengeStage.tsx
├── hooks/
│   └── useSessionQuestions.ts         # Updated pool extraction logic
└── lib/
    └── utils.ts                       # Helper arrays (shuffle)

tests/
├── unit/
│   ├── useSessionQuestions.test.ts    # Unit tests for selection logic
│   └── tenses/TenseLessonContainer.test.tsx
```

**Structure Decision**: A single cohesive feature working inside existing Next.js App Router directories.
