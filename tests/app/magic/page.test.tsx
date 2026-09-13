// tests/app/magic/page.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PhonicsMagicPage, { metadata } from '@/app/magic/page'

// Mock speech
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

describe('Phonics Magic Page (/magic)', () => {
  it('has valid metadata', () => {
    expect(metadata.title).toContain('Học Viện Phép Thuật & Thần Chú Ngữ Âm')
    expect(metadata.description).toBeDefined()
    expect(metadata.description).toContain('Merlin')
  })

  it('renders PhonicsMagicExperience component properly', () => {
    render(<PhonicsMagicPage />)
    expect(screen.getByText(/Học Viện Phép Thuật & Thần Chú Ngữ Âm 🧙‍♂️/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Tháp Lửa/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Pháp Sư Tập Sự 🪄/i)).toBeInTheDocument()
  })
})
