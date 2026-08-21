# Quickstart Validation Guide: Quản lý Tài khoản & Cấu hình Game

**Date**: 2026-08-21
**Feature**: 002-game-config-management

## Prerequisites

1. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
2. **Environment Variables**: Create `.env.local` with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
3. **Database Schema**: Run the SQL from [data-model.md](file:///F:/projects/gamehub/specs/002-game-config-management/data-model.md) in the Supabase SQL Editor
4. **Seed Admin User**: Create an admin user in the Supabase Auth dashboard (email/password)
5. **Dependencies Installed**: `npm install @supabase/supabase-js @supabase/ssr nanoid`

## Setup Commands

```bash
# Install new dependencies
npm install @supabase/supabase-js @supabase/ssr nanoid

# Start dev server
npm run dev
```

## Validation Scenarios

### Scenario 1: Admin Login Flow

**Goal**: Verify admin can login, see dashboard, and be protected from unauthorized access.

**Steps**:
1. Open `http://localhost:3000/admin/dashboard` (without login)
2. ✅ **Expected**: Redirected to `/login`
3. Enter admin email and password on login form
4. ✅ **Expected**: Redirected to `/admin/dashboard`
5. ✅ **Expected**: Dashboard shows list of 6 games with config counts

**Verify**:
```bash
# Unit tests
npm run test:run -- --grep "login"

# E2E tests
npx playwright test tests/e2e/admin-login.spec.ts
```

---

### Scenario 2: Create Game Configuration

**Goal**: Verify admin can create a named config for a game with custom parameters.

**Steps**:
1. From dashboard, click on "Flashcard" game
2. ✅ **Expected**: Config list page shows (empty initially) + "Tạo cấu hình mới" button
3. Click "Tạo cấu hình mới"
4. Enter name: "Lớp 1A - Tuần 3"
5. Select topics: Animals, Fruits
6. Set word limit: 10
7. Toggle auto-speak: on
8. Click "Lưu"
9. ✅ **Expected**: Redirected to config list, new config appears

**Verify**:
```bash
# Unit tests for config form validation
npm run test:run -- --grep "ConfigForm"

# E2E tests
npx playwright test tests/e2e/config-management.spec.ts
```

---

### Scenario 3: Edit and Delete Configuration

**Goal**: Verify admin can modify and remove existing configs.

**Steps**:
1. From Flashcard config list, click on "Lớp 1A - Tuần 3"
2. Change name to "Lớp 1A - Tuần 4"
3. Remove "Fruits" topic, add "Family"
4. Click "Lưu"
5. ✅ **Expected**: Name and settings updated in list
6. Click "Xóa" on a config
7. ✅ **Expected**: Confirmation dialog appears
8. Confirm deletion
9. ✅ **Expected**: Config removed from list

---

### Scenario 4: Share Configuration via Link

**Goal**: Verify admin can share a config and students can access it without login.

**Steps**:
1. From config list, click "Chia sẻ" on "Lớp 1A - Tuần 4"
2. ✅ **Expected**: Dialog shows shareable link (e.g., `http://localhost:3000/play/k8m2px9wyt`)
3. Copy the link
4. Open in a new incognito window (not logged in)
5. ✅ **Expected**: Redirected to Flashcard game with only Animals + Family topics, max 10 words, auto-speak on

**Verify**:
```bash
# Unit tests for slug generation
npm run test:run -- --grep "slug"

# E2E tests for share flow
npx playwright test tests/e2e/share-link.spec.ts
```

---

### Scenario 5: Backward Compatibility

**Goal**: Verify existing games work unchanged when accessed normally (not via share link).

**Steps**:
1. Open `http://localhost:3000/` (homepage)
2. Click on any game (Flashcard, Alphabet, etc.)
3. ✅ **Expected**: Game works with all content (no filtering, no config applied)
4. ✅ **Expected**: No login prompt, no admin UI visible

**Verify**:
```bash
# Run all existing tests to ensure no regressions
npm run test:run
npx playwright test
```

---

### Scenario 6: Invalid Share Link

**Goal**: Verify graceful handling of deleted/invalid share links.

**Steps**:
1. Open `http://localhost:3000/play/invalidslug`
2. ✅ **Expected**: Friendly 404 page with message and link back to homepage

---

## Full Test Suite

```bash
# Run all unit tests
npm run test:run

# Run all e2e tests
npm run test:e2e

# Run lint + type check
npm run lint
npx tsc --noEmit

# Build verification
npm run build
```

## Quality Gates Checklist

- [ ] `npm run lint` — zero errors
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run test:run` — all unit tests pass
- [ ] `npm run test:e2e` — all e2e tests pass
- [ ] `npm run build` — builds successfully
- [ ] Existing game routes unchanged and functional
- [ ] Admin routes protected by middleware
- [ ] Share links resolve correctly for public users
