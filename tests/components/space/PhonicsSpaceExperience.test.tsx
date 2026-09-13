// tests/components/space/PhonicsSpaceExperience.test.tsx

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PhonicsSpaceExperience } from '@/components/space/PhonicsSpaceExperience'
import { SpaceHeaderBar } from '@/components/space/SpaceHeaderBar'
import { SpaceSectorSelector } from '@/components/space/SpaceSectorSelector'
import { CosmicRoverModal } from '@/components/space/CosmicRoverModal'
import { SpaceCompendiumModal } from '@/components/space/SpaceCompendiumModal'
import { SPACE_MISSIONS, SPACE_SECTORS } from '@/data/space/missions'
import type { SpaceProgress } from '@/types/phonics-space'

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
vi.mock('@/app/actions/phonics-space', () => ({
  saveSpaceProgressAction: vi.fn().mockResolvedValue({
    success: true,
    data: { saved: true, totalMissions: 1, astronautRank: 'cadet-explorer' },
  }),
}))

describe('Phonics Space Odyssey UI Components', () => {
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

  describe('SpaceHeaderBar', () => {
    it('renders astronaut rank, mission counter, crystals, and triggers actions', () => {
      const onOpenCompendium = vi.fn()
      const onResetProgress = vi.fn()

      render(
        <SpaceHeaderBar
          astronautRank="cadet-explorer"
          totalCompleted={2}
          totalAvailable={12}
          cosmicCrystals={6}
          onOpenCompendium={onOpenCompendium}
          onResetProgress={onResetProgress}
        />
      )

      expect(screen.getByText('Thiếu Sinh Quân Vũ Trụ 🚀')).toBeInTheDocument()
      expect(screen.getByText(/Nhiệm Vụ: 2\/12/i)).toBeInTheDocument()
      expect(screen.getByText(/6 Tinh Thể 💎/i)).toBeInTheDocument()

      const compendiumBtn = screen.getByRole('button', { name: /mở bách khoa thiên văn vũ trụ/i })
      fireEvent.click(compendiumBtn)
      expect(onOpenCompendium).toHaveBeenCalledTimes(1)

      const resetBtn = screen.getByRole('button', { name: /đặt lại hành trình vũ trụ/i })
      fireEvent.click(resetBtn)
      expect(onResetProgress).toHaveBeenCalledTimes(1)
    })
  })

  describe('SpaceSectorSelector', () => {
    it('renders all sectors and triggers onSelectSector', () => {
      const onSelect = vi.fn()
      render(
        <SpaceSectorSelector
          sectors={SPACE_SECTORS}
          selectedSector="mars"
          completedSectors={['mars']}
          onSelectSector={onSelect}
        />
      )

      expect(screen.getByText('Hành Tinh Sao Hỏa Đỏ')).toBeInTheDocument()
      expect(screen.getByText('Hành Tinh Vành Đai Sao Thổ')).toBeInTheDocument()

      const saturnTab = screen.getByRole('tab', { name: /hành tinh vành đai sao thổ/i })
      fireEvent.click(saturnTab)
      expect(onSelect).toHaveBeenCalledWith('saturn')
    })
  })

  describe('CosmicRoverModal', () => {
    const roverMission = SPACE_MISSIONS[0]

    it('renders rover modal, plays sound on correct answer, and calls onMissionComplete', () => {
      const onComplete = vi.fn()
      const onClose = vi.fn()

      render(
        <CosmicRoverModal
          mission={roverMission}
          isAlreadyCompleted={false}
          onMissionComplete={onComplete}
          onClose={onClose}
          playChimeSound={mockPlayChime}
          playKickSound={mockPlayKick}
        />
      )

      expect(screen.getByText(/Nhiệm Vụ: Hạ Cánh Robot Sao Hỏa/i)).toBeInTheDocument()
      expect(screen.getByText(roverMission.challenge.promptVi)).toBeInTheDocument()

      // Click correct option "ROCK"
      const correctBtn = screen.getByRole('button', { name: 'ROCK' })
      fireEvent.click(correctBtn)

      expect(mockPlayChime).toHaveBeenCalled()
      expect(screen.getByText(/Bíp bíp! Tín hiệu vũ trụ đã được giải mã!/i)).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      expect(onComplete).toHaveBeenCalledWith(0)
    })

    it('handles wrong option selection with kick sound', () => {
      const onComplete = vi.fn()
      const onClose = vi.fn()

      render(
        <CosmicRoverModal
          mission={roverMission}
          isAlreadyCompleted={false}
          onMissionComplete={onComplete}
          onClose={onClose}
          playChimeSound={mockPlayChime}
          playKickSound={mockPlayKick}
        />
      )

      // Click wrong option "RACK"
      const wrongBtn = screen.getByRole('button', { name: 'RACK' })
      fireEvent.click(wrongBtn)

      expect(mockPlayKick).toHaveBeenCalled()
      expect(screen.getByText(/Tần số chưa khớp rồi!/i)).toBeInTheDocument()
    })
  })

  describe('SpaceCompendiumModal', () => {
    it('renders all missions and shows details for completed ones', () => {
      const onClose = vi.fn()
      render(
        <SpaceCompendiumModal
          completedMissionIds={['mars-rover']}
          onClose={onClose}
        />
      )

      expect(screen.getByText('Bách Khoa Thiên Văn Vũ Trụ')).toBeInTheDocument()
      expect(screen.getByText(/1\/12 nhiệm vụ/i)).toBeInTheDocument()
      expect(screen.getByText('Hạ Cánh Robot Sao Hỏa')).toBeInTheDocument()

      // Pronunciation trigger
      const pronounceBtn = screen.getByRole('button', { name: /nghe phát âm.*mars/i })
      fireEvent.click(pronounceBtn)
      expect(mockSpeak).toHaveBeenCalled()
    })
  })

  describe('PhonicsSpaceExperience Main Container', () => {
    it('renders sector missions, opens rover modal, and completes mission', () => {
      const initialProgress: SpaceProgress = {
        completedMissionIds: [],
        cosmicCrystals: 0,
        astronautRank: 'cadet-explorer',
        completedSectors: [],
      }

      render(<PhonicsSpaceExperience initialProgress={initialProgress} />)

      expect(screen.getByText('Thám Hiểm Vũ Trụ Phonics 🚀')).toBeInTheDocument()
      expect(screen.getByText(/Hành Tinh Sao Hỏa Đỏ \(Red Desert Mars\)/i)).toBeInTheDocument()

      // 3 missions in mars
      expect(screen.getByTestId('space-mission-card-mars-rover')).toBeInTheDocument()
      expect(screen.getByTestId('space-mission-card-mars-crater')).toBeInTheDocument()
      expect(screen.getByTestId('space-mission-card-mars-fuel')).toBeInTheDocument()

      // Click "Bắt Đầu Nhiệm Vụ" for Mars Rover
      const startMissionBtn = screen.getByRole('button', { name: /thực hiện nhiệm vụ hạ cánh robot sao hỏa/i })
      fireEvent.click(startMissionBtn)

      // Rover modal appears
      expect(screen.getByRole('dialog', { name: /trạm điều khiển nhiệm vụ hạ cánh robot sao hỏa/i })).toBeInTheDocument()

      // Click correct option "ROCK"
      const correctOption = screen.getByRole('button', { name: 'ROCK' })
      fireEvent.click(correctOption)

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      // Progress updated: 1/12 missions, 3 crystals
      expect(screen.getByText(/Nhiệm Vụ: 1\/12/i)).toBeInTheDocument()
      expect(screen.getByText(/3 Tinh Thể 💎/i)).toBeInTheDocument()
    })
  })
})
