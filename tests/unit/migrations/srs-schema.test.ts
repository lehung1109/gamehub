import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import type { SrsCard, SrsReviewInput, SrsReviewResult, MistakeDeckSummary } from '@/types/srs'
import type { StudentGamificationRow } from '@/types/database'

describe('mistake_notebook_srs migration script and types', () => {
  it('contains valid ALTER TABLE adding srs_deck JSONB column', () => {
    const migrationPath = path.resolve(
      process.cwd(),
      'supabase/migrations/20260912170000_mistake_notebook_srs.sql'
    )
    expect(fs.existsSync(migrationPath)).toBe(true)

    const sql = fs.readFileSync(migrationPath, 'utf-8')
    expect(sql).toContain('ALTER TABLE public.student_gamification')
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS srs_deck JSONB NOT NULL DEFAULT')
  })

  it('validates SrsCard and MistakeDeckSummary type shapes', () => {
    const card: SrsCard = {
      id: 'listening_apple',
      prompt: 'apple',
      correctAnswer: 'Quả táo',
      selectedAnswer: 'Quả cam',
      gameType: 'listening',
      topic: 'fruits',
      box: 1,
      lastReviewedAt: null,
      nextReviewAt: '2026-09-12T00:00:00Z',
      mistakeCount: 2,
      successCount: 0,
      isMastered: false,
    }
    expect(card.id).toBe('listening_apple')
    expect(card.box).toBe(1)
  })

  it('validates SrsReviewInput and SrsReviewResult type shapes', () => {
    const reviewInput: SrsReviewInput = {
      cardId: 'listening_apple',
      rating: 'good',
    }
    const card: SrsCard = {
      id: 'listening_apple',
      prompt: 'apple',
      correctAnswer: 'Quả táo',
      gameType: 'listening',
      box: 2,
      lastReviewedAt: '2026-09-12T10:00:00Z',
      nextReviewAt: '2026-09-15T10:00:00Z',
      mistakeCount: 2,
      successCount: 1,
      isMastered: false,
    }
    const result: SrsReviewResult = {
      updatedCard: card,
      earnedStars: 2,
      newlyMastered: false,
    }
    const summary: MistakeDeckSummary = {
      totalCards: 5,
      dueCount: 2,
      masteredCount: 1,
      learningCount: 2,
      reviewingCount: 2,
    }
    expect(reviewInput.rating).toBe('good')
    expect(result.earnedStars).toBe(2)
    expect(summary.totalCards).toBe(5)
  })

  it('verifies student_gamification database row includes srs_deck', () => {
    const row: StudentGamificationRow = {
      id: 'gam-1',
      student_id: 'student-1',
      streak_state: {},
      inventory: {},
      quests: [],
      srs_deck: [],
      created_at: '2026-09-12T00:00:00Z',
      updated_at: '2026-09-12T00:00:00Z',
    }
    expect(row.srs_deck).toEqual([])
  })
})
