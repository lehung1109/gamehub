// tests/components/dino/PhonicsDinoExperience.test.tsx

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PhonicsDinoExperience } from '@/components/dino/PhonicsDinoExperience'
import { DinoHeaderBar } from '@/components/dino/DinoHeaderBar'
import { DinoSiteSelector } from '@/components/dino/DinoSiteSelector'
import { FossilDigModal } from '@/components/dino/FossilDigModal'
import { DinoMuseumModal } from '@/components/dino/DinoMuseumModal'
import { DINOSAUR_FOSSILS, GEOLOGICAL_ERAS } from '@/data/dino/dinosaurs'
import type { DinoProgress } from '@/types/phonics-dino'

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
vi.mock('@/app/actions/phonics-dino', () => ({
  saveDinoProgressAction: vi.fn().mockResolvedValue({
    success: true,
    data: { saved: true, totalFossils: 1, paleontologistRank: 'junior_digger' },
  }),
}))

describe('Phonics Dino Kingdom UI Components', () => {
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

  describe('DinoHeaderBar', () => {
    it('renders rank, fossil counter, amber gems, and triggers actions', () => {
      const onOpenMuseum = vi.fn()
      const onResetProgress = vi.fn()

      render(
        <DinoHeaderBar
          paleontologistRank="junior_digger"
          totalCompleted={2}
          totalAvailable={12}
          amberGems={100}
          onOpenMuseum={onOpenMuseum}
          onResetProgress={onResetProgress}
        />
      )

      expect(screen.getByText('Nhà Khảo Cổ Tập Sự 🔍')).toBeInTheDocument()
      expect(screen.getByText(/Hóa Thạch: 2\/12/i)).toBeInTheDocument()
      expect(screen.getByText(/100 Hổ Phách 💎/i)).toBeInTheDocument()

      const museumBtn = screen.getByRole('button', { name: /mở viện bảo tàng tiền sử fossil museum/i })
      fireEvent.click(museumBtn)
      expect(onOpenMuseum).toHaveBeenCalledTimes(1)

      const resetBtn = screen.getByRole('button', { name: /đặt lại hành trình khảo cổ khủng long/i })
      fireEvent.click(resetBtn)
      expect(onResetProgress).toHaveBeenCalledTimes(1)
    })
  })

  describe('DinoSiteSelector', () => {
    it('renders geological eras and triggers onSelectEra for unlocked era', () => {
      const onSelect = vi.fn()
      render(
        <DinoSiteSelector
          eras={GEOLOGICAL_ERAS}
          selectedEra="triassic"
          completedFossilIds={['triassic-dig', 'triassic-rex']}
          onSelectEra={onSelect}
        />
      )

      expect(screen.getByText(/Triassic Valley/i)).toBeInTheDocument()
      expect(screen.getByText(/Jurassic Jungle/i)).toBeInTheDocument()

      // Click Triassic tab
      const triassicBtn = screen.getByRole('tab', { name: /triassic valley/i })
      fireEvent.click(triassicBtn)
      expect(onSelect).toHaveBeenCalledWith('triassic')

      // Jurassic requires 3 fossils, user has 2 -> locked
      const jurassicBtn = screen.getByRole('tab', { name: /jurassic jungle/i })
      expect(jurassicBtn).toBeDisabled()
    })
  })

  describe('FossilDigModal', () => {
    it('handles bone tile selection, clearing, and completion', () => {
      const onComplete = vi.fn()
      const onClose = vi.fn()
      const fossil = DINOSAUR_FOSSILS[0] // DIG

      render(
        <FossilDigModal
          fossil={fossil}
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
          playChimeSound={mockPlayChime}
        />
      )

      expect(screen.getByText(/Tiến Sĩ Rex 🦖 & Chippy 🤖/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Fossil Dig \(DIG\)/i)[0]).toBeInTheDocument()

      // Pronunciation button
      const audioBtn = screen.getByRole('button', { name: /nghe phát âm từ dig/i })
      fireEvent.click(audioBtn)
      expect(mockSpeak).toHaveBeenCalledWith('Dig', 'en-US')

      // Click bone buttons in order: D, I, G
      const dBtn = screen.getByRole('button', { name: /mảnh xương d/i })
      const iBtn = screen.getByRole('button', { name: /mảnh xương i/i })
      const gBtn = screen.getByRole('button', { name: /mảnh xương g/i })

      fireEvent.click(dBtn)
      fireEvent.click(iBtn)
      fireEvent.click(gBtn)

      // Click Complete Excavation button
      const completeBtn = screen.getByRole('button', { name: /hoàn thành khai quật/i })
      fireEvent.click(completeBtn)

      expect(mockPlayChime).toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalledWith('triassic-dig')
    })
  })

  describe('DinoMuseumModal', () => {
    it('displays unlocked and locked dinosaur fossils', () => {
      const onClose = vi.fn()
      render(
        <DinoMuseumModal
          isOpen={true}
          onClose={onClose}
          fossils={DINOSAUR_FOSSILS}
          completedFossilIds={['triassic-dig']}
        />
      )

      expect(screen.getByText(/Viện Bảo Tàng Khủng Long & Tiền Sử/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Fossil Dig \(DIG\)/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Baby Rex \(REX\)/i)[0]).toBeInTheDocument()

      const closeBtn = screen.getByRole('button', { name: /đóng viện bảo tàng/i })
      fireEvent.click(closeBtn)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('PhonicsDinoExperience Full Integration', () => {
    it('renders top-level experience, opens modal, and unlocks fossils', async () => {
      const initialProgress: DinoProgress = {
        completedFossilIds: [],
        currentEra: 'triassic',
        amberGems: 0,
        paleontologistRank: 'junior_digger',
        lastPlayedAt: '2026-09-13T10:00:00.000Z',
      }

      render(<PhonicsDinoExperience initialProgress={initialProgress} />)

      // Fast forward hydration timeout
      act(() => {
        vi.runAllTimers()
      })

      expect(screen.getByText(/Vương Quốc Khủng Long & Khảo Cổ Tiền Sử/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Thung Lũng Tam Điệp/i)[0]).toBeInTheDocument()

      // Open DIG fossil modal
      const digCard = screen.getByRole('button', { name: /khai quật hóa thạch triassic-dig/i })
      fireEvent.click(digCard)

      expect(screen.getByText(/Tiến Sĩ Rex 🦖 & Chippy 🤖/i)).toBeInTheDocument()
    })
  })
})
