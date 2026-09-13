// tests/components/arcade/VoiceArcadeGame.test.tsx

import React, { useState, useEffect } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { VoiceArcadeGame } from '@/components/arcade/VoiceArcadeGame'
import { ArcadeGameOverModal } from '@/components/arcade/ArcadeGameOverModal'
import { VoiceArcadeHub } from '@/components/arcade/VoiceArcadeHub'
import { VOICE_ARCADE_STAGES } from '@/data/arcade/voice-stages'
import type { ArcadeGameResult, ArcadeStage } from '@/types/voice-arcade'

// Track speech transcript changes
let mockTranscriptListeners: Array<(val: string) => void> = []

vi.mock('@/hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => {
    const [transcript, setTranscript] = useState('')
    useEffect(() => {
      const listener = (val: string) => setTranscript(val)
      mockTranscriptListeners.push(listener)
      return () => {
        mockTranscriptListeners = mockTranscriptListeners.filter((l) => l !== listener)
      }
    }, [])

    return {
      isListening: true,
      isSupported: true,
      transcript,
      interimTranscript: '',
      error: null,
      startListening: vi.fn(),
      stopListening: vi.fn(),
      resetTranscript: vi.fn(),
    }
  },
}))

vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

const mockPlayChime = vi.fn()
const mockPlayKick = vi.fn()
const mockPlaySnare = vi.fn()
const mockClose = vi.fn().mockResolvedValue(undefined)

vi.mock('@/lib/rhythm-beat-synthesizer', () => ({
  createRhythmSynthesizer: () => ({
    playChime: mockPlayChime,
    playKick: mockPlayKick,
    playSnare: mockPlaySnare,
    playWoodblock: vi.fn(),
    close: mockClose,
  }),
}))

describe('Voice Arcade Components', () => {
  const sampleStage: ArcadeStage = {
    id: 'test-stage',
    titleEn: 'Test Voice Runner',
    titleVi: 'Chạy Thử Nghiệm',
    descriptionVi: 'Stage for testing voice arcade runner',
    gameMode: 'runner',
    difficulty: 'easy',
    badgeIcon: '🏃',
    targetPhonics: 'CVC',
    hurdleSpeed: 1.0,
    timeLimitSeconds: 60,
    words: [
      { id: 'w1', word: 'CAT', icon: '🐱', phonicsSound: '/kæt/', translationVi: 'Con mèo', scoreValue: 100 },
      { id: 'w2', word: 'DOG', icon: '🐶', phonicsSound: '/dɒɡ/', translationVi: 'Con chó', scoreValue: 100 },
    ],
  }

  beforeEach(() => {
    vi.useFakeTimers()
    mockPlayChime.mockClear()
    mockPlayKick.mockClear()
    mockPlaySnare.mockClear()
    mockTranscriptListeners = []
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('VoiceArcadeGame', () => {
    it('renders stage title, first target word and mic controls', () => {
      render(<VoiceArcadeGame stage={sampleStage} />)

      expect(screen.getByText('Test Voice Runner')).toBeInTheDocument()
      expect(screen.getByText(/Chạy Thử Nghiệm/i)).toBeInTheDocument()
      expect(screen.getByText('CAT')).toBeInTheDocument()
      expect(screen.getByText('🐱')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /tắt micro điều khiển/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /phát âm đúng từ/i })).toBeInTheDocument()
    })

    it('handles simulated voice button click and awards score & combo', () => {
      render(<VoiceArcadeGame stage={sampleStage} />)

      const simBtn = screen.getByRole('button', { name: /phát âm đúng từ cat/i })
      act(() => {
        fireEvent.click(simBtn)
      })

      expect(mockPlayChime).toHaveBeenCalled()
      expect(screen.getByText(/SUPER JUMP/i)).toBeInTheDocument()

      // Advance timer for hit reaction delay (1000ms)
      act(() => {
        vi.advanceTimersByTime(1100)
      })

      // Next word DOG should now be displayed
      expect(screen.getByText('DOG')).toBeInTheDocument()
      expect(screen.getByText('🐶')).toBeInTheDocument()
    })

    it('evaluates speech recognition events to trigger leap', () => {
      render(<VoiceArcadeGame stage={sampleStage} />)

      // Simulate recognition event matching "CAT"
      act(() => {
        mockTranscriptListeners.forEach((fn) => fn('The CAT is running'))
      })

      expect(mockPlayChime).toHaveBeenCalled()
      expect(screen.getByText(/SUPER JUMP/i)).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1100)
      })

      expect(screen.getByText('DOG')).toBeInTheDocument()
    })

    it('handles skip button when kid misses or struggles with a word', () => {
      render(<VoiceArcadeGame stage={sampleStage} />)

      const skipBtn = screen.getByRole('button', { name: /bỏ lỡ từ hiện tại/i })
      act(() => {
        fireEvent.click(skipBtn)
      })

      expect(mockPlayKick).toHaveBeenCalled()
      expect(screen.getByText('💨 CỐ LÊN NHÉ!')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1100)
      })

      expect(screen.getByText('DOG')).toBeInTheDocument()
    })

    it('finishes game and renders game over modal when reaching the end', () => {
      const onComplete = vi.fn()
      render(<VoiceArcadeGame stage={sampleStage} onCompleteGame={onComplete} />)

      // Word 1 (CAT)
      const simBtn1 = screen.getByRole('button', { name: /phát âm đúng từ cat/i })
      act(() => {
        fireEvent.click(simBtn1)
      })
      act(() => {
        vi.advanceTimersByTime(1100)
      })

      // Word 2 (DOG)
      const simBtn2 = screen.getByRole('button', { name: /phát âm đúng từ dog/i })
      act(() => {
        fireEvent.click(simBtn2)
      })
      act(() => {
        vi.advanceTimersByTime(1100)
      })

      // Game over modal should appear
      expect(screen.getByRole('dialog', { name: /kết quả trò chơi arcade/i })).toBeInTheDocument()
      expect(screen.getByText(/hoàn thành màn chơi/i)).toBeInTheDocument()
      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('ArcadeGameOverModal', () => {
    const mockResult: ArcadeGameResult = {
      stageId: 'runner-cvc',
      gameMode: 'runner',
      score: 1250,
      accuracyPercent: 95,
      stars: 3,
      wordsHit: 7,
      wordsMissed: 0,
      maxCombo: 7,
      expEarned: 150,
    }

    it('displays game result stats and triggers onReplay callback', () => {
      const onReplay = vi.fn()
      render(
        <ArcadeGameOverModal
          stageTitle="Voice Jump Runner"
          result={mockResult}
          onReplay={onReplay}
        />
      )

      expect(screen.getByText('Voice Jump Runner')).toBeInTheDocument()
      expect(screen.getByText('1250')).toBeInTheDocument()
      expect(screen.getByText('95%')).toBeInTheDocument()
      expect(screen.getByText('7/7')).toBeInTheDocument()
      expect(screen.getByText('+150 XP')).toBeInTheDocument()

      const replayBtn = screen.getByRole('button', { name: /chơi lại/i })
      fireEvent.click(replayBtn)
      expect(onReplay).toHaveBeenCalledTimes(1)
    })
  })

  describe('VoiceArcadeHub', () => {
    it('renders all stages and filters by selected game mode', () => {
      render(<VoiceArcadeHub stages={VOICE_ARCADE_STAGES} />)

      expect(screen.getByText('Khu Trò Chơi Giọng Nói 🎙️')).toBeInTheDocument()
      expect(screen.getByText(/Voice Jump Runner: CVC Words/i)).toBeInTheDocument()
      expect(screen.getByText(/Meteor Blaster: Blends & Digraphs/i)).toBeInTheDocument()
      expect(screen.getByText(/Pitch Rocket Glider: Long Vowels/i)).toBeInTheDocument()

      // Filter by Meteor Blaster
      const meteorFilterBtn = screen.getByRole('button', { name: /bắn thiên thạch/i })
      fireEvent.click(meteorFilterBtn)

      expect(screen.queryByText(/Voice Jump Runner: CVC Words/i)).not.toBeInTheDocument()
      expect(screen.getByText(/Meteor Blaster: Blends & Digraphs/i)).toBeInTheDocument()
      expect(screen.queryByText(/Pitch Rocket Glider: Long Vowels/i)).not.toBeInTheDocument()
    })
  })

  describe('Kid-Friendly Strict Typography Check (>= 16px)', () => {
    it('contains zero elements with text-xs, text-sm, text-[10px], text-[12px], text-[14px]', () => {
      const bannedRegex = /\btext-(xs|sm|\[(?:10|11|12|13|14|15)px\])\b/

      const { container: hubContainer } = render(
        <VoiceArcadeHub stages={VOICE_ARCADE_STAGES} />
      )
      const hubElements = hubContainer.querySelectorAll('*')
      hubElements.forEach((el) => {
        const className =
          typeof el.className === 'string'
            ? el.className
            : (el as HTMLElement).getAttribute('class') || ''
        expect(className).not.toMatch(bannedRegex)
      })

      const { container: gameContainer } = render(
        <VoiceArcadeGame stage={sampleStage} />
      )
      const gameElements = gameContainer.querySelectorAll('*')
      gameElements.forEach((el) => {
        const className =
          typeof el.className === 'string'
            ? el.className
            : (el as HTMLElement).getAttribute('class') || ''
        expect(className).not.toMatch(bannedRegex)
      })
    })
  })
})
