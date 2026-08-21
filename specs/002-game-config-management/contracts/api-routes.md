# API Contracts: Quản lý Tài khoản & Cấu hình Game

**Date**: 2026-08-21
**Feature**: 002-game-config-management

> This project uses Next.js Server Actions and Server Components for data operations.
> No REST API endpoints are exposed. All mutations go through Server Actions.

## Server Actions

### Auth Actions (`src/app/actions/auth.ts`)

#### `login(formData: FormData)`

Authenticates admin with email/password.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string (via FormData) | Yes | Admin email address |
| `password` | string (via FormData) | Yes | Admin password |
| `redirect` | string (via FormData) | No | URL to redirect after success (default: `/admin/dashboard`) |

**Returns**: `{ error: string }` on failure. Redirects on success.

**Behavior**:
- Calls `supabase.auth.signInWithPassword()`
- On success: redirect to `redirect` param or `/admin/dashboard`
- On failure: return error message (not throw)

---

#### `logout()`

Signs out current admin.

**Returns**: Redirects to `/login`.

---

#### `updatePassword(newPassword: string)`

Changes current admin's password.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `newPassword` | string | Yes | New password (min 8 characters) |

**Returns**: `{ success: true }` or throws Error.

**Validation**: Password minimum 8 characters.

---

### Config Actions (`src/app/actions/configs.ts`)

#### `createConfig(data: CreateConfigInput)`

Creates a new game configuration.

```typescript
interface CreateConfigInput {
  gameId: string     // Must match known game ID
  name: string       // 1-200 characters
  settings: Record<string, unknown> // Validated per game schema
}
```

**Returns**: `{ data: GameConfig }` or `{ error: string }`.

**Behavior**:
- Validates `gameId` against known game list
- Validates `name` (non-empty, ≤200 chars)
- Validates `settings` against game-specific schema
- Inserts with `user_id = auth.uid()` (from session)
- Returns created config with generated `id`

---

#### `updateConfig(configId: string, data: UpdateConfigInput)`

Updates an existing game configuration.

```typescript
interface UpdateConfigInput {
  name?: string                      // 1-200 characters
  settings?: Record<string, unknown> // Validated per game schema
}
```

**Returns**: `{ data: GameConfig }` or `{ error: string }`.

**Behavior**:
- RLS ensures only owner can update
- Validates changed fields
- Updates `updated_at` timestamp
- Revalidates affected paths

---

#### `deleteConfig(configId: string)`

Deletes a game configuration (hard delete).

**Returns**: `{ success: true }` or `{ error: string }`.

**Behavior**:
- RLS ensures only owner can delete
- Hard delete (row removed)
- Associated share link becomes invalid
- Revalidates affected paths

---

#### `generateShareSlug(configId: string)`

Generates or retrieves a share slug for a configuration.

**Returns**: `{ slug: string }` or `{ error: string }`.

**Behavior**:
- If config already has `share_slug`, return existing slug
- If no slug, generate 10-char nanoid, update config, return slug
- Retry on unique constraint violation (regenerate)

---

## Server Component Data Fetching

### Admin Dashboard (`/admin/dashboard`)

```typescript
// Fetches all games (static JSON) + config counts per game
// Server Component — uses server Supabase client
const { data: configs } = await supabase
  .from('game_configs')
  .select('game_id, id')
  .eq('user_id', user.id)
  .eq('is_active', true)
```

### Game Config List (`/admin/games/[gameId]`)

```typescript
// Fetches all configs for a specific game
const { data: configs } = await supabase
  .from('game_configs')
  .select('*')
  .eq('user_id', user.id)
  .eq('game_id', gameId)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
```

### Share Link Resolution (`/play/[slug]`)

```typescript
// Public query — uses anon client (RLS allows via share_slug policy)
const { data: config } = await supabase
  .from('game_configs')
  .select('id, game_id, name, settings')
  .eq('share_slug', slug)
  .eq('is_active', true)
  .single()
```

**On success**: Redirect to `/games/[gameId]?config=[configId]`
**On failure**: Render 404 page with friendly message and link to homepage

### Game Page with Config (`/games/[gameId]?config=[configId]`)

```typescript
// If config query param present, fetch config settings (public read via RLS)
// Apply settings to filter/limit game content
// If no config param, use default behavior (all content)
```

## Route Structure

| Route | Access | Purpose |
|-------|--------|---------|
| `/login` | Public | Admin login form |
| `/admin/dashboard` | Protected (admin) | Game list + config overview |
| `/admin/games/[gameId]` | Protected (admin) | Config list for specific game |
| `/admin/configs/new?gameId=[gameId]` | Protected (admin) | Create new config |
| `/admin/configs/[configId]` | Protected (admin) | Edit existing config |
| `/admin/account` | Protected (admin) | Profile & password |
| `/play/[slug]` | Public | Share link resolver |
| `/games/*` | Public | Existing game routes (unchanged) |

## Middleware Contract (`src/middleware.ts`)

| Path Pattern | Behavior |
|-------------|----------|
| `/admin/*` | Check `getUser()`. If not authenticated → redirect to `/login?redirect=[current_path]` |
| `/login` | Check `getUser()`. If authenticated → redirect to `/admin/dashboard` |
| All others | Refresh auth token (passthrough) |
