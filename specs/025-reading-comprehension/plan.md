# Implementation Plan: Reading Comprehension

**Branch**: `[025-reading-comprehension]` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/025-reading-comprehension/spec.md`

## Summary

Add a reading comprehension module where learners read short texts and answer multiple-choice questions to test their understanding. Includes interactive vocabulary highlighting.

## Technical Context

**Language/Version**: TypeScript

**Primary Dependencies**: React, Next.js, Markdown parser (e.g., `react-markdown` if we want to support rich text formatting easily, or custom simple parser).

**Storage**: 
- Static data: New JSON files in `src/data/reading/`
- Progress tracking: Supabase

**Testing**: Vitest, Playwright

**Target Platform**: Web (Desktop & Mobile Responsive - complex layout required to fit text and questions)

**Project Type**: Next.js Web App Feature

**Performance Goals**: Layout must shift smoothly on mobile.

**Constraints**: Long texts require a scrollable container independent of the questions.

**Scale/Scope**: Initial batch of ~5 reading passages.

## Constitution Check

*GATE: Passed.*

## Project Structure

### Documentation (this feature)

```text
specs/025-reading-comprehension/
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
│       └── reading/     # Next.js routes for the game
├── components/
│   └── reading/         # Split layout, PassageText, QuestionList
└── data/
    └── reading/         # New directory for reading passages JSON
```

**Structure Decision**: Added new game route under `app/games/reading/` and components to `components/reading/`. Data goes to a new folder `src/data/reading/`.

## Complexity Tracking

N/A
