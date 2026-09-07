# Implementation Plan: Memory Match Game (Trò chơi Lật Thẻ Tìm Cặp)

**Branch**: `026-memory-match-game` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/026-memory-match-game/spec.md`

## Summary

Add an interactive Memory Match Game (Trò chơi Lật Thẻ Tìm Cặp) where young learners flip cards to pair visual Emoji illustrations with corresponding English words. The game supports selectable pair counts (4, 6, or 8 pairs), Web Speech audio pronunciation and audio replay on matched cards, proportional star rating calculations, progress tracking synchronization for classrooms, and full Teacher Admin configuration with live preview.

## Technical Context

**Language/Version**: TypeScript 5.x (Strict mode enabled)

**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Tailwind CSS 4.x, shadcn/ui, Lucide React

**Storage**: 
- Static data: Existing JSON topic and vocabulary dictionaries in `src/data/words/*.json` and `src/data/topics.json`
- Persistent configurations and progress tracking: Supabase via existing `/api/track` and `configs` server actions

**Testing**: Vitest + React Testing Library (Unit tests), Playwright (E2E tests)

**Target Platform**: Responsive Web (Mobile, Tablet, Desktop) with touch target compliance for young children (>= 72px)

**Project Type**: Next.js Web Application Game Module

**Performance Goals**: Interaction latency < 100ms; 60fps CSS 3D transform flip animations

**Constraints**: Zero external heavy canvas game engines; responsive grid layout (2x4, 3x4, 4x4) fitting within viewport without vertical scroll during play

**Scale/Scope**: 5 vocabulary topics (~75 words), 3 difficulty levels (4, 6, 8 pairs), public gameplay route + teacher admin config + progress tracking

## Constitution Check

*GATE: Passed with zero violations.*

- **Principle I (Next.js App Router)**: All new routes created in `src/app/games/memory-match/page.tsx` adhering to App Router patterns.
- **Principle II (TypeScript-First)**: Strict typing used for all models (`MemoryCard`, `MemoryGameState`, `MemoryMatchSettings`), zero `any`.
- **Principle III (Component-Driven UI)**: Standard Tailwind CSS utility classes and shadcn/ui base components used; flat child-friendly design.
- **Principle IV (Drag-and-Drop with dnd-kit)**: N/A (Memory match is click/tap to flip).
- **Principle V (Test-First NON-NEGOTIABLE)**: Comprehensive Vitest unit tests for components/hooks and Playwright E2E tests covering full gameplay flows.
- **Principle VI (Task Generation Standards)**: Standards to be strictly enforced during `/speckit-tasks` (Phase 1 worktree creation, TDD, iterative review subagents).

## Project Structure

### Documentation (this feature)

```text
specs/026-memory-match-game/
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
│       └── memory-match/
│           └── page.tsx                     # Main gameplay page with topic selection & win screen
├── components/
│   ├── config/
│   │   ├── ConfigCreateForm.tsx             # Register MemoryMatchConfigForm in switch
│   │   ├── ConfigEditForm.tsx               # Register MemoryMatchConfigForm in switch
│   │   └── MemoryMatchConfigForm.tsx        # Teacher admin configuration form
│   └── game/
│       ├── MemoryBoard.tsx                  # Responsive grid layout for cards
│       └── MemoryCard.tsx                   # Flippable card component with 3D transform
├── data/
│   └── games.json                           # Game catalog entry for Memory Match
├── hooks/
│   └── useMemoryGame.ts                     # Core game engine hook (turns, matches, rating)
├── lib/
│   └── game-config-schema.ts                # Schema validation & default settings
└── types/
    ├── config.ts                            # MemoryMatchSettings and GameSettingsMap mapping
    └── index.ts                             # Exported Game types

tests/
├── e2e/
│   └── memory-match.spec.ts                 # Playwright E2E test for full user journeys
└── unit/
    ├── components/
    │   ├── MemoryCard.test.tsx              # Card flip, audio trigger, accessibility tests
    │   └── MemoryMatchConfigForm.test.tsx   # Admin config form unit tests
    └── hooks/
        └── useMemoryGame.test.ts            # Shuffling, pairing, matching, star rating tests
```

**Structure Decision**: Fully aligns with existing GameHub architecture patterns (e.g., `spelling`, `listening`, `reading`). UI components placed under `src/components/game/`, gameplay logic isolated in `src/hooks/useMemoryGame.ts`, and admin config form under `src/components/config/`.

## Complexity Tracking

N/A - Zero constitutional violations or unnecessary complexity introduced.
