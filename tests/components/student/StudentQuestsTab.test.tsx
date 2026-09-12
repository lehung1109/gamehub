import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StudentQuestsTab } from '@/components/student/StudentQuestsTab'
import {
  saveStoredQuests,
  getStoredQuests,
  generateDailyQuests,
  generateWeeklyQuest,
  getWeekKey,
} from '@/lib/quests'
import { saveStoredStreak, getStoredStreak, getTodayDateString } from '@/lib/streak'
import type { StreakState } from '@/types/streak'

describe('StudentQuestsTab Component', () => {
  const classCode = 'CLASS1'
  const studentName = 'Bé Minh'

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('renders daily quests list, weekly quest, and summary header', () => {
    render(
      <StudentQuestsTab
        classCode={classCode}
        studentName={studentName}
        totalStars={50}
      />
    )

    // Header summary
    expect(screen.getByText(/Nhiệm vụ hôm nay/i)).toBeInTheDocument()

    // 3 Daily Quests generated deterministically
    expect(screen.getByText('Chăm chỉ mỗi ngày')).toBeInTheDocument()
    expect(screen.getByText('Bách phát bách trúng')).toBeInTheDocument()
    expect(screen.getByText('Thử thách trọng tâm')).toBeInTheDocument()

    // Weekly Quest
    expect(screen.getByText('Chiến binh tuần lễ')).toBeInTheDocument()

    // Progressbars rendered
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars.length).toBe(4) // 3 daily + 1 weekly

    // Rewards displayed
    expect(screen.getByText('+5 ⭐')).toBeInTheDocument()
    expect(screen.getAllByText('+10 ⭐').length).toBe(2)
    expect(screen.getByText('+35 ⭐')).toBeInTheDocument()
  })

  it('displays in-progress indicator and disabled state for incomplete quests', () => {
    render(
      <StudentQuestsTab
        classCode={classCode}
        studentName={studentName}
        totalStars={50}
      />
    )

    // Incomplete quests show progress text and "Đang làm"
    const inProgressButtons = screen.getAllByRole('button', { name: /Đang làm/i })
    expect(inProgressButtons.length).toBe(4)
    inProgressButtons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })

    // Shows 0/2 for the play games quest
    expect(screen.getByText('0 / 2')).toBeInTheDocument()
    // Shows 0/6 for weekly warrior quest
    expect(screen.getByText('0 / 6')).toBeInTheDocument()
  })

  it('allows claiming completed daily quest, calls onStarsClaimed, updates UI & storage', () => {
    const today = getTodayDateString()
    const dailyQuests = generateDailyQuests(today)
    // Mark first quest as completed
    dailyQuests[0].current = 2
    dailyQuests[0].isCompleted = true
    dailyQuests[0].isClaimed = false

    const weekly = generateWeeklyQuest(getWeekKey(today))
    saveStoredQuests(classCode, studentName, [...dailyQuests, weekly])

    const mockOnStarsClaimed = vi.fn()

    render(
      <StudentQuestsTab
        classCode={classCode}
        studentName={studentName}
        totalStars={50}
        onStarsClaimed={mockOnStarsClaimed}
      />
    )

    // Completed daily quest should show active "Nhận thưởng" button
    const claimButton = screen.getByRole('button', { name: 'Nhận thưởng' })
    expect(claimButton).not.toBeDisabled()

    // Click to claim
    fireEvent.click(claimButton)

    // onStarsClaimed should be called with reward stars (5)
    expect(mockOnStarsClaimed).toHaveBeenCalledTimes(1)
    expect(mockOnStarsClaimed).toHaveBeenCalledWith(5)

    // Button should now show "Đã nhận ✓" and be disabled
    const claimedButton = screen.getByRole('button', { name: /Đã nhận/i })
    expect(claimedButton).toBeDisabled()

    // Storage should be updated with isClaimed: true
    const stored = getStoredQuests(classCode, studentName)
    const claimedInStore = stored.find((q) => q.id === dailyQuests[0].id)
    expect(claimedInStore?.isClaimed).toBe(true)

    // Success notification/message should be displayed
    expect(screen.getByText(/Nhận thành công/i)).toBeInTheDocument()
  })

  it('allows claiming weekly quest and grants both stars and streak freeze', () => {
    const today = getTodayDateString()
    const weekKey = getWeekKey(today)
    const dailyQuests = generateDailyQuests(today)
    const weekly = generateWeeklyQuest(weekKey)

    // Mark weekly quest as completed
    weekly.current = 6
    weekly.isCompleted = true
    weekly.isClaimed = false
    saveStoredQuests(classCode, studentName, [...dailyQuests, weekly])

    // Seed streak state with 1 freeze
    const initialStreak: StreakState = {
      currentStreak: 4,
      longestStreak: 4,
      lastActiveDate: today,
      freezeCount: 1,
      totalActiveDays: 4,
      unlockedMilestones: [3],
    }
    saveStoredStreak(classCode, studentName, initialStreak)

    const mockOnStarsClaimed = vi.fn()

    render(
      <StudentQuestsTab
        classCode={classCode}
        studentName={studentName}
        totalStars={50}
        onStarsClaimed={mockOnStarsClaimed}
      />
    )

    // Find claim button for weekly quest
    const claimButton = screen.getByRole('button', { name: 'Nhận thưởng' })
    expect(claimButton).toBeInTheDocument()

    fireEvent.click(claimButton)

    // Should grant 35 stars
    expect(mockOnStarsClaimed).toHaveBeenCalledWith(35)

    // Streak freeze should be incremented to 2 in storage
    const updatedStreak = getStoredStreak(classCode, studentName)
    expect(updatedStreak.freezeCount).toBe(2)

    // Stored quest should be claimed
    const stored = getStoredQuests(classCode, studentName)
    const weeklyInStore = stored.find((q) => q.period === 'weekly')
    expect(weeklyInStore?.isClaimed).toBe(true)
  })

  it('renders already claimed quest with disabled "Đã nhận ✓" button', () => {
    const today = getTodayDateString()
    const dailyQuests = generateDailyQuests(today)
    dailyQuests[0].current = 2
    dailyQuests[0].isCompleted = true
    dailyQuests[0].isClaimed = true

    const weekly = generateWeeklyQuest(getWeekKey(today))
    saveStoredQuests(classCode, studentName, [...dailyQuests, weekly])

    render(
      <StudentQuestsTab
        classCode={classCode}
        studentName={studentName}
        totalStars={50}
      />
    )

    const claimedBtn = screen.getByRole('button', { name: /Đã nhận/i })
    expect(claimedBtn).toBeDisabled()
  })

  it('handles empty/undefined student credentials gracefully with anon fallback', () => {
    render(<StudentQuestsTab totalStars={20} />)

    expect(screen.getByText(/Nhiệm vụ hôm nay/i)).toBeInTheDocument()
    expect(screen.getByText('Chăm chỉ mỗi ngày')).toBeInTheDocument()
    expect(screen.getByText('Chiến binh tuần lễ')).toBeInTheDocument()
  })
})
