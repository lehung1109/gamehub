// tests/app/games/voice-arcade/page.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import VoiceArcadePage, { metadata } from '@/app/games/voice-arcade/page'
import ArcadeStageDetailPage, {
  generateStaticParams,
  generateMetadata,
} from '@/app/games/voice-arcade/[stageId]/page'

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

// Mock speech hooks
vi.mock('@/hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => ({
    isListening: false,
    isSupported: true,
    transcript: '',
    interimTranscript: '',
    error: null,
    startListening: vi.fn(),
    stopListening: vi.fn(),
    resetTranscript: vi.fn(),
  }),
}))

vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

describe('Voice Arcade Page Routes', () => {
  describe('Hub Page (/games/voice-arcade)', () => {
    it('has valid metadata', () => {
      expect(metadata.title).toContain('Khu Trò Chơi Giọng Nói')
      expect(metadata.description).toBeDefined()
    })

    it('renders VoiceArcadeHub with stages', () => {
      render(<VoiceArcadePage />)
      expect(screen.getByText('Khu Trò Chơi Giọng Nói 🎙️')).toBeInTheDocument()
      expect(screen.getByText(/Voice Jump Runner: CVC Words/i)).toBeInTheDocument()
      expect(screen.getByText(/Meteor Blaster: Blends & Digraphs/i)).toBeInTheDocument()
    })
  })

  describe('Dynamic Stage Page (/games/voice-arcade/[stageId])', () => {
    it('generates static params for all 3 curated stages', async () => {
      const params = await generateStaticParams()
      expect(params).toEqual([
        { stageId: 'runner-cvc' },
        { stageId: 'blaster-blends' },
        { stageId: 'glider-vowels' },
      ])
    })

    it('generates metadata for a valid stage', async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ stageId: 'runner-cvc' }),
      })
      expect(meta.title).toContain('Chú Thỏ Bật Nhảy Phonics CVC')
      expect(meta.title).toContain('Voice Jump Runner: CVC Words')
    })

    it('generates fallback metadata when stage is not found', async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ stageId: 'non-existent-stage' }),
      })
      expect(meta.title).toContain('Không tìm thấy màn chơi')
    })

    it('renders stage game when stageId is valid', async () => {
      const jsx = await ArcadeStageDetailPage({
        params: Promise.resolve({ stageId: 'runner-cvc' }),
      })
      render(jsx)
      expect(screen.getByText(/Voice Jump Runner: CVC Words/i)).toBeInTheDocument()
      expect(screen.getByText('CAT')).toBeInTheDocument()
    })

    it('triggers notFound() when stageId does not exist', async () => {
      await expect(
        ArcadeStageDetailPage({
          params: Promise.resolve({ stageId: 'invalid-stage-404' }),
        })
      ).rejects.toThrow('NEXT_NOT_FOUND')

      expect(mockNotFound).toHaveBeenCalled()
    })
  })
})
