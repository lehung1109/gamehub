# Implementation Plan: Complete Present Perfect and Present Perfect Continuous Tenses

**Branch**: `020-present-perfect-tenses` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/020-present-perfect-tenses/spec.md`

## Summary

This feature adds missing data for the "Present Perfect" and "Present Perfect Continuous" tenses. It involves changing their status in `index.json` to "active" and creating two comprehensive JSON files that define 80 workplace-themed challenges (20 per challenge type) for each tense, adhering exactly to the existing `TenseModuleData` interface.

## Technical Context

**Language/Version**: TypeScript 5.x / JSON Data

**Primary Dependencies**: Next.js App Router, React 19.x

**Storage**: Static JSON Files in `src/data/tenses/`

**Testing**: Existing TypeScript interfaces (no new unit tests strictly needed for static JSON, but the data must pass `tsc` type-checking if imported or JSON parse validation)

**Target Platform**: Web (GameHub Next.js application)

**Project Type**: Web Application Data Payload

**Performance Goals**: N/A (Static JSON loading)

**Constraints**: Content must be strictly IT/Workplace themed. Total 80 challenges per tense (20 conjugation, 20 error hunting, 20 sentence building, 20 devops).

**Scale/Scope**: 2 new JSON files (~1000 lines each) and 1 modification to `index.json`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Uses existing stack (TypeScript, JSON Data).
- [x] No new dependencies introduced.
- [x] Fully compliant with the existing `TenseModuleData` UI definitions (which uses shadcn/ui and Tailwind).
- [x] Will adhere to test-first and TDD if any UI/logic changes were needed, though this is primarily data generation.
- [x] Generation tasks will follow Subagent / TDD standards for JSON validation.

## Project Structure

### Documentation (this feature)

```text
specs/020-present-perfect-tenses/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
└── data/
    └── tenses/
        ├── index.json                        # Modify to set status active
        ├── present-perfect.json              # New file to create
        └── present-perfect-continuous.json   # New file to create
```

**Structure Decision**: The structure strictly adheres to the existing data folder setup at `src/data/tenses`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(No violations. Simple data addition matching existing schema.)*
