# Implementation Plan: Future Tenses

**Branch**: `022-future-tenses` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/022-future-tenses/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

This feature completes the Future tenses in the English learning app by changing their status from `coming_soon` to `active` in `src/data/tenses/index.json` and creating 4 new JSON data files containing metadata, rules, and exercises based on workplace context.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js, Next.js 16.x

**Primary Dependencies**: None new required (using existing Next.js, React, and JSON data structures)

**Storage**: Static JSON files (`src/data/tenses/`)

**Testing**: Vitest (Unit), Playwright (E2E)

**Target Platform**: Web Browser

**Project Type**: Next.js Web Application

**Performance Goals**: N/A (Static JSON loading)

**Constraints**: Content must follow the exact JSON schema defined in existing tense files.

**Scale/Scope**: 4 new JSON files, 1 file modification.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **App Router**: Passed (no route changes, just data)
- **TypeScript-First**: Passed (JSON data conforms to existing types)
- **Component-Driven UI**: Passed (no UI changes)
- **Test-First (NON-NEGOTIABLE)**: Passed. E2E tests for navigating to Future tenses must pass.
- **Task Generation Standards**: Passed (Will be handled in tasks phase).

## Project Structure

### Documentation (this feature)

```text
specs/022-future-tenses/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
└── data/
    └── tenses/
        ├── index.json                     # Modified
        ├── future-simple.json             # New
        ├── future-continuous.json         # New
        ├── future-perfect.json            # New
        └── future-perfect-continuous.json # New

tests/
└── e2e/
    └── tenses-flow.spec.ts                # Existing E2E test to be verified/updated if needed
```

**Structure Decision**: The feature entirely resides within the existing `src/data/tenses/` static data directory, aligning with the current static generation approach.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(No violations found)*
