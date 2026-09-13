import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ParentAccessManager } from '@/components/admin/ParentAccessManager'
import type { ParentAccessInfo, ClassroomAnnouncement } from '@/types/parent'

const sampleParents: ParentAccessInfo[] = [
  {
    studentId: 'stud-1',
    studentName: 'Bé Linh Đan',
    classroomId: 'class-1',
    classroomName: 'Lớp 3A',
    classCode: 'ABC123',
    accessPin: 'P-AB12CD',
    accessToken: 'token-linhdan-123',
    lastAccessedAt: '2026-09-12T10:00:00.000Z',
  },
  {
    studentId: 'stud-2',
    studentName: 'Bé Minh Triết',
    classroomId: 'class-1',
    classroomName: 'Lớp 3A',
    classCode: 'ABC123',
    accessPin: 'P-EF34GH',
    accessToken: 'token-triet-456',
    lastAccessedAt: null,
  },
]

const sampleAnnouncements: (ClassroomAnnouncement & { acknowledgedCount: number })[] = [
  {
    id: 'ann-1',
    classroomId: 'class-1',
    teacherId: 'teacher-1',
    studentId: null,
    title: 'Ôn tập thì Hiện Tại Hoàn Thành',
    content: 'Các bé hoàn thành 2 ván game Flashcard trước Chủ Nhật.',
    category: 'homework',
    priority: 'important',
    createdAt: '2026-09-12T08:00:00.000Z',
    acknowledgedCount: 1,
  },
]

describe('ParentAccessManager Component', () => {
  const onPublishAnnouncement = vi.fn().mockResolvedValue({ success: true })
  const onDeleteAnnouncement = vi.fn().mockResolvedValue({ success: true })
  const onRegeneratePin = vi.fn().mockResolvedValue({ success: true, newPin: 'P-999999' })

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders student parent list with PINs and status', () => {
    render(
      <ParentAccessManager
        classroomId="class-1"
        classroomName="Lớp 3A"
        classCode="ABC123"
        parents={sampleParents}
        announcements={sampleAnnouncements}
        onPublishAnnouncement={onPublishAnnouncement}
        onDeleteAnnouncement={onDeleteAnnouncement}
        onRegeneratePin={onRegeneratePin}
      />
    )

    expect(screen.getByText('Bé Linh Đan')).toBeInTheDocument()
    expect(screen.getByText('P-AB12CD')).toBeInTheDocument()
    expect(screen.getByText('Bé Minh Triết')).toBeInTheDocument()
    expect(screen.getByText('P-EF34GH')).toBeInTheDocument()
    expect(screen.getByText(/Chưa truy cập/i)).toBeInTheDocument()
  })

  it('copies student parent magic link to clipboard', async () => {
    render(
      <ParentAccessManager
        classroomId="class-1"
        classroomName="Lớp 3A"
        classCode="ABC123"
        parents={sampleParents}
        announcements={sampleAnnouncements}
        onPublishAnnouncement={onPublishAnnouncement}
        onDeleteAnnouncement={onDeleteAnnouncement}
        onRegeneratePin={onRegeneratePin}
      />
    )

    const copyButtons = screen.getAllByRole('button', { name: /Sao chép link/i })
    expect(copyButtons.length).toBeGreaterThan(0)

    await React.act(async () => {
      fireEvent.click(copyButtons[0])
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/parent/token-linhdan-123')
    )
  })

  it('renders announcements with read receipt counter', () => {
    render(
      <ParentAccessManager
        classroomId="class-1"
        classroomName="Lớp 3A"
        classCode="ABC123"
        parents={sampleParents}
        announcements={sampleAnnouncements}
        onPublishAnnouncement={onPublishAnnouncement}
        onDeleteAnnouncement={onDeleteAnnouncement}
        onRegeneratePin={onRegeneratePin}
      />
    )

    expect(screen.getByText('Ôn tập thì Hiện Tại Hoàn Thành')).toBeInTheDocument()
    expect(screen.getByText(/1 \/ 2 phụ huynh đã đọc/i)).toBeInTheDocument()
  })

  it('opens announcement modal and publishes new notice', async () => {
    render(
      <ParentAccessManager
        classroomId="class-1"
        classroomName="Lớp 3A"
        classCode="ABC123"
        parents={sampleParents}
        announcements={sampleAnnouncements}
        onPublishAnnouncement={onPublishAnnouncement}
        onDeleteAnnouncement={onDeleteAnnouncement}
        onRegeneratePin={onRegeneratePin}
      />
    )

    // Open compose modal
    const composeBtn = screen.getByRole('button', { name: /Tạo thông báo mới/i })
    fireEvent.click(composeBtn)

    // Fill form
    fireEvent.change(screen.getByLabelText(/Tiêu đề thông báo/i), {
      target: { value: 'Nghỉ lễ Quốc Khánh' },
    })
    fireEvent.change(screen.getByLabelText(/Nội dung thông báo/i), {
      target: { value: 'Lớp sẽ nghỉ học vào thứ Hai tuần tới.' },
    })

    const submitBtn = screen.getByRole('button', { name: /Gửi thông báo/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(onPublishAnnouncement).toHaveBeenCalledWith(
        expect.objectContaining({
          classroomId: 'class-1',
          title: 'Nghỉ lễ Quốc Khánh',
          content: 'Lớp sẽ nghỉ học vào thứ Hai tuần tới.',
        })
      )
    })
  })

  it('complies strictly with the min-16px font size policy (no sub-16px typography)', () => {
    const { container } = render(
      <ParentAccessManager
        classroomId="class-1"
        classroomName="Lớp 3A"
        classCode="ABC123"
        parents={sampleParents}
        announcements={sampleAnnouncements}
        onPublishAnnouncement={onPublishAnnouncement}
        onDeleteAnnouncement={onDeleteAnnouncement}
        onRegeneratePin={onRegeneratePin}
      />
    )

    const prohibitedRegex = /\b(text-xs|text-sm|text-\[1[0-4]px\]|text-\[[0-9]px\])\b/
    const allElements = container.querySelectorAll('*')

    const violations: string[] = []
    allElements.forEach((el) => {
      const className = el.getAttribute('class') || ''
      if (prohibitedRegex.test(className)) {
        violations.push(`${el.tagName}: ${className}`)
      }
    })

    expect(violations).toEqual([])
  })
})
