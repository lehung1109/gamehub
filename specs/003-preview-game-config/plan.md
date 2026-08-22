# Implementation Plan: Preview Game Configuration

**Branch**: `003-preview-game-config` | **Date**: 2026-08-22 | **Spec**: [spec.md](file:///F:/projects/gamehub/specs/003-preview-game-config/spec.md)

**Input**: Feature specification from `/specs/003-preview-game-config/spec.md`

## Summary

Enable admins to test-play any game configuration before saving by encoding current form settings into a URL-safe query parameter, opening the game in a new tab, and displaying a visual "preview mode" banner. The approach modifies the `useGameConfig` hook to detect a `preview` search parameter containing base64url-encoded settings, bypassing the database fetch. Config forms gain a "Chơi thử" button that validates settings, serializes them, and opens the game URL.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Tailwind CSS 4.x, shadcn/ui, Zod 3.x, Supabase

**Storage**: Supabase PostgreSQL (existing `game_configs` table) — no new storage needed; preview is entirely stateless via URL encoding

**Testing**: Vitest + React Testing Library (unit), Playwright (e2e)

**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge — all support 2,000+ character URLs)

**Project Type**: Next.js web application (App Router)

**Performance Goals**: Preview opens in <2 seconds from button click (SC-001)

**Constraints**: Zero database writes for preview (SC-005); URL-encoded settings must stay well within browser URL limits (~2,000 chars; all game settings serialize to <500 bytes)

**Scale/Scope**: 6 game types, 2 config forms (create + edit), 1 shared hook

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Next.js App Router | ✅ PASS | All routes use `app/` directory; no new routes needed for preview (uses existing game pages with a query param) |
| II. TypeScript-First | ✅ PASS | All new code in TypeScript strict mode; new types for preview payload will live in `src/types/config.ts`; no `any` usage |
| III. Component-Driven UI (Tailwind + shadcn/ui) | ✅ PASS | Preview banner uses shadcn/ui Badge + Tailwind utilities; "Chơi thử" button uses existing Button component; no custom CSS |
| IV. Drag-and-Drop (dnd-kit) | ✅ N/A | No drag-and-drop interactions in this feature |
| V. Test-First (NON-NEGOTIABLE) | ✅ PASS | Unit tests for: preview encoding/decoding utility, useGameConfig preview detection, preview banner rendering, form preview button. E2E tests for: create→preview→verify flow, edit→preview→verify flow |
| No new dependencies | ✅ PASS | Uses only existing stack (btoa/atob for base64 via native browser APIs, or TextEncoder — no new npm packages) |
| Complexity / YAGNI | ✅ PASS | Single utility function for encode/decode; single hook modification; minimal component additions |

## Project Structure

### Documentation (this feature)

```text
specs/003-preview-game-config/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── games/              # Existing game pages (6 games) — modified to support preview
│       ├── flashcard/
│       ├── alphabet/
│       ├── listening/
│       ├── spelling/
│       ├── numbers-colors/
│       └── sentences/
├── components/
│   ├── config/
│   │   ├── ConfigCreateForm.tsx   # Modified: add "Chơi thử" button
│   │   ├── ConfigEditForm.tsx     # Modified: add "Chơi thử" button
│   │   └── PreviewButton.tsx      # NEW: shared preview button component
│   └── game/
│       ├── ConfigBanner.tsx        # Existing: normal mode banner
│       └── PreviewBanner.tsx       # NEW: preview mode banner
├── hooks/
│   └── useGameConfig.ts           # Modified: detect preview param, decode settings
├── lib/
│   └── preview.ts                 # NEW: encode/decode preview settings utilities
└── types/
    └── config.ts                  # Modified: add PreviewPayload type

tests/
├── e2e/
│   └── preview-config.spec.ts     # NEW: E2E tests for preview flow
```

**Structure Decision**: Single Next.js web application using existing `src/` directory structure. No new directories beyond the files listed above. The preview feature threads through existing layers (form → utility → hook → game page → banner) rather than adding new architectural layers.

## Complexity Tracking

> No constitution violations — table not needed.
