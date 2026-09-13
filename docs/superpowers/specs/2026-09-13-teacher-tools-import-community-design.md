# Technical Design Specification: Extended Teacher Tools (Excel/Quizlet Import & Community Library)

**Feature Branch**: `feat/phase-9-teacher-tools-import-community`  
**Date**: 2026-09-13  
**Status**: In Design / Plan

---

## 1. Executive Summary & Problem Statement

### Current Limitations
1. **Manual Entry Friction**: Teachers who maintain vocabulary lists in Excel spreadsheets, Google Sheets, Quizlet study sets, or Anki decks have no way to batch-import words into GameHub. Adding 30 words manually requires 10-15 minutes of repetitive form entry.
2. **Siloed Content**: Lesson configurations created by experienced teachers remain isolated in their individual accounts. New teachers must configure games from scratch rather than benefiting from peer-curated content.
3. **Curriculum Sharing**: Schools and teacher teams cannot discover and clone ready-to-play game configurations tailored to specific grades (Grade 1-12) or CEFR levels (A1-B2).

### Core Objectives
1. **Multi-Format Vocabulary Importer (`/admin/word-bank` & Modal)**:
   - **Quizlet / Raw Text Parser**: Parses tab-separated, comma-separated, hyphen-separated, or pipe-separated flashcard exports with automatic line number stripping.
   - **CSV / TSV / Excel-paste Parser**: Auto-detects column headers (`english`, `vietnamese`, `phonetic`, `part_of_speech`, `cefr_level`, `topic`, `example_sentence`).
   - **Smart Data Validation & Preview Table**: Real-time validation tagging rows as `valid`, `warning`, `duplicate`, or `error` with inline editing and batch resolution.
   - **Dual Target Actions**: 1-click import into Centralized Word Bank or immediate game config generation.
2. **Community Library Marketplace (`/admin/community`)**:
   - Centralized marketplace for public lesson packs and game configurations.
   - Filterable by Game Type (`flashcard`, `crossword`, `hangman`, `wordle`, etc.), CEFR level (`Pre-A1` through `B2`), and Topic.
   - **1-Click Clone**: Clones shared configuration into current teacher's account with a unique title, ready for classroom assignment.
   - **Community Engagement**: Likes counter and clone counter to highlight top-rated educational content.
   - **Creator Publishing Flow**: Teachers can publish any of their existing `game_configs` to the community library with title, description, and tags.

---

## 2. Architecture & Data Flow

```
+-------------------------------------------------------------------------------+
|                             Teacher Admin Portal                              |
|   /admin/word-bank (Import Tab/Modal)          /admin/community (Marketplace) |
+------------------------------------+------------------------------------------+
                                     |
                +--------------------+--------------------+
                |                                         |
                v                                         v
   [Vocabulary Import Engine]                [Community Server Actions]
   - parseQuizletText()                      - getCommunityConfigsAction()
   - parseCsvOrTsv()                         - shareConfigToCommunityAction()
   - validateImportRows()                    - cloneCommunityConfigAction()
                |                            - toggleLikeCommunityConfigAction()
                v                                         |
   [Word Bank Server Actions]                             v
   - bulkCreateWordBankWordsAction()         [Supabase PostgreSQL]
                |                            - community_shared_configs
                v                            - game_configs
   [Supabase: word_bank]
```

---

## 3. Database Schema

### `supabase/migrations/20260913100000_community_shared_configs.sql`

```sql
CREATE TABLE IF NOT EXISTS public.community_shared_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES public.game_configs(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Giáo viên GameHub',
  title TEXT NOT NULL,
  description TEXT,
  game_id TEXT NOT NULL,
  cefr_level TEXT NOT NULL DEFAULT 'A1',
  topic TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  likes_count INT NOT NULL DEFAULT 0,
  clone_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_configs_game_id ON public.community_shared_configs(game_id);
CREATE INDEX IF NOT EXISTS idx_community_configs_cefr_level ON public.community_shared_configs(cefr_level);
CREATE INDEX IF NOT EXISTS idx_community_configs_created_at ON public.community_shared_configs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_configs_likes ON public.community_shared_configs(likes_count DESC);

-- RLS
ALTER TABLE public.community_shared_configs ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/authenticated) to read shared configs
CREATE POLICY "Allow read access to community shared configs"
  ON public.community_shared_configs
  FOR SELECT
  USING (true);

-- Allow authenticated teachers to publish configs
CREATE POLICY "Allow authenticated teachers to insert community shared configs"
  ON public.community_shared_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Allow author to update their shared config
CREATE POLICY "Allow authors to update their community shared configs"
  ON public.community_shared_configs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Allow author to delete their shared config
CREATE POLICY "Allow authors to delete their community shared configs"
  ON public.community_shared_configs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);
```

---

## 4. TypeScript Contracts (`src/types/community.ts` & `src/types/importer.ts`)

### `src/types/importer.ts`
```typescript
import type { CefrLevel, PartOfSpeech } from '@/types/word-bank'

export type ImportRowStatus = 'valid' | 'warning' | 'duplicate' | 'error'

export interface RawImportRow {
  id: string
  english: string
  vietnamese: string
  phonetic?: string
  partOfSpeech?: string
  cefrLevel?: string
  topic?: string
  exampleSentence?: string
  exampleTranslation?: string
}

export interface ValidatedImportRow {
  id: string
  english: string
  vietnamese: string
  phonetic: string | null
  partOfSpeech: PartOfSpeech
  cefrLevel: CefrLevel
  topic: string
  exampleSentence: string | null
  exampleTranslation: string | null
  status: ImportRowStatus
  validationMessage?: string
  isSelected: boolean
}

export interface ImportValidationSummary {
  total: number
  validCount: number
  warningCount: number
  duplicateCount: number
  errorCount: number
}
```

### `src/types/community.ts`
```typescript
import type { CefrLevel } from '@/types/word-bank'

export interface CommunitySharedConfig {
  id: string
  configId: string | null
  authorId: string
  authorName: string
  title: string
  description: string | null
  gameId: string
  cefrLevel: CefrLevel
  topic: string
  tags: string[]
  settings: Record<string, unknown>
  likesCount: number
  cloneCount: number
  createdAt: string
  updatedAt: string
  isLikedByMe?: boolean
}

export interface GetCommunityConfigsFilter {
  gameId?: string
  cefrLevel?: CefrLevel | 'all'
  topic?: string
  search?: string
  sortBy?: 'newest' | 'popular' | 'clones'
  page?: number
  pageSize?: number
}

export interface ShareConfigInput {
  configId: string
  title: string
  description?: string
  cefrLevel: CefrLevel
  topic: string
  tags?: string[]
}
```

---

## 5. UI & User Experience Specifications

1. **Vocabulary Importer Modal / Component (`VocabularyImporterModal.tsx`)**:
   - Tabbed input:
     - **Tải tệp tin (File)**: Drag-and-drop zone accepting `.csv`, `.tsv`, `.txt`.
     - **Dán văn bản (Paste)**: Large textarea with delimiter dropdown (`Tab`, `Dấu phẩy (,)`, `Dấu gạch ngang (-)`, `Dấu hai chấm (:)`).
   - Action bar: "Phân tích dữ liệu" (Parse data) and "Xem ví dụ định dạng".
   - Preview Table:
     - Checkbox per row + Master checkbox.
     - Colored status pill (`Hợp lệ`, `Cảnh báo`, `Trùng lặp`, `Lỗi`).
     - Editable table cells.
     - Delete row button.
   - Batch footer: Shows summary (e.g. `18 hợp lệ, 2 cảnh báo, 0 lỗi`), with primary button "Thêm vào Ngân hàng từ vựng" and secondary button "Hủy".
2. **Community Marketplace Hub (`/admin/community`)**:
   - Hero header: "Thư viện bài giảng & cấu hình cộng đồng" with count of available shared packs.
   - Search bar and filter chips for Game Type, CEFR Level, and Sort Order (`Mới nhất`, `Phổ biến nhất`, `Được sao chép nhiều nhất`).
   - Community Config Card:
     - Game icon & title.
     - Author badge & creation date.
     - CEFR badge & topic tag.
     - Like button with dynamic counter.
     - "Sao chép cấu hình" (Clone) button.
   - "Chia sẻ cấu hình của bạn" (Share Config) button opening a modal with config picker from teacher's own library.
3. **Typography & Design Tokens**:
   - Strict adherence to min 16px font size policy (all interactive and body texts $\ge 16$px).

---

## 6. Testing Strategy

1. **Unit Tests**:
   - `tests/unit/lib/vocabulary-importer.test.ts`: pure parser tests for Quizlet, CSV, TSV, edge case delimiters, missing fields, and duplicate detection.
   - `tests/unit/actions/community.test.ts`: server actions for listing, sharing, cloning, and liking community configs with 100% mocked Supabase client.
2. **Component Tests**:
   - `tests/unit/components/VocabularyImporterModal.test.tsx`: paste parsing, row editing, validation badges, batch selection, and submission.
   - `tests/unit/components/CommunityConfigCard.test.tsx`: card display, like toggling, and clone action triggers.
3. **End-to-End Tests**:
   - `tests/e2e/teacher-tools-import-community.spec.ts`: Playwright test covering import paste -> review table -> submission, and browsing community marketplace -> cloning configuration.
