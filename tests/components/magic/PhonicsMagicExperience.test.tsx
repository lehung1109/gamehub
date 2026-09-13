// tests/components/magic/PhonicsMagicExperience.test.tsx

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PhonicsMagicExperience } from '@/components/magic/PhonicsMagicExperience'
import { MagicHeaderBar } from '@/components/magic/MagicHeaderBar'
import { MagicTowerSelector } from '@/components/magic/MagicTowerSelector'
import { WandIncantationModal } from '@/components/magic/WandIncantationModal'
import { AncientGrimoireModal } from '@/components/magic/AncientGrimoireModal'
import { MAGIC_SPELLS, ELEMENTAL_TOWERS } from '@/data/magic/spells'
import type { MagicProgress } from '@/types/phonics-magic'

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
vi.mock('@/app/actions/phonics-magic', () => ({
  saveMagicProgressAction: vi.fn().mockResolvedValue({
    success: true,
    data: { saved: true, totalSpells: 1, wizardRank: 'apprentice_wizard' },
  }),
}))

describe('Phonics Magic Academy UI Components', () => {
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

  describe('MagicHeaderBar', () => {
    it('renders wizard rank, spell counter, mana crystals, and triggers actions', () => {
      const onOpenGrimoire = vi.fn()
      const onResetProgress = vi.fn()

      render(
        <MagicHeaderBar
          wizardRank="apprentice_wizard"
          totalCompleted={2}
          totalAvailable={12}
          manaCrystals={100}
          onOpenGrimoire={onOpenGrimoire}
          onResetProgress={onResetProgress}
        />
      )

      expect(screen.getByText('Pháp Sư Tập Sự 🪄')).toBeInTheDocument()
      expect(screen.getByText(/Thần Chú: 2\/12/i)).toBeInTheDocument()
      expect(screen.getByText(/100 Pha Lê 🔮/i)).toBeInTheDocument()

      const grimoireBtn = screen.getByRole('button', { name: /mở sách ma thuật cổ grimoire/i })
      fireEvent.click(grimoireBtn)
      expect(onOpenGrimoire).toHaveBeenCalledTimes(1)

      const resetBtn = screen.getByRole('button', { name: /đặt lại hành trình học viện phép thuật/i })
      fireEvent.click(resetBtn)
      expect(onResetProgress).toHaveBeenCalledTimes(1)
    })
  })

  describe('MagicTowerSelector', () => {
    it('renders elemental towers and triggers onSelectTower for unlocked tower', () => {
      const onSelect = vi.fn()
      render(
        <MagicTowerSelector
          towers={ELEMENTAL_TOWERS}
          selectedTower="fire"
          completedSpellIds={['fire-hot', 'fire-red']}
          onSelectTower={onSelect}
        />
      )

      expect(screen.getByText('Tháp Lửa (Hỏa Thuật)')).toBeInTheDocument()
      expect(screen.getByText('Tháp Nước (Thủy Thuật)')).toBeInTheDocument()

      // Water tower requires 2 spells and we have 2, so it is unlocked
      const waterTab = screen.getByRole('tab', { name: /tháp nước/i })
      expect(waterTab).not.toBeDisabled()
      fireEvent.click(waterTab)
      expect(onSelect).toHaveBeenCalledWith('water')

      // Earth tower requires 8 spells so it is locked
      const earthTab = screen.getByRole('tab', { name: /tháp đất/i })
      expect(earthTab).toBeDisabled()
    })
  })

  describe('WandIncantationModal', () => {
    const hotSpell = MAGIC_SPELLS[0] // HOT -> runeScramble: ['T', 'H', 'O']

    it('renders modal, assembles word by tapping runes, and completes spell on correct cast', () => {
      const onComplete = vi.fn()
      const onClose = vi.fn()

      render(
        <WandIncantationModal
          spell={hotSpell}
          isAlreadyCompleted={false}
          onSpellComplete={onComplete}
          onClose={onClose}
          playChimeSound={mockPlayChime}
          playKickSound={mockPlayKick}
        />
      )

      expect(screen.getByText(/Đốm Lửa Nóng Bỏng/i)).toBeInTheDocument()
      expect(screen.getByText(/Short \/ɒ\/ vowel/i)).toBeInTheDocument()

      // Tap runes in order to form "HOT": 'H', 'O', 'T'
      const hRune = screen.getByRole('button', { name: /✨ H/i })
      const oRune = screen.getByRole('button', { name: /✨ O/i })
      const tRune = screen.getByRole('button', { name: /✨ T/i })

      fireEvent.click(hRune)
      fireEvent.click(oRune)
      fireEvent.click(tRune)

      expect(screen.getByText('HOT')).toBeInTheDocument()

      // Click Cast Spell button
      const castBtn = screen.getByRole('button', { name: /vẫy đũa niệm phép thần chú/i })
      fireEvent.click(castBtn)

      expect(mockPlayChime).toHaveBeenCalled()
      expect(screen.getByText(/Thần chú khai mở thành công!/i)).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1700)
      })

      expect(onComplete).toHaveBeenCalled()
    })

    it('handles incorrect rune assembly with kick sound and reset', () => {
      const onComplete = vi.fn()
      const onClose = vi.fn()

      render(
        <WandIncantationModal
          spell={hotSpell}
          isAlreadyCompleted={false}
          onSpellComplete={onComplete}
          onClose={onClose}
          playChimeSound={mockPlayChime}
          playKickSound={mockPlayKick}
        />
      )

      // Tap wrong order: 'T', 'H'
      const tRune = screen.getByRole('button', { name: /✨ T/i })
      const hRune = screen.getByRole('button', { name: /✨ H/i })

      fireEvent.click(tRune)
      fireEvent.click(hRune)

      const castBtn = screen.getByRole('button', { name: /vẫy đũa niệm phép thần chú/i })
      fireEvent.click(castBtn)

      expect(mockPlayKick).toHaveBeenCalled()
      expect(screen.getByText(/Thần chú bị lệch tần số ma thuật!/i)).toBeInTheDocument()
    })
  })

  describe('AncientGrimoireModal', () => {
    it('renders all spells and shows unlocked details', () => {
      const onClose = vi.fn()
      render(
        <AncientGrimoireModal
          completedSpellIds={['fire-hot']}
          onClose={onClose}
        />
      )

      expect(screen.getByText('Sách Ma Thuật Cổ Grimoire')).toBeInTheDocument()
      expect(screen.getByText(/1\/12 thần chú/i)).toBeInTheDocument()
      expect(screen.getByText('Đốm Lửa Nóng Bỏng')).toBeInTheDocument()

      // Pronunciation trigger
      const pronounceBtn = screen.getByRole('button', { name: /nghe phát âm hot/i })
      fireEvent.click(pronounceBtn)
      expect(mockSpeak).toHaveBeenCalledWith('HOT')
    })
  })

  describe('PhonicsMagicExperience Main Container', () => {
    it('renders tower spells, opens incantation modal, and updates mana crystals and rank upon spell completion', () => {
      const initialProgress: MagicProgress = {
        completedSpellIds: [],
        currentTower: 'fire',
        manaCrystals: 0,
        wizardRank: 'apprentice_wizard',
        lastPlayedAt: new Date().toISOString(),
      }

      render(<PhonicsMagicExperience initialProgress={initialProgress} />)

      expect(screen.getByText(/Học Viện Phép Thuật & Thần Chú Ngữ Âm 🧙‍♂️/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Tháp Lửa \(Hỏa Thuật\)/i).length).toBeGreaterThanOrEqual(1)

      // 3 spells in fire tower
      expect(screen.getByTestId('magic-spell-card-fire-hot')).toBeInTheDocument()
      expect(screen.getByTestId('magic-spell-card-fire-red')).toBeInTheDocument()
      expect(screen.getByTestId('magic-spell-card-fire-sun')).toBeInTheDocument()

      // Start first spell
      const startSpellBtn = screen.getByRole('button', { name: /niệm phép thần chú đốm lửa nóng bỏng/i })
      fireEvent.click(startSpellBtn)

      // Wand incantation modal opens
      expect(screen.getByRole('dialog', { name: /điện thờ niệm phép đốm lửa nóng bỏng/i })).toBeInTheDocument()

      // Form "HOT"
      fireEvent.click(screen.getByRole('button', { name: /✨ H/i }))
      fireEvent.click(screen.getByRole('button', { name: /✨ O/i }))
      fireEvent.click(screen.getByRole('button', { name: /✨ T/i }))

      fireEvent.click(screen.getByRole('button', { name: /vẫy đũa niệm phép thần chú/i }))

      act(() => {
        vi.advanceTimersByTime(1700)
      })

      // Spell completes -> 1/12, 50 crystals
      expect(screen.getByText(/Thần Chú: 1\/12/i)).toBeInTheDocument()
      expect(screen.getByText(/50 Pha Lê 🔮/i)).toBeInTheDocument()
    })
  })
})
