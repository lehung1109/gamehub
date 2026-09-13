// tests/app/space/page.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PhonicsSpacePage, { metadata } from '@/app/space/page'

// Mock speech
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

describe('Phonics Space Page (/space)', () => {
  it('has valid metadata', () => {
    expect(metadata.title).toContain('Thám Hiểm Vũ Trụ Phonics & Khám Phá Hành Tinh')
    expect(metadata.description).toBeDefined()
    expect(metadata.description).toContain('Cosmo')
  })

  it('renders PhonicsSpaceExperience component properly', () => {
    render(<PhonicsSpacePage />)
    expect(screen.getByText(/Thám Hiểm Vũ Trụ Phonics/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Hành Tinh Sao Hỏa Đỏ/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Thiếu Sinh Quân Vũ Trụ/i)).toBeInTheDocument()
  })
})
