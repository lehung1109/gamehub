# GameHub

An educational interactive mini-game platform built with Next.js App Router, React 19, Tailwind CSS, Vitest, Playwright, and Supabase.

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Generate Supabase types from remote and run production build |
| `npm run build:ci` | Run Next.js production build without remote Supabase dependency (used in CI) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint validation |
| `npm run test` | Run Vitest unit/component tests in watch mode |
| `npm run test:run` | Run Vitest test suite once (used in CI) |
| `npm run test:e2e` | Run Playwright end-to-end tests (used in CI) |
| `npm run gen:types` | Generate TypeScript database types from remote Supabase project |

## CI/CD Pipelines

Automated quality gates are powered by GitHub Actions under `.github/workflows/`:

### 1. Core CI Pipeline (`.github/workflows/ci.yml`)
- **Trigger**: Pull requests targeting `main`, pushes to `main`
- **Steps**:
  1. **Lint**: `npm run lint` — validates code style and ESLint rules
  2. **Typecheck**: `npx tsc --noEmit` — enforces strict TypeScript types
  3. **Unit Tests**: `npm run test:run` — runs Vitest test suite
  4. **Build**: `npm run build:ci` — verifies Next.js production compilation
- **Concurrency**: Automatically cancels in-progress runs when new commits are pushed to the branch (`cancel-in-progress: true`)

### 2. E2E Testing Pipeline (`.github/workflows/e2e.yml`)
- **Trigger**: Pull requests targeting `main`, pushes to `main`
- **Steps**:
  1. Install Chromium via `npx playwright install --with-deps chromium`
  2. Execute E2E suite via `npm run test:e2e`
- **Artifacts**:
  - `playwright-report/`: Uploaded on every run (success and failure), retained for 30 days
  - `test-results/`: Uploaded on failure only, retained for 30 days
- **Concurrency**: Cancels redundant in-progress runs on new commits

### 3. Supabase Migration Validation (`.github/workflows/supabase.yml`)
- **Trigger**: Pull requests targeting `main` modifying `supabase/migrations/**` (path-filtered)
- **Step**: `npx supabase db lint` — validates database migration scripts
- **Concurrency**: Cancels redundant in-progress runs on new commits

## Pull Request Quality Gates

All PRs targeting `main` must pass the required status checks:
- `CI` status check (Lint, Typecheck, Unit Tests, Build)
- `E2E` status check (Playwright Chromium)
- `Supabase` status check (when database migrations are modified)
