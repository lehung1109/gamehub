import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StudentProfileBadge } from '@/components/StudentProfileBadge'
import { StudentBadge } from '@/components/student/StudentBadge'
import { StudentSessionProvider } from '@/contexts/StudentSessionContext'
import * as studentProgressAction from '@/app/actions/student-progress'
import { saveStoredInventory } from '@/lib/shop'

vi.mock('@/app/actions/student-progress', () => ({
  getStudentProgress: vi.fn(),
}))

vi.mock('@/app/actions/class-leaderboard', () => ({
  getClassLeaderboard: vi.fn().mockResolvedValue({
    success: true,
    entries: [],
  }),
}))

function setupStudentSession(
  classCode: string = 'CLASS1',
  studentName: string = 'Bé An',
  className: string = 'Lớp 1A'
) {
  const sessionData = { classCode, studentName, className, isAnonymous: false }
  sessionStorage.setItem('gamehub_student_session', JSON.stringify(sessionData))
  localStorage.setItem('gamehub_student_session', JSON.stringify(sessionData))
}

describe('StudentProfileFrames & Custom Titles Rendering', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 60,
    })
  })

  describe('Default state (no equipped items)', () => {
    it('renders StudentProfileBadge normally without frame CSS class or title badge', async () => {
      setupStudentSession('CLASS1', 'Bé An')

      render(
        <StudentSessionProvider>
          <StudentProfileBadge />
        </StudentSessionProvider>
      )

      const profileBadge = await screen.findByTestId('student-profile-badge')
      expect(profileBadge).toBeInTheDocument()

      const emojiContainer = screen.getByTestId('level-badge-emoji')
      expect(emojiContainer.className).not.toContain('ring-amber-400')
      expect(emojiContainer.className).not.toContain('ring-cyan-400')

      expect(screen.queryByTestId('equipped-title-badge')).not.toBeInTheDocument()
    })

    it('renders StudentBadge normally without frame CSS class or title badge', async () => {
      setupStudentSession('CLASS1', 'Bé An')

      render(
        <StudentSessionProvider>
          <StudentBadge />
        </StudentSessionProvider>
      )

      expect(await screen.findByText('Bé An')).toBeInTheDocument()

      const avatarContainer = screen.getByTestId('student-avatar-frame')
      expect(avatarContainer.className).not.toContain('ring-amber-400')
      expect(screen.queryByTestId('equipped-title-badge')).not.toBeInTheDocument()
    })
  })

  describe('Equipped frame rendering', () => {
    it('applies frame CSS class to avatar container in StudentProfileBadge', async () => {
      setupStudentSession('CLASS1', 'Bé An')
      saveStoredInventory('CLASS1', 'Bé An', {
        ownedItemIds: ['frame_gold'],
        equippedFrameId: 'frame_gold',
        equippedTitleId: null,
      })

      render(
        <StudentSessionProvider>
          <StudentProfileBadge />
        </StudentSessionProvider>
      )

      await screen.findByTestId('student-profile-badge')
      const emojiContainer = screen.getByTestId('level-badge-emoji')
      expect(emojiContainer.className).toContain('ring-amber-400')
    })

    it('applies frame CSS class to avatar container in StudentBadge', async () => {
      setupStudentSession('CLASS1', 'Bé An')
      saveStoredInventory('CLASS1', 'Bé An', {
        ownedItemIds: ['frame_neon'],
        equippedFrameId: 'frame_neon',
        equippedTitleId: null,
      })

      render(
        <StudentSessionProvider>
          <StudentBadge />
        </StudentSessionProvider>
      )

      await screen.findByText('Bé An')
      const avatarContainer = screen.getByTestId('student-avatar-frame')
      expect(avatarContainer.className).toContain('ring-cyan-400')
    })
  })

  describe('Equipped title rendering', () => {
    it('renders custom title badge with icon and name in StudentProfileBadge', async () => {
      setupStudentSession('CLASS1', 'Bé An')
      saveStoredInventory('CLASS1', 'Bé An', {
        ownedItemIds: ['title_master'],
        equippedFrameId: null,
        equippedTitleId: 'title_master',
      })

      render(
        <StudentSessionProvider>
          <StudentProfileBadge />
        </StudentSessionProvider>
      )

      await screen.findByTestId('student-profile-badge')
      const titleBadge = await screen.findByTestId('equipped-title-badge')
      expect(titleBadge).toBeInTheDocument()
      expect(titleBadge).toHaveTextContent('🎓')
      expect(titleBadge).toHaveTextContent('Bậc Thầy Tiếng Anh')
    })

    it('renders custom title badge with icon and name in StudentBadge', async () => {
      setupStudentSession('CLASS1', 'Bé An')
      saveStoredInventory('CLASS1', 'Bé An', {
        ownedItemIds: ['title_legend'],
        equippedFrameId: null,
        equippedTitleId: 'title_legend',
      })

      render(
        <StudentSessionProvider>
          <StudentBadge />
        </StudentSessionProvider>
      )

      await screen.findByText('Bé An')
      const titleBadge = await screen.findByTestId('equipped-title-badge')
      expect(titleBadge).toBeInTheDocument()
      expect(titleBadge).toHaveTextContent('🌟')
      expect(titleBadge).toHaveTextContent('Huyền Thoại GameHub')
    })
  })

  describe('Integration with both frame and title equipped', () => {
    it('renders both equipped frame and title simultaneously in StudentProfileBadge', async () => {
      setupStudentSession('CLASS1', 'Bé An')
      saveStoredInventory('CLASS1', 'Bé An', {
        ownedItemIds: ['frame_gold', 'title_speed'],
        equippedFrameId: 'frame_gold',
        equippedTitleId: 'title_speed',
      })

      render(
        <StudentSessionProvider>
          <StudentProfileBadge />
        </StudentSessionProvider>
      )

      await screen.findByTestId('student-profile-badge')

      // Check frame
      const emojiContainer = screen.getByTestId('level-badge-emoji')
      expect(emojiContainer.className).toContain('ring-amber-400')

      // Check title
      const titleBadge = screen.getByTestId('equipped-title-badge')
      expect(titleBadge).toHaveTextContent('⚡')
      expect(titleBadge).toHaveTextContent('Thần Tốc Độ')
    })

    it('renders both equipped frame and title simultaneously in StudentBadge', async () => {
      setupStudentSession('CLASS1', 'Bé An')
      saveStoredInventory('CLASS1', 'Bé An', {
        ownedItemIds: ['frame_galaxy', 'title_voice'],
        equippedFrameId: 'frame_galaxy',
        equippedTitleId: 'title_voice',
      })

      render(
        <StudentSessionProvider>
          <StudentBadge />
        </StudentSessionProvider>
      )

      await screen.findByText('Bé An')

      // Check frame
      const avatarContainer = screen.getByTestId('student-avatar-frame')
      expect(avatarContainer.className).toContain('ring-purple-600')

      // Check title
      const titleBadge = screen.getByTestId('equipped-title-badge')
      expect(titleBadge).toHaveTextContent('🎙️')
      expect(titleBadge).toHaveTextContent('Giọng Ca Vàng')
    })

    it('handles unknown or invalid equipped item IDs gracefully', async () => {
      setupStudentSession('CLASS1', 'Bé An')
      saveStoredInventory('CLASS1', 'Bé An', {
        ownedItemIds: [],
        equippedFrameId: 'non_existent_frame',
        equippedTitleId: 'non_existent_title',
      })

      render(
        <StudentSessionProvider>
          <StudentProfileBadge />
          <StudentBadge />
        </StudentSessionProvider>
      )

      await screen.findByTestId('student-profile-badge')
      expect(screen.queryByTestId('equipped-title-badge')).not.toBeInTheDocument()
    })

    it('re-reads inventory when modal closes in StudentProfileBadge', async () => {
      setupStudentSession('CLASS1', 'Bé An')

      render(
        <StudentSessionProvider>
          <StudentProfileBadge />
        </StudentSessionProvider>
      )

      const badge = await screen.findByTestId('student-profile-badge')
      const emojiContainer = screen.getByTestId('level-badge-emoji')
      expect(emojiContainer.className).not.toContain('ring-amber-400')

      // Click to open modal
      fireEvent.click(badge)
      expect(await screen.findByRole('dialog')).toBeInTheDocument()

      // Simulate student equipping frame_gold while modal was open
      saveStoredInventory('CLASS1', 'Bé An', {
        ownedItemIds: ['frame_gold'],
        equippedFrameId: 'frame_gold',
        equippedTitleId: null,
      })

      // Close modal using close button
      const closeBtn = screen.getByLabelText(/đóng/i)
      fireEvent.click(closeBtn)

      // After modal is closed, the frame should immediately reflect in the badge
      expect(emojiContainer.className).toContain('ring-amber-400')
    })
  })
})
