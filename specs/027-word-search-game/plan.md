# Implementation Plan: Word Search Game (Trò chơi Săn Tìm Từ Vựng)

**Branch**: `027-word-search-game` | **Date**: 2026-09-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/027-word-search-game/spec.md`

## Summary

Add an interactive Word Search Game (Trò chơi Săn Tìm Từ Vựng) on an 8x8 character matrix designed for primary school and ESL learners. Players find target vocabulary words arranged strictly horizontally (left-to-right) and vertically (top-to-bottom) using either continuous pointer drag or two-tap coordinate selection. The game includes rich visual and auditory aids (emojis, Vietnamese meanings, Web Speech API pronunciation), a 💡 Hint button that pulses target initial letters, a multi-color gradient renderer for intersecting words, a friendly stopwatch timer, star rating calculations, classroom progress tracking synchronization, and a full Teacher Admin configuration form with live preview mode.

## Technical Context

**Language/Version**: TypeScript 5.x (Strict mode enabled)

**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Tailwind CSS 4.x, shadcn/ui, Lucide React

**Storage**: 
- Static vocabulary data: Existing JSON topic dictionaries in `src/data/words/*.json` and `src/data/topics.json`
- Persistent configurations and progress tracking: Supabase via existing `/api/track` and configs server actions

**Testing**: Vitest + React Testing Library (Unit tests), Playwright (E2E tests)

**Target Platform**: Responsive Web (Mobile, Tablet, Desktop) with touch target compliance for young children (≥ 36x36px)

**Project Type**: Next.js Web Application Game Module

**Performance Goals**: Grid generation < 50ms; visual drag highlight latency < 50ms; 60fps CSS animations

**Constraints**: 8x8 fixed grid; horizontal and vertical directions only; zero external canvas game engines (standard React DOM Pointer Events + CSS Grid); multi-color gradient support for intersecting cells

**Scale/Scope**: 5 vocabulary topics (~75 words), 4-6 target words per round, public gameplay route + teacher admin config + progress tracking

## Constitution Check

*GATE: Passed with zero violations.*

- **Principle I (Next.js App Router)**: All new routes created under `src/app/games/word-search/page.tsx` adhering to App Router patterns.
- **Principle II (TypeScript-First)**: Strict typing used for all models (`WordSearchCell`, `WordSearchTargetWord`, `WordSearchGameState`, `WordSearchSettings`), zero `any`.
- **Principle III (Component-Driven UI)**: Standard Tailwind CSS utility classes and shadcn/ui base components used; flat child-friendly design.
- **Principle IV (Drag-and-Drop with dnd-kit)**: N/A (Word search selection uses Pointer Events for straight coordinate paths; no drop containers).
- **Principle V (Test-First NON-NEGOTIABLE)**: Comprehensive Vitest unit tests for generator, hooks, and components, alongside Playwright E2E tests covering full gameplay flows.
- **Principle VI (Task Generation Standards)**: Standards to be strictly enforced during `/speckit-tasks` (Phase 1 worktree creation, phase-level quality, TDD, iterative review subagents).

## Project Structure

### Documentation (this feature)

```text
specs/027-word-search-game/
├── checklists/
│   └── requirements.md  # Spec quality checklist
├── contracts/
│   └── ui-contract.md   # Interface and configuration contracts
├── data-model.md        # Domain entities and runtime state model
├── plan.md              # Implementation plan (this file)
├── quickstart.md        # Manual and automated verification scenarios
├── research.md          # Architectural and technical decisions
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
src/
├── app/
│   └── games/
│       └── word-search/
│           └── page.tsx                         # Main gameplay page with topic selection & win dialog
├── components/
│   ├── config/
│   │   ├── ConfigCreateForm.tsx                 # Register WordSearchConfigForm in switch
│   │   ├── ConfigEditForm.tsx                   # Register WordSearchConfigForm in switch
│   │   └── WordSearchConfigForm.tsx            # Teacher admin configuration form
│   └── game/
│       ├── WordSearchBoard.tsx                  # 8x8 matrix board with Pointer Event drag/tap
│       ├── WordSearchCellItem.tsx               # Individual cell with selection & multi-color gradient
│       └── WordSearchWordList.tsx               # Target words list with emoji, text, meaning, audio
├── data/
│   └── games.json                               # Game catalog entry for Word Search
├── hooks/
│   └── useWordSearchGame.ts                     # Core game engine hook (turns, drag path, matches, hints, rating)
├── lib/
│   ├── game-config-schema.ts                    # Schema validation & default settings
│   └── word-search-generator.ts                 # Deterministic 8x8 grid placement utility
└── types/
    ├── config.ts                                # WordSearchSettings and GameSettingsMap mapping
    ├── index.ts                                 # Exported Game types
    └── word-search.ts                           # Domain types (WordSearchCell, WordSearchTargetWord, etc.)

tests/
├── e2e/
│   └── word-search.spec.ts                      # Playwright E2E test for full user journeys
└── unit/
    ├── components/
    │   ├── WordSearchBoard.test.tsx             # Board rendering, pointer drag, two-tap tests
    │   └── WordSearchConfigForm.test.tsx        # Admin config form unit tests
    ├── hooks/
    │   └── useWordSearchGame.test.ts            # Game loop, selections, matches, hint, rating tests
    └── lib/
        └── word-search-generator.test.ts        # Deterministic placement, word fitting, random fill tests
```

**Structure Decision**: Aligns 100% with existing GameHub architecture patterns (`memory-match`, `spelling`, `listening`). UI components placed under `src/components/game/`, gameplay logic isolated in `src/hooks/useWordSearchGame.ts`, placement algorithm isolated in `src/lib/word-search-generator.ts`, and admin config form under `src/components/config/`.

## Complexity Tracking

*Zero violations. No additional complexity required.*
