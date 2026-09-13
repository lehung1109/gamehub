// tests/app/spelling-bee/page.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SpellingBeePage, { metadata } from '@/app/spelling-bee/page'
import SpellingBeeDivisionDetailPage, {
  generateStaticParams,
  generateMetadata,
} from '@/app/spelling-bee/[divisionId]/page'

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

describe('Spelling Bee Page Routes', () => {
  describe('Hub Page (/spelling-bee)', () => {
    it('has valid metadata', () => {
      expect(metadata.title).toContain('Đấu Trường Đánh Vần')
      expect(metadata.description).toBeDefined()
    })

    it('renders SpellingBeeHub with divisions', () => {
      render(<SpellingBeePage />)
      expect(screen.getByText('Đấu Trường Đánh Vần 🐝')).toBeInTheDocument()
      expect(screen.getByText('Bronze Bee Championship')).toBeInTheDocument()
      expect(screen.getByText('Silver Bee Championship')).toBeInTheDocument()
      expect(screen.getByText('Golden Bee Championship')).toBeInTheDocument()
    })
  })

  describe('Dynamic Division Page (/spelling-bee/[divisionId])', () => {
    it('generates static params for all 3 curated divisions', async () => {
      const params = await generateStaticParams()
      expect(params).toEqual([
        { divisionId: 'bronze-bee' },
        { divisionId: 'silver-bee' },
        { divisionId: 'golden-bee' },
      ])
    })

    it('generates metadata for a valid division', async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ divisionId: 'bronze-bee' }),
      })
      expect(meta.title).toContain('Hạng Ong Đồng - Khởi Động')
      expect(meta.title).toContain('Bronze Bee Championship')
    })

    it('generates fallback metadata when division is not found', async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ divisionId: 'non-existent-division' }),
      })
      expect(meta.title).toContain('Không tìm thấy')
    })

    it('renders division arena when divisionId is valid', async () => {
      const jsx = await SpellingBeeDivisionDetailPage({
        params: Promise.resolve({ divisionId: 'bronze-bee' }),
      })
      render(jsx)
      expect(screen.getByText('Hạng Ong Đồng - Khởi Động')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /nghe phát âm từ vựng/i })).toBeInTheDocument()
    })

    it('triggers notFound() when divisionId does not exist', async () => {
      await expect(
        SpellingBeeDivisionDetailPage({
          params: Promise.resolve({ divisionId: 'invalid-division-404' }),
        })
      ).rejects.toThrow('NEXT_NOT_FOUND')

      expect(mockNotFound).toHaveBeenCalled()
    })
  })
})
