# CI/CD Workflow Contracts

**Feature**: 007-ci-cd-pipelines | **Date**: 2026-08-23

## Overview

GitHub Actions workflows expose their behavior through trigger events, status checks, and artifacts. These contracts define the expected interface for each workflow.

## Contract: ci.yml — Core CI Pipeline

### Trigger

```yaml
on:
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
  push:
    branches: [main]
```

### Status Checks

| Check Name | Reports On | Blocks Merge |
|------------|-----------|-------------|
| CI | PR status | Yes (recommended via branch protection) |

### Steps Contract

| Step | Command | Failure Means |
|------|---------|---------------|
| Lint | `npm run lint` | Code style violations |
| Typecheck | `npx tsc --noEmit` | TypeScript type errors |
| Unit Tests | `npm run test:run` | Failing unit tests |
| Build | `npm run build:ci` | Build errors (broken imports, config issues) |

### Artifacts

None — failures are reported via step output logs.

---

## Contract: e2e.yml — E2E Testing Pipeline

### Trigger

```yaml
on:
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
  push:
    branches: [main]
```

### Status Checks

| Check Name | Reports On | Blocks Merge |
|------------|-----------|-------------|
| E2E | PR status | Yes (recommended via branch protection) |

### Steps Contract

| Step | Command | Failure Means |
|------|---------|---------------|
| Install Browsers | `npx playwright install --with-deps chromium` | Browser installation failed |
| E2E Tests | `npm run test:e2e` | User flow regressions |

### Artifacts

| Artifact | Condition | Retention | Contents |
|----------|-----------|-----------|----------|
| `playwright-report` | Always (on failure + success) | 30 days | HTML report, screenshots, traces |
| `test-results` | On failure only | 30 days | Raw test output, trace files |

---

## Contract: supabase.yml — Migration Validation

### Trigger

```yaml
on:
  pull_request:
    branches: [main]
    paths:
      - 'supabase/migrations/**'
```

### Status Checks

| Check Name | Reports On | Blocks Merge |
|------------|-----------|-------------|
| Supabase | PR status (only when migrations change) | Yes (recommended via branch protection) |

### Steps Contract

| Step | Command | Failure Means |
|------|---------|---------------|
| Lint Migrations | `npx supabase db lint` | Migration syntax/security issues |

### Artifacts

None — failures are reported via step output logs.

---

## Shared Contract: Concurrency

All workflows use:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Behavior**: When a new commit is pushed to a branch with an in-progress workflow run, the previous run is cancelled. Only the latest commit's results are reported.
