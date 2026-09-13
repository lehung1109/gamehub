# Implementation Plan: Extended Teacher Tools (Excel/Quizlet Import & Community Library)

**Feature Branch**: `feat/phase-9-teacher-tools-import-community`  
**Spec Reference**: `docs/superpowers/specs/2026-09-13-teacher-tools-import-community-design.md`  
**Status**: Ready for Execution

---

## Plan Overview

This plan delivers Phase 9 of the GameHub roadmap:
1. Pure multi-format text and spreadsheet parsing engine (Quizlet, TSV, CSV, line-number cleanup, validation).
2. Database schema, indexes, RLS, and custom TypeScript types for `community_shared_configs`.
3. Server actions for community library browsing, sharing, cloning, and liking.
4. Interactive `VocabularyImporterModal` with smart validation preview table and direct Word Bank import.
5. Community Library Marketplace at `/admin/community` with 1-click clone and sharing modal.
6. Playwright E2E verification across import and community workflows.

---

### Task 1: TypeScript Contracts & Domain Models

**Files:**
- Create: `src/types/importer.ts`
- Create: `src/types/community.ts`
- Modify: `src/types/index.ts` (export new types)
- Test: `tests/unit/types/importer-types.test.ts`

- [ ] **Step 1: Define importer and community TypeScript contracts**
- [ ] **Step 2: Export from `src/types/index.ts`**
- [ ] **Step 3: Write type validation test**
- [ ] **Step 4: Run test: `npx vitest run tests/unit/types/importer-types.test.ts`**
- [ ] **Step 5: Commit**

```bash
git add src/types/importer.ts src/types/community.ts src/types/index.ts tests/unit/types/importer-types.test.ts
git commit -m "feat(types): define contracts for vocabulary importer and community shared configs"
```

---

### Task 2: Pure Vocabulary Parsing & Validation Engine

**Files:**
- Create: `src/lib/vocabulary-importer.ts`
- Test: `tests/unit/lib/vocabulary-importer.test.ts`

- [ ] **Step 1: Write failing tests for Quizlet parser, CSV/TSV parser, delimiter detection, and row validator**
- [ ] **Step 2: Run test to verify failure: `npx vitest run tests/unit/lib/vocabulary-importer.test.ts`**
- [ ] **Step 3: Implement `src/lib/vocabulary-importer.ts` (`parseQuizletText`, `parseCsvOrTsv`, `validateImportRows`, `cleanRowNumbering`)**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit**

```bash
git add src/lib/vocabulary-importer.ts tests/unit/lib/vocabulary-importer.test.ts
git commit -m "feat(importer): implement pure Quizlet and CSV/TSV parser and validation engine"
```

---

### Task 3: Supabase Migration & Database Custom Types

**Files:**
- Create: `supabase/migrations/20260913100000_community_shared_configs.sql`
- Modify: `scripts/append-database-types.mjs`
- Modify: `src/types/database.ts`
- Test: `tests/unit/migrations/community-schema.test.ts`

- [ ] **Step 1: Write SQL migration for `community_shared_configs` (table, indexes, RLS)**
- [ ] **Step 2: Update `append-database-types.mjs` with `CommunitySharedConfigRow`, `Insert`, `Update`**
- [ ] **Step 3: Run `node scripts/append-database-types.mjs`**
- [ ] **Step 4: Write test verifying schema and types**
- [ ] **Step 5: Run test: `npx vitest run tests/unit/migrations/community-schema.test.ts`**
- [ ] **Step 6: Commit (force add sql & database.ts)**

```bash
git add -f supabase/migrations/20260913100000_community_shared_configs.sql scripts/append-database-types.mjs src/types/database.ts tests/unit/migrations/community-schema.test.ts
git commit -m "feat(migration): create community_shared_configs table, indexes, RLS, and types"
```

---

### Task 4: Server Actions for Community Sharing, Cloning, and Liking

**Files:**
- Create: `src/app/actions/community.ts`
- Test: `tests/unit/actions/community.test.ts`

- [ ] **Step 1: Write failing tests for `getCommunityConfigsAction`, `shareConfigToCommunityAction`, `cloneCommunityConfigAction`, and `toggleLikeCommunityConfigAction`**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `src/app/actions/community.ts`**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit**

```bash
git add src/app/actions/community.ts tests/unit/actions/community.test.ts
git commit -m "feat(actions): implement community configs query, share, clone, and like actions"
```

---

### Task 5: Multi-Format Vocabulary Importer UI & Word Bank Integration

**Files:**
- Create: `src/components/admin/VocabularyImporterModal.tsx`
- Modify: `src/app/admin/word-bank/page.tsx` (add "Nhập từ vựng" trigger button)
- Test: `tests/unit/components/VocabularyImporterModal.test.tsx`

- [ ] **Step 1: Write failing test for `VocabularyImporterModal` (file tab, paste tab, parse, preview table, inline edit, submit)**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `VocabularyImporterModal.tsx` and integrate into Word Bank page**
- [ ] **Step 4: Run test to verify pass & verify font scan**
- [ ] **Step 5: Commit**

```bash
git add src/components/admin/VocabularyImporterModal.tsx src/app/admin/word-bank/page.tsx tests/unit/components/VocabularyImporterModal.test.tsx
git commit -m "feat(ui): implement multi-format vocabulary importer modal and word bank integration"
```

---

### Task 6: Community Marketplace Hub UI & Config Sharing Modal

**Files:**
- Create: `src/components/admin/CommunityConfigCard.tsx`
- Create: `src/components/admin/ShareConfigModal.tsx`
- Create: `src/app/admin/community/page.tsx`
- Test: `tests/unit/components/CommunityConfigCard.test.tsx`

- [ ] **Step 1: Write failing test for `CommunityConfigCard` and Community Hub page**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement Community Marketplace cards, filter controls, sharing modal, and page**
- [ ] **Step 4: Run test to verify pass & verify font scan**
- [ ] **Step 5: Commit**

```bash
git add src/components/admin/CommunityConfigCard.tsx src/components/admin/ShareConfigModal.tsx src/app/admin/community/page.tsx tests/unit/components/CommunityConfigCard.test.tsx
git commit -m "feat(ui): implement community marketplace catalog, config cards, and sharing modal"
```

---

### Task 7: Admin Navigation Links & Topbar Entry Points

**Files:**
- Modify: `src/app/admin/dashboard/page.tsx` (add Community Library & Word Bank shortcuts)
- Modify: `src/components/admin/` navigation/layout headers where applicable
- Test: `tests/unit/components/AdminNavigation.test.tsx`

- [ ] **Step 1: Write test verifying admin navigation links for Community Library**
- [ ] **Step 2: Update admin navigation entry points**
- [ ] **Step 3: Run test to verify pass**
- [ ] **Step 4: Commit**

```bash
git add src/app/admin/dashboard/page.tsx tests/unit/components/AdminNavigation.test.tsx
git commit -m "feat(navigation): add admin shortcuts and navigation links to community library"
```

---

### Task 8: End-to-End Playwright Verification for Phase 9

**Files:**
- Create: `tests/e2e/teacher-tools-import-community.spec.ts`

- [ ] **Step 1: Write Playwright E2E tests for import paste flow and community library browsing & cloning**
- [ ] **Step 2: Run Playwright test: `npx playwright test tests/e2e/teacher-tools-import-community.spec.ts --project=chromium`**
- [ ] **Step 3: Commit**

```bash
git add tests/e2e/teacher-tools-import-community.spec.ts
git commit -m "test(e2e): add Playwright verification for vocabulary importer and community library"
```
