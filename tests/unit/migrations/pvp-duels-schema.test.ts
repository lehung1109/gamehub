import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import type {
  Database,
  PvpDuelRow,
  PvpDuelInsert,
  PvpDuelUpdate,
} from '@/types/database'

describe('PvP Duels Database Schema Migration', () => {
  const migrationPath = path.resolve('supabase/migrations/20260912220000_pvp_duels.sql')

  it('exists and defines pvp_duels table with status constraints and indexes', () => {
    expect(fs.existsSync(migrationPath)).toBe(true)
    const sql = fs.readFileSync(migrationPath, 'utf8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.pvp_duels')
    expect(sql).toContain('code VARCHAR(8) NOT NULL UNIQUE')
    expect(sql).toContain('topic TEXT NOT NULL DEFAULT')
    expect(sql).toContain('questions JSONB NOT NULL DEFAULT')
    expect(sql).toContain("CHECK (status IN ('waiting', 'ready', 'in_progress', 'finished', 'cancelled'))")
    expect(sql).toContain('player1_name TEXT NOT NULL')
    expect(sql).toContain('player1_avatar TEXT NOT NULL DEFAULT')
    expect(sql).toContain('player1_score INT NOT NULL DEFAULT 0')
    expect(sql).toContain('player1_answers JSONB NOT NULL DEFAULT')
    expect(sql).toContain('player2_name TEXT')
    expect(sql).toContain('player2_avatar TEXT DEFAULT')
    expect(sql).toContain('player2_score INT NOT NULL DEFAULT 0')
    expect(sql).toContain('player2_answers JSONB NOT NULL DEFAULT')
    expect(sql).toContain('current_question_index INT NOT NULL DEFAULT 0')
    expect(sql).toContain('winner_name TEXT')
    expect(sql).toContain('idx_pvp_duels_code')
    expect(sql).toContain('idx_pvp_duels_status')
    expect(sql).toContain('ALTER TABLE public.pvp_duels ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('handle_updated_at()')
  })

  it('verifies Database type definitions for pvp_duels', () => {
    type DBTable = Database['public']['Tables']['pvp_duels']
    const row: DBTable['Row'] = {
      id: 'duel-123',
      code: 'ABC123',
      topic: 'animals',
      questions: [],
      status: 'waiting',
      player1_name: 'Hero',
      player1_avatar: '🦊',
      player1_score: 0,
      player1_answers: [],
      player2_name: null,
      player2_avatar: '🐼',
      player2_score: 0,
      player2_answers: [],
      current_question_index: 0,
      winner_name: null,
      created_at: '2026-09-12T22:00:00Z',
      updated_at: '2026-09-12T22:00:00Z',
    }
    expect(row.code).toBe('ABC123')
    expect(row.player1_name).toBe('Hero')
  })

  it('exports helper types PvpDuelRow, PvpDuelInsert, and PvpDuelUpdate', () => {
    const row: PvpDuelRow = {
      id: 'duel-456',
      code: 'XYZ789',
      topic: 'fruits',
      questions: [],
      status: 'ready',
      player1_name: 'Alex',
      player1_avatar: '🦊',
      player1_score: 100,
      player1_answers: [],
      player2_name: 'Sam',
      player2_avatar: '🐼',
      player2_score: 80,
      player2_answers: [],
      current_question_index: 1,
      winner_name: null,
      created_at: '2026-09-12T22:00:00Z',
      updated_at: '2026-09-12T22:00:00Z',
    }

    const insert: PvpDuelInsert = {
      code: 'XYZ789',
      player1_name: 'Alex',
    }

    const update: PvpDuelUpdate = {
      status: 'in_progress',
      player2_name: 'Sam',
    }

    expect(row.code).toBe('XYZ789')
    expect(insert.player1_name).toBe('Alex')
    expect(update.status).toBe('in_progress')
  })
})
