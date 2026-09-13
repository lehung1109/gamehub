// tests/app/ocean/page.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PhonicsOceanPage, { metadata } from '@/app/ocean/page'

// Mock speech
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

describe('Phonics Ocean Page (/ocean)', () => {
  it('has valid metadata', () => {
    expect(metadata.title).toContain('Thám Hiểm Đại Dương & Tàu Ngầm Ngữ Âm')
    expect(metadata.description).toBeDefined()
    expect(metadata.description).toContain('Thuyền trưởng Coral')
  })

  it('renders PhonicsOceanExperience component properly', () => {
    render(<PhonicsOceanPage />)
    expect(screen.getByText(/Thám Hiểm Đại Dương & Tàu Ngầm Ngữ Âm 🐬/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Tầng Ánh Nắng/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Thợ Lặn Tập Sự 🤿/i)).toBeInTheDocument()
  })
})
