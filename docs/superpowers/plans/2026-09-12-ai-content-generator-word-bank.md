# AI Content Generator & Centralized Word Bank Implementation Plan (Phase 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Centralized Word Bank and AI Content Generation Studio allowing teachers to effortlessly generate curriculum-aligned vocabulary, reading passages, and grammar exercises with dual-engine fallback (Gemini API + smart offline pedagogical engine) and publish them directly into GameHub game configurations.

**Architecture:** PostgreSQL table `public.word_bank` with RLS; TypeScript types in `src/types/word-bank.ts` and `src/types/ai-generator.ts`; dual AI generation engine in `src/lib/ai-generator.ts`; Server Actions in `src/app/actions/word-bank.ts` and `src/app/actions/ai-generator.ts`; teacher admin pages at `/admin/word-bank` and `/admin/ai-generator`.

**Tech Stack:** Next.js 16, Supabase, TypeScript, Tailwind CSS, Lucide Icons, Vitest, Testing Library, Playwright.

**Spec:** [docs/superpowers/specs/2026-09-12-ai-content-generator-word-bank-design.md](file:///F:/projects/gamehub/docs/superpowers/specs/2026-09-12-ai-content-generator-word-bank-design.md)

---

## Tasks

### Task 1: Word Bank Database Migration & TypeScript Definitions

**Files:**
- Create: `supabase/migrations/20260912180000_centralized_word_bank.sql`
- Create: `src/types/word-bank.ts`
- Modify: `src/types/database.ts`
- Create: `tests/unit/migrations/word-bank-schema.test.ts`

**Interfaces:**
- Produces:
  - `WordBankItem`, `CefrLevel`, `PartOfSpeech`, `WordBankFilterInput`
  - `Database['public']['Tables']['word_bank']`

- [ ] **Step 1: Write failing unit test for migration SQL**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement migration and types**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260912180000_centralized_word_bank.sql src/types/word-bank.ts src/types/database.ts tests/unit/migrations/word-bank-schema.test.ts
git commit -m "feat(migration): add public.word_bank table and TypeScript types"
```

---

### Task 2: AI Content Generation Engine with Dual Provider Fallback

**Files:**
- Create: `src/types/ai-generator.ts`
- Create: `src/lib/ai-generator.ts`
- Create: `src/data/curriculum-lexicon.json`
- Create: `tests/unit/lib/ai-generator.test.ts`

**Interfaces:**
- Consumes: `CefrLevel`, `PartOfSpeech`, `GameId`
- Produces:
  - `generateAiVocabulary(input: AiGenerateVocabInput): Promise<AiGeneratedVocabItem[]>`
  - `generateAiReading(input: AiGenerateReadingInput): Promise<AiGeneratedReadingPassage>`
  - `generateAiGrammar(input: AiGenerateGrammarInput): Promise<AiGeneratedGrammarItem[]>`
  - Fallback engine ensuring 100% test reliability when no `GEMINI_API_KEY` is present.

- [ ] **Step 1: Write failing unit tests for AI generator engine**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `src/lib/ai-generator.ts` and curriculum data**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

```bash
git add src/types/ai-generator.ts src/lib/ai-generator.ts src/data/curriculum-lexicon.json tests/unit/lib/ai-generator.test.ts
git commit -m "feat(ai): implement AI content generator engine with dual provider fallback"
```

---

### Task 3: Server Actions for Word Bank Management & Search

**Files:**
- Create: `src/app/actions/word-bank.ts`
- Create: `tests/unit/actions/word-bank.test.ts`

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/server`, `WordBankItem`
- Produces:
  - `getWordBankWordsAction(filter: WordBankFilterInput)`
  - `createWordBankWordAction(data: CreateWordBankInput)`
  - `bulkCreateWordBankWordsAction(words: CreateWordBankInput[])`
  - `deleteWordBankWordAction(wordId: string)`

- [ ] **Step 1: Write failing unit tests for word-bank actions**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `src/app/actions/word-bank.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

```bash
git add src/app/actions/word-bank.ts tests/unit/actions/word-bank.test.ts
git commit -m "feat(actions): implement word bank CRUD and search server actions"
```

---

### Task 4: Server Actions for AI Generation & One-Click Game Config Publishing

**Files:**
- Create: `src/app/actions/ai-generator.ts`
- Create: `tests/unit/actions/ai-generator.test.ts`

**Interfaces:**
- Consumes: `generateAiVocabulary`, `generateAiReading`, `generateAiGrammar` from `@/lib/ai-generator`
- Produces:
  - `generateAiVocabularyAction(input)`
  - `generateAiReadingAction(input)`
  - `generateAiGrammarAction(input)`
  - `publishAiContentToGameConfigAction(input)`

- [ ] **Step 1: Write failing unit tests for AI actions**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `src/app/actions/ai-generator.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

```bash
git add src/app/actions/ai-generator.ts tests/unit/actions/ai-generator.test.ts
git commit -m "feat(actions): implement AI generator actions and direct game config publishing"
```

---

### Task 5: Word Bank Management UI (`/admin/word-bank`)

**Files:**
- Create: `src/components/admin/WordBankList.tsx`
- Create: `src/components/admin/WordBankFilterBar.tsx`
- Create: `src/components/admin/WordBankAddDialog.tsx`
- Create: `src/app/admin/word-bank/page.tsx`
- Create: `tests/components/admin/WordBankList.test.tsx`

**Interfaces:**
- Consumes: `getWordBankWordsAction`, `createWordBankWordAction`, `deleteWordBankWordAction`, `SpeakButton`
- Produces:
  - Interactive table & grid of vocabulary words with IPA phonetics, audio, CEFR pill, and search/filter controls.

- [ ] **Step 1: Write failing component tests for WordBankList**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement UI components and page**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

```bash
git add src/components/admin/WordBankList.tsx src/components/admin/WordBankFilterBar.tsx src/components/admin/WordBankAddDialog.tsx src/app/admin/word-bank/page.tsx tests/components/admin/WordBankList.test.tsx
git commit -m "feat(ui): add Word Bank management page and filter components"
```

---

### Task 6: AI Content Studio UI & Direct Game Publishing (`/admin/ai-generator`)

**Files:**
- Create: `src/components/admin/AiContentStudio.tsx`
- Create: `src/components/admin/AiVocabGeneratorTab.tsx`
- Create: `src/components/admin/AiReadingGeneratorTab.tsx`
- Create: `src/components/admin/AiGrammarGeneratorTab.tsx`
- Create: `src/components/admin/AiPublishModal.tsx`
- Create: `src/app/admin/ai-generator/page.tsx`
- Modify: `src/app/admin/layout.tsx`, `src/app/admin/dashboard/page.tsx`
- Create: `tests/components/admin/AiContentStudio.test.tsx`

**Interfaces:**
- Consumes: AI server actions from `@/app/actions/ai-generator`
- Produces:
  - Multi-tab AI Studio (Vocab, Reading, Grammar) with inline editable results and direct game configuration publishing modal.

- [ ] **Step 1: Write failing component tests for AiContentStudio**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement components and layout updates**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AiContentStudio.tsx src/components/admin/AiVocabGeneratorTab.tsx src/components/admin/AiReadingGeneratorTab.tsx src/components/admin/AiGrammarGeneratorTab.tsx src/components/admin/AiPublishModal.tsx src/app/admin/ai-generator/page.tsx src/app/admin/layout.tsx src/app/admin/dashboard/page.tsx tests/components/admin/AiContentStudio.test.tsx
git commit -m "feat(ui): build AI Content Studio and one-click game publishing modal"
```

---

### Task 7: Playwright E2E Test & Full Regression Suite

**Files:**
- Create: `tests/e2e/ai-generator-word-bank.spec.ts`

**Interfaces:**
- Produces:
  - Playwright test exercising AI Studio generation, editing items, and publishing to `game_configs`.
  - Verification of full repository suite (`npm test`, `npx tsc --noEmit`, `npm run lint`).

- [ ] **Step 1: Implement Playwright E2E test**
- [ ] **Step 2: Run full regression checks**
- [ ] **Step 3: Commit**

```bash
git add tests/e2e/ai-generator-word-bank.spec.ts
git commit -m "test(e2e): add Playwright E2E verification for AI generator and word bank"
```
