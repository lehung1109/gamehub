# Implementation Plan: English Learning Games for Kids

**Branch**: `001-english-learning-games` | **Date**: 2026-08-20 | **Spec**: [spec.md](file:///F:/projects/gamehub/specs/001-english-learning-games/spec.md)

**Input**: Feature specification from `/specs/001-english-learning-games/spec.md`

## Summary

Build a monolith web application for grade 1-2 students (ages 6-7) to learn English through 6 interactive games: Flashcard, Alphabet & Phonics, Listening Comprehension, Spelling, Numbers & Colors, and Simple Sentences. Uses Next.js 16 App Router with TypeScript and Tailwind CSS v4, static JSON data, Web Speech API for pronunciation, system emoji for illustrations, bilingual Vietnamese-English UI, Duolingo-style flat design, responsive mobile-first layout. Zero user tracking, zero authentication, deploys to Vercel free tier as a static export.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Next.js 16.3.x (React 19.2, Node.js 20.9.0+)

**Primary Dependencies**:
- Next.js 16 (App Router, Turbopack, static export)
- Tailwind CSS v4.3.x (CSS-first via `@tailwindcss/postcss`)
- @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities (~12kb gzipped)
- Web Speech API (browser-native, zero dependency)

**Storage**: Static JSON files in `src/data/` — imported at build time, no database

**Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E, multi-browser)

**Target Platform**: Web (static export) — Chrome 90+, Safari 14+, Edge 90+, Firefox 90+

**Project Type**: Web application (monolith static site)

**Performance Goals**: Page interactive < 3s on 3G, navigation < 1s, Lighthouse ≥ 90

**Constraints**: Zero tracking/cookies/analytics, zero user data collection, offline-capable after load, emoji-only illustrations, Vercel free tier

**Scale/Scope**: 6 games, 5+ topics, 50+ words, 26 letters, 20 numbers, 10 colors, 10+ sentences, ~15 routes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is a blank template — no project-specific principles defined. No gates to enforce.

**Pre-Phase 0 Status**: ✅ PASS (no constraints)
**Post-Phase 1 Status**: ✅ PASS (no constraints)

## Project Structure

### Documentation (this feature)

```text
specs/001-english-learning-games/
├── plan.md              # This file
├── research.md          # Phase 0 output — technology decisions
├── data-model.md        # Phase 1 output — entity definitions & state machines
├── quickstart.md        # Phase 1 output — validation scenarios & setup guide
├── contracts/
│   └── routes.md        # Phase 1 output — route & component contracts
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router — pages & layouts
│   ├── layout.tsx                # Root layout (HTML shell, global CSS, fonts)
│   ├── page.tsx                  # Homepage — game card grid
│   ├── globals.css               # Tailwind v4 imports + @theme + animations
│   ├── not-found.tsx             # Custom 404 page
│   └── games/
│       ├── flashcard/
│       │   ├── page.tsx          # Topic selection
│       │   └── [topicId]/
│       │       └── page.tsx      # Flashcard game (with generateStaticParams)
│       ├── alphabet/
│       │   └── page.tsx          # Alphabet & Phonics game
│       ├── listening/
│       │   └── page.tsx          # Listening comprehension game
│       ├── spelling/
│       │   └── page.tsx          # Spelling / word building game
│       ├── numbers-colors/
│       │   └── page.tsx          # Numbers & Colors game
│       └── sentences/
│           └── page.tsx          # Simple sentences game
├── components/
│   ├── ui/                       # Generic UI components
│   │   ├── BackButton.tsx        # Navigation back to homepage
│   │   ├── SpeakButton.tsx       # Audio pronunciation trigger
│   │   ├── FeedbackOverlay.tsx   # Correct/wrong answer overlay
│   │   ├── GameCard.tsx          # Homepage game card
│   │   └── SpeechUnsupportedBanner.tsx
│   └── game/                     # Game-specific shared components
│       ├── QuizEngine.tsx        # Reusable quiz state machine
│       ├── FlashcardStack.tsx    # Card flip & navigation
│       ├── LetterGrid.tsx        # A-Z button grid
│       ├── DragDropBoard.tsx     # @dnd-kit spelling/sentence board
│       ├── LetterBank.tsx        # Draggable letter tiles
│       ├── DropSlots.tsx         # Droppable letter/word slots
│       └── TabSwitcher.tsx       # Numbers/Colors tab UI
├── data/                         # Static JSON data files
│   ├── games.json
│   ├── topics.json
│   ├── words/
│   │   ├── animals.json
│   │   ├── fruits.json
│   │   ├── family.json
│   │   ├── school.json
│   │   └── body-parts.json
│   ├── letters.json
│   ├── numbers.json
│   ├── colors.json
│   └── sentences.json
├── hooks/                        # Custom React hooks
│   └── useSpeech.ts              # Web Speech API wrapper
├── lib/                          # Utility functions
│   ├── cn.ts                     # clsx + tailwind-merge helper
│   ├── shuffle.ts                # Array shuffle for quiz/game randomization
│   └── speech-check.ts           # Browser speech API support detection
└── types/                        # TypeScript interfaces
    └── index.ts                  # All entity types (Game, Word, Letter, etc.)

tests/
├── components/                   # Vitest component tests
├── hooks/                        # Vitest hook tests
└── e2e/                          # Playwright E2E tests

next.config.ts                    # output: 'export', static config
postcss.config.mjs                # @tailwindcss/postcss plugin
tsconfig.json                     # strict: true
package.json
```

**Structure Decision**: Single-project monolith (no separate backend needed). All data is static JSON imported at build time. The App Router's file-based routing maps directly to the game hub's URL structure: one folder per game under `src/app/games/`. Shared components and hooks are co-located in `src/components/` and `src/hooks/` for reuse across games. The `src/data/` directory holds all JSON content files that are imported by Server Components at build time.

## Complexity Tracking

> No constitution violations to justify — constitution is a blank template.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| N/A | N/A | N/A |
