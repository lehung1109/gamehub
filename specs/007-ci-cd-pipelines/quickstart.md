# Quickstart Validation Guide: CI/CD Pipelines

**Feature**: 007-ci-cd-pipelines | **Date**: 2026-08-23

## Prerequisites

- GitHub repository with push access
- Branch protection rules can be configured on `main` (optional, recommended)
- All existing local tests pass: `npm run lint`, `npx tsc --noEmit`, `npm run test:run`

## Validation Scenarios

### Scenario 1: Core CI Pipeline — All Checks Pass

1. Create a feature branch: `git checkout -b test/ci-validation`
2. Make a trivial change (e.g., add a comment to a test file)
3. Commit and push: `git push origin test/ci-validation`
4. Open a pull request targeting `main`
5. **Expected**: The "CI" workflow triggers. All 4 steps (Lint, Typecheck, Unit Tests, Build) pass. PR shows a green check.

### Scenario 2: Core CI Pipeline — Lint Failure

1. On the test branch, introduce a lint error (e.g., add an unused import)
2. Commit and push
3. **Expected**: The "CI" workflow triggers. The Lint step fails with a clear error message showing the file and line. PR shows a red check.

### Scenario 3: Core CI Pipeline — Type Error

1. On the test branch, introduce a type error (e.g., assign a string to a number variable)
2. Commit and push
3. **Expected**: The "CI" workflow triggers. The Typecheck step fails with the TypeScript error. PR shows a red check.

### Scenario 4: Core CI Pipeline — Build Without gen:types

1. Verify that the `build:ci` script exists in `package.json` and runs `next build` (without `gen:types`)
2. Run locally: `npm run build:ci`
3. **Expected**: Build succeeds using the committed `src/types/database.ts` without requiring Supabase access token.

### Scenario 5: E2E Pipeline — Tests Pass with Artifacts

1. On the test branch with a clean change, verify the "E2E" workflow triggers alongside "CI"
2. **Expected**: Playwright tests run in headless Chromium. All tests pass. The `playwright-report` artifact is available for download on the workflow run page.

### Scenario 6: E2E Pipeline — Test Failure with Artifacts

1. On the test branch, break a user flow (e.g., change a data-testid that an E2E test depends on)
2. Commit and push
3. **Expected**: E2E tests fail. Both `playwright-report` and `test-results` artifacts are uploaded and downloadable from the workflow run page.

### Scenario 7: Supabase Migration Validation — Valid Migration

1. Create a branch with a new valid SQL file in `supabase/migrations/`
2. Open a pull request
3. **Expected**: The "Supabase" workflow triggers and the lint step passes.

### Scenario 8: Supabase Migration Validation — Invalid Migration

1. Create a branch with a malformed SQL file in `supabase/migrations/` (e.g., `CREAT TABLE` typo)
2. Open a pull request
3. **Expected**: The "Supabase" workflow triggers and the lint step fails with a clear error.

### Scenario 9: Supabase Workflow — Path Filtering

1. Create a branch that modifies only `src/` files (no migration changes)
2. Open a pull request
3. **Expected**: The "Supabase" workflow does NOT trigger (path filter excludes non-migration changes).

### Scenario 10: Concurrency Cancellation

1. Push commit A to the test branch
2. While the workflow is still running, immediately push commit B
3. **Expected**: The workflow for commit A is cancelled. Only commit B's workflow runs to completion.

## Cleanup

After validation, delete the test branch:

```bash
git checkout main
git branch -D test/ci-validation
git push origin --delete test/ci-validation
```

Close any test pull requests without merging.
