// tests/components/safari/PhonicsSafariExperience.test.tsx

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PhonicsSafariExperience } from '@/components/safari/PhonicsSafariExperience'
import { SafariHeaderBar } from '@/components/safari/SafariHeaderBar'
import { SafariBiomeSelector } from '@/components/safari/SafariBiomeSelector'
import { SafariCameraModal } from '@/components/safari/SafariCameraModal'
import { SafariFieldGuideModal } from '@/components/safari/SafariFieldGuideModal'
import { SAFARI_ANIMALS, SAFARI_BIOMES } from '@/data/safari/animals'
import type { SafariProgress } from '@/types/phonics-safari'

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
vi.mock('@/app/actions/phonics-safari', () => ({
  saveSafariProgressAction: vi.fn().mockResolvedValue({
    success: true,
    data: { saved: true, totalPhotos: 1, explorerRank: 'junior-scout' },
  }),
}))

describe('Phonics Safari UI Components', () => {
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

  describe('SafariHeaderBar', () => {
    it('renders explorer rank, photo count, and triggers actions', () => {
      const onOpenFieldGuide = vi.fn()
      const onResetProgress = vi.fn()

      render(
        <SafariHeaderBar
          explorerRank="junior-scout"
          totalPhotos={3}
          totalAvailable={16}
          onOpenFieldGuide={onOpenFieldGuide}
          onResetProgress={onResetProgress}
        />
      )

      expect(screen.getByText('Thám Tử Nhí 🧭')).toBeInTheDocument()
      expect(screen.getByText(/Ảnh Đã Chụp: 3\/16/i)).toBeInTheDocument()

      const fieldGuideBtn = screen.getByRole('button', { name: /mở sổ tay bách khoa động vật/i })
      fireEvent.click(fieldGuideBtn)
      expect(onOpenFieldGuide).toHaveBeenCalledTimes(1)

      const resetBtn = screen.getByRole('button', { name: /đặt lại hành trình thám hiểm/i })
      fireEvent.click(resetBtn)
      expect(onResetProgress).toHaveBeenCalledTimes(1)
    })
  })

  describe('SafariBiomeSelector', () => {
    it('renders all biomes and triggers onSelectBiome', () => {
      const onSelect = vi.fn()
      render(
        <SafariBiomeSelector
          biomes={SAFARI_BIOMES}
          selectedBiome="savanna"
          completedBiomes={['savanna']}
          onSelectBiome={onSelect}
        />
      )

      expect(screen.getByText('Thảo Nguyên Savanna')).toBeInTheDocument()
      expect(screen.getByText('Rừng Nhiệt Đới Amazon')).toBeInTheDocument()

      const rainforestTab = screen.getByRole('tab', { name: /rừng nhiệt đới amazon/i })
      fireEvent.click(rainforestTab)
      expect(onSelect).toHaveBeenCalledWith('rainforest')
    })
  })

  describe('SafariCameraModal', () => {
    const lion = SAFARI_ANIMALS[0]

    it('renders viewfinder, plays sound on correct answer, and calls onCapture', () => {
      const onCapture = vi.fn()
      const onClose = vi.fn()

      render(
        <SafariCameraModal
          animal={lion}
          isAlreadyCaptured={false}
          onCapture={onCapture}
          onClose={onClose}
          playChimeSound={mockPlayChime}
          playKickSound={mockPlayKick}
        />
      )

      expect(screen.getByText(/Kính Ngắm Safari: Sư Tử/i)).toBeInTheDocument()
      expect(screen.getByText(lion.challenge.question)).toBeInTheDocument()

      // Click correct option "Lion"
      const correctBtn = screen.getByRole('button', { name: 'Lion' })
      fireEvent.click(correctBtn)

      expect(mockPlayChime).toHaveBeenCalled()
      expect(screen.getByText(/Tách! Bức ảnh tuyệt đẹp!/i)).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      expect(onCapture).toHaveBeenCalledWith(0)
    })

    it('handles incorrect answer with kick sound and feedback', () => {
      const onCapture = vi.fn()
      const onClose = vi.fn()

      render(
        <SafariCameraModal
          animal={lion}
          isAlreadyCaptured={false}
          onCapture={onCapture}
          onClose={onClose}
          playChimeSound={mockPlayChime}
          playKickSound={mockPlayKick}
        />
      )

      // Click wrong option "Tiger"
      const wrongBtn = screen.getByRole('button', { name: 'Tiger' })
      fireEvent.click(wrongBtn)

      expect(mockPlayKick).toHaveBeenCalled()
      expect(screen.getByText(/Chưa đúng rồi!/i)).toBeInTheDocument()
    })
  })

  describe('SafariFieldGuideModal', () => {
    it('renders all 16 animals and shows details for captured ones', () => {
      const onClose = vi.fn()
      render(
        <SafariFieldGuideModal
          photographedAnimalIds={['lion']}
          onClose={onClose}
        />
      )

      expect(screen.getByText('Sổ Tay Bách Khoa Động Vật Safari')).toBeInTheDocument()
      expect(screen.getByText(/1\/16 loài/i)).toBeInTheDocument()
      expect(screen.getByText('Sư Tử')).toBeInTheDocument()
      expect(screen.getByText(/Tiếng gầm của sư tử đực/i)).toBeInTheDocument()

      // Pronounce button
      const pronounceBtn = screen.getByRole('button', { name: /nghe phát âm lion/i })
      fireEvent.click(pronounceBtn)
      expect(mockSpeak).toHaveBeenCalled()
    })
  })

  describe('PhonicsSafariExperience Main Container', () => {
    it('renders habitat animals, opens camera modal, and captures photo', () => {
      const initialProgress: SafariProgress = {
        photographedAnimalIds: [],
        completedBiomes: [],
        explorerRank: 'junior-scout',
        totalPhotosCaptured: 0,
      }

      render(<PhonicsSafariExperience initialProgress={initialProgress} />)

      expect(screen.getByText('Thám Hiểm Safari Ngữ Âm 🦁')).toBeInTheDocument()
      expect(screen.getByText('Thảo Nguyên Savanna (African Savanna)')).toBeInTheDocument()

      // 4 savanna animals displayed
      expect(screen.getByTestId('safari-animal-card-lion')).toBeInTheDocument()
      expect(screen.getByTestId('safari-animal-card-elephant')).toBeInTheDocument()
      expect(screen.getByTestId('safari-animal-card-giraffe')).toBeInTheDocument()
      expect(screen.getByTestId('safari-animal-card-zebra')).toBeInTheDocument()

      // Click "Chụp ảnh ngay" for Lion
      const captureLionBtn = screen.getByRole('button', { name: /chụp ảnh sư tử/i })
      fireEvent.click(captureLionBtn)

      // Viewfinder modal appears
      expect(screen.getByRole('dialog', { name: /kính ngắm máy ảnh chụp sư tử/i })).toBeInTheDocument()

      // Select correct answer "Lion"
      const correctOption = screen.getByRole('button', { name: 'Lion' })
      fireEvent.click(correctOption)

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      // Lion is now captured!
      expect(screen.getByText(/Ảnh Đã Chụp: 1\/16/i)).toBeInTheDocument()
    })
  })
})
