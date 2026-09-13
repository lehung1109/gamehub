import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { useSpeech } from '@/hooks/useSpeech'
import { SpeechSettingsModal } from '@/components/speech/SpeechSettingsModal'
import { VoicePreviewButton } from '@/components/speech/VoicePreviewButton'
import { SPEECH_CONFIG_STORAGE_KEY } from '@/types/speech'

describe('Upgraded useSpeech & SpeechSettingsModal', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()

    // Mock window.speechSynthesis and SpeechSynthesisUtterance
    class MockUtterance {
      text: string
      lang = 'en-US'
      rate = 1
      pitch = 1
      voice: any = null
      onstart: (() => void) | null = null
      onend: (() => void) | null = null
      onerror: (() => void) | null = null
      constructor(text = '') {
        this.text = text
      }
    }
    // @ts-expect-error Mocking window.SpeechSynthesisUtterance
    window.SpeechSynthesisUtterance = MockUtterance

    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        getVoices: vi.fn().mockReturnValue([
          {
            name: 'Google US English Natural',
            lang: 'en-US',
            default: true,
            localService: false,
            voiceURI: 'google-us-neural',
          },
          {
            name: 'Microsoft George - English (United Kingdom)',
            lang: 'en-GB',
            default: false,
            localService: true,
            voiceURI: 'ms-uk',
          },
          {
            name: 'Karen Australian Natural',
            lang: 'en-AU',
            default: false,
            localService: false,
            voiceURI: 'au-karen',
          },
        ]),
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    })
  })

  describe('useSpeech Hook', () => {
    it('initializes with default speech config and loads stored preferences', () => {
      const { result } = renderHook(() => useSpeech())

      expect(result.current.config.accent).toBe('US')
      expect(result.current.config.voiceStyle).toBe('kid')
      expect(result.current.isSupported).toBe(true)
      expect(result.current.availableVoices.length).toBeGreaterThanOrEqual(3)
    })

    it('updates accent and persists to localStorage', () => {
      const { result } = renderHook(() => useSpeech())

      act(() => {
        result.current.setAccent('UK')
      })

      expect(result.current.config.accent).toBe('UK')
      const stored = JSON.parse(localStorage.getItem(SPEECH_CONFIG_STORAGE_KEY) || '{}')
      expect(stored.accent).toBe('UK')
    })

    it('updates voice style and speed rate correctly', () => {
      const { result } = renderHook(() => useSpeech())

      act(() => {
        result.current.setVoiceStyle('natural')
      })

      expect(result.current.config.voiceStyle).toBe('natural')

      act(() => {
        result.current.updateConfig({ speedRate: 0.7 })
      })

      expect(result.current.config.speedRate).toBe(0.7)
    })
  })

  describe('VoicePreviewButton', () => {
    it('renders preview button and triggers speak callback when clicked', () => {
      const onPreview = vi.fn()
      render(<VoicePreviewButton onPreview={onPreview} />)

      const btn = screen.getByRole('button', { name: /preview|nghe thử/i })
      expect(btn).toBeDefined()

      fireEvent.click(btn)
      expect(onPreview).toHaveBeenCalledTimes(1)
    })
  })

  describe('SpeechSettingsModal', () => {
    it('renders modal with accents, styles, and close actions when open', () => {
      const onClose = vi.fn()
      render(
        <SpeechSettingsModal
          isOpen={true}
          onClose={onClose}
        />
      )

      expect(screen.getByRole('dialog')).toBeDefined()
      expect(screen.getByText(/Speech & Accent Settings/i)).toBeDefined()

      // Accents: US, UK, AU
      expect(screen.getByText('American English (US)')).toBeDefined()
      expect(screen.getByText('British English (UK)')).toBeDefined()
      expect(screen.getByText('Australian English (AU)')).toBeDefined()

      // Styles
      expect(screen.getByText('Friendly Kid')).toBeDefined()
      expect(screen.getByText('Natural English')).toBeDefined()

      // Close button
      const closeBtn = screen.getByRole('button', { name: /close settings/i })
      fireEvent.click(closeBtn)
      expect(onClose).toHaveBeenCalled()
    })

    it('complies strictly with kid-friendly typography (no text-xs, text-sm)', () => {
      const { container } = render(
        <SpeechSettingsModal
          isOpen={true}
          onClose={vi.fn()}
        />
      )

      const html = container.innerHTML
      expect(html).not.toContain('text-xs')
      expect(html).not.toContain('text-sm')
      expect(html).not.toContain('text-[10px]')
      expect(html).not.toContain('text-[12px]')
      expect(html).not.toContain('text-[14px]')
    })
  })
})
