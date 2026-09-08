# Implementation Plan: Grammar Detective Game

**Branch**: `028-grammar-detective` | **Date**: 2026-09-08 | **Spec**: [specs/028-grammar-detective/spec.md](file:///F:/projects/gamehub/specs/028-grammar-detective/spec.md)

**Input**: Feature specification from `/specs/028-grammar-detective/spec.md`

## Summary

Implement **Grammar Detective (Thám tử sửa lỗi)**, a new interactive educational minigame at `/games/grammar-detective` for GameHub.
The game puts learners in the role of an investigator reviewing workplace and daily communication documents (emails, incident reports, Slack messages) on a themed **Detective Desk**.
Learners activate a **Token Tap Highlighter** to mark suspect words, open a **Deduction Card** to choose the right fix among 3-4 multiple-choice alternatives, hear pronunciation via Web Speech API (`useSpeech`), receive bilingual explanations (English and Vietnamese), manage 3 Credibility points (lives), advance through 4 detective rank tiers (*Intern* to *Chief*), and practice in an optional **Endless Audit** mode.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled, zero `any`)

**Primary Dependencies**: Next.js 16.3.1 (App Router), React 19.2.8, Tailwind CSS v4, shadcn/ui components (`Button`, `Card`, `Progress`, `Dialog`, `Badge`), Lucide React icons, Web Speech API (via existing `useSpeech` hook).

**Storage**: Static JSON database at `src/data/grammar-detective.json` for case documents and error annotations; Supabase integration via existing `useGameTracking` hook for student score and accuracy sync; `localStorage` (`gamehub_grammar_detective_v1`) for client-side progress and unlocked rank tiers.

**Testing**: Vitest + React Testing Library for unit tests (`src/app/games/grammar-detective/__tests__/*.test.tsx`); Playwright for browser-level E2E tests (`tests/grammar-detective.spec.ts`).

**Target Platform**: Responsive Web (Mobile 360px+, Tablet, Desktop 1440px+ on modern Chromium, Safari, Firefox).

**Project Type**: Educational web application feature within existing GameHub platform.

**Performance Goals**: Token tap response < 50ms, Deduction Card opening < 100ms, Web Speech audio start < 500ms, zero layout shifts when replacing words in-place.

**Constraints**: Strict prevention of native browser text-selection menus (Copy/Paste) during highlighter mode; touch targets >= 44x44px; bilingual Vietnamese/English explanations for all error items.

**Scale/Scope**: 1 new game route `/games/grammar-detective`, 1 catalog entry in `games.json`, 1 structured dataset with 12+ case files across 4 rank tiers, 5 focused UI sub-components, 1 tokenizer utility, 1 state machine hook, unit tests, and Playwright E2E spec.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I: Next.js App Router**: Route created in `src/app/games/grammar-detective/page.tsx`, uses `"use client"` where interactive hooks are needed; no `pages/` directory used.
- [x] **Principle II: TypeScript-First**: Strict typing throughout; types declared in `src/types/grammar-detective.ts` without `any`; no unvalidated type assertions.
- [x] **Principle III: Component-Driven UI**: Built with Tailwind CSS v4 utilities and shadcn/ui components; flat child-friendly design; large touch targets.
- [x] **Principle IV: Drag-and-Drop**: Token highlighter uses tap/click interaction (dnd-kit is not required for tap interactions, but if any sorting is introduced later, dnd-kit will be used).
- [x] **Principle V: Test-First**: Unit tests with Vitest for tokenizer and state machine hook; Playwright E2E tests for end-to-end game completion.
- [x] **Tech Stack Compliance**: All dependencies are within approved versions; zero additional third-party dependencies required.

## Project Structure

### Documentation (this feature)

```text
specs/028-grammar-detective/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical research and decisions
├── data-model.md        # Entities, validation, state diagram
├── quickstart.md        # Runnable verification and testing guide
├── contracts/
│   └── grammar-detective-api.ts # TypeScript interfaces and contracts
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Task breakdown (generated via /speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── games/
│       └── grammar-detective/
│           ├── page.tsx                           # Main route & container
│           └── __tests__/
│               ├── tokenizer.test.ts              # Unit tests for text segmentation
│               └── useGrammarDetective.test.ts    # Unit tests for game state machine
├── components/
│   └── game/
│       └── grammar-detective/
│           ├── DetectiveDesk.tsx                  # Case document & token rendering
│           ├── DeductionCard.tsx                  # Error fix modal with 3-4 options
│           ├── DossierSelector.tsx                # Case file selection by rank tier
│           ├── CaseSolvedModal.tsx                # Victory summary dialog
│           └── CaseColdModal.tsx                  # Failure & review debriefing dialog
├── data/
│   └── grammar-detective.json                     # 12+ case files across 4 rank tiers
├── hooks/
│   └── useGrammarDetective.ts                     # Game state machine hook
├── lib/
│   └── grammar-detective-tokenizer.ts             # Deterministic tokenization utility
└── types/
    └── grammar-detective.ts                       # Shared TypeScript interfaces

tests/
└── grammar-detective.spec.ts                      # Playwright E2E test suite
```

**Structure Decision**: Integrated directly into GameHub's established modular App Router pattern under `src/app/games/grammar-detective` with isolated sub-components in `src/components/game/grammar-detective/` and test suites adhering to Principle V.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| *None* | *All architecture strictly adheres to GameHub Constitution* | *N/A* |
