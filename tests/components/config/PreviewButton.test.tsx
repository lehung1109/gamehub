// tests/components/config/PreviewButton.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PreviewButton } from '@/components/config/PreviewButton'
import type { FlashcardSettings, AlphabetSettings } from '@/types/config'

describe('PreviewButton Component', () => {
  let mockWindowOpen: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockWindowOpen = vi.fn()
    vi.stubGlobal('open', mockWindowOpen)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders button with label "Chơi thử" and type="button"', () => {
    const settings: FlashcardSettings = {
      topics: ['animals'],
      wordLimit: 5,
      autoSpeak: true,
    }
    render(<PreviewButton gameId="flashcard" settings={settings} />)

    const button = screen.getByRole('button', { name: /chơi thử/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
  })

  it('respects disabled prop', () => {
    const settings: FlashcardSettings = {
      topics: ['animals'],
      wordLimit: 5,
      autoSpeak: true,
    }
    render(<PreviewButton gameId="flashcard" settings={settings} disabled={true} />)

    const button = screen.getByRole('button', { name: /chơi thử/i })
    expect(button).toBeDisabled()

    fireEvent.click(button)
    expect(mockWindowOpen).not.toHaveBeenCalled()
  })

  it('opens preview game URL in new tab when clicked with valid settings', () => {
    const settings: AlphabetSettings = {
      letterRange: ['A', 'B', 'C'],
      mode: 'quiz',
      autoSpeak: false,
    }
    render(<PreviewButton gameId="alphabet" settings={settings} />)

    const button = screen.getByRole('button', { name: /chơi thử/i })
    fireEvent.click(button)

    expect(mockWindowOpen).toHaveBeenCalledTimes(1)
    const [openedUrl, target] = mockWindowOpen.mock.calls[0]
    expect(openedUrl).toMatch(/^\/games\/alphabet\?preview=[A-Za-z0-9_-]+$/)
    expect(target).toBe('_blank')
  })

  it('calls onError and does not open window if settings validation fails', () => {
    const onError = vi.fn()
    // Invalid settings (null or invalid type passed as any)
    render(
      <PreviewButton
        gameId={'invalid-game' as any}
        settings={null as any}
        onError={onError}
      />
    )

    const button = screen.getByRole('button', { name: /chơi thử/i })
    fireEvent.click(button)

    expect(mockWindowOpen).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(expect.any(String))
  })

  it('does not trigger parent form submission on click', () => {
    const handleFormSubmit = vi.fn((e) => e.preventDefault())
    const settings: FlashcardSettings = {
      topics: ['fruits'],
      wordLimit: 10,
      autoSpeak: false,
    }

    render(
      <form onSubmit={handleFormSubmit}>
        <PreviewButton gameId="flashcard" settings={settings} />
      </form>
    )

    const button = screen.getByRole('button', { name: /chơi thử/i })
    fireEvent.click(button)

    expect(mockWindowOpen).toHaveBeenCalled()
    expect(handleFormSubmit).not.toHaveBeenCalled()
  })
})
