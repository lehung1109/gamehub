# Implementation Plan: Desktop Container Scaling

**Branch**: `008-desktop-container-scaling` | **Date**: 2026-08-24 | **Spec**: [spec.md](file:///F:/projects/gamehub/specs/008-desktop-container-scaling/spec.md)

**Input**: Feature specification from `/specs/008-desktop-container-scaling/spec.md`

## Summary

Expand the GameHub application's layout system for desktop viewports (1280px–1920px+) by removing the root `max-w-5xl` (1024px) bottleneck, introducing responsive `xl:` and `2xl:` breakpoints across all container, grid, and text components, and relaxing pervasive text truncation on wide screens. This is a **styling-only** change — no functional behavior, data model, or API modifications.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Next.js 16.3.1 (App Router), React 19.2.8, Tailwind CSS v4 (via `@tailwindcss/postcss`), shadcn/ui v4.18.0, dnd-kit 6.3.1

**Storage**: N/A — no database or data layer changes

**Testing**: Vitest 4.x + Testing Library 16.x (unit), Playwright 1.62.x (e2e)

**Target Platform**: Web — desktop browsers at 1280px–3440px+ viewports (mobile/tablet unchanged)

**Project Type**: Web application (educational games hub for children)

**Performance Goals**: Zero layout shift during responsive transitions, maintain 60fps animations, no increase in CLS

**Constraints**: Zero visual regressions at ≤1024px viewports (FR-008), styling-only changes preserving all component APIs (assumption), ultra-wide cap to prevent excessive line lengths (FR-009)

**Scale/Scope**: ~50+ files with `max-w-*` constraints, ~15 grid layouts, ~25 truncation instances, 4 game play areas, 3 nested layouts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Next.js App Router | ✅ PASS | No routing changes; all layouts remain in `app/` directory |
| II. TypeScript-First | ✅ PASS | Styling-only; no type definitions affected |
| III. Component-Driven UI (Tailwind + shadcn) | ✅ PASS | All changes use Tailwind utility classes; no custom CSS files created; shadcn composition patterns preserved |
| IV. Drag-and-Drop (dnd-kit) | ✅ PASS | DnD containers expand but dnd-kit library usage unchanged |
| V. Test-First (NON-NEGOTIABLE) | ✅ PASS | Unit tests for responsive class application + E2E visual regression tests required |
| VI. Spec-Driven (NON-NEGOTIABLE) | ✅ PASS | Approved `spec.md` exists; plan follows specify → plan → tasks → implement workflow |
| VII. Superpowers Workflow (NON-NEGOTIABLE) | ✅ PASS | Implementation will follow workspace isolation → task execution → TDD → code review → branch completion |
| VIII. Task Generation Standards | ✅ PASS | Tasks will specify exact file paths, complete code, and verification steps |

**Gate Result**: ✅ ALL GATES PASS — no violations, no complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/008-desktop-container-scaling/
├── spec.md              # Feature specification (approved)
├── plan.md              # This file
├── research.md          # Phase 0 output — responsive scaling decisions
├── data-model.md        # Phase 1 output — responsive design system model
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/
│   └── responsive-contract.md  # Phase 1 output — breakpoint visual contract
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx              # ROOT CHANGE: max-w-5xl → responsive max-width tiers
│   ├── globals.css             # Theme tokens (no changes expected)
│   ├── page.tsx                # Home page: grid scaling + card text
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout: max-w-7xl now effective
│   │   ├── dashboard/page.tsx  # Dashboard: grid + stat card scaling
│   │   └── ...                 # Other admin pages
│   ├── games/
│   │   ├── layout.tsx          # Games layout: no container change needed
│   │   ├── flashcard/          # Flashcard pages: container scaling
│   │   ├── listening/          # Listening page: container scaling
│   │   ├── sentences/          # Sentences page: container scaling
│   │   ├── spelling/           # Spelling page: container scaling
│   │   ├── alphabet/           # Alphabet page: container scaling
│   │   └── numbers-colors/     # Numbers/Colors page: container scaling
│   ├── play/                   # Play pages: inherits root scaling
│   └── tenses/                 # Tenses pages: inherits root scaling
├── components/
│   ├── StudentProfileBadge.tsx         # Truncation relaxation
│   ├── student/StudentBadge.tsx        # Truncation relaxation
│   ├── custom/GameCard.tsx             # Card text + line-clamp relaxation
│   ├── game/
│   │   ├── FlashcardStack.tsx          # Play area max-w expansion
│   │   ├── DragDropBoard.tsx           # Play area max-w expansion
│   │   ├── QuizEngine.tsx              # Play area max-w expansion
│   │   └── LetterGrid.tsx             # Grid column scaling
│   ├── tenses/
│   │   ├── TenseHubMap.tsx             # Grid column scaling
│   │   ├── TenseCard.tsx               # Card text relaxation
│   │   ├── TenseLessonContainer.tsx    # Container scaling
│   │   ├── LessonHeader.tsx            # Truncation relaxation
│   │   └── stages/                     # Stage containers: max-w expansion
│   ├── dashboard/
│   │   ├── ClassOverview.tsx           # Grid + truncation scaling
│   │   └── StudentDetail.tsx           # Card text scaling
│   ├── admin/ConfigList.tsx            # Grid column scaling
│   └── class/ClassList.tsx             # Grid column scaling
└── types/                              # No changes

tests/
├── unit/                               # Responsive class application tests
└── e2e/                                # Visual regression tests at multiple viewports
```

**Structure Decision**: Single project structure. All changes are Tailwind class modifications within existing files. No new files created except tests.
