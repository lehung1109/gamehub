// tests/components/student/AdaptivePowerPack.test.tsx

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdaptivePowerPack } from '@/components/student/adaptive/AdaptivePowerPack'
import type { AdaptiveDailyPlan } from '@/types/adaptive-learning'

const mockPlan: AdaptiveDailyPlan = {
  id: 'plan-101',
  date: '2026-09-13',
  studentId: 'student-an',
  totalExpReward: 60,
  isFullyCompleted: false,
  steps: [
    {
      stepNumber: 1,
      type: 'warm_up',
      titleVi: 'Khởi động: Bật âm đuôi /s/, /k/',
      descriptionVi: 'Khắc phục lỗi nuốt âm đuôi',
      targetGameId: 'pronunciation',
      targetUrl: '/games/pronunciation',
      expReward: 10,
      isCompleted: false,
    },
    {
      stepNumber: 2,
      type: 'core_drill',
      titleVi: 'Luyện tập: Trật tự từ trong câu đơn',
      descriptionVi: 'Rèn luyện ghép câu',
      targetGameId: 'sentences',
      targetUrl: '/games/sentences',
      expReward: 20,
      isCompleted: false,
    },
    {
      stepNumber: 3,
      type: 'boss_challenge',
      titleVi: 'Thử thách phản xạ đỉnh cao',
      descriptionVi: 'Chinh phục 3 câu đố tốc độ',
      targetGameId: 'falling-words',
      targetUrl: '/games/falling-words',
      expReward: 30,
      isCompleted: false,
    },
  ],
}

describe('AdaptivePowerPack Component', () => {
  it('renders all 3 steps and strictly satisfies kid-friendly typography', () => {
    const { container } = render(<AdaptivePowerPack plan={mockPlan} />)

    expect(
      screen.getByRole('heading', { name: /nhiệm vụ thích ứng hôm nay/i })
    ).toBeVisible()
    expect(screen.getByText(/Bước 1: Khởi Động/i)).toBeInTheDocument()
    expect(screen.getByText(/Bước 2: Luyện Cốt Lõi/i)).toBeInTheDocument()
    expect(screen.getByText(/Bước 3: Trùm Thử Thách/i)).toBeInTheDocument()
    expect(screen.getByText(/Khởi động: Bật âm đuôi \/s\/, \/k\//i)).toBeInTheDocument()

    // Kid-friendly typography audit: ensure zero forbidden small text classes
    const html = container.innerHTML
    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
    expect(html).not.toContain('text-[10px]')
    expect(html).not.toContain('text-[12px]')
    expect(html).not.toContain('text-[14px]')
  })

  it('toggles step completion and updates EXP counter', () => {
    const onComplete = vi.fn()
    render(<AdaptivePowerPack plan={mockPlan} onCompleteStep={onComplete} />)

    expect(screen.getByText('+0 / 60 EXP')).toBeInTheDocument()

    const step1Toggle = screen.getByLabelText(/đánh dấu bước 1/i)
    fireEvent.click(step1Toggle)

    expect(onComplete).toHaveBeenCalledWith(1)
    expect(screen.getByText('+10 / 60 EXP')).toBeInTheDocument()
  })

  it('displays celebratory banner when all steps are completed', () => {
    render(<AdaptivePowerPack plan={mockPlan} />)

    // Complete all 3 steps
    fireEvent.click(screen.getByLabelText(/đánh dấu bước 1/i))
    fireEvent.click(screen.getByLabelText(/đánh dấu bước 2/i))
    fireEvent.click(screen.getByLabelText(/đánh dấu bước 3/i))

    expect(
      screen.getByRole('heading', { name: /xuất sắc! em đã hoàn thành toàn bộ gói tăng tốc!/i })
    ).toBeVisible()
    expect(screen.getByText('+60 / 60 EXP')).toBeInTheDocument()
  })
})
