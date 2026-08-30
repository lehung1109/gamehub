# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary


Implement a standalone "Parts of Speech" Hub (`/parts-of-speech`) for working adults, consisting of 5 lessons (Noun, Verb, Adjective, Adverb, Mixed). Each lesson contains 3 interactive stages: Word Family (using drag-and-drop), Fill-in Blank (multiple choice), and Error Hunting. The implementation will closely mirror the existing "Tenses" feature architecture, reusing UI components where possible and persisting progress in local storage.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Next.js (App Router) 16.x, React 19.x, Tailwind CSS 4.x, shadcn/ui 4.x, dnd-kit 6.x

**Storage**: Local Storage (for progress tracking)

**Testing**: Vitest (Unit), Playwright (E2E)

**Target Platform**: Web (Vercel)

**Project Type**: Web application

**Performance Goals**: N/A (Standard web)

**Constraints**: Zero tracking, Component-Driven UI, dnd-kit for drag-and-drop interactions.

**Scale/Scope**: 1 Hub Page, 5 Lesson Types, 3 Stages per Lesson.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] App Router used exclusively (`src/app/parts-of-speech`)
- [x] TypeScript strict mode adhered to
- [x] Tailwind + shadcn/ui used for styling
- [x] dnd-kit used for Word Family stage drag-and-drop
- [x] Unit (Vitest) and E2E (Playwright) testing required for all new features
- [x] Progress tracking uses local storage (zero tracking/cookies)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── parts-of-speech/
│       ├── page.tsx
│       └── [slug]/page.tsx
├── components/
│   └── parts-of-speech/
│       ├── PartsOfSpeechHubMap.tsx
│       ├── PartsOfSpeechLessonContainer.tsx
│       └── stages/
│           ├── WordFamilyStage.tsx
│           ├── FillInBlankStage.tsx
│           └── ErrorHuntingStage.tsx
├── data/
│   └── parts-of-speech/
│       ├── index.json
│       └── noun.json
└── types/
    └── parts-of-speech.ts

tests/
├── unit/
│   └── components/parts-of-speech/
└── e2e/
    └── parts-of-speech.spec.ts
```

**Structure Decision**: The feature is integrated into the existing Next.js App Router structure, mirroring the architecture of the `tenses` module to ensure consistency and speed of delivery.


