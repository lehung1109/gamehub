// tests/components/escape-room/EscapeRoomPlayer.test.tsx

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EscapeRoomPlayer } from '@/components/escape-room/EscapeRoomPlayer'
import { EscapeClueModal } from '@/components/escape-room/EscapeClueModal'
import { EscapeCipherKeypad } from '@/components/escape-room/EscapeCipherKeypad'
import { EscapeCertificateModal } from '@/components/escape-room/EscapeCertificateModal'
import { PhonicsEscapeRoomHub } from '@/components/escape-room/PhonicsEscapeRoomHub'
import { ESCAPE_ROOMS } from '@/data/escape-room/rooms'
import type { EscapeRoom, EscapeResult } from '@/types/phonics-escape-room'

// Mock useSpeech
const mockSpeak = vi.fn()
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

// Mock rhythm synthesizer
const mockPlayChime = vi.fn()
const mockPlayKick = vi.fn()
const mockClose = vi.fn().mockResolvedValue(undefined)
vi.mock('@/lib/rhythm-beat-synthesizer', () => ({
  createRhythmSynthesizer: () => ({
    playChime: mockPlayChime,
    playKick: mockPlayKick,
    playSnare: vi.fn(),
    playWoodblock: vi.fn(),
    close: mockClose,
  }),
}))

// Mock server actions
vi.mock('@/app/actions/phonics-escape-room', () => ({
  submitEscapeScoreAction: vi.fn().mockResolvedValue({
    success: true,
    data: { keysEarned: 3, expAwarded: 230, isEscaped: true },
  }),
}))

describe('Phonics Mystery Escape Room Components', () => {
  const sampleRoom: EscapeRoom = ESCAPE_ROOMS[0] // pharaoh-tomb

  beforeEach(() => {
    vi.useFakeTimers()
    mockSpeak.mockClear()
    mockPlayChime.mockClear()
    mockPlayKick.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('EscapeRoomPlayer', () => {
    it('renders room title, timer, hot-spots and master escape door', () => {
      render(<EscapeRoomPlayer room={sampleRoom} />)

      expect(screen.getByText('Lăng Mộ Pharaoh Bí Ẩn')).toBeInTheDocument()
      expect(screen.getByText(/Thời Gian:/i)).toBeInTheDocument()
      expect(screen.getByText('CỬA THOÁT HIỂM')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /khám phá manh mối bức họa cổ đại/i })).toBeInTheDocument()
    })

    it('opens clue modal when clicking a hotspot, solves riddle, and collects cipher char', () => {
      render(<EscapeRoomPlayer room={sampleRoom} />)

      const hsBtn = screen.getByRole('button', { name: /khám phá manh mối bức họa cổ đại/i })
      fireEvent.click(hsBtn)

      // Modal should open
      expect(
        screen.getByRole('dialog', { name: /khám phá manh mối thám tử/i })
      ).toBeInTheDocument()

      // Click correct option SHELL
      const shellBtn = screen.getByRole('button', { name: /shell/i })
      fireEvent.click(shellBtn)

      expect(mockPlayChime).toHaveBeenCalled()
      expect(screen.getByText(/Ký tự bí mật nhận được:/i)).toBeInTheDocument()

      // Advance timer for modal close
      act(() => {
        vi.advanceTimersByTime(1500)
      })

      // Clue count should update to 1/4
      expect(screen.getByText('1/4')).toBeInTheDocument()
    })

    it('opens keypad, accepts correct word SHIP, and displays certificate modal', () => {
      const onComplete = vi.fn()
      render(<EscapeRoomPlayer room={sampleRoom} onCompleteEscape={onComplete} />)

      // Open Keypad via Vault Door
      const doorBtn = screen.getByRole('button', { name: /mở ổ khóa mật mã cửa chính/i })
      fireEvent.click(doorBtn)

      expect(
        screen.getByRole('dialog', { name: /ổ khóa mật mã cửa thoát hiểm/i })
      ).toBeInTheDocument()

      // Type S - H - I - P
      fireEvent.click(screen.getByRole('button', { name: 'Ký tự S' }))
      fireEvent.click(screen.getByRole('button', { name: 'Ký tự H' }))
      fireEvent.click(screen.getByRole('button', { name: 'Ký tự I' }))
      fireEvent.click(screen.getByRole('button', { name: 'Ký tự P' }))

      expect(mockPlayChime).toHaveBeenCalled()
      expect(screen.getByText(/MẬT MÃ CHÍNH XÁC/i)).toBeInTheDocument()

      // Advance timer for unlock transition
      act(() => {
        vi.advanceTimersByTime(1600)
      })

      // Certificate modal should appear
      expect(
        screen.getByRole('dialog', { name: /chứng chỉ thám tử thoát hiểm xuất sắc/i })
      ).toBeInTheDocument()
      expect(screen.getByText('THOÁT HIỂM THÀNH CÔNG!')).toBeInTheDocument()
      expect(onComplete).toHaveBeenCalled()
    })

    it('toggles pause and resume timer', () => {
      render(<EscapeRoomPlayer room={sampleRoom} />)

      const pauseBtn = screen.getByRole('button', { name: /tạm dừng đếm giờ/i })
      fireEvent.click(pauseBtn)

      expect(screen.getByRole('button', { name: /tiếp tục đếm giờ/i })).toBeInTheDocument()
    })
  })

  describe('EscapeClueModal', () => {
    it('plays kick sound on wrong choice', () => {
      const onSolve = vi.fn()
      const onClose = vi.fn()
      render(
        <EscapeClueModal
          hotspot={sampleRoom.hotspots[0]}
          isSolved={false}
          onSolveClue={onSolve}
          onClose={onClose}
        />
      )

      // Click wrong option BELL
      const wrongBtn = screen.getByRole('button', { name: /bell/i })
      fireEvent.click(wrongBtn)

      expect(mockPlayKick).toHaveBeenCalled()
      expect(screen.getByText(/Chưa đúng rồi/i)).toBeInTheDocument()
    })
  })

  describe('EscapeCipherKeypad', () => {
    it('handles backspace correctly', () => {
      render(
        <EscapeCipherKeypad
          masterCipherWord="SHIP"
          cipherHintVi="Phương tiện vượt sông Nile"
          unlockedChars={new Set(['S', 'H'])}
          onUnlockSuccess={vi.fn()}
          onClose={vi.fn()}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Ký tự S' }))
      const deleteBtn = screen.getByRole('button', { name: /xóa ký tự vừa nhập/i })
      fireEvent.click(deleteBtn)

      // Slot should be cleared
      expect(screen.getByTestId('cipher-display-slot-0')).toHaveTextContent('')
    })
  })

  describe('EscapeCertificateModal', () => {
    const mockResult: EscapeResult = {
      roomId: 'pharaoh-tomb',
      keysEarned: 3,
      cluesSolved: 4,
      totalClues: 4,
      timeSpentSeconds: 140,
      isEscaped: true,
      expEarned: 230,
      completedAt: new Date().toISOString(),
    }

    it('renders certificate details and invokes replay', () => {
      const onReplay = vi.fn()
      render(
        <EscapeCertificateModal
          roomTitle="Lăng Mộ Pharaoh Bí Ẩn"
          result={mockResult}
          onReplay={onReplay}
        />
      )

      expect(screen.getByText('CHỨNG NHẬN THÁM TỬ XUẤT SẮC')).toBeInTheDocument()
      expect(screen.getByText('02:20')).toBeInTheDocument()
      expect(screen.getByText('4/4')).toBeInTheDocument()
      expect(screen.getByText('+230 XP')).toBeInTheDocument()

      const replayBtn = screen.getByRole('button', { name: /thử lại phòng/i })
      fireEvent.click(replayBtn)
      expect(onReplay).toHaveBeenCalledTimes(1)
    })
  })

  describe('PhonicsEscapeRoomHub', () => {
    it('renders hero title and all 3 room cards', () => {
      render(<PhonicsEscapeRoomHub rooms={ESCAPE_ROOMS} />)

      expect(screen.getByText('Phòng Thoát Hiểm Bí Mật 🗝️')).toBeInTheDocument()
      expect(screen.getByText('Lăng Mộ Pharaoh Bí Ẩn')).toBeInTheDocument()
      expect(screen.getByText('Thư Viện Ma Thuật Đêm Khuya')).toBeInTheDocument()
      expect(screen.getByText('Trạm Không Gian Bị Khóa')).toBeInTheDocument()
    })

    it('filters rooms by difficulty correctly', () => {
      render(<PhonicsEscapeRoomHub rooms={ESCAPE_ROOMS} />)

      // Click "Thám Tử (Vowel Teams)"
      const intermediateBtn = screen.getByRole('button', {
        name: /Thám Tử \(Vowel Teams\)/i,
      })
      fireEvent.click(intermediateBtn)

      expect(screen.getByText('Thư Viện Ma Thuật Đêm Khuya')).toBeInTheDocument()
      expect(screen.queryByText('Lăng Mộ Pharaoh Bí Ẩn')).not.toBeInTheDocument()
      expect(screen.queryByText('Trạm Không Gian Bị Khóa')).not.toBeInTheDocument()
    })
  })
})
