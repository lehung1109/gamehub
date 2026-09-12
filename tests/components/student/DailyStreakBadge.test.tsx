import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DailyStreakBadge } from '@/components/student/DailyStreakBadge'
import { StudentSessionProvider } from '@/contexts/StudentSessionContext'
import { saveStoredStreak, getTodayDateString } from '@/lib/streak'
import type { StreakState } from '@/types/streak'

const mockSession = {
  classCode: 'CLASS101',
  studentName: 'Bé Minh',
  className: 'Lớp 1A',
}

function renderBadge(sessionData = mockSession) {
  sessionStorage.setItem(
    'gamehub_student_session',
    JSON.stringify({ ...sessionData, isAnonymous: false })
  )
  localStorage.setItem(
    'gamehub_student_session',
    JSON.stringify({ ...sessionData, isAnonymous: false })
  )

  return render(
    <StudentSessionProvider>
      <DailyStreakBadge />
    </StudentSessionProvider>
  )
}

describe('DailyStreakBadge Component', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  it('renders streak count and flame icon', async () => {
    const today = getTodayDateString()
    const streakState: StreakState = {
      currentStreak: 3,
      longestStreak: 5,
      lastActiveDate: today,
      freezeCount: 2,
      totalActiveDays: 10,
      unlockedMilestones: [3],
    }
    saveStoredStreak(mockSession.classCode, mockSession.studentName, streakState)

    renderBadge()

    // Streak count text
    const streakText = await screen.findByText('3 ngày')
    expect(streakText).toBeInTheDocument()

    // Flame icon
    const flameIcon = screen.getByTestId('streak-flame-icon')
    expect(flameIcon).toBeInTheDocument()

    // Badge button and accessibility
    const badge = screen.getByRole('button', { name: /Chuỗi học tập 3 ngày/i })
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute(
      'title',
      'Chuỗi học tập liên tục 3 ngày. Bấm để xem chi tiết!'
    )
  })

  it('shows active today state vs not played today state', async () => {
    const today = getTodayDateString()

    // Case 1: Active today
    const activeStreak: StreakState = {
      currentStreak: 4,
      longestStreak: 4,
      lastActiveDate: today,
      freezeCount: 1,
      totalActiveDays: 6,
      unlockedMilestones: [3],
    }
    saveStoredStreak(mockSession.classCode, mockSession.studentName, activeStreak)

    const { unmount } = renderBadge()
    const activeBadge = await screen.findByRole('button', { name: /Chuỗi học tập 4 ngày/i })
    expect(activeBadge.className).toContain('bg-orange-50')
    expect(screen.queryByTestId('streak-indicator-dot')).not.toBeInTheDocument()

    unmount()
    sessionStorage.clear()
    localStorage.clear()

    // Case 2: Not yet played today (last active yesterday or earlier)
    const pendingStreak: StreakState = {
      currentStreak: 4,
      longestStreak: 4,
      lastActiveDate: '2026-09-10',
      freezeCount: 1,
      totalActiveDays: 6,
      unlockedMilestones: [3],
    }
    saveStoredStreak(mockSession.classCode, mockSession.studentName, pendingStreak)

    renderBadge()
    const pendingBadge = await screen.findByRole('button', { name: /Chuỗi học tập 4 ngày/i })
    expect(pendingBadge.className).toContain('bg-amber-50')
    expect(screen.getByTestId('streak-indicator-dot')).toBeInTheDocument()
  })

  it('displays ice shield badge when freezeCount > 0', async () => {
    const streakState: StreakState = {
      currentStreak: 2,
      longestStreak: 2,
      lastActiveDate: '2026-09-11',
      freezeCount: 3,
      totalActiveDays: 4,
      unlockedMilestones: [],
    }
    saveStoredStreak(mockSession.classCode, mockSession.studentName, streakState)

    renderBadge()

    const freezeBadge = await screen.findByTestId('streak-freeze-badge')
    expect(freezeBadge).toBeInTheDocument()
    expect(freezeBadge).toHaveTextContent('3')
  })

  it('clicking badge opens DailyStreakModal', async () => {
    const today = getTodayDateString()
    const streakState: StreakState = {
      currentStreak: 7,
      longestStreak: 12,
      lastActiveDate: today,
      freezeCount: 1,
      totalActiveDays: 20,
      unlockedMilestones: [3, 7],
    }
    saveStoredStreak(mockSession.classCode, mockSession.studentName, streakState)

    renderBadge()

    const badge = await screen.findByRole('button', { name: /Chuỗi học tập 7 ngày/i })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(badge)

    const modal = await screen.findByRole('dialog')
    expect(modal).toBeInTheDocument()
    expect(screen.getByText('Chuỗi Ngày Học Tập')).toBeInTheDocument()
    expect(screen.getByText(/7 Ngày Liên Tiếp/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Hôm nay bạn đã hoàn thành bài học và giữ vững chuỗi/i)
    ).toBeInTheDocument()
  })

  it('modal displays longest streak, total active days, freeze count, and milestones', async () => {
    const streakState: StreakState = {
      currentStreak: 5,
      longestStreak: 15,
      lastActiveDate: '2026-09-10',
      freezeCount: 2,
      totalActiveDays: 25,
      unlockedMilestones: [3],
    }
    saveStoredStreak(mockSession.classCode, mockSession.studentName, streakState)

    renderBadge()

    const badge = await screen.findByRole('button', { name: /Chuỗi học tập 5 ngày/i })
    fireEvent.click(badge)

    await screen.findByRole('dialog')

    // Longest streak
    expect(screen.getByText('Kỷ lục chuỗi dài nhất')).toBeInTheDocument()
    expect(screen.getByTestId('stat-longest-streak')).toHaveTextContent('15 ngày')

    // Total active days
    expect(screen.getByText('Tổng số ngày học')).toBeInTheDocument()
    expect(screen.getByTestId('stat-total-days')).toHaveTextContent('25 ngày')

    // Streak freeze with note
    expect(screen.getByText('Băng bảo vệ chuỗi')).toBeInTheDocument()
    expect(screen.getByTestId('stat-freeze-count')).toHaveTextContent('2 khiên')
    expect(
      screen.getByText(/Tự động kích hoạt khi bạn bỏ lỡ 1 ngày để bảo toàn chuỗi/i)
    ).toBeInTheDocument()

    // Unplayed today guidance
    expect(
      screen.getByText(/Hãy chơi ít nhất 1 trò chơi hôm nay để tiếp tục chuỗi nhé/i)
    ).toBeInTheDocument()

    // Milestones roadmap
    expect(screen.getByText(/3 ngày/i)).toBeInTheDocument()
    expect(screen.getByText(/7 ngày/i)).toBeInTheDocument()
    expect(screen.getByText(/14 ngày/i)).toBeInTheDocument()
    expect(screen.getByText(/30 ngày/i)).toBeInTheDocument()
  })

  it('closes modal via close button, action button, and Escape key', async () => {
    const streakState: StreakState = {
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: '2026-09-11',
      freezeCount: 1,
      totalActiveDays: 2,
      unlockedMilestones: [],
    }
    saveStoredStreak(mockSession.classCode, mockSession.studentName, streakState)

    renderBadge()

    const badge = await screen.findByRole('button', { name: /Chuỗi học tập 1 ngày/i })

    // Open and close via close button 'X'
    fireEvent.click(badge)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    const closeBtn = screen.getByRole('button', { name: 'Đóng' })
    fireEvent.click(closeBtn)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Open and close via 'Tiếp tục học ngay' action button
    fireEvent.click(badge)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    const actionBtn = screen.getByRole('button', { name: /Tiếp tục học ngay/i })
    fireEvent.click(actionBtn)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Open and close via Escape key
    fireEvent.click(badge)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
