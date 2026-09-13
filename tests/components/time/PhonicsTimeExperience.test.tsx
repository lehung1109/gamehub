// tests/components/time/PhonicsTimeExperience.test.tsx

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PhonicsTimeExperience } from '@/components/time/PhonicsTimeExperience'
import { TimeHeaderBar } from '@/components/time/TimeHeaderBar'
import { ChronoEraSelector } from '@/components/time/ChronoEraSelector'
import { ChronoCapsuleModal } from '@/components/time/ChronoCapsuleModal'
import { TimeMuseumModal } from '@/components/time/TimeMuseumModal'
import { HISTORICAL_RELICS, HISTORICAL_ERAS } from '@/data/time/relics'
import type { TimeProgress } from '@/types/phonics-time'

// Mock speech
const mockSpeak = vi.fn()
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

// Mock sound synthesizer
const mockPlayChime = vi.fn()
const mockPlayKick = vi.fn()
const mockPlayWoodblock = vi.fn()
const mockClose = vi.fn().mockResolvedValue(undefined)
vi.mock('@/lib/rhythm-beat-synthesizer', () => ({
  createRhythmSynthesizer: () => ({
    playChime: mockPlayChime,
    playKick: mockPlayKick,
    playSnare: vi.fn(),
    playWoodblock: mockPlayWoodblock,
    close: mockClose,
  }),
}))

// Mock server action
vi.mock('@/app/actions/phonics-time', () => ({
  saveTimeProgressAction: vi.fn().mockResolvedValue({
    success: true,
    data: { saved: true, totalRelics: 1, travelerRank: 'novice_nomad' },
  }),
}))

describe('Phonics Time Machine UI Components', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockSpeak.mockClear()
    mockPlayChime.mockClear()
    mockPlayKick.mockClear()
    mockPlayWoodblock.mockClear()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('TimeHeaderBar', () => {
    it('renders rank, relic counter, chrono-orbs, and triggers actions', () => {
      const onOpenMuseum = vi.fn()
      const onResetProgress = vi.fn()

      render(
        <TimeHeaderBar
          travelerRank="novice_nomad"
          totalCompleted={2}
          totalAvailable={12}
          chronoOrbs={100}
          onOpenMuseum={onOpenMuseum}
          onResetProgress={onResetProgress}
        />
      )

      expect(screen.getByText('Nhà Du Hành Tập Sự 🧭')).toBeInTheDocument()
      expect(screen.getByText(/Cổ Vật: 2\/12/i)).toBeInTheDocument()
      expect(screen.getByText(/100 Bảo Ngọc ⏳/i)).toBeInTheDocument()

      const museumBtn = screen.getByRole('button', { name: /mở viện bảo tàng không thời gian time museum/i })
      fireEvent.click(museumBtn)
      expect(onOpenMuseum).toHaveBeenCalledTimes(1)

      const resetBtn = screen.getByRole('button', { name: /đặt lại hành trình cỗ máy thời gian/i })
      fireEvent.click(resetBtn)
      expect(onResetProgress).toHaveBeenCalledTimes(1)
    })
  })

  describe('ChronoEraSelector', () => {
    it('renders historical eras and triggers onSelectEra for unlocked era', () => {
      const onSelect = vi.fn()
      render(
        <ChronoEraSelector
          eras={HISTORICAL_ERAS}
          selectedEra="ancient_egypt"
          completedRelicIds={['egypt-sun', 'egypt-cat']}
          onSelectEra={onSelect}
        />
      )

      expect(screen.getByText(/Ancient Egypt/i)).toBeInTheDocument()
      expect(screen.getByText(/Ancient Greece/i)).toBeInTheDocument()

      // Click Egypt tab
      const egyptBtn = screen.getByRole('tab', { name: /ancient egypt/i })
      fireEvent.click(egyptBtn)
      expect(onSelect).toHaveBeenCalledWith('ancient_egypt')

      // Greece requires 3 relics, user has 2 -> locked
      const greeceBtn = screen.getByRole('tab', { name: /ancient greece/i })
      expect(greeceBtn).toBeDisabled()
    })
  })

  describe('ChronoCapsuleModal', () => {
    it('handles rune tile selection, clearing, and completion', () => {
      const onComplete = vi.fn()
      const onClose = vi.fn()
      const relic = HISTORICAL_RELICS[0] // SUN

      render(
        <ChronoCapsuleModal
          relic={relic}
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
          playChimeSound={mockPlayChime}
        />
      )

      expect(screen.getByText(/Giáo Sư Chronos 🕰️ & Mèo Pip 🐱/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Solar Disc of Ra \(SUN\)/i)[0]).toBeInTheDocument()

      // Pronunciation button
      const audioBtn = screen.getByRole('button', { name: /nghe phát âm từ sun/i })
      fireEvent.click(audioBtn)
      expect(mockSpeak).toHaveBeenCalledWith('Sun', 'en-US')

      // Click rune buttons in order: S, U, N
      const sBtn = screen.getByRole('button', { name: /mảnh rune s/i })
      const uBtn = screen.getByRole('button', { name: /mảnh rune u/i })
      const nBtn = screen.getByRole('button', { name: /mảnh rune n/i })

      fireEvent.click(sBtn)
      fireEvent.click(uBtn)
      fireEvent.click(nBtn)

      // Click Complete Restoration button
      const completeBtn = screen.getByRole('button', { name: /khôi phục bảo vật/i })
      fireEvent.click(completeBtn)

      expect(mockPlayChime).toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalledWith('egypt-sun')
    })
  })

  describe('TimeMuseumModal', () => {
    it('displays unlocked and locked historical relics', () => {
      const onClose = vi.fn()
      render(
        <TimeMuseumModal
          isOpen={true}
          onClose={onClose}
          relics={HISTORICAL_RELICS}
          completedRelicIds={['egypt-sun']}
        />
      )

      expect(screen.getByText(/Viện Bảo Tàng Không Thời Gian/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Solar Disc of Ra \(SUN\)/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Sacred Bastet Statue \(CAT\)/i)[0]).toBeInTheDocument()

      const closeBtn = screen.getByRole('button', { name: /đóng viện bảo tàng/i })
      fireEvent.click(closeBtn)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('PhonicsTimeExperience Full Integration', () => {
    it('renders top-level experience, opens modal, and unlocks relics', async () => {
      const initialProgress: TimeProgress = {
        completedRelicIds: [],
        currentEra: 'ancient_egypt',
        chronoOrbs: 0,
        travelerRank: 'novice_nomad',
        lastPlayedAt: '2026-09-13T10:00:00.000Z',
      }

      render(<PhonicsTimeExperience initialProgress={initialProgress} />)

      // Fast forward hydration timeout
      act(() => {
        vi.runAllTimers()
      })

      expect(screen.getByText(/Cỗ Máy Thời Gian & Cuộc Du Hành Lịch Sử/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Kim Tự Tháp Ai Cập Cổ Đại/i)[0]).toBeInTheDocument()

      // Open SUN relic modal
      const sunCard = screen.getByRole('button', { name: /khôi phục cổ vật egypt-sun/i })
      fireEvent.click(sunCard)

      expect(screen.getByText(/Giáo Sư Chronos 🕰️ & Mèo Pip 🐱/i)).toBeInTheDocument()
    })
  })
})
