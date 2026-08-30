# Implementation Plan: Expand Sentence Sorting Data

**Branch**: `018-longer-sorting-sentences` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/018-longer-sorting-sentences/spec.md`

## Summary

Expand the existing sentence sorting game data from 15 simple sentences to 50 complex sentences (10-12 words long). The data is stored statically in a JSON file and no major application architecture changes are required. The focus will be entirely on writing the 50 sentences and ensuring they conform to the schema and length constraints.

## Technical Context

**Language/Version**: TypeScript (strict) / JSON data

**Primary Dependencies**: Next.js 16.x, React 19.x, Tailwind CSS 4.x, dnd-kit 6.x

**Storage**: `src/data/sentences.json`

**Testing**: Vitest + React Testing Library (Unit), Playwright (E2E)

**Target Platform**: Web (Next.js Application)

**Project Type**: Next.js Web App

**Performance Goals**: N/A for static data changes

**Constraints**: Sentences MUST be exactly 10 to 12 words long. Data MUST conform strictly to the existing JSON schema so as not to break the UI.

**Scale/Scope**: 50 Sentence items.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Next.js App Router**: Complies (data modification only).
- **II. TypeScript-First**: Complies (data matches existing TS types implicitly).
- **V. Test-First (NON-NEGOTIABLE)**: Complies (Test-driven approach will be used to validate the JSON structure and word lengths before final integration).
- **VI. Task Generation Standards**: Will be enforced in the subsequent `/speckit-tasks` step.

All checks pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/018-longer-sorting-sentences/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
src/
└── data/
    └── sentences.json   # The target file for modification

tests/
└── # Existing unit or E2E tests for the sentence sorting feature
```

**Structure Decision**: The project is a Next.js web application. We only need to touch `src/data/sentences.json` and potentially add a small validation test in `tests/` or `src/` to strictly enforce the 10-12 word length requirement for all sentences.
