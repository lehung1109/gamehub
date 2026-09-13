// tests/app/town/page.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PhonicsTownPage, { metadata } from '@/app/town/page'

// Mock speech
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

describe('Phonics Town Page (/town)', () => {
  it('has valid metadata', () => {
    expect(metadata.title).toContain('Thành Phố Ngữ Âm & Xây Dựng Thế Giới')
    expect(metadata.description).toBeDefined()
    expect(metadata.description).toContain('Thị trưởng Phonics Town')
  })

  it('renders PhonicsTownGrid component properly', () => {
    render(<PhonicsTownPage />)
    expect(screen.getByText(/Thành Phố Ngữ Âm Phonics/i)).toBeInTheDocument()
    expect(screen.getByText(/Tập sự/i)).toBeInTheDocument()
  })
})
