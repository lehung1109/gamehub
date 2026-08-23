import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import GamesLayout from '@/app/games/layout'
import PlayLayout from '@/app/play/layout'

vi.mock('@/app/actions/classes', () => ({
  validateClassCodeAction: vi.fn(),
}))

vi.mock('@/app/actions/student-progress', () => ({
  getStudentProgress: vi.fn().mockResolvedValue({
    success: true,
    totalStars: 0,
  }),
}))

describe('Games & Play Layout Integration', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('renders GamesLayout with StudentSessionProvider, popup, and children', async () => {
    render(
      <GamesLayout>
        <div data-testid="game-content">Game Screen Content</div>
      </GamesLayout>
    )

    expect(screen.getByTestId('game-content')).toBeInTheDocument()
    // Popup appears on first game visit because session is empty
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Tham gia lớp học/i)).toBeInTheDocument()
  })

  it('renders PlayLayout with StudentSessionProvider, popup, and children', async () => {
    render(
      <PlayLayout>
        <div data-testid="play-content">Shared Play Screen</div>
      </PlayLayout>
    )

    expect(screen.getByTestId('play-content')).toBeInTheDocument()
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('does not show popup in GamesLayout if student session already exists in sessionStorage', async () => {
    sessionStorage.setItem(
      'gamehub_student_session',
      JSON.stringify({
        classCode: 'ABC123',
        studentName: 'Bé Lan',
        className: 'Lớp 1B',
        isAnonymous: false,
      })
    )

    render(
      <GamesLayout>
        <div data-testid="game-content">Game Screen Content</div>
      </GamesLayout>
    )

    expect(screen.getByTestId('game-content')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByText(/Bé Lan/i)).toBeInTheDocument()
    expect(screen.getByText(/Lớp 1B/i)).toBeInTheDocument()
  })
})
