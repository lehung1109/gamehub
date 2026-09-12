// tests/unit/components/student/StudentCertificatesTab.test.tsx

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StudentCertificatesTab } from '@/components/student/StudentCertificatesTab'
import * as reportsActions from '@/app/actions/reports'
import type { StudentCertificate } from '@/types/certificates'

vi.mock('@/app/actions/reports', () => ({
  getMyCertificatesAction: vi.fn(),
}))

describe('StudentCertificatesTab Component', () => {
  const mockCertificates: StudentCertificate[] = [
    {
      id: 'cert-1',
      studentId: 'student-1',
      classroomId: 'class-1',
      certificateType: 'vocab_master',
      title: 'Chiến Binh Từ Vựng Xuất Sắc',
      recipientName: 'Bé An',
      achievementText: 'Đã xuất sắc thuộc 100 từ vựng tiếng Anh',
      teacherName: 'Cô Lan',
      teacherNote: 'Em học rất chăm!',
      verificationCode: 'GH-CERT-111222',
      issuedAt: '2026-09-12T10:00:00Z',
      createdAt: '2026-09-12T10:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', async () => {
    vi.mocked(reportsActions.getMyCertificatesAction).mockImplementation(
      () => new Promise(() => {}) // never resolves
    )

    render(<StudentCertificatesTab classCode="CLASS1" studentName="Bé An" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders certificate cards when loaded successfully', async () => {
    vi.mocked(reportsActions.getMyCertificatesAction).mockResolvedValue({
      success: true,
      certificates: mockCertificates,
      classroomName: 'Lớp 1A',
    })

    render(<StudentCertificatesTab classCode="CLASS1" studentName="Bé An" />)

    await waitFor(() => {
      expect(screen.getByText('Chiến Binh Từ Vựng Xuất Sắc')).toBeInTheDocument()
    })

    expect(screen.getByText(/Đã xuất sắc thuộc 100 từ vựng tiếng Anh/)).toBeInTheDocument()
    expect(screen.getByText(/GH-CERT-111222/)).toBeInTheDocument()
    expect(screen.getByText(/Cô Lan/)).toBeInTheDocument()
  })

  it('renders empty state when no certificates exist', async () => {
    vi.mocked(reportsActions.getMyCertificatesAction).mockResolvedValue({
      success: true,
      certificates: [],
      classroomName: 'Lớp 1A',
    })

    render(<StudentCertificatesTab classCode="CLASS1" studentName="Bé An" />)

    await waitFor(() => {
      expect(screen.getByText(/Chưa có bằng khen nào/i)).toBeInTheDocument()
    })
  })

  it('renders error state and retries on click', async () => {
    vi.mocked(reportsActions.getMyCertificatesAction).mockResolvedValueOnce({
      success: false,
      certificates: [],
      error: 'Lỗi máy chủ',
    })

    render(<StudentCertificatesTab classCode="CLASS1" studentName="Bé An" />)

    await waitFor(() => {
      expect(screen.getByText('Lỗi máy chủ')).toBeInTheDocument()
    })

    vi.mocked(reportsActions.getMyCertificatesAction).mockResolvedValueOnce({
      success: true,
      certificates: mockCertificates,
      classroomName: 'Lớp 1A',
    })

    const retryBtn = screen.getByRole('button', { name: /thử lại/i })
    fireEvent.click(retryBtn)

    await waitFor(() => {
      expect(screen.getByText('Chiến Binh Từ Vựng Xuất Sắc')).toBeInTheDocument()
    })
  })

  it('opens preview modal when clicking Xem & In', async () => {
    vi.mocked(reportsActions.getMyCertificatesAction).mockResolvedValue({
      success: true,
      certificates: mockCertificates,
      classroomName: 'Lớp 1A',
    })

    render(<StudentCertificatesTab classCode="CLASS1" studentName="Bé An" />)

    await waitFor(() => {
      expect(screen.getByText('Chiến Binh Từ Vựng Xuất Sắc')).toBeInTheDocument()
    })

    const previewBtn = screen.getByRole('button', { name: /xem & in/i })
    fireEvent.click(previewBtn)

    expect(screen.getByText('Giấy Chứng Nhận Danh Dự')).toBeInTheDocument()
  })
})
