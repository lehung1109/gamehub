# Implementation Plan: Workplace English Tense Practice - Present Simple

**Branch**: `006-workplace-tense-practice` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-workplace-tense-practice/spec.md`

## Summary

Expand GameHub to working professionals and university students by introducing a dedicated 12-Tenses Hub (`/tenses`) and a comprehensive, modular learning experience for **Thì Hiện Tại Đơn (Present Simple)** at `/tenses/present-simple`. 

The module incorporates 3 high-impact practice stages:
1. **Chia Động Từ Trong Email & Ngữ Cảnh Công Sở (Conjugation)** (8 questions)
2. **Săn Lỗi Sai Văn Phòng (Workplace Error Hunter)** (6 questions)
3. **Ghép Câu Lịch Trình & Giao Tiếp (Sentence Builder)** (6 questions using dnd-kit & tap-to-place)

All tense data is 100% decoupled from legacy game schemas, stored under `src/data/tenses/`, and user progress is persisted locally via `localStorage`.

---

## Technical Context

**Language/Version**: TypeScript 5.x (Strict Mode)
**Primary Dependencies**: Next.js 16.3.1 (App Router), React 19.2.8, Tailwind CSS 4.x, shadcn/ui, `@dnd-kit/core` 6.3.1, `@dnd-kit/sortable` 10.0.0, `lucide-react`
**Storage**: Client-side `localStorage` (`gamehub_tense_progress_v1`), zero database requirement for student/learner self-study
**Testing**: Vitest 4.x + React Testing Library (Unit/Integration), Playwright (E2E)
**Target Platform**: Web Browsers (Mobile 360px+, Tablet, Desktop)
**Project Type**: Next.js Web Application
**Performance Goals**: Instant client-side stage transitions, <100ms UI feedback, static generation (SSG) for all tense lesson pages
**Constraints**: 
- 100% decoupling from legacy `Game`, `Topic`, `Word`, `Sentence` schemas
- Zero required user login or tracking overhead for tense practice
- Fully responsive across mobile viewports (minimum 360px width, 44px minimum touch targets)
- Web Speech API integration with graceful fallback
**Scale/Scope**: 1 Hub Page, 1 Modular Lesson Page (Present Simple), 4 Tab/Stage Views, 1 Completion Dashboard, 20 Challenge Items, 5 Theory Cards

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Verification / Justification |
|-----------|-------------|:------:|------------------------------|
| **I. Next.js App Router** | App router (`src/app/tenses`), Server Components by default, SSG pre-rendering | **PASS** | `/tenses` and `/tenses/[slug]` use App Router SSG with `generateStaticParams`. Client interactivity is scoped to `TenseLessonContainer` and stage components. |
| **II. TypeScript-First** | Strict mode, no `any`, shared types in `src/types/tenses.ts` | **PASS** | Complete types defined in `src/types/tenses.ts` and `contracts/tense-module.contract.ts`. No `any` used. |
| **III. Component-Driven UI** | Tailwind CSS + shadcn/ui foundation, no custom CSS files | **PASS** | Uses Tailwind 4 utility classes, existing shadcn/ui primitives (`Button`, `Card`, `Badge`, `Tabs`, `Progress`). |
| **IV. Drag-and-Drop** | `@dnd-kit/core` exclusively for drag-and-drop | **PASS** | Stage 3 Sentence Builder uses `@dnd-kit/core` with `PointerSensor` and `KeyboardSensor`, complemented by tap-to-select for mobile convenience. |
| **V. Test-First** | Vitest + RTL (Unit) and Playwright (E2E) | **PASS** | Plan includes comprehensive unit tests for all components, hooks, storage utilities, and Playwright E2E tests for the full user flow. |

---

## Project Structure

### Documentation (this feature)

```text
specs/006-workplace-tense-practice/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0 architectural decisions & technical context
├── data-model.md        # Phase 1 data entities, schemas, and state transitions
├── contracts/           # Phase 1 interface contracts
│   ├── tense-module.contract.ts
│   └── ui-contracts.md
└── quickstart.md        # Phase 1 runnable validation scenarios
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── page.tsx                             # Updated homepage with prominent Tenses banner
│   └── tenses/
│       ├── page.tsx                         # 12-Tenses Hub Map (SSG Server Component)
│       └── [slug]/
│           └── page.tsx                     # Dynamic Tense Lesson Page (SSG Server Component)
├── components/
│   └── tenses/
│       ├── TenseHubMap.tsx                  # Interactive Hub view with progress badges
│       ├── TenseCard.tsx                    # Individual tense status card
│       ├── TenseLessonContainer.tsx         # Main client container managing tabs & stages
│       ├── LessonHeader.tsx                 # Navigation breadcrumb, title & progress bar
│       ├── QuickRulesTab.tsx                # Cheat-sheet rule cards & workplace tips
│       ├── stages/
│       │   ├── ConjugationStage.tsx         # Stage 1: Workplace Email Cloze
│       │   ├── ErrorHunterStage.tsx         # Stage 2: Office Proofreading & Token Fix
│       │   └── SentenceBuilderStage.tsx     # Stage 3: dnd-kit & Tap Token Builder
│       └── CompletionDashboard.tsx          # Lesson summary, score tally & replay controls
├── data/
│   └── tenses/
│       ├── index.json                       # 12-Tenses master catalog & metadata
│       └── present-simple.json              # Complete data package for Present Simple
├── lib/
│   └── tenses/
│       ├── storage.ts                       # LocalStorage persistence & hydration helper
│       └── validation.ts                    # Answer normalization & validation helpers
└── types/
    └── tenses.ts                            # Dedicated TypeScript interfaces for tense system

tests/
├── unit/
│   ├── tenses/
│   │   ├── storage.test.ts                  # LocalStorage unit tests
│   │   ├── validation.test.ts               # Grammar validation unit tests
│   │   ├── QuickRulesTab.test.tsx           # Grammar rule display & audio unit tests
│   │   ├── ConjugationStage.test.tsx        # Stage 1 interaction & grading tests
│   │   ├── ErrorHunterStage.test.tsx        # Stage 2 proofreading tests
│   │   ├── SentenceBuilderStage.test.tsx    # Stage 3 dnd & tap tests
│   │   └── TenseHubMap.test.tsx             # Hub badge rendering tests
│   └── data/
│       └── tenses-schema.test.ts            # JSON schema integrity validation
└── e2e/
    └── tenses-flow.spec.ts                  # Playwright E2E test for complete user journey
```

**Structure Decision**: 
The structure follows a strictly modular, decoupled organization under `src/app/tenses/`, `src/components/tenses/`, `src/data/tenses/`, `src/lib/tenses/`, and `src/types/tenses.ts`. This ensures complete isolation from the legacy kids game codebase while upholding the Next.js App Router and GameHub constitution principles.

---

## Complexity Tracking

> *No constitution violations detected. All additions follow standard App Router and approved libraries.*

| Item | Status | Justification |
|------|--------|---------------|
| `src/data/tenses/` | Approved | Decoupled data model ensuring no legacy dependency |
| `@dnd-kit/core` in Stage 3 | Approved | Mandated by Constitution Principle IV for drag & drop |
| `localStorage` persistence | Approved | Zero-friction user experience matching non-login requirement (FR-012) |

---

## Next Steps

With Phase 0 (Research) and Phase 1 (Design, Data Model, Contracts, Quickstart) complete, the feature is ready for `/speckit-tasks` to generate granular implementation tasks in `tasks.md`.
