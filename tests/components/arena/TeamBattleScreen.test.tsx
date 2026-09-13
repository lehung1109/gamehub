// tests/components/arena/TeamBattleScreen.test.tsx

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TeamBattleScreen } from '@/components/arena/TeamBattleScreen'
import { TEAM_CONFIGS } from '@/lib/team-battle-engine'
import type { TeamState } from '@/types/team-battle'

const mockTeams: TeamState[] = [
  {
    id: 'dragons',
    config: TEAM_CONFIGS.dragons,
    members: [
      { id: 's1', name: 'Minh Khang', avatar: '🐉', points: 950, streak: 3, isOnline: true },
    ],
    totalScore: 950,
    rank: 1,
    comboMultiplier: 1.15,
  },
  {
    id: 'eagles',
    config: TEAM_CONFIGS.eagles,
    members: [
      { id: 's2', name: 'Hoàng Yến', avatar: '🦅', points: 800, streak: 2, isOnline: true },
    ],
    totalScore: 800,
    rank: 2,
    comboMultiplier: 1.0,
  },
]

describe('TeamBattleScreen Component', () => {
  it('renders team battle screen and satisfies kid-friendly typography', () => {
    const { container } = render(
      <TeamBattleScreen
        pin="889900"
        currentQuestionIndex={0}
        totalQuestions={5}
        teams={mockTeams}
      />
    )

    expect(screen.getByText('889900')).toBeInTheDocument()
    expect(screen.getAllByText('Rồng Lửa').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Đại Bàng Biển').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Minh Khang')).toBeInTheDocument()
    expect(screen.getByText('Hoàng Yến')).toBeInTheDocument()

    // Typography audit
    const html = container.innerHTML
    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
    expect(html).not.toContain('text-[10px]')
    expect(html).not.toContain('text-[12px]')
    expect(html).not.toContain('text-[14px]')
  })

  it('renders combo multiplier badge when active', () => {
    render(
      <TeamBattleScreen
        pin="889900"
        currentQuestionIndex={1}
        totalQuestions={5}
        teams={mockTeams}
      />
    )

    expect(screen.getByText(/combo đội: x1.15 điểm thưởng!/i)).toBeInTheDocument()
  })

  it('invokes onNextQuestion callback when button is clicked', () => {
    const onNext = vi.fn()
    render(
      <TeamBattleScreen
        pin="889900"
        currentQuestionIndex={0}
        totalQuestions={5}
        teams={mockTeams}
        onNextQuestion={onNext}
      />
    )

    const nextBtn = screen.getByRole('button', { name: /chuyển câu tiếp theo/i })
    fireEvent.click(nextBtn)
    expect(onNext).toHaveBeenCalled()
  })
})
