# Research: CI/CD Pipelines

**Feature**: 007-ci-cd-pipelines | **Date**: 2026-08-23

## R1: Build Script Decoupling from Remote Supabase

**Decision**: Add a `build:ci` script that runs `next build` directly, skipping `gen:types`.

**Rationale**: The current `"build": "npm run gen:types && next build"` calls `supabase gen types typescript --project-id oajcckqxzkkfwimwmodl` which requires a Supabase access token and network access to the remote project. CI environments should not depend on external services for build verification. The generated `src/types/database.ts` file is already committed to the repository (213 lines, last updated), so CI can build against the checked-in version.

**Alternatives considered**:
- *Provide `SUPABASE_ACCESS_TOKEN` as a CI secret*: Would work but creates an unnecessary dependency on an external service for every PR build. Adds secret management overhead and fragility.
- *Run `gen:types` with a local Supabase instance*: Heavy — requires Docker, database seeding, long setup time. Overkill for a build check.
- *Remove `gen:types` from build entirely*: Too aggressive — developers need it locally. Better to have two scripts.

## R2: Package Manager for CI

**Decision**: Use `npm` with `package-lock.json` for CI.

**Rationale**: The project has both `bun.lock` and `package-lock.json`. GitHub Actions runners have `npm` pre-installed (no setup step needed). Using `npm ci` provides deterministic installs from the lockfile and is the most reliable choice for CI stability. Bun is usable locally but adds a setup step on CI.

**Alternatives considered**:
- *Use Bun on CI*: Requires `oven-sh/setup-bun` action step. Faster installs but adds a dependency on a third-party action and Bun version management. Not justified for the current project scale.
- *Use pnpm*: No `pnpm-lock.yaml` exists — not applicable.

## R3: Workflow Separation Strategy

**Decision**: Three separate workflow files (`ci.yml`, `e2e.yml`, `supabase.yml`).

**Rationale**:
- **Independent status checks**: Each workflow reports its own status on the PR, making it immediately clear which category of checks failed.
- **Selective re-runs**: If E2E fails but CI passes, developers can re-run only the E2E workflow.
- **Path filtering**: Supabase validation only needs to run when migration files change. Separate workflows make `paths` filtering clean.
- **Concurrency**: Each workflow can have its own concurrency group, so a re-push cancels the right runs.

**Alternatives considered**:
- *Single workflow with multiple jobs*: Simpler file management but merges unrelated concerns. A single "CI" status check makes it harder to identify which step failed. Path filtering becomes convoluted with conditional jobs.
- *Matrix strategy*: Overkill — no need to test across multiple OS/Node versions for this project.

## R4: E2E Pipeline Architecture

**Decision**: E2E runs in a separate workflow, triggered on the same events as CI. It does NOT depend on CI passing first (no `workflow_run` dependency).

**Rationale**: Making E2E depend on CI via `workflow_run` adds latency (CI must fully complete before E2E starts) and makes the pipeline slower for developers. Running them in parallel means faster total feedback. If CI fails, the developer sees both CI failure and E2E results, which is more information, not less. The Playwright config already handles CI-specific settings (retries, workers).

**Alternatives considered**:
- *Sequential via `workflow_run`*: Saves compute when CI fails (E2E would be skipped) but adds 5-10 minutes of latency to E2E feedback. Not worth it for a free-tier project with low PR volume.

## R5: Supabase Migration Validation Approach

**Decision**: Use `supabase db lint` via the Supabase CLI installed from npm.

**Rationale**: The `supabase` package (v2.115.0) is already a project dependency. `supabase db lint` checks migration files for common issues (syntax, naming, security). No Docker or local database instance required for basic linting. The workflow uses path filtering (`supabase/migrations/**`) to only run when migration files actually change.

**Alternatives considered**:
- *`supabase db diff` against a local instance*: Requires Docker + full local Supabase setup. Too heavy for CI validation and introduces Docker dependency.
- *Manual SQL parsing/linting*: Fragile, would need to maintain a custom SQL linter.
- *`supabase test db`*: Requires a running local Supabase instance with pgTAP. Could be added later as an enhancement but is outside the current scope.

## R6: Node.js Version

**Decision**: Use Node.js 20 LTS (`actions/setup-node@v4` with `node-version: 20`).

**Rationale**: Node 20 is the current LTS release, widely supported, and compatible with Next.js 16.x. The `actions/setup-node@v4` action handles caching of `npm` dependencies via `cache: 'npm'`, which speeds up subsequent runs.

**Alternatives considered**:
- *Node 22*: Current version but not yet LTS. May have compatibility edge cases.
- *Node 18*: Still in maintenance but approaching EOL. No reason to use an older version.

## R7: Concurrency Groups

**Decision**: Each workflow uses `concurrency` with `group: ${{ github.workflow }}-${{ github.ref }}` and `cancel-in-progress: true`.

**Rationale**: When a developer pushes multiple commits rapidly, only the latest commit's workflow run matters. Previous in-progress runs are cancelled automatically, saving GitHub Actions minutes and avoiding confusion from stale results.

**Alternatives considered**:
- *No concurrency control*: Wastes CI minutes on stale commits. Developers might see confusing results from outdated runs.
