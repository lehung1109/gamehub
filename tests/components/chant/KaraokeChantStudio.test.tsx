// tests/components/chant/KaraokeChantStudio.test.tsx

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { KaraokeChantStudio } from '@/components/chant/KaraokeChantStudio'
import { PHONICS_CHANTS } from '@/data/chants/phonics-chants'

// Mock useSpeech
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

// Mock rhythm synthesizer
vi.mock('@/lib/rhythm-beat-synthesizer', () => ({
  createRhythmSynthesizer: () => ({
    playWoodblock: vi.fn(),
    playKick: vi.fn(),
    playSnare: vi.fn(),
    playChime: vi.fn(),
    close: vi.fn().mockResolvedValue(undefined),
  }),
}))

describe('KaraokeChantStudio Component', () => {
  const sampleChant = PHONICS_CHANTS[0]

  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('renders chant title, target sound, and karaoke lines properly', () => {
    render(<KaraokeChantStudio chant={sampleChant} />)

    expect(screen.getByText('Chú Mèo Trên Tấm Thảm')).toBeInTheDocument()
    expect(screen.getByText(/Mục tiêu Phonics:/i)).toBeInTheDocument()
    expect(screen.getByText('Một chú mèo, một chú mèo mập mạp!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /phát nhịp điệu/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vỗ tay gõ nhịp điệu/i })).toBeInTheDocument()
  })

  it('handles play toggle and rhythm tap interaction', () => {
    render(<KaraokeChantStudio chant={sampleChant} />)

    const playBtn = screen.getByRole('button', { name: /phát nhịp điệu/i })
    fireEvent.click(playBtn)

    expect(screen.getByRole('button', { name: /tạm dừng/i })).toBeInTheDocument()

    // Tap rhythm
    const tapBtn = screen.getByRole('button', { name: /vỗ tay gõ nhịp điệu/i })
    fireEvent.click(tapBtn)

    // Combo should increment
    expect(screen.getByText(/Combo: 1x/i)).toBeInTheDocument()
  })

  it('advances beats and shows completion modal when reaching totalBeats', () => {
    const onCompleteMock = vi.fn()
    render(<KaraokeChantStudio chant={sampleChant} onCompletePerformance={onCompleteMock} />)

    const playBtn = screen.getByRole('button', { name: /phát nhịp điệu/i })
    fireEvent.click(playBtn)

    // Advance timers across all beats
    act(() => {
      vi.advanceTimersByTime(20000)
    })

    expect(screen.getByRole('dialog', { name: /chúc mừng hoàn thành bài vè/i })).toBeInTheDocument()
    expect(onCompleteMock).toHaveBeenCalled()
  })

  it('satisfies strict kid-friendly typography policy (zero text-xs, text-sm)', () => {
    const { container } = render(<KaraokeChantStudio chant={sampleChant} />)
    const html = container.innerHTML

    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
    expect(html).not.toContain('text-[10px]')
    expect(html).not.toContain('text-[12px]')
    expect(html).not.toContain('text-[14px]')
  })
})
