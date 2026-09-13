import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CommunityConfigCard } from '@/components/admin/CommunityConfigCard'
import { ShareConfigModal } from '@/components/admin/ShareConfigModal'
import * as communityActions from '@/app/actions/community'
import type { CommunitySharedConfig } from '@/types/community'
import fs from 'node:fs'
import path from 'node:path'

vi.mock('@/app/actions/community', () => ({
  toggleLikeCommunityConfigAction: vi.fn(),
  cloneCommunityConfigAction: vi.fn(),
  deleteCommunityConfigAction: vi.fn(),
  shareConfigToCommunityAction: vi.fn(),
}))

describe('CommunityConfigCard & ShareConfigModal', () => {
  const mockConfig: CommunitySharedConfig = {
    id: 'comm-card-1',
    configId: 'cfg-1',
    authorId: 'teacher-1',
    authorName: 'Thầy Quang',
    title: 'Động vật hoang dã Jungle Animals',
    description: 'Bộ thẻ từ vựng các con vật rừng nhiệt đới kèm hình ảnh',
    gameId: 'flashcard',
    cefrLevel: 'A1',
    topic: 'animals',
    tags: ['animals', 'jungle', 'kids'],
    settings: { timer: 30 },
    likesCount: 12,
    cloneCount: 8,
    createdAt: '2026-09-13T08:00:00Z',
    updatedAt: '2026-09-13T08:00:00Z',
    isLikedByMe: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(communityActions.toggleLikeCommunityConfigAction).mockResolvedValue({
      success: true,
      data: { likesCount: 13, isLiked: true },
    })
    vi.mocked(communityActions.cloneCommunityConfigAction).mockResolvedValue({
      success: true,
      data: { newConfigId: 'new-cloned-id-999' },
    })
    vi.mocked(communityActions.deleteCommunityConfigAction).mockResolvedValue({
      success: true,
      data: null,
    })
    vi.mocked(communityActions.shareConfigToCommunityAction).mockResolvedValue({
      success: true,
      data: mockConfig,
    })
  })

  describe('CommunityConfigCard Component', () => {
    it('renders card with title, author, badges, counters, and action buttons', () => {
      render(
        <CommunityConfigCard
          config={mockConfig}
          currentUserId="other-teacher"
        />
      )

      expect(screen.getByText('Động vật hoang dã Jungle Animals')).toBeDefined()
      expect(screen.getByText(/Thầy Quang/i)).toBeDefined()
      expect(screen.getByText('A1')).toBeDefined()
      expect(screen.getAllByText('animals').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('12')).toBeDefined() // likes
      expect(screen.getByText('8')).toBeDefined() // clones

      expect(screen.getByRole('button', { name: /Sao chép/i })).toBeDefined()
    })

    it('toggles like when like button is clicked', async () => {
      const onLikeToggle = vi.fn()
      render(
        <CommunityConfigCard
          config={mockConfig}
          currentUserId="other-teacher"
          onLikeToggle={onLikeToggle}
        />
      )

      const likeBtn = screen.getByRole('button', { name: /Thích/i })
      fireEvent.click(likeBtn)

      await waitFor(() => {
        expect(communityActions.toggleLikeCommunityConfigAction).toHaveBeenCalledWith(
          'comm-card-1',
          false
        )
        expect(onLikeToggle).toHaveBeenCalledWith('comm-card-1', true, 13)
      })
    })

    it('calls cloneCommunityConfigAction when clone button is clicked', async () => {
      const onCloned = vi.fn()
      render(
        <CommunityConfigCard
          config={mockConfig}
          currentUserId="other-teacher"
          onCloned={onCloned}
        />
      )

      const cloneBtn = screen.getByRole('button', { name: /Sao chép/i })
      fireEvent.click(cloneBtn)

      await waitFor(() => {
        expect(communityActions.cloneCommunityConfigAction).toHaveBeenCalledWith('comm-card-1')
        expect(onCloned).toHaveBeenCalledWith('new-cloned-id-999')
      })
    })

    it('shows delete button only when currentUserId matches authorId', async () => {
      const onDeleted = vi.fn()
      const { rerender } = render(
        <CommunityConfigCard
          config={mockConfig}
          currentUserId="other-teacher"
        />
      )
      expect(screen.queryByRole('button', { name: /Xóa/i })).toBeNull()

      rerender(
        <CommunityConfigCard
          config={mockConfig}
          currentUserId="teacher-1"
          onDeleted={onDeleted}
        />
      )

      const deleteBtn = screen.getByRole('button', { name: /Xóa/i })
      expect(deleteBtn).toBeDefined()

      // Mock confirm
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      fireEvent.click(deleteBtn)

      await waitFor(() => {
        expect(communityActions.deleteCommunityConfigAction).toHaveBeenCalledWith('comm-card-1')
        expect(onDeleted).toHaveBeenCalledWith('comm-card-1')
      })
    })
  })

  describe('ShareConfigModal Component', () => {
    const mockMyConfigs = [
      { id: 'cfg-1', name: 'Trái cây A1', game_id: 'flashcard', created_at: '2026-09-13T00:00:00Z' },
      { id: 'cfg-2', name: 'Đồ vật B1', game_id: 'word-match', created_at: '2026-09-13T00:00:00Z' },
    ]

    it('renders nothing when closed', () => {
      const { container } = render(
        <ShareConfigModal
          isOpen={false}
          onClose={vi.fn()}
          myConfigs={mockMyConfigs}
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('submits share configuration form successfully', async () => {
      const onSuccess = vi.fn()
      render(
        <ShareConfigModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={onSuccess}
          myConfigs={mockMyConfigs}
        />
      )

      expect(screen.getByText(/Chia sẻ cấu hình lên Cộng đồng/i)).toBeDefined()

      // Select first config
      const selectConfig = screen.getByLabelText(/Chọn bài học cần chia sẻ/i)
      fireEvent.change(selectConfig, { target: { value: 'cfg-1' } })

      // Enter title
      const titleInput = screen.getByLabelText(/Tiêu đề bài chia sẻ/i)
      fireEvent.change(titleInput, { target: { value: 'Trái cây ngon miệng A1' } })

      // Click submit
      const submitBtn = screen.getByRole('button', { name: /Chia sẻ ngay/i })
      fireEvent.click(submitBtn)

      await waitFor(() => {
        expect(communityActions.shareConfigToCommunityAction).toHaveBeenCalledWith(
          expect.objectContaining({
            configId: 'cfg-1',
            title: 'Trái cây ngon miệng A1',
          })
        )
        expect(onSuccess).toHaveBeenCalled()
      })
    })
  })

  describe('Typography Compliance', () => {
    it('verifies CommunityConfigCard and ShareConfigModal adhere strictly to >= 16px font policy', () => {
      const files = [
        'src/components/admin/CommunityConfigCard.tsx',
        'src/components/admin/ShareConfigModal.tsx',
        'src/components/admin/CommunityHubView.tsx',
        'src/app/admin/community/page.tsx',
      ]


      const forbiddenClasses = [
        'text-xs',
        'text-sm',
        'text-[10px]',
        'text-[11px]',
        'text-[12px]',
        'text-[13px]',
        'text-[14px]',
        'text-[15px]',
      ]

      for (const file of files) {
        const fullPath = path.resolve(process.cwd(), file)
        expect(fs.existsSync(fullPath)).toBe(true)
        const content = fs.readFileSync(fullPath, 'utf-8')

        for (const cls of forbiddenClasses) {
          const regex = new RegExp(`\\b${cls.replace('[', '\\[').replace(']', '\\]')}\\b`, 'g')
          const matches = content.match(regex)
          expect(
            matches,
            `Found forbidden sub-16px class "${cls}" in ${file}`
          ).toBeNull()
        }
      }
    })
  })
})
