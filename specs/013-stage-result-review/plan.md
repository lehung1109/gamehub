# Implementation Plan: stage-result-review

**Branch**: `013-stage-result-review` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/013-stage-result-review/spec.md`

## Summary

Implement a stage result summary and detailed review UI that displays after a user completes a 10-question practice stage. Expand the underlying question bank to 20 questions per stage, drawing exactly 10 at random per session, and persist detailed attempt history to Local Storage for later review.

## Technical Context

**Language/Version**: TypeScript (strict) 5.x

**Primary Dependencies**: Next.js (App Router) 16.x, React 19.x, Tailwind CSS 4.x, shadcn/ui 4.x

**Storage**: Web API `localStorage`

**Testing**: Vitest + Testing Library (Unit), Playwright (E2E)

**Target Platform**: Web Browsers (Mobile and Desktop)

**Project Type**: Next.js Web Application

**Performance Goals**: UI updates and local storage persistence must be instant with no noticeable lag.

**Constraints**: Test-first methodology is non-negotiable; zero tracking/cookies; adhere to shadcn/ui composition patterns.

**Scale/Scope**: 4 tense practice stages, each having a minimum of 20 questions. `localStorage` capacity (5MB) is ample for storing textual history strings.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **UI Stack**: Validated. Will use Tailwind CSS and shadcn/ui.
- **Testing**: Validated. Will employ Vitest and Playwright.
- **Component Design**: Validated. Will use composable React components without CSS-in-JS.
- **Data Persistence**: Validated. Will use existing `localStorage` wrapper logic inside `src/lib/tenses/storage.ts`.

## Project Structure

### Documentation (this feature)

```text
specs/013-stage-result-review/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
src/
├── app/
├── components/
│   ├── tenses/
│   │   ├── CompletionDashboard.tsx
│   │   ├── TenseLessonContainer.tsx
│   │   └── stages/
│   │       ├── ui/
│   │       │   ├── StageResultUI.tsx (NEW)
│   │       │   └── HistoryReviewUI.tsx (NEW)
├── data/
│   └── tenses/
│       └── present-simple.json
├── hooks/
│   └── useSessionQuestions.ts
├── lib/
│   └── tenses/
│       └── storage.ts
└── types/
    └── tenses.ts
```

**Structure Decision**: The implementation will integrate directly into the existing `src/` directory, expanding the existing `tenses` feature module.

## Complexity Tracking

*No constitution violations. Default architecture fully supports the feature requirements.*
