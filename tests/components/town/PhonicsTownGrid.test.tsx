// tests/components/town/PhonicsTownGrid.test.tsx

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PhonicsTownGrid } from '@/components/town/PhonicsTownGrid'
import { TownHeaderBar } from '@/components/town/TownHeaderBar'
import { TownBuildMenuModal } from '@/components/town/TownBuildMenuModal'
import { TownResidentQuestModal } from '@/components/town/TownResidentQuestModal'
import { TOWN_BUILDINGS } from '@/data/town/buildings'
import type { TownState } from '@/types/phonics-town'

// Mock useSpeech
const mockSpeak = vi.fn()
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

// Mock rhythm synthesizer
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

// Mock server actions
vi.mock('@/app/actions/phonics-town', () => ({
  saveTownStateAction: vi.fn().mockResolvedValue({
    success: true,
    data: { saved: true, prosperityStars: 50, mayorRank: 'novice' },
  }),
}))

describe('Phonics Town UI Components', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockSpeak.mockClear()
    mockPlayChime.mockClear()
    mockPlayKick.mockClear()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('TownHeaderBar', () => {
    it('renders bricks, prosperity stars, and mayor title', () => {
      const onReset = vi.fn()
      render(
        <TownHeaderBar
          bricks={150}
          prosperityStars={45}
          mayorRank="novice"
          onResetTown={onReset}
        />
      )

      expect(screen.getByText('Thị Trưởng Tập Sự 🏅')).toBeInTheDocument()
      expect(screen.getByText(/Gạch Xây Dựng: 150/i)).toBeInTheDocument()
      expect(screen.getByText(/Thịnh Vượng: 45/i)).toBeInTheDocument()

      const resetBtn = screen.getByRole('button', { name: /bắt đầu lại thành phố mới/i })
      fireEvent.click(resetBtn)
      expect(onReset).toHaveBeenCalledTimes(1)
    })
  })

  describe('TownBuildMenuModal', () => {
    it('lists available buildings and triggers onSelectBuilding', () => {
      const onSelect = vi.fn()
      const onClose = vi.fn()
      render(
        <TownBuildMenuModal
          slotIndex={0}
          availableBricks={100}
          alreadyBuiltTypes={new Set(['zoo'])}
          onSelectBuilding={onSelect}
          onClose={onClose}
        />
      )

      expect(screen.getByText('Quy Hoạch Công Trình Mới')).toBeInTheDocument()
      expect(screen.getByText('Tiệm Bánh Nắng Mai')).toBeInTheDocument()
      // Zoo was already built, should not be listed
      expect(screen.queryByText('Vườn Thú Safari')).not.toBeInTheDocument()

      const buildBakeryBtn = screen.getAllByRole('button', { name: /xây dựng ngay/i })[0]
      fireEvent.click(buildBakeryBtn)
      expect(onSelect).toHaveBeenCalledWith('bakery')
    })
  })

  describe('TownResidentQuestModal', () => {
    const bakeryDef = TOWN_BUILDINGS[0] // bakery

    it('renders NPC greeting, options, and handles correct answer', () => {
      const onComplete = vi.fn()
      const onClose = vi.fn()
      render(
        <TownResidentQuestModal
          buildingDef={bakeryDef}
          isCompleted={false}
          onComplete={onComplete}
          onClose={onClose}
        />
      )

      expect(screen.getByText('Baker Bob')).toBeInTheDocument()
      expect(screen.getByText(/Nguyên liệu nào có nguyên âm ngắn \/e\//i)).toBeInTheDocument()

      // Click correct option EGG
      const eggBtn = screen.getByRole('button', { name: /egg/i })
      fireEvent.click(eggBtn)

      expect(mockPlayChime).toHaveBeenCalled()
      expect(screen.getByText(/Tuyệt vời! Cư dân vô cùng cảm ơn Thị trưởng!/i)).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1500)
      })

      expect(onComplete).toHaveBeenCalled()
    })

    it('handles wrong option with kick sound', () => {
      const onComplete = vi.fn()
      const onClose = vi.fn()
      render(
        <TownResidentQuestModal
          buildingDef={bakeryDef}
          isCompleted={false}
          onComplete={onComplete}
          onClose={onClose}
        />
      )

      const wrongBtn = screen.getByRole('button', { name: /apple/i })
      fireEvent.click(wrongBtn)

      expect(mockPlayKick).toHaveBeenCalled()
      expect(screen.getByText(/Chưa đúng rồi/i)).toBeInTheDocument()
    })
  })

  describe('PhonicsTownGrid', () => {
    it('renders empty slots, builds a building, upgrades it, and completes quest', () => {
      const initialState: TownState = {
        buildings: [],
        bricks: 150,
        prosperityStars: 0,
        mayorRank: 'novice',
        totalQuestsCompleted: 0,
      }

      render(<PhonicsTownGrid initialState={initialState} />)

      // Verify empty slot #1
      expect(screen.getByText('Ô Đất Trống #1')).toBeInTheDocument()

      // Click "Xây Công Trình" on Slot 0
      const buildSlot0Btn = screen.getByRole('button', { name: /xây dựng công trình tại ô 1/i })
      fireEvent.click(buildSlot0Btn)

      // Modal opens
      expect(screen.getByRole('dialog', { name: /menu xây dựng công trình mới/i })).toBeInTheDocument()

      // Choose Bakery
      const buildBakeryBtn = screen.getAllByRole('button', { name: /xây dựng ngay/i })[0]
      fireEvent.click(buildBakeryBtn)

      // Bakery should now be placed on slot 0
      expect(screen.getByTestId('town-building-card-bakery')).toBeInTheDocument()
      expect(screen.getByText('Cấp 1: Xe Bánh Mì Dạo')).toBeInTheDocument()
      // Bricks decreased from 150 to 100, stars increased to 20
      expect(screen.getByText(/Gạch Xây Dựng: 100/i)).toBeInTheDocument()
      expect(screen.getByText(/Thịnh Vượng: 20/i)).toBeInTheDocument()

      // Meet resident Baker Bob
      const residentBtn = screen.getByRole('button', { name: /gặp cư dân baker bob/i })
      fireEvent.click(residentBtn)

      expect(screen.getByRole('dialog', { name: /nhiệm vụ cư dân thị trấn/i })).toBeInTheDocument()

      // Answer quest (EGG)
      const eggBtn = screen.getByRole('button', { name: /egg/i })
      fireEvent.click(eggBtn)

      act(() => {
        vi.advanceTimersByTime(1500)
      })

      // Bricks +30 (130), stars +15 (35)
      expect(screen.getByText(/Gạch Xây Dựng: 130/i)).toBeInTheDocument()
      expect(screen.getByText(/Thịnh Vượng: 35/i)).toBeInTheDocument()

      // Now upgrade to Level 2 (costs 100 bricks)
      const upgradeBtn = screen.getByRole('button', { name: /nâng cấp lên cấp 2/i })
      fireEvent.click(upgradeBtn)

      expect(screen.getByText('Cấp 2: Tiệm Bánh Nóng Hổi')).toBeInTheDocument()
      // Bricks: 130 - 100 = 30 bricks
      expect(screen.getByText(/Gạch Xây Dựng: 30/i)).toBeInTheDocument()
    })
  })
})
