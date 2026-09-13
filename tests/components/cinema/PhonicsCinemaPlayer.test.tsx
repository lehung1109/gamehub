// tests/components/cinema/PhonicsCinemaPlayer.test.tsx

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PhonicsCinemaPlayer } from '@/components/cinema/PhonicsCinemaPlayer'
import { CinemaPopcornModal } from '@/components/cinema/CinemaPopcornModal'
import { PhonicsCinemaHub } from '@/components/cinema/PhonicsCinemaHub'
import { CINEMA_EPISODES } from '@/data/cinema/episodes'
import type { CinemaEpisode, CinemaResult } from '@/types/phonics-cinema'

const mockSpeak = vi.fn()
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

const mockPlayChime = vi.fn()
const mockPlayKick = vi.fn()
const mockClose = vi.fn().mockResolvedValue(undefined)

vi.mock('@/lib/rhythm-beat-synthesizer', () => ({
  createRhythmSynthesizer: () => ({
    playChime: mockPlayChime,
    playKick: mockPlayKick,
    playSnare: vi.fn(),
    playWoodblock: vi.fn(),
    close: mockClose,
  }),
}))

describe('Interactive Phonics Cinema Components', () => {
  const sampleEpisode: CinemaEpisode = {
    id: 'test-dino',
    titleVi: 'Khủng Long Thử Nghiệm',
    titleEn: 'Test Dino Adventure',
    synopsisVi: 'Tập phim thử nghiệm hoạt hình',
    category: 'cvc',
    durationEstimate: '1 phút',
    badgeIcon: '🦖',
    targetPhonics: 'Nguyên âm ngắn /æ/',
    scenes: [
      {
        id: 'sc1',
        sceneNumber: 1,
        titleVi: 'Cảnh 1: Khởi hành',
        narrationEn: 'Rex is hungry and looks for food.',
        narrationVi: 'Rex đang đói và đi tìm thức ăn.',
        backgroundTheme: 'jungle',
        characterEmoji: '🦖',
        characterAnimation: 'bounce',
        interactivePrompt: {
          id: 'p1',
          questionVi: 'Chọn thức ăn có âm /æ/ cho Rex!',
          questionEn: 'Pick food with /æ/ sound!',
          options: [
            { id: 'opt1', text: 'APPLE', icon: '🍎', isCorrect: true, phonicsHint: 'Short A' },
            { id: 'opt2', text: 'DOG', icon: '🐶', isCorrect: false, phonicsHint: 'Short O' },
          ],
          explanationVi: 'Quả táo rất ngon!',
          popcornReward: 50,
        },
      },
      {
        id: 'sc2',
        sceneNumber: 2,
        titleVi: 'Cảnh 2: Kết thúc vui vẻ',
        narrationEn: 'Rex is full and smiles happily.',
        narrationVi: 'Rex no nê và mỉm cười hạnh phúc.',
        backgroundTheme: 'jungle',
        characterEmoji: '🦖',
        characterAnimation: 'bounce',
      },
    ],
  }

  beforeEach(() => {
    vi.useFakeTimers()
    mockSpeak.mockClear()
    mockPlayChime.mockClear()
    mockPlayKick.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('PhonicsCinemaPlayer', () => {
    it('renders episode screen, subtitle narration and character', () => {
      render(<PhonicsCinemaPlayer episode={sampleEpisode} />)

      expect(screen.getByText('Cảnh 1: Khởi hành')).toBeInTheDocument()
      expect(screen.getByText('"Rex is hungry and looks for food."')).toBeInTheDocument()
      expect(screen.getByText('Rex đang đói và đi tìm thức ăn.')).toBeInTheDocument()
      expect(screen.getByText('🦖')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /nghe lại lời kể/i })).toBeInTheDocument()
    })

    it('pauses for interactive prompt and awards popcorn on correct choice', () => {
      render(<PhonicsCinemaPlayer episode={sampleEpisode} />)

      // Advance timer for prompt appearance (1500ms)
      act(() => {
        vi.advanceTimersByTime(1600)
      })

      // Dialog prompt should appear
      expect(
        screen.getByRole('dialog', { name: /thử thách tương tác rạp chiếu phim/i })
      ).toBeInTheDocument()
      expect(screen.getByText('Chọn thức ăn có âm /æ/ cho Rex!')).toBeInTheDocument()

      // Click correct option APPLE
      const appleBtn = screen.getByRole('button', { name: /apple/i })
      act(() => {
        fireEvent.click(appleBtn)
      })

      expect(mockPlayChime).toHaveBeenCalled()
      expect(screen.getByText(/Quả táo rất ngon!/i)).toBeInTheDocument()

      // Advance timer to transition to Scene 2
      act(() => {
        vi.advanceTimersByTime(1600)
      })

      // Popcorn counter should be 50
      expect(screen.getByText(/Bắp Rang: 50/i)).toBeInTheDocument()
      // Now in Scene 2
      expect(screen.getByText('Cảnh 2: Kết thúc vui vẻ')).toBeInTheDocument()
    })

    it('finishes movie when reaching final scene and renders popcorn modal', () => {
      const onComplete = vi.fn()
      render(<PhonicsCinemaPlayer episode={sampleEpisode} onCompleteMovie={onComplete} />)

      // Answer prompt in Scene 1
      act(() => {
        vi.advanceTimersByTime(1600)
      })
      const appleBtn = screen.getByRole('button', { name: /apple/i })
      act(() => {
        fireEvent.click(appleBtn)
      })
      act(() => {
        vi.advanceTimersByTime(1600)
      })

      // In Scene 2, click "Xem Kết Quả" button
      const nextBtn = screen.getByRole('button', { name: /chuyển sang cảnh tiếp theo/i })
      act(() => {
        fireEvent.click(nextBtn)
      })

      // Popcorn modal should be visible
      expect(
        screen.getByRole('dialog', { name: /vé xem phim và kết quả rạp chiếu phonics/i })
      ).toBeInTheDocument()
      expect(screen.getByText(/BUỔI CHIẾU PHIM HOÀN TẤT/i)).toBeInTheDocument()
      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('CinemaPopcornModal', () => {
    const mockResult: CinemaResult = {
      episodeId: 'the-hungry-dino',
      popcornEarned: 100,
      maxPopcorn: 100,
      correctPrompts: 2,
      totalPrompts: 2,
      stars: 3,
      expEarned: 120,
      completedAt: new Date().toISOString(),
    }

    it('renders result details and triggers replay callback', () => {
      const onReplay = vi.fn()
      render(
        <CinemaPopcornModal
          episodeTitle="The Hungry Dino"
          result={mockResult}
          onReplay={onReplay}
        />
      )

      expect(screen.getByText('The Hungry Dino')).toBeInTheDocument()
      expect(screen.getByText('🍿 100')).toBeInTheDocument()
      expect(screen.getByText('2/2')).toBeInTheDocument()
      expect(screen.getByText('+120 XP')).toBeInTheDocument()

      const replayBtn = screen.getByRole('button', { name: /xem lại phim/i })
      fireEvent.click(replayBtn)
      expect(onReplay).toHaveBeenCalledTimes(1)
    })
  })

  describe('PhonicsCinemaHub', () => {
    it('renders all 3 episodes and filters by category', () => {
      render(<PhonicsCinemaHub episodes={CINEMA_EPISODES} />)

      expect(screen.getByText('Rạp Chiếu Phim Phonics 🍿')).toBeInTheDocument()
      expect(screen.getByText('The Hungry Dino')).toBeInTheDocument()
      expect(screen.getByText('The Magic Potion')).toBeInTheDocument()
      expect(screen.getByText('The Flying Carpet')).toBeInTheDocument()

      // Filter by Digraphs
      const digraphBtn = screen.getByRole('button', { name: /phụ âm kép/i })
      fireEvent.click(digraphBtn)

      expect(screen.queryByText('The Hungry Dino')).not.toBeInTheDocument()
      expect(screen.getByText('The Magic Potion')).toBeInTheDocument()
      expect(screen.queryByText('The Flying Carpet')).not.toBeInTheDocument()
    })
  })

  describe('Kid-Friendly Strict Typography Check (>= 16px)', () => {
    it('contains zero elements with text-xs, text-sm, text-[10px], text-[12px], text-[14px]', () => {
      const bannedRegex = /\btext-(xs|sm|\[(?:10|11|12|13|14|15)px\])\b/

      const { container: hubContainer } = render(
        <PhonicsCinemaHub episodes={CINEMA_EPISODES} />
      )
      hubContainer.querySelectorAll('*').forEach((el) => {
        const className =
          typeof el.className === 'string'
            ? el.className
            : (el as HTMLElement).getAttribute('class') || ''
        expect(className).not.toMatch(bannedRegex)
      })

      const { container: playerContainer } = render(
        <PhonicsCinemaPlayer episode={sampleEpisode} />
      )
      playerContainer.querySelectorAll('*').forEach((el) => {
        const className =
          typeof el.className === 'string'
            ? el.className
            : (el as HTMLElement).getAttribute('class') || ''
        expect(className).not.toMatch(bannedRegex)
      })
    })
  })
})
