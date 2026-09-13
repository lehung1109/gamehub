// tests/components/spelling-bee/SpellingBeeArena.test.tsx

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SpellingBeeArena } from '@/components/spelling-bee/SpellingBeeArena'
import { SpellingBeeTrophyModal } from '@/components/spelling-bee/SpellingBeeTrophyModal'
import { SpellingBeeHub } from '@/components/spelling-bee/SpellingBeeHub'
import { SPELLING_BEE_DIVISIONS } from '@/data/spelling-bee/tournament-divisions'
import type { SpellingBeeDivision, SpellingBeeResult } from '@/types/spelling-bee'

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

describe('Spelling Bee Components', () => {
  const sampleDivision: SpellingBeeDivision = {
    id: 'test-bee',
    tier: 'bronze',
    titleVi: 'Hạng Thử Nghiệm',
    titleEn: 'Test Bee Championship',
    descriptionVi: 'Phân hạng thi đấu thử nghiệm',
    badgeEmoji: '🐝',
    timeLimitPerWord: 40,
    maxMistakes: 3,
    words: [
      {
        id: 'tw1',
        word: 'CAT',
        phonicsSound: '/kæt/',
        translationVi: 'Con mèo',
        definitionVi: 'Thú nuôi thích bắt chuột',
        exampleSentence: 'The cat sleeps on the mat.',
        points: 100,
      },
      {
        id: 'tw2',
        word: 'SUN',
        phonicsSound: '/sʌn/',
        translationVi: 'Mặt trời',
        definitionVi: 'Ngôi sao rực sáng buổi sớm',
        exampleSentence: 'The sun shines in the morning.',
        points: 100,
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

  describe('SpellingBeeArena', () => {
    it('renders division header, audio prompt buttons and keyboard', () => {
      render(<SpellingBeeArena division={sampleDivision} />)

      expect(screen.getByText('Hạng Thử Nghiệm')).toBeInTheDocument()
      expect(screen.getByText('Test Bee Championship')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /nghe phát âm từ vựng/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /đọc chậm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /câu ví dụ/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /gợi ý/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Chữ cái C$/ })).toBeInTheDocument()
    })

    it('spells word by clicking virtual letters and validates correct answer', () => {
      render(<SpellingBeeArena division={sampleDivision} />)

      // Click C - A - T
      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái C$/ }))
      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái A$/ }))
      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái T$/ }))

      // Verify letters appear in slot board
      expect(screen.getByTestId('spelling-letter-slot-0')).toHaveTextContent('C')
      expect(screen.getByTestId('spelling-letter-slot-1')).toHaveTextContent('A')
      expect(screen.getByTestId('spelling-letter-slot-2')).toHaveTextContent('T')

      // Submit
      const submitBtn = screen.getByRole('button', { name: /xác nhận gửi từ đánh vần/i })
      act(() => {
        fireEvent.click(submitBtn)
      })

      expect(mockPlayChime).toHaveBeenCalled()
      expect(screen.getByText(/CHÍNH XÁC/i)).toBeInTheDocument()

      // Advance timer for next word
      act(() => {
        vi.advanceTimersByTime(1300)
      })

      // Progress should advance to Word 2 (SUN)
      expect(screen.getByText(/Từ số: 2\/2/i)).toBeInTheDocument()
    })

    it('handles delete and clear letters', () => {
      render(<SpellingBeeArena division={sampleDivision} />)

      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái C$/ }))
      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái O$/ }))

      // Delete last letter
      const deleteBtn = screen.getByRole('button', { name: /xóa một chữ cái cuối/i })
      fireEvent.click(deleteBtn)

      expect(screen.getByTestId('spelling-letter-slot-0')).toHaveTextContent('C')
      expect(screen.getByTestId('spelling-letter-slot-1')).toHaveTextContent('')

      // Clear all
      const clearBtn = screen.getByRole('button', { name: /xóa tất cả các chữ cái đã nhập/i })
      fireEvent.click(clearBtn)
      expect(screen.getByTestId('spelling-letter-slot-0')).toHaveTextContent('')
    })

    it('handles wrong spelling attempt, decrements lives and shows wrong feedback', () => {
      render(<SpellingBeeArena division={sampleDivision} />)

      // Enter wrong word
      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái D$/ }))
      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái O$/ }))
      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái G$/ }))

      const submitBtn = screen.getByRole('button', { name: /xác nhận gửi từ đánh vần/i })
      act(() => {
        fireEvent.click(submitBtn)
      })

      expect(mockPlayKick).toHaveBeenCalled()
      expect(screen.getByText(/CHƯA ĐÚNG/i)).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1300)
      })

      // Lives remaining should be 2/3
      expect(screen.getByText(/Mạng: 2\/3/i)).toBeInTheDocument()
    })

    it('finishes tournament and displays trophy modal upon completing all words', () => {
      const onComplete = vi.fn()
      render(<SpellingBeeArena division={sampleDivision} onCompleteTournament={onComplete} />)

      // Word 1 (CAT)
      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái C$/ }))
      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái A$/ }))
      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái T$/ }))
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /xác nhận gửi từ đánh vần/i }))
      })
      act(() => {
        vi.advanceTimersByTime(1300)
      })

      // Word 2 (SUN)
      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái S$/ }))
      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái U$/ }))
      fireEvent.click(screen.getByRole('button', { name: /^Chữ cái N$/ }))
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /xác nhận gửi từ đánh vần/i }))
      })
      act(() => {
        vi.advanceTimersByTime(1300)
      })

      // Trophy modal should be displayed
      expect(
        screen.getByRole('dialog', { name: /chứng nhận kết quả giải đấu spelling bee/i })
      ).toBeInTheDocument()
      expect(screen.getByText(/NHÀ VÔ ĐỊCH SPELLING BEE/i)).toBeInTheDocument()
      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('SpellingBeeTrophyModal', () => {
    const mockResult: SpellingBeeResult = {
      divisionId: 'bronze-bee',
      tier: 'bronze',
      score: 1350,
      wordsCorrect: 6,
      wordsTotal: 6,
      accuracyPercent: 100,
      stars: 3,
      expEarned: 250,
      isChampion: true,
    }

    it('renders result details and invokes onReplay callback', () => {
      const onReplay = vi.fn()
      render(
        <SpellingBeeTrophyModal
          divisionTitle="Bronze Bee Championship"
          result={mockResult}
          onReplay={onReplay}
        />
      )

      expect(screen.getByText('Bronze Bee Championship')).toBeInTheDocument()
      expect(screen.getByText('1350')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
      expect(screen.getByText('6/6')).toBeInTheDocument()
      expect(screen.getByText('+250 XP')).toBeInTheDocument()

      const replayBtn = screen.getByRole('button', { name: /thử lại vòng này/i })
      fireEvent.click(replayBtn)
      expect(onReplay).toHaveBeenCalledTimes(1)
    })
  })

  describe('SpellingBeeHub', () => {
    it('renders all division cards and tips', () => {
      render(<SpellingBeeHub divisions={SPELLING_BEE_DIVISIONS} />)

      expect(screen.getByText('Đấu Trường Đánh Vần 🐝')).toBeInTheDocument()
      expect(screen.getByText('Bronze Bee Championship')).toBeInTheDocument()
      expect(screen.getByText('Silver Bee Championship')).toBeInTheDocument()
      expect(screen.getByText('Golden Bee Championship')).toBeInTheDocument()
    })
  })

  describe('Kid-Friendly Strict Typography Check (>= 16px)', () => {
    it('contains zero elements with text-xs, text-sm, text-[10px], text-[12px], text-[14px]', () => {
      const bannedRegex = /\btext-(xs|sm|\[(?:10|11|12|13|14|15)px\])\b/

      const { container: hubContainer } = render(
        <SpellingBeeHub divisions={SPELLING_BEE_DIVISIONS} />
      )
      hubContainer.querySelectorAll('*').forEach((el) => {
        const className =
          typeof el.className === 'string'
            ? el.className
            : (el as HTMLElement).getAttribute('class') || ''
        expect(className).not.toMatch(bannedRegex)
      })

      const { container: arenaContainer } = render(
        <SpellingBeeArena division={sampleDivision} />
      )
      arenaContainer.querySelectorAll('*').forEach((el) => {
        const className =
          typeof el.className === 'string'
            ? el.className
            : (el as HTMLElement).getAttribute('class') || ''
        expect(className).not.toMatch(bannedRegex)
      })
    })
  })
})
