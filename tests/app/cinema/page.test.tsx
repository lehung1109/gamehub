// tests/app/cinema/page.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PhonicsCinemaPage, { metadata } from '@/app/cinema/page'
import CinemaEpisodeDetailPage, {
  generateStaticParams,
  generateMetadata,
} from '@/app/cinema/[episodeId]/page'

// Mock next/navigation
const mockNotFound = vi.fn()
vi.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound()
    throw new Error('NEXT_NOT_FOUND')
  },
}))

// Mock rhythm synthesizer
vi.mock('@/lib/rhythm-beat-synthesizer', () => ({
  createRhythmSynthesizer: () => ({
    playChime: vi.fn(),
    playKick: vi.fn(),
    playSnare: vi.fn(),
    playWoodblock: vi.fn(),
    close: vi.fn().mockResolvedValue(undefined),
  }),
}))

// Mock speech
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

describe('Phonics Cinema Page Routes', () => {
  describe('Hub Page (/cinema)', () => {
    it('has valid metadata', () => {
      expect(metadata.title).toContain('Rạp Chiếu Phim Hoạt Hình Phonics')
      expect(metadata.description).toBeDefined()
    })

    it('renders PhonicsCinemaHub with all 3 episodes', () => {
      render(<PhonicsCinemaPage />)
      expect(screen.getByText('Rạp Chiếu Phim Phonics 🍿')).toBeInTheDocument()
      expect(screen.getByText('Chú Khủng Long Đói Bụng')).toBeInTheDocument()
      expect(screen.getByText('Nồi Thuốc Tiên Kỳ Diệu')).toBeInTheDocument()
      expect(screen.getByText('Chiếc Thảm Bay Thần Kỳ')).toBeInTheDocument()
    })
  })

  describe('Dynamic Episode Page (/cinema/[episodeId])', () => {
    it('generates static params for all 3 curated episodes', async () => {
      const params = await generateStaticParams()
      expect(params).toEqual([
        { episodeId: 'the-hungry-dino' },
        { episodeId: 'the-magic-potion' },
        { episodeId: 'the-flying-carpet' },
      ])
    })

    it('generates correct metadata for an existing episode', async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ episodeId: 'the-hungry-dino' }),
      })
      expect(meta.title).toContain('Chú Khủng Long Đói Bụng')
      expect(meta.description).toContain('Rex')
    })

    it('generates fallback metadata for unknown episode', async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ episodeId: 'unknown-episode' }),
      })
      expect(meta.title).toBe('Không tìm thấy tập phim | GameHub Phonics Cinema')
    })

    it('renders player component for valid episode', async () => {
      const PageComponent = await CinemaEpisodeDetailPage({
        params: Promise.resolve({ episodeId: 'the-hungry-dino' }),
      })
      render(PageComponent)

      expect(screen.getByText('Cảnh 1: Bữa Sáng Của Rex')).toBeInTheDocument()
      expect(screen.getByText('Chú Khủng Long Đói Bụng')).toBeInTheDocument()
    })

    it('invokes notFound() when episode is not found', async () => {
      await expect(
        CinemaEpisodeDetailPage({
          params: Promise.resolve({ episodeId: 'non-existent' }),
        })
      ).rejects.toThrow('NEXT_NOT_FOUND')

      expect(mockNotFound).toHaveBeenCalled()
    })
  })
})
