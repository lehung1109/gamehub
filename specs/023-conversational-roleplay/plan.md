# Implementation Plan: Conversational Roleplay

**Branch**: `[023-conversational-roleplay]` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/023-conversational-roleplay/spec.md`

## Summary

Add a conversational roleplay game mode to the application where users read a context and choose the correct response in a simulated chat interface. The system will use existing text-to-speech for audio playback and evaluate answers to improve conversational English skills.

## Technical Context

**Language/Version**: TypeScript

**Primary Dependencies**: React, Next.js, Framer Motion (for chat animations if applicable), Web Speech API (for TTS).

**Storage**: 
- Static data: JSON files in `src/data/conversations/`
- Progress tracking: Supabase

**Testing**: Vitest (unit tests), Playwright (E2E tests)

**Target Platform**: Web (Desktop & Mobile Responsive)

**Project Type**: Next.js Web App Feature

**Performance Goals**: <100ms response time between answer selection and next message rendering

**Constraints**: Audio playback requires user interaction to initialize on most modern browsers.

**Scale/Scope**: ~10 conversational modules initially, extending to more later.

## Constitution Check

*GATE: Passed. Feature aligns with project architecture and uses existing conventions (Next.js, Vitest, local JSON data).*

## Project Structure

### Documentation (this feature)

```text
specs/023-conversational-roleplay/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A for this internal feature)
└── tasks.md             # Phase 2 output (to be generated)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── games/
│       └── roleplay/    # Next.js routes for the game
├── components/
│   └── roleplay/        # Chat UI components (ChatBubble, Choices, etc.)
├── data/
│   └── conversations/   # JSON data for the scenarios
└── types/
    └── roleplay.ts      # TypeScript interfaces
```

**Structure Decision**: Added a new game route under `app/games/roleplay/` and localized components to `components/roleplay/`. Data is stored in `data/conversations/` following the pattern of other games.

## Complexity Tracking

N/A
