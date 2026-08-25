# Implementation Plan: fix-github-action-secrets

**Branch**: `011-fix-github-action-secrets` | **Date**: 2026-08-25 | **Spec**: [specs/011-fix-github-action-secrets/spec.md](specs/011-fix-github-action-secrets/spec.md)

**Input**: Feature specification from `specs/011-fix-github-action-secrets/spec.md`

## Summary

The GitHub Actions workflows (`ci.yml` and `e2e.yml`) currently use hardcoded dummy values for Supabase environment variables. We need to update them to correctly map the repository secrets (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ACCESS_TOKEN`) to the environment so the pipeline can successfully connect to Supabase.

## Technical Context

**Language/Version**: Next.js / Node.js 20

**Primary Dependencies**: GitHub Actions

**Storage**: Supabase

**Testing**: Playwright & Vitest (executed via GitHub Actions)

**Target Platform**: GitHub Actions runner (ubuntu-latest)

**Project Type**: Next.js web application CI/CD

**Performance Goals**: N/A

**Constraints**: Workflows must use `env:` at the job level to expose secrets securely to the required steps.

**Scale/Scope**: 2 workflow files (`ci.yml` and `e2e.yml`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **App Router / TypeScript / Tailwind**: N/A (DevOps only)
- **Test-First**: CI pipeline must correctly run tests. Fixing the environment variables satisfies the requirement to have a functional testing pipeline.
- **Lint / Type Check**: Fix will allow these checks to run successfully against the correct Supabase instance.

*All checks pass.*

## Project Structure

### Documentation (this feature)

```text
specs/011-fix-github-action-secrets/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── contracts/           # Phase 1 output (/speckit-plan command)
```

### Source Code (repository root)

```text
.github/
└── workflows/
    ├── ci.yml
    └── e2e.yml
```

**Structure Decision**: The modifications will be confined to the existing GitHub Actions workflow files located in `.github/workflows/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A
