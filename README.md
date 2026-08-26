# GameHub

An educational interactive mini-game platform built with Next.js App Router, React 19, Tailwind CSS, Vitest, Playwright, and Supabase.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (`@supabase/ssr`, `@supabase/supabase-js`, PostgreSQL with Row Level Security)
- **Drag & Drop / Interaction**: [`@dnd-kit`](https://dndkit.com/) (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/), [Playwright](https://playwright.dev/)
- **Language & Tooling**: [TypeScript 5](https://www.typescriptlang.org/), [ESLint 9](https://eslint.org/)

---

## Project Structure

```text
gamehub/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD workflows (CI, E2E, Security)
├── public/                 # Static public assets
├── specs/                  # Feature specifications, plans, and development tasks
├── src/
│   ├── app/                # Next.js 16 App Router (pages, layouts, routes, actions)
│   │   ├── actions/        # Server actions for server-side mutations
│   │   ├── admin/          # Admin and teacher management dashboard routes
│   │   ├── api/            # API Route handlers (e.g., student session tracking)
│   │   ├── games/          # Game catalog and custom game selection routes
│   │   ├── login/          # Teacher / Admin authentication page
│   │   ├── play/           # Interactive gameplay engine routes
│   │   └── tenses/         # English grammar and verb tense game routes
│   ├── components/         # Reusable React UI & domain components
│   │   ├── admin/          # Teacher dashboard, analytics & management components
│   │   ├── class/          # Classroom management and student grouping UI
│   │   ├── config/         # Custom game level/content configuration builders
│   │   ├── custom/         # Custom game player and loader components
│   │   ├── dashboard/      # Navigation and analytics dashboard cards
│   │   ├── game/           # Core game engine UI, sound toggles, scoreboards
│   │   ├── student/        # Student selector, pin login & session tracking UI
│   │   ├── tenses/         # Verb tense practice cards and exercises
│   │   └── ui/             # Primitive shadcn/ui components (Button, Dialog, etc.)
│   ├── contexts/           # React Context providers (state management)
│   ├── data/               # Static educational datasets & dictionary lists
│   │   ├── colors.json     # Color vocabulary dataset
│   │   ├── games.json      # Built-in game metadata & module index
│   │   ├── letters.json    # Alphabet and phonics dataset
│   │   ├── numbers.json    # Numbers and counting dataset
│   │   ├── sentences.json  # Sentence construction datasets
│   │   ├── tenses/         # Grammar rules and tense datasets
│   │   ├── topics.json     # Categorized vocabulary topics
│   │   └── words/          # Categorized word lists
│   ├── hooks/              # Custom React hooks (game tracking, speech synthesis)
│   ├── lib/                # Shared utilities, Supabase clients & analytics
│   │   ├── supabase/       # Supabase browser, server, and admin client factories
│   │   ├── analytics.ts    # Student performance metrics & aggregation helpers
│   │   ├── class-code.ts   # Classroom code generation and validation
│   │   ├── export-csv.ts   # CSV export utilities for teacher analytics
│   │   ├── preview.ts      # Sound and visual preview utilities
│   │   └── utils.ts        # Common helper functions and Tailwind class merger
│   ├── proxy.ts            # Edge request proxy and session authentication router
│   └── types/              # TypeScript types and generated database schemas
│       ├── config.ts       # Custom game config interfaces
│       ├── database.ts     # Supabase auto-generated database types
│       ├── index.ts        # Common game and domain entities
│       └── tenses.ts       # Grammar and tense data models
├── supabase/
│   └── migrations/         # PostgreSQL migration files and RLS security policies
└── tests/                  # Automated test suites
    ├── app/                # App route and integration tests
    ├── components/         # React component tests (React Testing Library)
    ├── data/               # Static data integrity tests
    ├── e2e/                # Playwright end-to-end browser tests
    ├── hooks/              # Custom hook unit tests
    ├── lib/                # Utility and helper unit tests
    ├── types/              # Type contract and schema tests
    └── unit/               # Core game logic and math unit tests
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js**: Version `20.x` or `24.x` (LTS recommended)
- **npm**: Version `10.x` or higher
- **Supabase CLI** (optional for local database): `npx supabase` or standalone CLI

### Environment Setup

1. Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local 2>/dev/null || touch .env.local
```

2. Populate `.env.local` with your Supabase project credentials:

```env
# Required: Supabase URL and Public Anon / Publishable Key
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key

# Optional (for Admin / Service Role operations & migrations)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ACCESS_TOKEN=your-supabase-access-token
```

> [!NOTE]
> When running with a local Supabase instance (`npx supabase start`), default development keys are provided in the CLI output. For cloud instances, retrieve these keys from your **Supabase Dashboard -> Project Settings -> API**.

### Database Setup

#### Option A: Local Supabase Database (Recommended for Offline Dev)
1. Start local Supabase containers (requires Docker):
   ```bash
   npx supabase start
   ```
2. Apply migrations:
   ```bash
   npx supabase migration up
   ```

#### Option B: Remote Supabase Project
1. Link to your remote Supabase project:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```
2. Push migrations or execute `supabase/migrations/20260822151714_student_progress.sql` via the Supabase SQL Editor.

### Installation & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate database types** (optional if using remote Supabase):
   ```bash
   npm run gen:types
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `next dev` | Starts the Next.js development server with Turbopack at `http://localhost:3000` |
| `npm run build` | `npm run gen:types && next build` | Generates TypeScript database types from remote Supabase and builds production bundle |
| `npm run build:ci` | `next build` | Compiles Next.js production build without fetching remote Supabase schema (used in CI) |
| `npm run start` | `next start` | Starts the production server after running `npm run build` |
| `npm run lint` | `eslint` | Runs ESLint validation across all TypeScript and React source files |
| `npm run test` | `vitest` | Runs Vitest unit and component test suites in interactive watch mode |
| `npm run test:run` | `vitest run` | Executes all Vitest unit and component tests once (used in CI pipeline) |
| `npm run test:e2e` | `playwright test` | Runs Playwright end-to-end browser tests against Chromium |
| `npm run gen:types` | `npx supabase gen types ...` | Generates TypeScript types (`src/types/database.ts`) from remote Supabase schema |

---

## CI/CD Pipelines & Quality Gates

Automated continuous integration and security audits are configured using GitHub Actions under `.github/workflows/`:

### 1. Core CI Pipeline (`.github/workflows/ci.yml`)
- **Triggers**: Pull requests targeting `main`, pushes to `main`.
- **Execution Steps**:
  1. **Dependency Installation**: `npm ci` (Node.js 24 environment).
  2. **Type Generation**: `npm run gen:types`.
  3. **Lint**: `npm run lint` — validates ESLint conventions.
  4. **Typecheck**: `npx tsc --noEmit` — validates strict TypeScript compilation.
  5. **Unit & Component Tests**: `npm run test:run` — executes Vitest test suite.
  6. **Build**: `npm run build:ci` with Next.js build caching.
- **Concurrency**: `cancel-in-progress: true` automatically cancels outdated runs on subsequent pushes.

### 2. E2E Testing Pipeline (`.github/workflows/e2e.yml`)
- **Triggers**: Scheduled daily run at 17:00 UTC (00:00 VN time), manual `workflow_dispatch`.
- **Execution Steps**:
  1. Sets up Node.js 24 and runs `npm ci`.
  2. Generates Supabase types via `npm run gen:types`.
  3. Installs Playwright Chromium browser binaries (`npx playwright install --with-deps chromium`).
  4. Executes end-to-end tests via `npm run test:e2e`.
- **Artifacts**:
  - `playwright-report/`: Uploaded on every run and retained for 30 days.
  - `test-results/`: Uploaded on failure for debugging, retained for 30 days.

### 3. Supply-Chain Security & Scorecard (`.github/workflows/scorecard.yml`)
- **Triggers**: Scheduled weekly runs, pushes to `main`, and branch protection checks.
- **Execution Steps**: Runs OpenSSF Scorecard supply-chain security analysis and publishes SARIF reports to GitHub Code Scanning.

### Pull Request Quality Gates
All pull requests targeting `main` must fulfill the following quality gates before merging:
- Passing **CI** status check (`Lint`, `Typecheck`, `Unit Tests`, `Build`).
- Clean branch protection review and status checks.
