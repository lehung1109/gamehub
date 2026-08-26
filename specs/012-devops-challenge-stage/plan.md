# Implementation Plan: Chặng 4: DevOps Challenge Stage

**Branch**: `012-devops-challenge-stage` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-devops-challenge-stage/spec.md`

## Summary

Add a new Stage 4 (DevOps Challenge) to grammar lessons, combining Conjugation, Error Hunting, and Sentence Building exercises with IT/DevOps contexts. The implementation focuses on refactoring existing stage components to extract reusable question UI components, adding an optional `devOpsChallenge` array to the data model, and safely updating local storage aggregation.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Tailwind CSS, shadcn/ui, dnd-kit

**Storage**: LocalStorage via `src/lib/tenses/storage.ts`

**Testing**: Vitest (Unit), Playwright (E2E)

**Target Platform**: Web (Vercel)

**Project Type**: Web Application

**Performance Goals**: Fast UI transition between different question types, smooth dnd-kit interaction.

**Constraints**: Zero tracking. Strictly use Tailwind CSS and shadcn/ui for UI components. Must not break existing LocalStorage structures.

**Scale/Scope**: Refactoring 3 existing stage components. Modifying 1 JSON data file. Modifying `storage.ts`. Creating 1 new Stage component.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Next.js App Router**: N/A (Component level changes, routes remain same)
- [x] **TypeScript-First**: Strict typing using discriminated unions for mixed items.
- [x] **Component-Driven UI**: Extracted question UI components will follow Tailwind/shadcn patterns.
- [x] **Drag-and-Drop with dnd-kit**: Kept fully intact during extraction.
- [x] **Test-First**: Unit tests required for new `storage.ts` logic. E2E tests required for the new stage.

## Project Structure

### Documentation (this feature)

```text
specs/012-devops-challenge-stage/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── components/tenses/stages/
│   ├── ConjugationStage.tsx          # To refactor
│   ├── ErrorHunterStage.tsx          # To refactor
│   ├── SentenceBuilderStage.tsx      # To refactor
│   ├── DevOpsChallengeStage.tsx      # NEW
│   └── ui/                           # NEW
│       ├── ConjugationQuestionUI.tsx     # NEW
│       ├── ErrorHunterQuestionUI.tsx     # NEW
│       └── SentenceBuilderQuestionUI.tsx # NEW
├── data/tenses/
│   └── present-simple.json           # To modify (add 9 mock questions)
├── lib/tenses/
│   └── storage.ts                    # To modify
└── types/
    └── tenses.ts                     # To modify
```

**Structure Decision**: The project is a standard web application. Components are separated by feature. To avoid duplicating logic between individual stages and the mixed `DevOpsChallengeStage`, core interactive UI elements of each question type will be extracted into a `ui/` subdirectory within `stages/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(No violations)*
