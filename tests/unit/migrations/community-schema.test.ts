import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import type { Database, CommunitySharedConfigRow, CommunitySharedConfigInsert, CommunitySharedConfigUpdate } from '@/types/database'
import type { CommunitySharedConfig, GetCommunityConfigsFilter, ShareConfigInput } from '@/types/community'

describe('community_shared_configs migration and TypeScript database definitions', () => {
  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20260913100000_community_shared_configs.sql'
  )

  it('migration file exists and contains table, foreign keys, indexes, triggers, and RLS policies', () => {
    expect(fs.existsSync(migrationPath)).toBe(true)
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    // Table creation
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.community_shared_configs')

    // Columns
    expect(sql).toContain('id UUID PRIMARY KEY DEFAULT gen_random_uuid()')
    expect(sql).toContain('config_id UUID REFERENCES public.game_configs(id) ON DELETE SET NULL')
    expect(sql).toContain('author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE')
    expect(sql).toContain("author_name TEXT NOT NULL DEFAULT 'Giáo viên GameHub'")
    expect(sql).toContain('title TEXT NOT NULL')
    expect(sql).toContain('description TEXT')
    expect(sql).toContain('game_id TEXT NOT NULL')
    expect(sql).toContain("cefr_level TEXT NOT NULL DEFAULT 'A1'")
    expect(sql).toContain("topic TEXT NOT NULL DEFAULT 'general'")
    expect(sql).toContain("tags TEXT[] NOT NULL DEFAULT '{}'")
    expect(sql).toContain("settings JSONB NOT NULL DEFAULT '{}'::jsonb")
    expect(sql).toContain('likes_count INT NOT NULL DEFAULT 0')
    expect(sql).toContain('clone_count INT NOT NULL DEFAULT 0')
    expect(sql).toContain('created_at TIMESTAMPTZ NOT NULL')
    expect(sql).toContain('updated_at TIMESTAMPTZ NOT NULL')

    // Indexes
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_community_configs_game_id ON public.community_shared_configs (game_id)')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_community_configs_cefr_level ON public.community_shared_configs (cefr_level)')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_community_configs_created_at ON public.community_shared_configs (created_at DESC)')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_community_configs_likes ON public.community_shared_configs (likes_count DESC)')

    // RLS
    expect(sql).toContain('ALTER TABLE public.community_shared_configs ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('CREATE POLICY "Allow read access to community shared configs"')
    expect(sql).toContain('CREATE POLICY "Allow authenticated teachers to insert community shared configs"')
    expect(sql).toContain('CREATE POLICY "Allow authors to update their community shared configs"')
    expect(sql).toContain('CREATE POLICY "Allow authors to delete their community shared configs"')

    // Scalar optimization in RLS: (select auth.uid()) instead of un-parenthesized auth.uid()
    expect(sql).toContain('(select auth.uid()) = author_id')

    // Updated_at trigger
    expect(sql).toContain('trg_community_shared_configs_updated_at')
  })

  it('validates Database community_shared_configs table schema and helper types', () => {
    type CommunityTable = Database['public']['Tables']['community_shared_configs']
    type DbRow = CommunityTable['Row']
    type DbInsert = CommunityTable['Insert']
    type DbUpdate = CommunityTable['Update']

    const mockRow: DbRow = {
      id: 'cfg-uuid-1',
      config_id: 'original-cfg-1',
      author_id: 'author-uuid-1',
      author_name: 'Cô Lan Anh',
      title: 'Animals Vocabulary B1',
      description: 'Advanced animal vocabulary quiz with pictures and sentences',
      game_id: 'flashcard',
      cefr_level: 'B1',
      topic: 'animals',
      tags: ['animals', 'vocabulary', 'b1'],
      settings: { timerSeconds: 30, soundEnabled: true },
      likes_count: 5,
      clone_count: 12,
      created_at: '2026-09-13T10:00:00Z',
      updated_at: '2026-09-13T10:00:00Z',
    }

    const typedRow: CommunitySharedConfigRow = mockRow
    expect(typedRow.id).toBe('cfg-uuid-1')
    expect(typedRow.likes_count).toBe(5)
    expect(typedRow.clone_count).toBe(12)

    const insertPayload: DbInsert & CommunitySharedConfigInsert = {
      author_id: 'author-uuid-1',
      title: 'Color Quiz A1',
      game_id: 'word-match',
    }
    expect(insertPayload.title).toBe('Color Quiz A1')

    const updatePayload: DbUpdate & CommunitySharedConfigUpdate = {
      likes_count: 6,
    }
    expect(updatePayload.likes_count).toBe(6)
  })

  it('validates domain model interoperability with community types', () => {
    const domainConfig: CommunitySharedConfig = {
      id: 'c-1',
      configId: 'cfg-1',
      authorId: 'auth-1',
      authorName: 'Thầy Hưng',
      title: 'Food & Drinks',
      description: 'Learn common food and drinks vocabulary',
      gameId: 'flashcard',
      cefrLevel: 'A1',
      topic: 'food',
      tags: ['food', 'drinks', 'beginner'],
      settings: { words: [] },
      likesCount: 10,
      cloneCount: 3,
      createdAt: '2026-09-13T10:00:00Z',
      updatedAt: '2026-09-13T10:00:00Z',
    }
    expect(domainConfig.title).toBe('Food & Drinks')

    const shareInput: ShareConfigInput = {
      configId: 'cfg-1',
      title: 'Food & Drinks',
      description: 'Learn common food and drinks vocabulary',
      cefrLevel: 'A1',
      topic: 'food',
      tags: ['food', 'drinks', 'beginner'],
    }
    expect(shareInput.title).toBe('Food & Drinks')

    const filter: GetCommunityConfigsFilter = {
      gameId: 'flashcard',
      cefrLevel: 'A1',
      search: 'food',
      sortBy: 'popular',
    }
    expect(filter.sortBy).toBe('popular')
  })
})

