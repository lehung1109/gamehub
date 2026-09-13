// tests/app/kitchen/page.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PhonicsKitchenPage, { metadata } from '@/app/kitchen/page'

// Mock speech
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

describe('Phonics Kitchen Page (/kitchen)', () => {
  it('has valid metadata', () => {
    expect(metadata.title).toContain('Bếp Trưởng Nhí Phonics & Học Viện Nấu Ăn Ngữ Âm')
    expect(metadata.description).toBeDefined()
    expect(metadata.description).toContain('Pierre')
  })

  it('renders PhonicsKitchenExperience component properly', () => {
    render(<PhonicsKitchenPage />)
    expect(screen.getByText(/Bếp Trưởng Nhí Phonics/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Tiệm Pizza & Mì Ý/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Phụ Bếp Nhí/i)).toBeInTheDocument()
  })
})
