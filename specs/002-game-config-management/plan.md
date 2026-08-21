# Implementation Plan: Quản lý Tài khoản & Cấu hình Game

**Branch**: `002-game-config-management` | **Date**: 2026-08-21 | **Spec**: [spec.md](file:///F:/projects/gamehub/specs/002-game-config-management/spec.md)

**Input**: Feature specification from `specs/002-game-config-management/spec.md`

## Summary

Thêm hệ thống quản lý tài khoản admin và cấu hình game vào GameHub. Admin (giáo viên) có thể đăng nhập, tạo nhiều cấu hình cho từng game (đặt tên, chọn tham số), và chia sẻ qua link ngắn. Học sinh mở link chia sẻ sẽ chơi game với cấu hình tùy chỉnh, không cần đăng nhập. Sử dụng Supabase Auth (email/password) cho xác thực admin, Supabase PostgreSQL (với RLS) cho lưu trữ, và nanoid cho share slug.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**:
- Next.js 16.3.1 (App Router)
- React 19.2.8
- @supabase/supabase-js + @supabase/ssr (auth & database)
- nanoid (share slug generation)
- shadcn/ui 4.x (admin UI components)
- Tailwind CSS 4.x (styling)

**Storage**: Supabase PostgreSQL with Row Level Security (RLS). Keys stored in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Testing**:
- Vitest + React Testing Library (unit tests)
- Playwright (e2e tests)

**Target Platform**: Web (browser), deployed on Vercel

**Project Type**: Web application (Next.js monolith)

**Performance Goals**: Share link resolution < 3 seconds, admin dashboard < 2 seconds load time

**Constraints**: Zero tracking/cookies for students (anon users). Auth cookies only for admin sessions. Backward compatibility with all 6 existing games.

**Scale/Scope**: Single admin role (no role hierarchy), 50+ configs per game, 6 games

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Next.js App Router | ✅ PASS | All new routes under `src/app/admin/` and `src/app/play/[slug]/`. Server Components by default, Client Components only for interactive forms. |
| II. TypeScript-First | ✅ PASS | All code in TypeScript strict. Supabase types in `src/types/database.ts` are generated strictly via `npm run gen:types` (never edited manually). Application & domain models in `src/types/config.ts`. No `any`. |
| III. Component-Driven UI | ✅ PASS | Admin UI built with shadcn/ui (Dialog, Form, Button, Table, Card). Tailwind only. No custom CSS. |
| IV. Drag-and-Drop (dnd-kit) | ✅ N/A | No drag-and-drop needed for this feature. |
| V. Test-First | ✅ PASS | Unit tests for: auth actions, config CRUD, slug generation, components. E2E tests for: login flow, config management, share link flow. |
| Tech Stack | ⚠️ ADDITION | Adding `@supabase/supabase-js`, `@supabase/ssr`, `nanoid` — justified: Supabase provides auth + database (user-specified). nanoid provides collision-resistant short IDs. |
| Zero Tracking | ✅ PASS | Auth cookies only for admin. Students access via anon Supabase client (no cookies stored). Share link uses server-side resolution. |

## Project Structure

### Documentation (this feature)

```text
specs/002-game-config-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-routes.md    # Server Actions & Route contracts
└── tasks.md             # Phase 2 output (via /speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── admin/                    # Admin dashboard (protected)
│   │   ├── layout.tsx            # Admin layout with auth check
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Game list + config overview
│   │   ├── games/
│   │   │   └── [gameId]/
│   │   │       └── page.tsx      # Config list for specific game
│   │   ├── configs/
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create new config
│   │   │   └── [configId]/
│   │   │       └── page.tsx      # Edit config
│   │   └── account/
│   │       └── page.tsx          # Profile & password change
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── play/
│   │   └── [slug]/
│   │       └── page.tsx          # Share link resolver
│   ├── actions/
│   │   ├── auth.ts               # Login/logout/password actions
│   │   └── configs.ts            # Config CRUD actions
│   └── games/                    # Existing game routes (unchanged)
│       ├── flashcard/
│       ├── alphabet/
│       ├── listening/
│       ├── spelling/
│       ├── numbers-colors/
│       └── sentences/
├── components/
│   ├── admin/                    # Admin-specific components
│   │   ├── ConfigForm.tsx        # Config create/edit form
│   │   ├── ConfigList.tsx        # Config list table
│   │   ├── GameCard.tsx          # Game card for dashboard
│   │   ├── ShareDialog.tsx       # Share link dialog
│   │   └── DeleteDialog.tsx      # Delete confirmation dialog
│   ├── custom/                   # Existing custom components
│   ├── game/                     # Existing game components
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server Supabase client
│   ├── slug.ts                   # NanoID share slug generator
│   ├── game-config-schema.ts     # Per-game config parameter definitions
│   └── utils.ts                  # Existing utilities
├── types/
│   ├── index.ts                  # Existing types
│   ├── database.ts               # Supabase generated types
│   └── config.ts                 # Config-related types
├── middleware.ts                  # Auth session refresh + route protection
└── data/                          # Existing static JSON (unchanged)

tests/
├── e2e/
│   ├── admin-login.spec.ts       # Login/logout flow
│   ├── config-management.spec.ts # Create/edit/delete config
│   └── share-link.spec.ts        # Share link flow
└── unit/                          # Co-located or here
```

**Structure Decision**: Extends the existing Next.js monolith structure. Admin routes are isolated under `src/app/admin/` with a protected layout. Share link resolution lives at `src/app/play/[slug]/`. All existing game routes remain untouched. Supabase client utilities live under `src/lib/supabase/`. Game config schemas (defining what each game can configure) live in `src/lib/game-config-schema.ts`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Adding Supabase (new external dependency) | User-specified requirement. Need persistent storage for admin accounts & configs. Static JSON insufficient for dynamic CRUD operations. | File-based storage rejected: no auth, no RLS, no concurrent access safety. |
| Adding nanoid (new dependency) | Share slugs must be short, unambiguous, collision-resistant. | UUID rejected: too long for URLs. Sequential IDs rejected: enumerable, insecure. |
