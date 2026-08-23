import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LevelUpCelebrationDialog } from '@/components/student/LevelUpCelebrationDialog'
import * as studentSessionHook from '@/hooks/use-student-session'

vi.mock('@/hooks/use-student-session', () => ({
  useStudentSession: vi.fn(),
}))

describe('LevelUpCelebrationDialog Component', () => {
  it('does not render anything when celebration.show is false', () => {
    vi.mocked(studentSessionHook.useStudentSession).mockReturnValue({
      session: { classCode: 'ABC123', studentName: 'Bé Linh' },
      isAnonymous: false,
      isLoaded: true,
      isOpen: false,
      setOpen: vi.fn(),
      joinClass: vi.fn(),
      skip: vi.fn(),
      clearSession: vi.fn(),
      totalStars: 50,
      levelInfo: {
        currentLevel: { level: 2, threshold: 50, badge: '🐱', title: 'Khám phá' },
        nextLevel: { level: 3, threshold: 150, badge: '🦁', title: 'Chinh phục' },
        starsToNext: 100,
        progressToNext: 0,
      },
      isLoadingStars: false,
      refreshProgress: vi.fn(),
      celebration: { show: false, level: null },
      dismissCelebration: vi.fn(),
    })

    const { container } = render(<LevelUpCelebrationDialog />)
    expect(container.firstChild).toBeNull()
  })

  it('renders level-up congratulatory modal when celebration.show is true', () => {
    const mockDismiss = vi.fn()
    vi.mocked(studentSessionHook.useStudentSession).mockReturnValue({
      session: { classCode: 'ABC123', studentName: 'Bé Linh' },
      isAnonymous: false,
      isLoaded: true,
      isOpen: false,
      setOpen: vi.fn(),
      joinClass: vi.fn(),
      skip: vi.fn(),
      clearSession: vi.fn(),
      totalStars: 50,
      levelInfo: {
        currentLevel: { level: 2, threshold: 50, badge: '🐱', title: 'Khám phá' },
        nextLevel: { level: 3, threshold: 150, badge: '🦁', title: 'Chinh phục' },
        starsToNext: 100,
        progressToNext: 0,
      },
      isLoadingStars: false,
      refreshProgress: vi.fn(),
      celebration: {
        show: true,
        level: { level: 2, threshold: 50, badge: '🐱', title: 'Khám phá' },
      },
      dismissCelebration: mockDismiss,
    })

    render(<LevelUpCelebrationDialog />)

    expect(screen.getByTestId('level-up-dialog')).toBeInTheDocument()
    expect(screen.getByText(/Thăng cấp/i)).toBeInTheDocument()
    expect(screen.getByText(/Cấp độ 2/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Khám phá/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('🐱').length).toBeGreaterThanOrEqual(1)

    const dismissBtn = screen.getByRole('button', { name: /tiếp tục|tuyệt vời|đóng/i })
    expect(dismissBtn).toBeInTheDocument()
    fireEvent.click(dismissBtn)

    expect(mockDismiss).toHaveBeenCalledTimes(1)
  })
})
