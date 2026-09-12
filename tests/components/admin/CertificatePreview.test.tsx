// tests/components/admin/CertificatePreview.test.tsx

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CertificatePreview } from '@/components/admin/reports/CertificatePreview'
import type { StudentCertificate } from '@/types/certificates'

const mockCertificate: StudentCertificate = {
  id: 'cert-101',
  studentId: 'student-202',
  classroomId: 'class-303',
  certificateType: 'vocab_master',
  title: 'Chiến Binh Từ Vựng Xuất Sắc',
  recipientName: 'Nguyễn Tuệ Nhi',
  achievementText: 'Đã xuất sắc hoàn thành 100 từ vựng với độ chính xác trên 90%',
  teacherName: 'Cô Linh',
  teacherNote: 'Bé học rất chăm chỉ và năng động.',
  verificationCode: 'GH-CERT-9X2K4M',
  issuedAt: '2026-09-12T10:00:00Z',
  createdAt: '2026-09-12T10:00:00Z',
}

describe('CertificatePreview Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.print = vi.fn()
  })

  it('renders certificate details correctly', () => {
    render(
      <CertificatePreview
        certificate={mockCertificate}
        classroomName="Lớp 2A"
      />
    )

    expect(screen.getByText('Nguyễn Tuệ Nhi')).toBeInTheDocument()
    expect(screen.getByText('Chiến Binh Từ Vựng Xuất Sắc')).toBeInTheDocument()
    expect(
      screen.getByText(/Đã xuất sắc hoàn thành 100 từ vựng với độ chính xác trên 90%/)
    ).toBeInTheDocument()
    expect(screen.getAllByText('Cô Linh').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('GH-CERT-9X2K4M').length).toBeGreaterThanOrEqual(1)
  })

  it('calls window.print when print button is clicked', () => {
    render(
      <CertificatePreview
        certificate={mockCertificate}
        classroomName="Lớp 2A"
      />
    )

    const printBtn = screen.getByRole('button', { name: /in giấy khen/i })
    fireEvent.click(printBtn)

    expect(window.print).toHaveBeenCalledTimes(1)
  })
})
