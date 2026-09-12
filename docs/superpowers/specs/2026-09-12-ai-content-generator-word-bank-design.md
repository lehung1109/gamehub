# Technical Design Specification: AI Content Generator & Centralized Word Bank (Phase 3, Sub-project 10)

**Feature Branch**: `feat/ai-content-generator-word-bank`  
**Date**: 2026-09-12  
**Status**: Ready for Implementation Plan  

---

## 1. Executive Summary & Problem Statement

Currently in GameHub:
1. **Manual Game Configuration**: Teachers must manually construct question lists or select hardcoded topics (`animals`, `school`, `fruits`, etc.). There is no way to create custom vocabulary sets for specialized curriculum topics (e.g. "Space & Solar System", "Vietnamese Tet Festival", "Renewable Energy").
2. **Scattered Vocabulary & No Reusable Lexicon**: Words and exercises are fragmented across individual game JSON files (`src/data/words/*.json`, `src/data/sentences/*.json`, `src/data/reading/*.json`). Teachers cannot view, search, curate, or reuse words across multiple games.
3. **Teacher Workload**: Creating 20 high-quality vocabulary cards with IPA phonetics, accurate Vietnamese translations, example sentences, and distractor choices takes 20-30 minutes per lesson.

### Objectives
1. **Centralized Word Bank (`word_bank`)**:
   - Provide a persistent vocabulary store categorized by CEFR level (`Pre-A1`, `A1`, `A2`, `B1`, `B2`) and topics, with IPA phonetics, bilingual definitions, example sentences, and audio pronunciation.
   - Allow teachers to search, filter, edit, and select words to instantly generate game configs.
2. **AI Content Generator Studio**:
   - **Vocabulary Generator**: Generates rich vocabulary cards (English word, IPA phonetic, Vietnamese translation, CEFR level, emoji, example sentence, bilingual translation, distractor choices).
   - **Reading Comprehension Generator**: Generates themed reading passages with graded reading difficulty and multiple-choice questions for the Reading game.
   - **Grammar Detective Generator**: Generates sentences containing deliberate grammatical mistakes with error segment identification, explanations, and hints.
3. **One-Click Publishing to Game Configurations**:
   - Inline review and editing of generated content.
   - One-click saving to `word_bank` and direct creation of valid `game_configs` (for Flashcard, Word Search, Falling Words, Crossword, Wordle, Reading, and Grammar Detective).
4. **Dual AI Engine Architecture**:
   - Supports Gemini API when `GEMINI_API_KEY` is provided.
   - Seamless fallback to an internal Rule-Based Pedagogical Template Generator if the key is missing or offline, guaranteeing 100% deterministic testability and reliability.

---

## 2. Architecture & Data Flow

```
+-------------------------------------------------------------+
|                     Teacher Dashboard                       |
|   /admin/word-bank                   /admin/ai-generator    |
|   (Curate, Filter, Export)           (Vocab / Reading / Gr) |
+------------------------------+------------------------------+
                               |
               +---------------+---------------+
               |                               |
               v                               v
    [Server Actions: word-bank]    [Server Actions: ai-generator]
    - getWordBankWordsAction       - generateAiVocabularyAction
    - createWordBankWordAction     - generateAiReadingAction
    - bulkCreateWordBankWordsAction- generateAiGrammarAction
    - deleteWordBankWordAction     - publishAiContentToGameConfig
               |                               |
               |                     +---------+---------+
               |                     |                   |
               |                     v                   v
               |               [Gemini API]     [Offline Pedagogical
               |               (@google/genai)     Template Engine]
               |                     |                   |
               +----------+----------+-------------------+
                          |
                          v
         +---------------------------------+
         |     Supabase PostgreSQL DB      |
         |   - public.word_bank            |
         |   - public.game_configs         |
         +---------------------------------+
```

---

## 3. Database Schema

### Migration: `supabase/migrations/20260912180000_centralized_word_bank.sql`

```sql
-- Table: public.word_bank
CREATE TABLE IF NOT EXISTS public.word_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  english TEXT NOT NULL,
  vietnamese TEXT NOT NULL,
  phonetic TEXT,
  part_of_speech TEXT NOT NULL DEFAULT 'noun',
  cefr_level TEXT NOT NULL DEFAULT 'A1',
  topic TEXT NOT NULL DEFAULT 'general',
  emoji TEXT,
  example_sentence TEXT,
  example_translation TEXT,
  distractors TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for lightning-fast search and filtering
CREATE INDEX IF NOT EXISTS idx_word_bank_english ON public.word_bank (LOWER(TRIM(english)));
CREATE INDEX IF NOT EXISTS idx_word_bank_topic ON public.word_bank (topic);
CREATE INDEX IF NOT EXISTS idx_word_bank_cefr ON public.word_bank (cefr_level);
CREATE INDEX IF NOT EXISTS idx_word_bank_created_by ON public.word_bank (created_by);

-- Enable RLS
ALTER TABLE public.word_bank ENABLE ROW LEVEL SECURITY;

-- RLS Policies:
-- 1. Read: Any authenticated user or system service can read all words
CREATE POLICY "Allow authenticated read word_bank"
  ON public.word_bank
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Insert: Authenticated users can insert their own words
CREATE POLICY "Allow authenticated insert word_bank"
  ON public.word_bank
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by OR is_system = false);

-- 3. Update: Teachers can update words they created
CREATE POLICY "Allow update own words in word_bank"
  ON public.word_bank
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR is_system = false);

-- 4. Delete: Teachers can delete words they created (system words protected)
CREATE POLICY "Allow delete own words in word_bank"
  ON public.word_bank
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by AND is_system = false);

-- Updated_at trigger
CREATE OR REPLACE TRIGGER trg_word_bank_updated_at
  BEFORE UPDATE ON public.word_bank
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 4. TypeScript Interfaces (`src/types/word-bank.ts` and `src/types/ai-generator.ts`)

### `src/types/word-bank.ts`
```typescript
export type CefrLevel = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2';
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase';

export interface WordBankItem {
  id: string;
  english: string;
  vietnamese: string;
  phonetic?: string | null;
  partOfSpeech: PartOfSpeech;
  cefrLevel: CefrLevel;
  topic: string;
  emoji?: string | null;
  exampleSentence?: string | null;
  exampleTranslation?: string | null;
  distractors: string[];
  createdBy?: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WordBankFilterInput {
  search?: string;
  topic?: string;
  cefrLevel?: CefrLevel | 'all';
  partOfSpeech?: PartOfSpeech | 'all';
  page?: number;
  pageSize?: number;
}
```

### `src/types/ai-generator.ts`
```typescript
import type { CefrLevel, PartOfSpeech } from './word-bank';
import type { GameId } from './config';

export interface AiGeneratedVocabItem {
  id: string; // temporary client UUID
  english: string;
  vietnamese: string;
  phonetic: string;
  partOfSpeech: PartOfSpeech;
  cefrLevel: CefrLevel;
  topic: string;
  emoji: string;
  exampleSentence: string;
  exampleTranslation: string;
  distractors: string[];
}

export interface AiGeneratedReadingPassage {
  title: string;
  passage: string;
  vietnameseTranslation: string;
  cefrLevel: CefrLevel;
  topic: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}

export interface AiGeneratedGrammarItem {
  id: string;
  incorrectSentence: string;
  correctSentence: string;
  errorPart: string;
  ruleExplanation: string;
  hint: string;
}

export interface PublishAiContentInput {
  gameId: GameId;
  name: string;
  vocabItems?: AiGeneratedVocabItem[];
  readingPassage?: AiGeneratedReadingPassage;
  grammarItems?: AiGeneratedGrammarItem[];
  saveToWordBank?: boolean;
}
```

---

## 5. Core Engine Design (`src/lib/ai-generator.ts`)

1. **Dual Engine Architecture**:
   - Evaluates `process.env.GEMINI_API_KEY`.
   - If available: Calls Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`) with structured JSON schema responses (`responseMimeType: "application/json"`).
   - If unavailable or upon API rejection: Invokes `generateOfflinePedagogicalContent(...)`, which uses comprehensive curated dictionaries with 50+ topics and CEFR distributions. This guarantees **100% test reliability and offline zero-network capability**.
2. **Content Sanitization**:
   - Normalizes text: trims whitespace, enforces capitalizations, validates that `options` include `correctAnswer`.
   - Generates at least 3 plausible distractor options for vocabulary mini-games.

---

## 6. Server Actions

1. **`src/app/actions/word-bank.ts`**:
   - `getWordBankWordsAction(filter: WordBankFilterInput)`: Paginated query with case-insensitive search across `english` and `vietnamese`.
   - `createWordBankWordAction(data)`: Validates and inserts a word for the authenticated teacher.
   - `bulkCreateWordBankWordsAction(words)`: Bulk-inserts up to 50 words atomically.
   - `deleteWordBankWordAction(wordId)`: Deletes custom teacher-created word.
2. **`src/app/actions/ai-generator.ts`**:
   - `generateAiVocabularyAction({ topic, cefrLevel, count, customPrompt })`: Returns validated `AiGeneratedVocabItem[]`.
   - `generateAiReadingAction({ topic, cefrLevel, questionCount })`: Returns `AiGeneratedReadingPassage`.
   - `generateAiGrammarAction({ topic, focusRule, count })`: Returns `AiGeneratedGrammarItem[]`.
   - `publishAiContentToGameConfigAction(input)`: Validates game settings, optionally saves to `word_bank`, and creates a new row in `game_configs` for the teacher.

---

## 7. UI Components & Layout

1. **Word Bank Page (`src/app/admin/word-bank/page.tsx`)**:
   - Header with search input, topic dropdown, CEFR pill selector, and action buttons ("Thêm từ mới", "Tạo bằng AI", "Xuất sang Game").
   - Word Table / Grid:
     - English word with `SpeakButton` audio.
     - Phonetic transcription (IPA).
     - Vietnamese translation.
     - CEFR Level pill (e.g. `A1` green, `A2` blue, `B1` purple).
     - Topic badge & example sentence.
     - Delete / Edit actions for teacher words.
2. **AI Content Studio (`src/app/admin/ai-generator/page.tsx`)**:
   - Multi-tab Studio:
     - **Tab 1: Sinh Từ vựng (Vocabulary)**: Topic input, CEFR picker, word count slider. Results displayed as editable cards.
     - **Tab 2: Sinh Bài đọc (Reading Passage)**: Passage topic, reading level, comprehension question generator.
     - **Tab 3: Sinh Bài tập Ngữ pháp (Grammar Detective)**: Focus rule (Tenses, Articles, Subject-Verb Agreement, Prepositions), sentence generator.
   - Inline Editor: Teacher can modify any generated word, phonetic, or translation before approving.
   - Action Bar:
     - "Lưu vào Ngân hàng từ"
     - "Tạo cấu hình Game ngay" (Select target game: Flashcards, Word Search, Falling Words, Crossword, Wordle, Reading, Grammar Detective).
3. **Navbar & Admin Dashboard Integration**:
   - Add links to `Ngân hàng từ` and `AI Studio` in `src/app/admin/layout.tsx`.
   - Add quick-start cards on `src/app/admin/dashboard/page.tsx`.

---

## 8. Verification & QA Plan

1. **Migration & Schema Tests** (`tests/unit/migrations/word-bank-schema.test.ts`):
   - Verifies table structure, columns, indexes, RLS policies, and triggers.
2. **AI Engine Tests** (`tests/unit/lib/ai-generator.test.ts`):
   - Tests vocabulary generator across all CEFR levels.
   - Tests reading comprehension generator schema.
   - Tests grammar detective generator schema.
   - Tests fallback engine when API key is unset.
3. **Server Action Tests** (`tests/unit/actions/word-bank.test.ts`, `tests/unit/actions/ai-generator.test.ts`):
   - Tests search, filtering, pagination, and RLS enforcement.
   - Tests publishing generated content into valid `game_configs`.
4. **UI Component Tests** (`tests/components/admin/WordBankList.test.tsx`, `tests/components/admin/AiContentStudio.test.tsx`):
   - Tests search filtering, inline editing, audio pronunciation, and one-click publishing.
5. **Playwright E2E Test** (`tests/e2e/ai-generator-word-bank.spec.ts`):
   - Teacher accesses AI Studio, generates a vocabulary set for "Solar System", edits a card, clicks "Tạo cấu hình Game", and verifies game config is created in `game_configs` and appears in the admin dashboard!
