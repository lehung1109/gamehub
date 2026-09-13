// tests/app/safari/page.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PhonicsSafariPage, { metadata } from '@/app/safari/page'

// Mock speech
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

describe('Phonics Safari Page (/safari)', () => {
  it('has valid metadata', () => {
    expect(metadata.title).toContain('Thám Hiểm Safari Ngữ Âm & Bách Khoa Động Vật')
    expect(metadata.description).toBeDefined()
    expect(metadata.description).toContain('Ranger Leo')
  })

  it('renders PhonicsSafariExperience component properly', () => {
    render(<PhonicsSafariPage />)
    expect(screen.getByText(/Thám Hiểm Safari Ngữ Âm/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Thảo Nguyên Savanna/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Thám Tử Nhí/i)).toBeInTheDocument()
  })
})
