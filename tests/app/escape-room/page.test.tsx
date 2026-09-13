// tests/app/escape-room/page.test.tsx

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PhonicsEscapeRoomPage, { metadata } from '@/app/escape-room/page'
import EscapeRoomDetailPage, {
  generateStaticParams,
  generateMetadata,
} from '@/app/escape-room/[roomId]/page'

// Mock next/navigation
const mockNotFound = vi.fn()
vi.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound()
    throw new Error('NEXT_NOT_FOUND')
  },
}))

// Mock speech
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
    playChime: vi.fn(),
    playKick: vi.fn(),
    playSnare: vi.fn(),
    playWoodblock: vi.fn(),
    close: vi.fn().mockResolvedValue(undefined),
  }),
}))

describe('Phonics Escape Room Page Routes', () => {
  describe('Hub Page (/escape-room)', () => {
    it('has valid metadata', () => {
      expect(metadata.title).toContain('Phòng Thoát Hiểm Bí Mật')
      expect(metadata.description).toBeDefined()
    })

    it('renders PhonicsEscapeRoomHub with all 3 rooms', () => {
      render(<PhonicsEscapeRoomPage />)
      expect(screen.getByText('Phòng Thoát Hiểm Bí Mật 🗝️')).toBeInTheDocument()
      expect(screen.getByText('Lăng Mộ Pharaoh Bí Ẩn')).toBeInTheDocument()
      expect(screen.getByText('Thư Viện Ma Thuật Đêm Khuya')).toBeInTheDocument()
      expect(screen.getByText('Trạm Không Gian Bị Khóa')).toBeInTheDocument()
    })
  })

  describe('Dynamic Room Page (/escape-room/[roomId])', () => {
    it('generates static params for all 3 curated rooms', async () => {
      const params = await generateStaticParams()
      expect(params).toEqual([
        { roomId: 'pharaoh-tomb' },
        { roomId: 'haunted-library' },
        { roomId: 'space-station' },
      ])
    })

    it('generates correct metadata for an existing room', async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ roomId: 'pharaoh-tomb' }),
      })
      expect(meta.title).toContain('Lăng Mộ Pharaoh Bí Ẩn')
      expect(meta.description).toContain('lăng mộ cổ đại')
    })

    it('generates fallback metadata for unknown room', async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ roomId: 'unknown-room' }),
      })
      expect(meta.title).toBe('Không tìm thấy phòng thoát hiểm | GameHub')
    })

    it('renders player component for valid room', async () => {
      const PageComponent = await EscapeRoomDetailPage({
        params: Promise.resolve({ roomId: 'pharaoh-tomb' }),
      })
      render(PageComponent)

      expect(screen.getByText('Lăng Mộ Pharaoh Bí Ẩn')).toBeInTheDocument()
      expect(screen.getByText('CỬA THOÁT HIỂM')).toBeInTheDocument()
    })

    it('invokes notFound() when room is not found', async () => {
      await expect(
        EscapeRoomDetailPage({
          params: Promise.resolve({ roomId: 'non-existent' }),
        })
      ).rejects.toThrow('NEXT_NOT_FOUND')

      expect(mockNotFound).toHaveBeenCalled()
    })
  })
})
