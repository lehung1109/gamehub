import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickVoiceSwitcher } from '@/components/speech/QuickVoiceSwitcher'
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister'

describe('Layout & QuickVoiceSwitcher Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()

    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        getVoices: vi.fn().mockReturnValue([]),
        speak: vi.fn(),
        cancel: vi.fn(),
      },
    })
  })

  describe('QuickVoiceSwitcher Component', () => {
    it('renders current voice accent flag and label', () => {
      render(<QuickVoiceSwitcher />)

      const button = screen.getByRole('button', { name: /voice accent|giọng đọc/i })
      expect(button).toBeDefined()
      // Default accent US flag
      expect(screen.getByText('🇺🇸')).toBeDefined()
      expect(screen.getByText(/US|American/i)).toBeDefined()
    })

    it('opens SpeechSettingsModal when clicked', async () => {
      render(<QuickVoiceSwitcher />)

      const button = screen.getByRole('button', { name: /voice accent|giọng đọc/i })
      fireEvent.click(button)

      expect(screen.getByRole('dialog')).toBeDefined()
      expect(screen.getByText('Speech & Accent Settings')).toBeDefined()
    })

    it('complies strictly with kid-friendly typography (no text-xs, text-sm)', () => {
      const { container } = render(<QuickVoiceSwitcher />)
      const html = container.innerHTML

      expect(html).not.toContain('text-xs')
      expect(html).not.toContain('text-sm')
      expect(html).not.toContain('text-[10px]')
      expect(html).not.toContain('text-[12px]')
      expect(html).not.toContain('text-[14px]')
    })
  })

  describe('ServiceWorkerRegister Mounting', () => {
    it('renders PWA components without crashing', () => {
      const { container } = render(<ServiceWorkerRegister />)
      expect(container).toBeDefined()
    })
  })
})
