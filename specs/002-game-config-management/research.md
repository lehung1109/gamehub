# Research: Quản lý Tài khoản & Cấu hình Game

**Date**: 2026-08-21
**Feature**: 002-game-config-management

## R1: Supabase Auth with Next.js App Router

### Decision
Use `@supabase/ssr` (replacing deprecated `@supabase/auth-helpers-nextjs`) with `@supabase/supabase-js` for cookie-based session management across three client layers:
1. **Browser Client** (`src/lib/supabase/client.ts`) — interactive client-side operations
2. **Server Client** (`src/lib/supabase/server.ts`) — Server Components, Server Actions, Route Handlers using `cookies()` from `next/headers`
3. **Middleware Client** (`src/middleware.ts`) — proactive token refresh and redirect for `/admin/*`

### Rationale
- **SSR & Cookie Consistency**: Next.js App Router runs code across separate runtimes (Server Components, Middleware, Browser). Cookie storage ensures sessions are readable server-side before rendering, eliminating auth flicker.
- **Security**: `supabase.auth.getUser()` validates JWT against Supabase Auth servers. `getSession()` only reads unverified cookie payloads. Route protection MUST use `getUser()`.
- **Modern API**: `@supabase/ssr` is the current recommended package; `@supabase/auth-helpers-nextjs` is deprecated and incompatible with Next.js async cookie handlers.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| NextAuth.js / Auth.js with Supabase Adapter | Adds unnecessary ORM/auth layer when Supabase Auth provides direct RLS integration |
| `@supabase/auth-helpers-nextjs` | Deprecated; incompatible with modern Next.js async cookie handlers |
| Client-Only Auth (LocalStorage) | Cannot protect routes server-side; causes flash of unauthenticated content |

### Key Implementation Details
- **Dependencies**: `@supabase/supabase-js`, `@supabase/ssr`
- **Env vars** (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Auth flow**: Email/password via Server Actions (`signInWithPassword`)
- **Route protection**: Middleware checks `/admin/*` routes, redirects to `/login` if unauthenticated
- **Password change**: `supabase.auth.updateUser({ password })` via Server Action

---

## R2: Supabase Database Schema & RLS

### Decision
Two tables with strict Row Level Security:
1. **`profiles`**: Links 1:1 with `auth.users` for teacher metadata (display name, role)
2. **`game_configs`**: Stores custom configurations per game type with JSONB `settings` column and embedded `share_slug` (unique indexed)

### Rationale
- **JSONB Settings**: 6 game types have distinct config shapes (topics, word counts, difficulty, audio toggle). JSONB avoids schema bloat and allows adding game types without SQL migrations.
- **Embedded share_slug**: 1 config = 1 share link. Single indexed lookup without JOINs.
- **Zero-Trust RLS**: PostgreSQL kernel-level enforcement — admin can never view/mutate another teacher's configs even if client params are tampered.

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| Dedicated `share_links` table | Unnecessary JOIN complexity for 1:1 relationship |
| Per-game tables (`flashcard_configs`, etc.) | Maintenance overhead for 6+ games; JSONB + Zod provides equivalent type safety |
| Service Role Key bypassing RLS | Violates least-privilege; risks data leakage |

### RLS Policy Summary
| Policy | Table | Role | Condition |
|--------|-------|------|-----------|
| Admin view own configs | game_configs | authenticated | `auth.uid() = user_id` |
| Admin insert own configs | game_configs | authenticated | `auth.uid() = user_id` |
| Admin update own configs | game_configs | authenticated | `auth.uid() = user_id` |
| Admin delete own configs | game_configs | authenticated | `auth.uid() = user_id` |
| Public view shared configs | game_configs | anon, authenticated | `share_slug IS NOT NULL AND is_active = true` |
| User view own profile | profiles | authenticated | `auth.uid() = id` |
| User update own profile | profiles | authenticated | `auth.uid() = id` |

---

## R3: Supabase Agent Skills

### Decision
Installed `supabase/agent-skills` via `npx skills add supabase/agent-skills`. This provides:
1. **`supabase` skill**: Covers Database, Auth, Edge Functions, Storage, SSR cookie clients
2. **`supabase-postgres-best-practices` skill**: Schema design, RLS optimization, query performance

### Rationale
- Eliminates AI agent hallucinations about deprecated APIs (`supabase-auth-helpers`)
- Enforces secure RLS patterns
- Guides correct `@supabase/ssr` usage with Next.js App Router

### Integration
Skills installed at `.agents/skills/supabase/` and `.agents/skills/supabase-postgres-best-practices/`

---

## R4: Share Link Slug Generation

### Decision
Use `nanoid` with custom 10-character, URL-safe, lowercase alphabet: `23456789abcdefghjkmnpqrstuvwxyz` (32 chars).

### Rationale
- **Collision resistance**: 32^10 ≈ 1.12 × 10^15 unique combinations. At 10,000 configs/day, 1,500+ years before 1% collision chance.
- **Human-friendly**: Excludes ambiguous characters (`0`/`O`, `1`/`I`/`l`). Lowercase-only prevents typing mistakes.
- **URL ergonomics**: 10 chars fit cleanly in URLs: `gamehub.edu.vn/play/k8m2px9wyt`

### Alternatives Considered
| Alternative | Reason Rejected |
|-------------|-----------------|
| UUID v4 (36 chars) | Too long, unreadable, unwieldy in messages |
| Sequential IDs (1, 2, 3...) | Enumerable, insecure — allows scraping other teachers' configs |
| Base64/Hashids | Requires secret salt, can generate offensive character combinations |

### Route Design
Share links resolve via `/play/[slug]` → server-side Supabase query → redirect to `/games/[gameId]?config=[configId]`

---

## R5: Per-Game Configurable Parameters

### Decision
Each game type defines a schema of configurable parameters. Configurations are stored as JSONB in the `settings` column, validated at the application level with TypeScript types.

### Game Configuration Schemas

| Game | Parameters | Type |
|------|-----------|------|
| **flashcard** | `topics` (selected topic IDs), `wordLimit` (max words per session), `autoSpeak` (auto-pronounce on flip) | `string[]`, `number`, `boolean` |
| **alphabet** | `letterRange` (subset of A-Z), `mode` (learn/quiz), `autoSpeak` | `string[]`, `string`, `boolean` |
| **listening** | `topics` (selected topics), `questionCount`, `showHint` | `string[]`, `number`, `boolean` |
| **spelling** | `topics` (selected topics), `wordLimit`, `showEmoji` | `string[]`, `number`, `boolean` |
| **numbers-colors** | `numberRange` (min-max), `includeColors`, `mode` (learn/quiz) | `[number,number]`, `boolean`, `string` |
| **sentences** | `categories` (selected categories), `sentenceCount`, `showVietnamese` | `string[]`, `number`, `boolean` |

### Rationale
- Common parameters across games: topic/content selection, item count limits, mode (learn/quiz), audio toggles
- JSONB + TypeScript discriminated unions provide type safety without per-game SQL tables
- Each game page reads `config` query param → fetches settings from Supabase → filters content accordingly
