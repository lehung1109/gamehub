<div align="center">

# 🌟 GameHub

**An interactive, educational mini-game platform engineered for ESL / English learners, modern classrooms, and workplace professionals.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2%2C336%20Passed-FCC72B?style=flat-square&logo=vitest&logoColor=black)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Passed-2EAD33?style=flat-square&logo=playwright)](https://playwright.dev/)
[![Security](https://img.shields.io/badge/Security-0%20Vulnerabilities-brightgreen?style=flat-square&logo=dependabot)](https://github.com/lehung1109/gamehub/security/dependabot)

</div>

---

## 📖 Overview

**GameHub** is a web-first educational platform combining game-based learning with comprehensive classroom management. Designed for young learners, ESL students, parents, and working professionals, GameHub delivers an intuitive, interactive environment for mastering English vocabulary, phonics, sentence construction, workplace grammar, interactive speech, and realtime competition.

### Core Pillars

1. **Zero-Friction Learner Experience**: Students can jump directly into learning without friction—play anonymously or join a teacher's classroom using a 6-character Class Code.
2. **Pedagogically Structured Mini-Games**: Visual, auditory, and kinesthetic activities powered by drag-and-drop physics, speech synthesis, and real-time audio feedback.
3. **Professional English Mastery**: Contextualized grammar modules (Workplace Tenses, Parts of Speech, IT/DevOps communication) bridging classroom theory with real-world communication.
4. **Actionable Teacher & Admin Tools**: Intuitive dashboards for class rosters, Quizlet/CSV vocabulary importing, live game previewing, error analytics, and community game config marketplace.
5. **Parent Partnership & Communication**: Dedicated Parent Portal with secure PIN access, weekly progress digests, and real-time classroom announcements.
6. **Mobile-First PWA & Habit Engine**: Installable PWA with offline action queues, multi-accent Neural TTS, Spaced Repetition (SRS), and Web Push notifications for daily streak protection.

---

## 🗺️ 12-Phase Roadmap Architecture

GameHub's complete roadmap has been fully implemented, verified, and merged into `main`:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   GAMEHUB PLATFORM                                      │
├───────────────────────────────┬───────────────────────────────┬─────────────────────────┤
│    Learner & Gameplay Core    │     Classroom & Community     │   Habit & Mobile Web    │
├───────────────────────────────┼───────────────────────────────┼─────────────────────────┤
│ Phase 1: 14 Mini-Games        │ Phase 6: Curriculum Roadmap   │ Phase 4: Daily Streaks  │
│ Phase 2: Parts of Speech Hub  │ Phase 7: Realtime 1v1 PvP     │ Phase 5: Sổ Tay Từ Khó  │
│ Phase 3: Workplace Tenses     │ Phase 9: Teacher Tools        │ Phase 11: Offline PWA   │
│ Phase 8: AI Speaking Partner  │ Phase 10: Parent Portal       │ Phase 12: Web Push VAPID│
└───────────────────────────────┴───────────────────────────────┴─────────────────────────┘
```

---

## ✨ Key Features & Modules

### 🎮 1. Interactive Mini-Game Suite (Phase 1, 2, 3)

GameHub features a comprehensive library of 14+ interactive mini-games:

- **🃏 Vocabulary Flashcards (`/games/flashcard`)**: Interactive 3D flip card animations with bilingual terms (English / Vietnamese), illustrative emojis, and native Web Speech synthesis.
- **🔤 Alphabet & Phonics (`/games/alphabet`)**: Complete 26-letter interactive phonics board with IPA transcriptions, explore mode, and listening identification quizzes.
- **👂 Listening & Audio Quiz (`/games/listening`)**: Spoken English audio challenges identifying corresponding pictures, words, or meanings.
- **✏️ Spelling Challenge (`/games/spelling`)**: Kinesthetic drag-and-drop letter assembly powered by `@dnd-kit` with audio reinforcement upon completion.
- **🔢 Numbers & Colors (`/games/numbers-colors`)**: Numbers 1 to 20 with dynamic emoji counters and bilingual color palette swatch recognition.
- **💬 Simple Sentences Builder (`/games/sentences`)**: Sentence puzzle reordering scrambled word tokens into grammatically sound English syntax.
- **🧩 Crossword Master (`/games/crossword`)**: Thematic crossword puzzles with contextual hints and audio pronunciation.
- **🌧️ Falling Words Arcade (`/games/falling-words`)**: High-speed typing reflexes with falling word clouds, bomb triggers, and combo streaks.
- **🎈 Balloon Hangman (`/games/hangman`)**: Rescue the explorer by guessing letters before all hot-air balloons pop.
- **🔍 Odd One Out (`/games/odd-one-out`)**: Categorical deduction challenges identifying words that don't belong.
- **🔠 Word Connect (`/games/word-connect`)**: Connect scrambled letters on a circular dial to reveal hidden crossword anagrams.
- **🔎 Word Search Board (`/games/word-search`)**: Multi-directional letter grid word-hunting puzzle.
- **⚔️ Word Knight: RPG Battle (`/games/vocab-defense`)**: Turn-based fantasy battle defeating monsters with vocabulary accuracy.
- **💼 Workplace Tense Practice (`/tenses`)**: Workplace communication training covering Present Simple, Present Continuous, and Present Perfect across DevOps standups, incident logs, and PR reviews.
- **🏷️ Parts of Speech Hub (`/parts-of-speech`)**: Deep dive into Nouns, Verbs, Adjectives, Adverbs, and Prepositions with the Error Hunter game (`/games/grammar-detective`).

---

### 🗺️ 2. Curriculum Roadmap & Progression (Phase 6)

- **Interactive World Map (`/roadmap`)**: 4 progressive learning worlds (*Khởi Động, Khám Phá, Tăng Tốc, Về Đích*) with 16 thematic milestone nodes.
- **Pedagogical Gating**: Star threshold requirements and sequential node unlocking to guide structured learning habits.
- **Post-Game Result Banners**: Contextual prompts guiding students to next unlocks or bonus challenges upon finishing games.

---

### ⚔️ 3. Realtime Student 1v1 PvP Duels & Leaderboards (Phase 7)

- **Arena Duel Hub (`/duel`)**: Create custom 1v1 challenge rooms or join friends using 6-character room codes.
- **Live Head-to-Head Arena (`/duel/[code]`)**: Realtime countdowns, live split-score progress bars, and podium victory celebrations.
- **Classroom & Global Leaderboards (`/leaderboard`)**: Tiered podiums and weekly ranking tables celebrating star earners and streak champions.

---

### 🎙️ 4. AI Speaking Partner & Pronunciation Lab (Phase 8)

- **Interactive Speech Hub (`/speaking`)**: Practice real-time conversational English with AI personas (*Bé Thỏ Thông Thái, Thầy Alex, Robot Sparky*).
- **CEFR Scenarios (`/speaking/[scenarioId]`)**: Curated A1-B2 roleplay topics (Ordering food, Introducing pets, Airport navigation, DevOps standup).
- **Phonetic Feedback & Scaffolding**: Color-coded pronunciation analysis, phrase hints, and automatic mistake saving to the Mistake Notebook.

---

### 👩‍🏫 5. Teacher Tools & Community Marketplace (Phase 9)

- **Multi-Format Vocabulary Importer (`/admin/word-bank`)**: Import external vocabulary lists from Quizlet flashcard text, CSV, or TSV with delimiter auto-detection and duplicate resolution.
- **Community Game Marketplace (`/admin/community`)**: Publish, browse, clone, and rate community game configurations with verified tags.
- **Classroom Rosters & Analytics**: Class code generation, active session tracking, student progress matrices, and RFC 4180-compliant CSV exports.

---

### 👨‍👩‍👧 6. Parent Portal & Communication Hub (Phase 10)

- **Parent Portal (`/parent`)**: Secure student progress tracking via individual PIN codes or direct magic link tokens.
- **Weekly Learning Digest**: Automated weekly progress summaries tracking total practice minutes, games completed, and stars earned.
- **Notice Board & Acknowledgments**: Read teacher notices, homework assignments, and kudos with instant acknowledgment timestamps.

---

### 📱 7. PWA Offline Architecture & Multi-Accent Neural TTS (Phase 11)

- **Installable PWA**: Standalone progressive web app installable on iOS, Android, and Desktop with offline caching.
- **Offline Action Queue**: Transparently queues game completion, scores, and star rewards in localStorage when offline, automatically synchronizing via `navigator.onLine` background triggers.
- **Multi-Accent Neural Speech (`QuickVoiceSwitcher`)**: Seamless switching between American (US), British (UK), and Australian (AU) native voice accents.

---

### 🔔 8. Web Push Notifications & Learning Habit Engine (Phase 12)

- **RFC 8291 / 8292 VAPID Engine**: Push service worker integration (`public/sw.js`) and server actions for secure device notifications.
- **Daily Streak Preservation**: Automatic reminders at 19:00 alerting students before their flame streak expires.
- **Spaced Repetition (SRS) Review**: Scheduled 5-minute memory refresh alerts when cards in the Sổ Tay Từ Khó reach their review interval.
- **Classroom Push Broadcasts**: Teachers broadcast homework announcements directly to parents' device lock screens.
- **Kid-Friendly Typography**: Strictly $\ge 16$px font size across all banners and preference toggle cards.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16.3.5](https://nextjs.org/) (App Router, Turbopack, Server Actions, Route Handlers) |
| **UI & Styling** | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (`@supabase/ssr`, `@supabase/supabase-js`, PostgreSQL with Row Level Security) |
| **Web Push & PWA** | `web-push` (RFC 8291/8292 VAPID), Service Workers, Web App Manifest |
| **Speech & Audio** | Native Web Speech Synthesis API, Web Speech Recognition |
| **Drag & Drop** | [`@dnd-kit`](https://dndkit.com/) (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) |
| **Testing** | [Vitest](https://vitest.dev/) (2,336 unit tests), [Playwright](https://playwright.dev/) (52 E2E suites) |
| **Language & Tooling** | [TypeScript 5](https://www.typescriptlang.org/), [ESLint 9](https://eslint.org/) |

---

## 📁 Project Directory Structure

```text
gamehub/
├── .github/
│   └── workflows/          # CI, E2E, and Security GitHub Actions workflows
├── public/                 # Static assets, audio clips, icons, sw.js, manifest
├── src/
│   ├── app/                # Next.js 16 App Router (60 pages & route handlers)
│   │   ├── actions/        # Server Actions (auth, push, duels, speaking, parent, srs)
│   │   ├── admin/          # Teacher & Admin portal (dashboard, classes, community, word-bank)
│   │   ├── api/            # API Route handlers (CSV export, session tracking)
│   │   ├── duel/           # Realtime 1v1 PvP Duel arena and lobby
│   │   ├── games/          # 14 educational mini-game suites
│   │   ├── leaderboard/    # Class and global leaderboard podiums
│   │   ├── parent/         # Parent Portal and progress digest
│   │   ├── parts-of-speech/# Grammar Hub and categorization stages
│   │   ├── roadmap/        # 4-world curriculum roadmap map
│   │   ├── speaking/       # AI Speaking Partner dialogues
│   │   └── tenses/         # Workplace English and verb tenses
│   ├── components/         # Reusable React components
│   │   ├── admin/          # Teacher tools, parent access manager, community cards
│   │   ├── duel/           # Realtime duel question cards, scorebars, and podiums
│   │   ├── parent/         # Parent digest cards, notice boards, certificates
│   │   ├── push/           # Push notification prompt and preference cards
│   │   ├── pwa/            # Service worker registrar, offline indicators
│   │   ├── roadmap/        # Curriculum nodes, world maps, result banners
│   │   ├── speaking/       # Interactive speech arena, mic pulse, scaffolding hints
│   │   ├── speech/         # Multi-accent quick voice switcher and modal
│   │   └── student/        # Daily streak badges, quest panels, shop modal
│   ├── hooks/              # Custom hooks (usePushNotification, useNetworkStatus, useStudentSession)
│   ├── lib/                # Pure business logic & algorithms
│   │   ├── offline/        # Offline queue manager and action synchronizer
│   │   ├── parent/         # Weekly digest generator and PIN authenticators
│   │   ├── push/           # VAPID push service, reminder generators, client helpers
│   │   ├── speaking/       # Speech evaluation and fluency score engine
│   │   ├── supabase/       # Browser, server, and admin Supabase client factories
│   │   └── vocabulary/     # Quizlet and CSV/TSV parser and validator
│   └── types/              # Strict TypeScript contracts and database models
├── supabase/
│   └── migrations/         # PostgreSQL DDL migrations with RLS security policies
└── tests/
    ├── e2e/                # 52 Playwright browser end-to-end test suites
    └── unit/               # 2,336 Vitest unit and integration tests across 291 files
```

---

## 📜 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `next dev` | Starts the Next.js development server with Turbopack at `http://localhost:3000` |
| `npm run build` | `npm run gen:types && next build` | Generates Supabase types and creates optimized production build |
| `npm run build:ci` | `next build` | Production build without remote Supabase type generation (used in CI) |
| `npm run start` | `next start` | Starts production server |
| `npm run lint` | `eslint` | Runs ESLint validation across all source files |
| `npm run test` | `vitest` | Runs Vitest tests in interactive watch mode |
| `npm run test:run` | `vitest run` | Executes all 2,336 Vitest unit tests once (0 errors) |
| `npm run test:e2e` | `playwright test` | Runs Playwright E2E browser tests across desktop and mobile |
| `npm run gen:types` | `npx supabase gen types ...` | Generates TypeScript types from remote Supabase schema |

---

## 🔒 Security & Quality Gates

- **0 Known Vulnerabilities**: `npm audit` is 100% clean with all dependencies patched.
- **Strict Typography Policy**: Kid-friendly minimum 16px font size enforced across all student, parent, and learning components.
- **Row Level Security (RLS)**: Strict PostgreSQL RLS policies applied to all tables in `supabase/migrations/`.
- **Zero `any` TypeScript Policy**: TypeScript 5 strict mode enforced with zero compile errors.

---

<div align="center">
  <b>GameHub — Made with ❤️ for English learners and modern educators.</b>
</div>
