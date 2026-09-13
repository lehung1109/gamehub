// tests/app/dino/page.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PhonicsDinoPage, { metadata } from '@/app/dino/page'

// Mock speech
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

describe('Phonics Dino Page (/dino)', () => {
  it('has valid metadata', () => {
    expect(metadata.title).toContain('Vương Quốc Khủng Long & Khảo Cổ Tiền Sử')
    expect(metadata.description).toBeDefined()
    expect(metadata.description).toContain('Tiến Sĩ Rex')
  })

  it('renders PhonicsDinoExperience component properly', () => {
    render(<PhonicsDinoPage />)
    expect(screen.getByText(/Vương Quốc Khủng Long & Khảo Cổ Tiền Sử/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Thung Lũng Tam Điệp/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Nhà Khảo Cổ Tập Sự 🔍/i)).toBeInTheDocument()
  })
})
