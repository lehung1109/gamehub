// tests/components/arena/TeamPodiumModal.test.tsx

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TeamPodiumModal } from '@/components/arena/TeamPodiumModal'
import { TeamPickerModal } from '@/components/arena/TeamPickerModal'
import { TEAM_CONFIGS } from '@/lib/team-battle-engine'
import type { TeamBattleSummary } from '@/types/team-battle'

const mockSummary: TeamBattleSummary = {
  sessionId: 'sess-battle-99',
  winningTeam: {
    id: 'dragons',
    config: TEAM_CONFIGS.dragons,
    members: [
      { id: 's1', name: 'Bé Khang', avatar: '🐉', points: 1500, streak: 5, isOnline: true },
    ],
    totalScore: 3500,
    rank: 1,
    comboMultiplier: 1.3,
  },
  teamRankings: [
    {
      id: 'dragons',
      config: TEAM_CONFIGS.dragons,
      members: [
        { id: 's1', name: 'Bé Khang', avatar: '🐉', points: 1500, streak: 5, isOnline: true },
      ],
      totalScore: 3500,
      rank: 1,
      comboMultiplier: 1.3,
    },
    {
      id: 'eagles',
      config: TEAM_CONFIGS.eagles,
      members: [
        { id: 's2', name: 'Bé Yến', avatar: '🦅', points: 1200, streak: 3, isOnline: true },
      ],
      totalScore: 2800,
      rank: 2,
      comboMultiplier: 1.15,
    },
  ],
  mvps: [
    {
      teamId: 'dragons',
      studentId: 's1',
      studentName: 'Bé Khang',
      avatar: '🐉',
      score: 1500,
    },
    {
      teamId: 'eagles',
      studentId: 's2',
      studentName: 'Bé Yến',
      avatar: '🦅',
      score: 1200,
    },
  ],
}

describe('TeamPodiumModal & TeamPickerModal Components', () => {
  describe('TeamPickerModal', () => {
    it('renders team cards and obeys kid-friendly typography', () => {
      const onSelect = vi.fn()
      const { container } = render(
        <TeamPickerModal
          availableTeamIds={['dragons', 'eagles']}
          teamCounts={{ dragons: 4, eagles: 3 }}
          onSelectTeam={onSelect}
        />
      )

      expect(
        screen.getByRole('heading', { name: /chọn đội trưởng & linh vật của em/i })
      ).toBeVisible()
      expect(screen.getByText('Rồng Lửa')).toBeInTheDocument()
      expect(screen.getByText('Đại Bàng Biển')).toBeInTheDocument()
      expect(screen.getByText('4 thành viên')).toBeInTheDocument()

      const html = container.innerHTML
      expect(html).not.toContain('text-xs')
      expect(html).not.toContain('text-sm')
      expect(html).not.toContain('text-[10px]')
      expect(html).not.toContain('text-[12px]')
      expect(html).not.toContain('text-[14px]')

      const submitBtn = screen.getByRole('button', { name: /vào đội rồng lửa/i })
      fireEvent.click(submitBtn)
      expect(onSelect).toHaveBeenCalledWith('dragons')
    })
  })

  describe('TeamPodiumModal', () => {
    it('renders winner celebration, rankings, MVPs and respects typography', () => {
      const onPlayAgain = vi.fn()
      const { container } = render(
        <TeamPodiumModal summary={mockSummary} onPlayAgain={onPlayAgain} />
      )

      expect(
        screen.getByText(/nhà vô địch đấu trường đồng đội/i)
      ).toBeInTheDocument()
      expect(screen.getAllByText('Rồng Lửa').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/3,500 Điểm/i)).toBeInTheDocument()
      expect(screen.getByText('Bé Khang')).toBeInTheDocument()
      expect(screen.getByText('Bé Yến')).toBeInTheDocument()

      const html = container.innerHTML
      expect(html).not.toContain('text-xs')
      expect(html).not.toContain('text-sm')
      expect(html).not.toContain('text-[10px]')
      expect(html).not.toContain('text-[12px]')
      expect(html).not.toContain('text-[14px]')

      const replayBtn = screen.getByRole('button', { name: /khởi động trận đấu mới/i })
      fireEvent.click(replayBtn)
      expect(onPlayAgain).toHaveBeenCalled()
    })
  })
})
