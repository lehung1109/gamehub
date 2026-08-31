# Implementation Plan: Typing / Fill-in-the-Blanks

**Branch**: `[024-typing-fill-in-blanks]` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/024-typing-fill-in-blanks/spec.md`

## Summary

Add a fill-in-the-blanks game mode focused on active grammar recall. Learners type the missing words (primarily tenses) into an input field within a sentence context. The system validates the input, handling case and whitespace gracefully.

## Technical Context

**Language/Version**: TypeScript

**Primary Dependencies**: React, Next.js.

**Storage**: 
- Static data: Existing JSON files in `src/data/tenses/`
- Progress tracking: Supabase

**Testing**: Vitest (unit tests for input validation), Playwright (E2E tests)

**Target Platform**: Web (Desktop & Mobile Responsive - requires careful handling of mobile keyboards)

**Project Type**: Next.js Web App Feature

**Performance Goals**: Instantaneous validation (<50ms) upon pressing Enter/Submit.

**Constraints**: Mobile virtual keyboard may introduce unwanted auto-capitalization or auto-correct; input field must configure `autoComplete`, `autoCorrect`, and `spellCheck` properly.

**Scale/Scope**: Map to the existing Tenses data structure which contains hundreds of sentences.

## Constitution Check

*GATE: Passed. Feature aligns with project architecture and uses existing conventions.*

## Project Structure

### Documentation (this feature)

```text
specs/024-typing-fill-in-blanks/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A)
└── tasks.md             # Phase 2 output (to be generated)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── games/
│       └── typing/      # Next.js routes for the game
├── components/
│   └── typing/          # Components (SentenceWithInput, HintBadge, etc.)
└── types/
    └── config.ts        # Update GameSettingsMap to include 'typing'
```

**Structure Decision**: Added a new game route under `app/games/typing/` and localized components to `components/typing/`. We will reuse `src/data/tenses/` and map it to the required format in runtime or build time.

## Complexity Tracking

N/A
