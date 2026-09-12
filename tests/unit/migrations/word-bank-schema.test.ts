import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import type {
  CefrLevel,
  PartOfSpeech,
  WordBankItem,
  WordBankFilterInput,
  CreateWordBankInput,
  UpdateWordBankInput,
} from '@/types/word-bank'
import type { Database, WordBankRow } from '@/types/database'

describe('word_bank migration and TypeScript definitions', () => {
  it('contains valid table definition, expected columns, foreign key, indexes, RLS, and trigger', () => {
    const migrationPath = path.resolve(
      process.cwd(),
      'supabase/migrations/20260912180000_centralized_word_bank.sql'
    )
    expect(fs.existsSync(migrationPath)).toBe(true)

    const sql = fs.readFileSync(migrationPath, 'utf-8')

    // Table definition
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.word_bank')

    // Expected columns
    const expectedColumns = [
      'id UUID PRIMARY KEY',
      'english TEXT NOT NULL',
      'vietnamese TEXT NOT NULL',
      'phonetic TEXT',
      'part_of_speech TEXT NOT NULL',
      'cefr_level TEXT NOT NULL',
      'topic TEXT NOT NULL',
      'emoji TEXT',
      'example_sentence TEXT',
      'example_translation TEXT',
      'distractors TEXT[] NOT NULL',
      'created_by UUID REFERENCES auth.users(id)',
      'is_system BOOLEAN NOT NULL',
      'created_at TIMESTAMPTZ NOT NULL',
      'updated_at TIMESTAMPTZ NOT NULL',
    ]

    for (const column of expectedColumns) {
      expect(sql).toContain(column)
    }

    // Indexes
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_word_bank_english ON public.word_bank')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_word_bank_topic ON public.word_bank (topic)')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_word_bank_cefr ON public.word_bank (cefr_level)')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_word_bank_created_by ON public.word_bank (created_by)')

    // RLS enabled and policies
    expect(sql).toContain('ALTER TABLE public.word_bank ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('CREATE POLICY "Allow authenticated read word_bank"')
    expect(sql).toContain('CREATE POLICY "Allow authenticated insert word_bank"')
    expect(sql).toContain('CREATE POLICY "Allow update own words in word_bank"')
    expect(sql).toContain('CREATE POLICY "Allow delete own words in word_bank"')

    // RLS security and performance clauses
    expect(sql).toContain('WITH CHECK ((select auth.uid()) = created_by AND is_system = false)')
    expect(sql).toContain('USING ((select auth.uid()) = created_by AND is_system = false)')

    // CHECK constraints
    expect(sql).toContain("CHECK (cefr_level IN ('Pre-A1', 'A1', 'A2', 'B1', 'B2'))")
    expect(sql).toContain("CHECK (part_of_speech IN ('noun', 'verb', 'adjective', 'adverb', 'phrase'))")

    // Trigger
    expect(sql).toContain('trg_word_bank_updated_at')
  })

  it('validates WordBankItem, CefrLevel, and PartOfSpeech type shapes', () => {
    const cefrLevels: CefrLevel[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2']
    const partsOfSpeech: PartOfSpeech[] = ['noun', 'verb', 'adjective', 'adverb', 'phrase']
    expect(cefrLevels).toHaveLength(5)
    expect(partsOfSpeech).toHaveLength(5)

    const item: WordBankItem = {
      id: 'wb-123',
      english: 'solar system',
      vietnamese: 'hệ mặt trời',
      phonetic: '/ˈsoʊ.lɚ ˌsɪs.təm/',
      partOfSpeech: 'noun',
      cefrLevel: 'A2',
      topic: 'space',
      emoji: '🪐',
      exampleSentence: 'Earth is part of the solar system.',
      exampleTranslation: 'Trái đất là một phần của hệ mặt trời.',
      distractors: ['galaxy', 'universe', 'black hole'],
      createdBy: 'user-456',
      isSystem: false,
      createdAt: '2026-09-12T00:00:00Z',
      updatedAt: '2026-09-12T00:00:00Z',
    }

    expect(item.id).toBe('wb-123')
    expect(item.english).toBe('solar system')
    expect(item.vietnamese).toBe('hệ mặt trời')
    expect(item.distractors).toEqual(['galaxy', 'universe', 'black hole'])
    expect(item.isSystem).toBe(false)
  })

  it('validates WordBankFilterInput, CreateWordBankInput, and UpdateWordBankInput shapes', () => {
    const filter: WordBankFilterInput = {
      search: 'solar',
      topic: 'space',
      cefrLevel: 'A2',
      partOfSpeech: 'noun',
      page: 1,
      pageSize: 20,
    }
    expect(filter.search).toBe('solar')
    expect(filter.pageSize).toBe(20)

    const createInput: CreateWordBankInput = {
      english: 'astronaut',
      vietnamese: 'phi hành gia',
      phonetic: '/ˈæs.trə.nɑːt/',
      partOfSpeech: 'noun',
      cefrLevel: 'B1',
      topic: 'space',
      emoji: '👨‍🚀',
      exampleSentence: 'The astronaut floated in space.',
      exampleTranslation: 'Phi hành gia lơ lửng trong không gian.',
      distractors: ['pilot', 'engineer', 'scientist'],
      isSystem: false,
    }
    expect(createInput.english).toBe('astronaut')

    const updateInput: UpdateWordBankInput = {
      id: 'wb-123',
      emoji: '🚀',
    }
    expect(updateInput.id).toBe('wb-123')
    expect(updateInput.emoji).toBe('🚀')
  })

  it('verifies Database public.word_bank table schema and WordBankRow type', () => {
    type WordBankTable = Database['public']['Tables']['word_bank']
    type DbRow = WordBankTable['Row']
    type DbInsert = WordBankTable['Insert']
    type DbUpdate = WordBankTable['Update']

    const row: DbRow = {
      id: 'wb-row-1',
      english: 'apple',
      vietnamese: 'quả táo',
      phonetic: '/ˈæp.əl/',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      topic: 'fruits',
      emoji: '🍎',
      example_sentence: 'I eat an apple every day.',
      example_translation: 'Tôi ăn một quả táo mỗi ngày.',
      distractors: ['banana', 'orange', 'grape'],
      created_by: null,
      is_system: true,
      created_at: '2026-09-12T00:00:00Z',
      updated_at: '2026-09-12T00:00:00Z',
    }

    const wordBankRow: WordBankRow = row
    expect(wordBankRow.id).toBe('wb-row-1')
    expect(wordBankRow.is_system).toBe(true)

    const insertPayload: DbInsert = {
      english: 'banana',
      vietnamese: 'quả chuối',
    }
    expect(insertPayload.english).toBe('banana')

    const updatePayload: DbUpdate = {
      emoji: '🍌',
    }
    expect(updatePayload.emoji).toBe('🍌')
  })
})
