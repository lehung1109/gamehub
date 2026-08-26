<div align="center">

# 🌟 GameHub

**An interactive, educational mini-game platform engineered for ESL / English learners, modern classrooms, and workplace professionals.**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-FCC72B?style=flat-square&logo=vitest&logoColor=black)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?style=flat-square&logo=playwright)](https://playwright.dev/)

</div>

---

## 📖 Overview

**GameHub** is a web-first educational platform combining game-based learning with comprehensive classroom management. Designed for young learners, ESL students, and working professionals, GameHub delivers an intuitive, interactive environment for mastering English vocabulary, phonics, sentence construction, and workplace grammar.

### Core Pillars

1. **Zero-Friction Learner Experience**: Students can jump directly into learning without friction—play anonymously or join a teacher's classroom using a 6-character Class Code.
2. **Pedagogically Structured Mini-Games**: Visual, auditory, and kinesthetic activities powered by drag-and-drop physics, speech synthesis, and real-time audio feedback.
3. **Professional English Mastery**: Contextualized grammar modules (e.g. Workplace Tenses, DevOps & IT communication) designed to bridge the gap between classroom theory and real-world workplace scenarios.
4. **Actionable Teacher & Admin Tools**: Intuitive dashboards for class roster management, custom game configuration builders, live game previewing, error analytics, and RFC 4180-compliant CSV reporting.

---

## ✨ Key Features

### 🎮 Interactive Mini-Games

GameHub features a diverse library of mini-games catering to different learning stages:

- **🃏 Vocabulary Flashcards (`/games/flashcard`)**
  - Interactive 3D flip card animations with bilingual terms (English / Vietnamese) and illustrative emojis.
  - Native Web Speech synthesis for accurate American/British English pronunciation.
  - Themed vocabulary categories: *Animals, Fruits, School, Family, Body Parts*.
- **🔤 Alphabet & Phonics (`/games/alphabet`)**
  - Complete 26-letter interactive alphabet board with IPA phonetic transcriptions.
  - Dual modes: **Explore/Learn** (tap to hear pronunciation and example words) and **Phonics Quiz** (listen and identify target letters).
- **👂 Listening & Audio Quiz (`/games/listening`)**
  - Spoken English audio challenges where learners identify corresponding pictures, words, or meanings.
  - Configurable hints and instant audio-visual answer feedback.
- **✏️ Spelling Challenge (`/games/spelling`)**
  - Kinesthetic drag-and-drop letter assembly powered by `@dnd-kit`.
  - Scrambled letter banks with visual drop slot validation and audio reinforcement upon correct completion.
- **🔢 Numbers & Colors (`/games/numbers-colors`)**
  - Interactive number exploration from 1 to 20 with dynamic emoji counters.
  - Color palette swatch recognition covering primary and secondary colors in English and Vietnamese.
- **💬 Simple Sentences Builder (`/games/sentences`)**
  - Drag-and-drop sentence puzzle reordering scrambled word tokens into grammatically sound English sentences.
  - Real-world everyday contexts: *Daily Actions, Descriptions, Feelings & Preferences*.
- **💼 Workplace Tense Practice (`/tenses`)**
  - Tailored grammar training for workplace communication and IT/DevOps environments:
    - **Present Simple & Quick Rules**: Visual formulas and quick reference rule cards for *To Be*, *Action Verbs*, *Spelling Rules*, and *Adverbs of Frequency*.
    - **Conjugation Practice**: Contextual fill-in-the-blank verb conjugation in emails, standup chats, and status reports.
    - **Error Hunter**: Spot and correct tense/grammar mistakes in workplace sentences with detailed diagnostic explanations.
    - **Sentence Builder**: Construct complex workplace sentences by arranging clauses in correct syntax.
    - **DevOps Workplace Challenge**: Industry-specific scenarios covering deployment notices, incident logs, code reviews, and sprint status updates.

---

### 🎓 Student Experience & Gamification

- **Student Profiles & Avatars**: Students track their learning journey with custom avatars, nicknames, and persistent progress.
- **Session Join via Class Code**: Simple modal login (`StudentJoinPopup`) requiring only a class code and student name—no passwords or emails needed for young students.
- **Levels & Celebration Dialogs**: Earn Stars and XP to level up from *Tập sự* (Beginner) to *Bậc thầy* (Master), accompanied by animated celebration popups (`LevelUpCelebrationDialog`) and confetti effects.
- **Real-Time Score Feedback**: Instant audio-visual feedback on answers with score calculations, streaks, and completion percentages.
- **Attempt History & Review**: Detailed post-game reviews showing question breakdowns, submitted answers, correct solutions, and grammar explanations.

---

### 👩‍🏫 Teacher & Classroom Management

- **Classroom Roster & Code Generation**: Create distinct classes, auto-generate unique join codes, and organize student cohorts.
- **Custom Game Configuration Builder**:
  - Full-featured configuration editor supporting custom word limits, category selection, letter/number ranges, and audio toggles.
  - Game-specific configuration forms for Flashcards, Alphabet, Listening, Spelling, Numbers/Colors, and Sentences.
- **Live Preview Mode**: Test drive any custom game configuration in a sandbox environment before assigning it to students.
- **Performance Analytics & CSV Export**:
  - Class-wide overview metrics: total students, active sessions, average accuracy, and total time spent.
  - Filter analytics across timeframes: *Last 7 Days*, *Last 30 Days*, or *All Time*.
  - One-click CSV export with UTF-8 BOM and formula injection protection for Excel compatibility.
- **Difficult Words Analysis**: Automated diagnostic report identifying vocabulary words and grammar concepts with high error rates to guide classroom remediation.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (`@supabase/ssr`, `@supabase/supabase-js`, PostgreSQL with Row Level Security)
- **Drag & Drop / Interaction**: [`@dnd-kit`](https://dndkit.com/) (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/), [Playwright](https://playwright.dev/)
- **Language & Tooling**: [TypeScript 5](https://www.typescriptlang.org/), [ESLint 9](https://eslint.org/)

---

## 📁 Project Structure

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

## 🚀 Getting Started

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

## 📜 NPM Scripts

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

## 🔄 CI/CD Pipelines & Quality Gates

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
