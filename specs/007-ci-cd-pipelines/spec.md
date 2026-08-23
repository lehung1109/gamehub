# Feature Specification: CI/CD Pipelines

**Feature Branch**: `007-ci-cd-pipelines`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "Set up GitHub Actions CI pipelines covering essential CI (linting, type checking, unit tests, build check) and important pipelines (E2E testing with Playwright, Supabase schema/migration validation)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Core CI Quality Gate on Pull Requests (Priority: P1)

A developer opens a pull request or pushes a commit to the main branch. The system automatically runs linting, type checking, unit tests, and a production build check. The developer receives clear pass/fail feedback directly in the pull request before any code is merged.

**Why this priority**: This is the foundation of all code quality enforcement. Without automated CI checks, broken code can be merged into the main branch, causing regressions and wasted debugging time. The project constitution already mandates these quality gates — this automates their enforcement.

**Independent Test**: Can be fully tested by opening a pull request with intentionally broken code (lint error, type error, failing test, build error) and verifying the workflow reports failure. A clean PR should report all checks passing.

**Acceptance Scenarios**:

1. **Given** a developer opens a pull request targeting the main branch, **When** the PR is created, **Then** the CI workflow triggers automatically and runs linting, type checking, unit tests, and build check in sequence.
2. **Given** the CI workflow is running, **When** any check fails (e.g., a lint error), **Then** the workflow reports failure with clear output showing which check failed and why, and the PR is blocked from merging.
3. **Given** a developer pushes a new commit to a branch with an open pull request, **When** the push event occurs, **Then** the CI workflow re-runs on the latest commit.
4. **Given** all checks pass successfully, **When** the CI workflow completes, **Then** the pull request shows a green status indicating all checks have passed.

---

### User Story 2 - End-to-End Testing Pipeline (Priority: P2)

A developer submits code that changes user-facing behavior. The system automatically runs the full Playwright E2E test suite in headless browsers to validate that complete user flows work correctly. If any E2E test fails, the failure artifacts (screenshots, traces) are available for download to aid debugging.

**Why this priority**: E2E tests catch integration issues and user-facing regressions that unit tests miss. The project has existing Playwright tests and the constitution requires E2E tests for every feature — automating their execution on CI ensures no regression slips through.

**Independent Test**: Can be tested by creating a PR that intentionally breaks a user flow (e.g., removing a navigation link) and verifying the E2E workflow fails with downloadable test artifacts. A clean PR should pass with all E2E tests green.

**Acceptance Scenarios**:

1. **Given** a developer opens a pull request, **When** the core CI checks pass, **Then** the E2E test workflow runs the Playwright test suite against the application.
2. **Given** the E2E test suite is running, **When** a test fails, **Then** the workflow uploads test artifacts (reports, screenshots, traces) that the developer can download from the workflow run page.
3. **Given** the E2E test suite completes successfully, **When** all tests pass, **Then** the pull request shows a green status for the E2E check.

---

### User Story 3 - Supabase Migration Validation (Priority: P3)

A developer adds or modifies a database migration file. The system automatically validates the migration syntax and checks for common issues before the migration reaches production. The developer receives clear feedback if the migration has errors.

**Why this priority**: Database migrations are high-risk changes — a broken migration can cause data loss or downtime. Validating migrations automatically catches syntax errors and structural issues early, before they affect the production database.

**Independent Test**: Can be tested by creating a PR with a deliberately malformed SQL migration file and verifying the validation workflow catches the error. A PR with a valid migration should pass.

**Acceptance Scenarios**:

1. **Given** a developer adds a new file in the `supabase/migrations/` directory, **When** a pull request is opened, **Then** the Supabase validation workflow runs and checks the migration for syntax errors.
2. **Given** the migration validation workflow runs, **When** a migration file contains invalid SQL, **Then** the workflow reports failure with the specific error details.
3. **Given** a pull request modifies only non-migration files, **When** the PR is created, **Then** the Supabase validation step is skipped to save CI time.

---

### Edge Cases

- What happens when CI runs on a branch that requires Supabase type generation (`gen:types`) but no Supabase credentials are available? The build step must work independently without requiring remote Supabase access.
- What happens when multiple developers push commits rapidly to the same PR? Only the latest commit's workflow run should matter; previous runs should be cancelled to save resources.
- What happens when E2E tests are flaky? The pipeline should support configurable retries (the project already configures 2 retries in CI mode).
- What happens when a workflow fails due to infrastructure issues (e.g., GitHub runner outage)? Developers should be able to manually re-run failed workflows.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST automatically trigger CI checks when a pull request is opened, synchronized (new commits pushed), or reopened against the main branch.
- **FR-002**: System MUST run linting checks and report pass/fail with detailed output on failure.
- **FR-003**: System MUST run TypeScript type checking and report pass/fail with detailed error locations on failure.
- **FR-004**: System MUST run the full unit test suite and report pass/fail with test result summaries.
- **FR-005**: System MUST run a production build check and report pass/fail. The build step MUST NOT depend on external services (e.g., remote type generation) that are unavailable in CI.
- **FR-006**: System MUST run the Playwright E2E test suite in headless mode after core CI checks pass.
- **FR-007**: System MUST upload E2E test artifacts (reports, screenshots, traces) when any E2E test fails, allowing developers to download them from the workflow run.
- **FR-008**: System MUST validate Supabase migration files for syntax correctness when migration files are added or changed.
- **FR-009**: System MUST cancel in-progress workflow runs when a newer commit is pushed to the same branch, to avoid redundant resource usage.
- **FR-010**: System MUST report individual check status clearly in the pull request interface so developers can identify exactly which step failed.
- **FR-011**: System MUST also trigger CI checks on pushes directly to the main branch (for merged code verification).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of pull requests receive automated CI feedback (lint, typecheck, tests, build) within 10 minutes of submission.
- **SC-002**: No code with lint errors, type errors, or failing unit tests is merged into the main branch.
- **SC-003**: E2E test results are available for every pull request, with failure artifacts downloadable in under 30 seconds.
- **SC-004**: Developers can identify the root cause of a CI failure within 2 minutes by reading the workflow output.
- **SC-005**: Migration validation catches 100% of SQL syntax errors before they reach production.
- **SC-006**: Redundant CI runs are cancelled automatically when new commits are pushed, reducing wasted compute by at least 50%.

## Assumptions

- The project already has working lint (`npm run lint`), typecheck (`npx tsc --noEmit`), unit test (`npm run test:run`), and E2E test (`npm run test:e2e`) scripts that can be invoked in CI without additional configuration.
- GitHub Actions is the CI/CD platform and the repository is hosted on GitHub.
- The `npm run build` script in CI should use `next build` directly (without `gen:types`) or `gen:types` should be handled separately with proper credentials. The CI build step will need a way to build without requiring live Supabase access.
- Playwright browser binaries can be cached in CI to speed up E2E test runs.
- The Supabase CLI is available as an npm dependency or can be installed in the CI environment for migration validation.
- The main branch is named `main`.
- Free-tier GitHub Actions runners provide sufficient resources for all pipelines.
