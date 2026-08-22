import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import AlphabetGamePage from '@/app/games/alphabet/page'
import FlashcardTopicSelectionPage from '@/app/games/flashcard/page'
import ListeningGamePage from '@/app/games/listening/page'
import NumbersColorsPage from '@/app/games/numbers-colors/page'
import SentencesGamePage from '@/app/games/sentences/page'
import SpellingGamePage from '@/app/games/spelling/page'
import * as configActions from '@/app/actions/configs'

let mockConfigId: string | null = null

vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>()
  return {
    ...actual,
    useSearchParams: () => ({
      get: (key: string) => (key === 'config' ? mockConfigId : null),
    }),
  }
})

// Mock useSpeech
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
    isSupported: true,
    supported: true,
  }),
}))

describe('Game Config Resolution (US4 / T039)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigId = null
  })

  it('AlphabetGamePage respects letterRange and custom config name', async () => {
    mockConfigId = 'cfg-alpha'
    vi.spyOn(configActions, 'getConfigByIdPublic').mockResolvedValueOnce({
      data: {
        id: 'cfg-alpha',
        user_id: 'u1',
        game_id: 'alphabet',
        name: 'Lớp 1A - Chữ A đến C',
        settings: { letterRange: ['A', 'B', 'C'], mode: 'learn', autoSpeak: true },
        share_slug: 'alpha-slug',
        is_active: true,
        created_at: '2026-08-21T00:00:00Z',
        updated_at: '2026-08-21T00:00:00Z',
      },
    })

    render(<AlphabetGamePage />)
    expect(screen.getByRole('heading', { level: 1, name: /Chữ cái & Phonics/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Lớp 1A - Chữ A đến C')).toBeInTheDocument()
    })
  })

  it('FlashcardTopicSelectionPage filters topics when config is passed', async () => {
    mockConfigId = 'cfg-flash'
    vi.spyOn(configActions, 'getConfigByIdPublic').mockResolvedValueOnce({
      data: {
        id: 'cfg-flash',
        user_id: 'u1',
        game_id: 'flashcard',
        name: 'Lớp 1A - Chỉ học Động vật',
        settings: { topics: ['animals'], wordLimit: 5, autoSpeak: true },
        share_slug: 'flash-slug',
        is_active: true,
        created_at: '2026-08-21T00:00:00Z',
        updated_at: '2026-08-21T00:00:00Z',
      },
    })

    render(<FlashcardTopicSelectionPage />)

    await waitFor(() => {
      expect(screen.getByText('Động vật')).toBeInTheDocument()
      expect(screen.queryByText('Trường học')).not.toBeInTheDocument()
      expect(screen.getByText('Lớp 1A - Chỉ học Động vật')).toBeInTheDocument()
    })
  })

  it('ListeningGamePage applies config properly', async () => {
    mockConfigId = 'cfg-listen'
    vi.spyOn(configActions, 'getConfigByIdPublic').mockResolvedValueOnce({
      data: {
        id: 'cfg-listen',
        user_id: 'u1',
        game_id: 'listening',
        name: 'Lớp 2A - Luyện nghe',
        settings: { topics: ['fruits'], questionCount: 5, showHint: true },
        share_slug: 'listen-slug',
        is_active: true,
        created_at: '2026-08-21T00:00:00Z',
        updated_at: '2026-08-21T00:00:00Z',
      },
    })

    render(<ListeningGamePage />)
    expect(screen.getByRole('heading', { level: 1, name: /Nghe hiểu/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Lớp 2A - Luyện nghe')).toBeInTheDocument()
    })
  })

  it('NumbersColorsPage renders properly with custom settings', async () => {
    mockConfigId = 'cfg-num'
    vi.spyOn(configActions, 'getConfigByIdPublic').mockResolvedValueOnce({
      data: {
        id: 'cfg-num',
        user_id: 'u1',
        game_id: 'numbers-colors',
        name: 'Lớp 1B - Số 1 đến 10',
        settings: { numberRange: [1, 10], includeColors: false, mode: 'learn' },
        share_slug: 'num-slug',
        is_active: true,
        created_at: '2026-08-21T00:00:00Z',
        updated_at: '2026-08-21T00:00:00Z',
      },
    })

    render(<NumbersColorsPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Số & Màu sắc/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Lớp 1B - Số 1 đến 10')).toBeInTheDocument()
    })
  })

  it('SentencesGamePage renders properly with custom settings', async () => {
    mockConfigId = 'cfg-sen'
    vi.spyOn(configActions, 'getConfigByIdPublic').mockResolvedValueOnce({
      data: {
        id: 'cfg-sen',
        user_id: 'u1',
        game_id: 'sentences',
        name: 'Lớp 3A - Ghép câu',
        settings: { categories: ['animals'], sentenceCount: 5, showVietnamese: true },
        share_slug: 'sen-slug',
        is_active: true,
        created_at: '2026-08-21T00:00:00Z',
        updated_at: '2026-08-21T00:00:00Z',
      },
    })

    render(<SentencesGamePage />)
    expect(screen.getByRole('heading', { level: 1, name: /Luyện câu đơn giản/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Lớp 3A - Ghép câu')).toBeInTheDocument()
    })
  })

  it('SpellingGamePage renders properly with custom settings', async () => {
    mockConfigId = 'cfg-spell'
    vi.spyOn(configActions, 'getConfigByIdPublic').mockResolvedValueOnce({
      data: {
        id: 'cfg-spell',
        user_id: 'u1',
        game_id: 'spelling',
        name: 'Lớp 2B - Đánh vần',
        settings: { topics: ['animals'], wordLimit: 5, showEmoji: true },
        share_slug: 'spell-slug',
        is_active: true,
        created_at: '2026-08-21T00:00:00Z',
        updated_at: '2026-08-21T00:00:00Z',
      },
    })

    render(<SpellingGamePage />)
    expect(screen.getByRole('heading', { level: 1, name: /Đánh vần & Ghép từ/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Lớp 2B - Đánh vần')).toBeInTheDocument()
    })
  })
})
