// tests/app/timetravel/page.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PhonicsTimePage, { metadata } from '@/app/timetravel/page'

// Mock speech
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

describe('Phonics Time Machine Page (/timetravel)', () => {
  it('has valid metadata', () => {
    expect(metadata.title).toContain('Cỗ Máy Thời Gian & Cuộc Du Hành Lịch Sử')
    expect(metadata.description).toBeDefined()
    expect(metadata.description).toContain('Giáo Sư Chronos')
  })

  it('renders PhonicsTimeExperience component properly', () => {
    render(<PhonicsTimePage />)
    expect(screen.getByText(/Cỗ Máy Thời Gian & Cuộc Du Hành Lịch Sử/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Kim Tự Tháp Ai Cập Cổ Đại/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Nhà Du Hành Tập Sự 🧭/i)).toBeInTheDocument()
  })
})
