// tests/components/ocean/PhonicsOceanExperience.test.tsx

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PhonicsOceanExperience } from '@/components/ocean/PhonicsOceanExperience'
import { OceanHeaderBar } from '@/components/ocean/OceanHeaderBar'
import { OceanZoneSelector } from '@/components/ocean/OceanZoneSelector'
import { SubmarineSonarModal } from '@/components/ocean/SubmarineSonarModal'
import { OceanCompendiumModal } from '@/components/ocean/OceanCompendiumModal'
import { OCEAN_MISSIONS, OCEAN_ZONES } from '@/data/ocean/missions'
import type { OceanProgress } from '@/types/phonics-ocean'

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
vi.mock('@/app/actions/phonics-ocean', () => ({
  saveOceanProgressAction: vi.fn().mockResolvedValue({
    success: true,
    data: { saved: true, totalMissions: 1, diverRank: 'snorkel_cadet' },
  }),
}))

describe('Phonics Ocean Explorer UI Components', () => {
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

  describe('OceanHeaderBar', () => {
    it('renders diver rank, mission counter, pearls, and triggers actions', () => {
      const onOpenCompendium = vi.fn()
      const onResetProgress = vi.fn()

      render(
        <OceanHeaderBar
          diverRank="snorkel_cadet"
          totalCompleted={2}
          totalAvailable={12}
          pearls={100}
          onOpenCompendium={onOpenCompendium}
          onResetProgress={onResetProgress}
        />
      )

      expect(screen.getByText('Thợ Lặn Tập Sự 🤿')).toBeInTheDocument()
      expect(screen.getByText(/Nhiệm Vụ: 2\/12/i)).toBeInTheDocument()
      expect(screen.getByText(/100 Ngọc Trai 🦪/i)).toBeInTheDocument()

      const compendiumBtn = screen.getByRole('button', { name: /mở bách khoa sinh vật đại dương/i })
      fireEvent.click(compendiumBtn)
      expect(onOpenCompendium).toHaveBeenCalledTimes(1)

      const resetBtn = screen.getByRole('button', { name: /đặt lại hành trình thám hiểm biển/i })
      fireEvent.click(resetBtn)
      expect(onResetProgress).toHaveBeenCalledTimes(1)
    })
  })

  describe('OceanZoneSelector', () => {
    it('renders depth zones and triggers onSelectZone for unlocked zone', () => {
      const onSelect = vi.fn()
      render(
        <OceanZoneSelector
          zones={OCEAN_ZONES}
          selectedZone="sunlight"
          completedMissionIds={['sunlight-fin', 'sunlight-sun']}
          onSelectZone={onSelect}
        />
      )

      expect(screen.getByText('Tầng Ánh Nắng (0 - 200m)')).toBeInTheDocument()
      expect(screen.getByText('Tầng Hoàng Hôn (200 - 1,000m)')).toBeInTheDocument()

      // Twilight zone requires 2 missions and we have 2, so it is unlocked
      const twilightTab = screen.getByRole('tab', { name: /tầng hoàng hôn/i })
      expect(twilightTab).not.toBeDisabled()
      fireEvent.click(twilightTab)
      expect(onSelect).toHaveBeenCalledWith('twilight')

      // Abyss requires 8 missions so it is locked
      const abyssTab = screen.getByRole('tab', { name: /vực thẳm mariana/i })
      expect(abyssTab).toBeDisabled()
    })
  })

  describe('SubmarineSonarModal', () => {
    const finMission = OCEAN_MISSIONS[0] // FIN -> bubbleScramble: ['N', 'F', 'I']

    it('renders sonar modal, assembles word by tapping bubbles, and completes mission on correct verification', () => {
      const onComplete = vi.fn()
      const onClose = vi.fn()

      render(
        <SubmarineSonarModal
          mission={finMission}
          isAlreadyCompleted={false}
          onMissionComplete={onComplete}
          onClose={onClose}
          playChimeSound={mockPlayChime}
          playKickSound={mockPlayKick}
        />
      )

      expect(screen.getByText(/Vây Cá Hề Nhiệt Đới/i)).toBeInTheDocument()
      expect(screen.getByText(/Short \/ɪ\/ vowel/i)).toBeInTheDocument()

      // Tap bubbles in order to form "FIN": 'F', 'I', 'N'
      const fBubble = screen.getByRole('button', { name: /🫧 F/i })
      const iBubble = screen.getByRole('button', { name: /🫧 I/i })
      const nBubble = screen.getByRole('button', { name: /🫧 N/i })

      fireEvent.click(fBubble)
      fireEvent.click(iBubble)
      fireEvent.click(nBubble)

      expect(screen.getByText('FIN')).toBeInTheDocument()

      // Click verification button
      const verifyBtn = screen.getByRole('button', { name: /phát sóng sonar khóa mục tiêu/i })
      fireEvent.click(verifyBtn)

      expect(mockPlayChime).toHaveBeenCalled()
      expect(screen.getByText(/Tuyệt vời! Bạn đã mở khóa Clownfish/i)).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1700)
      })

      expect(onComplete).toHaveBeenCalled()
    })

    it('handles incorrect word assembly with kick sound and reset', () => {
      const onComplete = vi.fn()
      const onClose = vi.fn()

      render(
        <SubmarineSonarModal
          mission={finMission}
          isAlreadyCompleted={false}
          onMissionComplete={onComplete}
          onClose={onClose}
          playChimeSound={mockPlayChime}
          playKickSound={mockPlayKick}
        />
      )

      // Tap in wrong order: 'N', 'F'
      const nBubble = screen.getByRole('button', { name: /🫧 N/i })
      const fBubble = screen.getByRole('button', { name: /🫧 F/i })

      fireEvent.click(nBubble)
      fireEvent.click(fBubble)

      const verifyBtn = screen.getByRole('button', { name: /phát sóng sonar khóa mục tiêu/i })
      fireEvent.click(verifyBtn)

      expect(mockPlayKick).toHaveBeenCalled()
      expect(screen.getByText(/Sóng âm chưa khớp!/i)).toBeInTheDocument()
    })
  })

  describe('OceanCompendiumModal', () => {
    it('renders all missions and shows unlocked details', () => {
      const onClose = vi.fn()
      render(
        <OceanCompendiumModal
          completedMissionIds={['sunlight-fin']}
          onClose={onClose}
        />
      )

      expect(screen.getByText('Bách Khoa Sinh Vật Đại Dương')).toBeInTheDocument()
      expect(screen.getByText(/1\/12 nhiệm vụ/i)).toBeInTheDocument()
      expect(screen.getByText('Vây Cá Hề Nhiệt Đới')).toBeInTheDocument()

      // Pronunciation trigger
      const pronounceBtn = screen.getByRole('button', { name: /nghe phát âm fin/i })
      fireEvent.click(pronounceBtn)
      expect(mockSpeak).toHaveBeenCalledWith('FIN')
    })
  })

  describe('PhonicsOceanExperience Main Container', () => {
    it('renders zone missions, opens sonar modal, and updates pearls and rank upon mission completion', () => {
      const initialProgress: OceanProgress = {
        completedMissionIds: [],
        currentZone: 'sunlight',
        pearls: 0,
        diverRank: 'snorkel_cadet',
        lastPlayedAt: new Date().toISOString(),
      }

      render(<PhonicsOceanExperience initialProgress={initialProgress} />)

      expect(screen.getByText(/Thám Hiểm Đại Dương & Tàu Ngầm Ngữ Âm 🐬/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Tầng Ánh Nắng \(0 - 200m\)/i).length).toBeGreaterThanOrEqual(1)

      // 3 missions in sunlight zone
      expect(screen.getByTestId('ocean-mission-card-sunlight-fin')).toBeInTheDocument()
      expect(screen.getByTestId('ocean-mission-card-sunlight-sun')).toBeInTheDocument()
      expect(screen.getByTestId('ocean-mission-card-sunlight-wet')).toBeInTheDocument()

      // Start first mission
      const startMissionBtn = screen.getByRole('button', { name: /thực hiện nhiệm vụ vây cá hề nhiệt đới/i })
      fireEvent.click(startMissionBtn)

      // Sonar modal opens
      expect(screen.getByRole('dialog', { name: /trạm sonar tàu ngầm vây cá hề nhiệt đới/i })).toBeInTheDocument()

      // Form "FIN"
      fireEvent.click(screen.getByRole('button', { name: /🫧 F/i }))
      fireEvent.click(screen.getByRole('button', { name: /🫧 I/i }))
      fireEvent.click(screen.getByRole('button', { name: /🫧 N/i }))

      fireEvent.click(screen.getByRole('button', { name: /phát sóng sonar khóa mục tiêu/i }))

      act(() => {
        vi.advanceTimersByTime(1700)
      })

      // Mission completes -> 1/12, 50 pearls
      expect(screen.getByText(/Nhiệm Vụ: 1\/12/i)).toBeInTheDocument()
      expect(screen.getByText(/50 Ngọc Trai 🦪/i)).toBeInTheDocument()
    })
  })
})
