// tests/components/passport/PassportHub.test.tsx

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PassportHub } from '@/components/passport/PassportHub'
import { SAMPLE_STUDENT_PASSPORT } from '@/data/passport/sample-passport'

// Mock useSpeech
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

describe('PassportHub Component', () => {
  it('renders student passport cover banner, stamps, and voice recordings', () => {
    render(<PassportHub initialPassport={SAMPLE_STUDENT_PASSPORT} />)

    expect(screen.getByRole('heading', { name: 'Bé An Nhiên' })).toBeInTheDocument()
    expect(screen.getByText('Hộ Chiếu Năng Lực Tiếng Anh')).toBeInTheDocument()
    expect(screen.getByText('Nhà Thám Hiểm Trò Chơi')).toBeInTheDocument()
    expect(screen.getByText('Hồ Sơ Giọng Nói Nhí (Audio Portfolio)')).toBeInTheDocument()
    expect(screen.getByText('Lồng tiếng: Chú Mèo Trong Rừng')).toBeInTheDocument()
  })

  it('opens digital graduation modal when clicking graduation button', () => {
    render(<PassportHub initialPassport={SAMPLE_STUDENT_PASSPORT} />)

    const gradBtn = screen.getByRole('button', { name: /tổ chức lễ tốt nghiệp/i })
    expect(gradBtn).toBeInTheDocument()

    fireEvent.click(gradBtn)

    expect(
      screen.getByRole('dialog', { name: /lễ tốt nghiệp trực tuyến và chứng chỉ/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/Chứng Nhận Hoàn Thành GameHub/i)).toBeInTheDocument()
  })

  it('satisfies strict kid-friendly typography policy (zero text-xs, text-sm)', () => {
    const { container } = render(<PassportHub initialPassport={SAMPLE_STUDENT_PASSPORT} />)
    const html = container.innerHTML

    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
    expect(html).not.toContain('text-[10px]')
    expect(html).not.toContain('text-[12px]')
    expect(html).not.toContain('text-[14px]')
  })
})
