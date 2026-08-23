# Implementation Plan: CI/CD Pipelines

**Branch**: `007-ci-cd-pipelines` | **Date**: 2026-08-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-ci-cd-pipelines/spec.md`

## Summary

Set up GitHub Actions workflows to automate the project's quality gates: a core CI pipeline (lint, typecheck, unit tests, build) triggered on every PR and push to main, a Playwright E2E testing pipeline with artifact uploads on failure, and a Supabase migration validation pipeline with path-based filtering. The `npm run build` script must be decoupled from remote `gen:types` for CI use. Concurrency groups cancel redundant runs.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Next.js 16.x, React 19.x, Vitest (unit tests), Playwright (E2E tests), ESLint 9 (flat config), Supabase CLI (`supabase` npm package v2.115.0)

**Storage**: Supabase (PostgreSQL) — migrations in `supabase/migrations/`

**Testing**: Vitest (`npm run test:run`) for unit tests, Playwright (`npm run test:e2e`) for E2E

**Target Platform**: GitHub Actions (ubuntu-latest runners)

**Project Type**: Web application (Next.js)

**Performance Goals**: CI pipeline completes within 10 minutes; E2E pipeline completes within 15 minutes

**Constraints**: Free-tier GitHub Actions runners; no external service dependencies in the build step; the project has both `bun.lock` and `package-lock.json` — CI will use npm (package-lock.json present, npm is universally available on GitHub runners)

**Scale/Scope**: 3 workflow files, 1 package.json script change

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Next.js App Router | ✅ PASS | CI workflows interact with Next.js only via `next build` — no routing changes |
| II. TypeScript-First | ✅ PASS | Workflow files are YAML, not application code. `tsc --noEmit` is enforced as a CI step |
| III. Component-Driven UI | ✅ PASS | No UI changes |
| IV. Drag-and-Drop | ✅ PASS | No drag-and-drop changes |
| V. Test-First | ✅ PASS | This feature *enforces* the Test-First principle by automating test runs on CI. The CI workflows themselves are infrastructure (YAML), not application features, so they do not require Vitest/Playwright tests — they are validated by manual PR-based smoke testing (see quickstart.md) |
| Quality Gates | ✅ PASS | Directly automates all 5 quality gates from the constitution |
| Technology Stack | ✅ PASS | GitHub Actions is infrastructure, not an application dependency. No new npm packages added |
| Governance: No new deps | ✅ PASS | No new dependencies introduced |

**Gate result**: ✅ ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/007-ci-cd-pipelines/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal — no data entities)
├── quickstart.md        # Phase 1 output (validation guide)
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
.github/
├── dependabot.yml            # Existing
└── workflows/
    ├── ci.yml                # NEW — Core CI pipeline (lint, typecheck, unit tests, build)
    ├── e2e.yml               # NEW — Playwright E2E pipeline
    └── supabase.yml          # NEW — Supabase migration validation

package.json                  # MODIFIED — add "build:ci" script (next build without gen:types)
```

**Structure Decision**: All workflows live under `.github/workflows/` following GitHub Actions convention. Three separate workflow files provide independent status checks, clear failure identification, and the ability to re-run individual pipelines. A single `build:ci` script is added to `package.json` to decouple the build from remote type generation.

## Complexity Tracking

No constitution violations — table not needed.
