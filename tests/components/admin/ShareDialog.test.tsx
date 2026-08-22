import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ShareDialog } from '@/components/admin/ShareDialog'
import type { GameConfig } from '@/types/config'
import * as configActions from '@/app/actions/configs'

const mockConfig: GameConfig = {
  id: 'cfg-123',
  user_id: 'user-1',
  game_id: 'flashcard',
  name: 'Lớp 1A - Flashcard',
  settings: { topics: ['animals'], wordLimit: 5, autoSpeak: true },
  share_slug: 'abc123xyz0',
  is_active: true,
  created_at: '2026-08-21T00:00:00Z',
  updated_at: '2026-08-21T00:00:00Z',
}

const mockConfigWithoutSlug: GameConfig = {
  ...mockConfig,
  id: 'cfg-456',
  name: 'Lớp 1B - Chưa có link',
  share_slug: null,
}

describe('ShareDialog component (T036 / US4)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders nothing visible when isOpen is false', () => {
    render(
      <ShareDialog
        isOpen={false}
        onClose={vi.fn()}
        config={mockConfig}
      />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog title and existing share link when config has share_slug', () => {
    render(
      <ShareDialog
        isOpen={true}
        onClose={vi.fn()}
        config={mockConfig}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Chia sẻ cấu hình/i })).toBeInTheDocument()
    expect(screen.getByText(/Lớp 1A - Flashcard/i)).toBeInTheDocument()

    const input = screen.getByRole('textbox', { name: /Đường link chia sẻ/i }) as HTMLInputElement
    expect(input.value).toContain('/play/abc123xyz0')
  })

  it('generates a slug automatically if config has no share_slug', async () => {
    const generateSpy = vi.spyOn(configActions, 'generateShareSlug').mockResolvedValue({
      slug: 'newslug999',
    })

    render(
      <ShareDialog
        isOpen={true}
        onClose={vi.fn()}
        config={mockConfigWithoutSlug}
      />
    )

    await waitFor(() => {
      expect(generateSpy).toHaveBeenCalledWith('cfg-456')
    })

    await waitFor(() => {
      const input = screen.getByRole('textbox', { name: /Đường link chia sẻ/i }) as HTMLInputElement
      expect(input.value).toContain('/play/newslug999')
    })
  })

  it('copies link to clipboard and shows feedback when user clicks Copy button', async () => {
    render(
      <ShareDialog
        isOpen={true}
        onClose={vi.fn()}
        config={mockConfig}
      />
    )

    const copyBtn = screen.getByRole('button', { name: /Sao chép/i })
    fireEvent.click(copyBtn)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/play/abc123xyz0')
    )

    await waitFor(() => {
      expect(screen.getByText(/Đã sao chép/i)).toBeInTheDocument()
    })
  })

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn()

    render(
      <ShareDialog
        isOpen={true}
        onClose={handleClose}
        config={mockConfig}
      />
    )

    const closeBtn = screen.getByRole('button', { name: /Đóng/i })
    fireEvent.click(closeBtn)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('handles clipboard writeText failure gracefully with fallback or error', async () => {
    // Mock writeText rejection
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard permission denied')),
      },
    })
    const execMock = vi.fn().mockReturnValue(true)
    Object.defineProperty(document, 'execCommand', {
      value: execMock,
      writable: true,
      configurable: true,
    })

    render(
      <ShareDialog
        isOpen={true}
        onClose={vi.fn()}
        config={mockConfig}
      />
    )

    const copyBtn = screen.getByRole('button', { name: /Sao chép/i })
    fireEvent.click(copyBtn)

    await waitFor(() => {
      expect(execMock).toHaveBeenCalledWith('copy')
      expect(screen.getByText(/Đã sao chép/i)).toBeInTheDocument()
    })
  })

  it('displays an error message when slug generation fails', async () => {
    vi.spyOn(configActions, 'generateShareSlug').mockResolvedValue({
      error: 'Không thể tạo link chia sẻ',
    })

    render(
      <ShareDialog
        isOpen={true}
        onClose={vi.fn()}
        config={mockConfigWithoutSlug}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Không thể tạo link chia sẻ/i)).toBeInTheDocument()
    })
  })
})
