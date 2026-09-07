import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WordSearchConfigForm } from '@/components/config/WordSearchConfigForm'
import type { WordSearchSettings } from '@/types/config'

describe('WordSearchConfigForm', () => {
  const defaultSettings: WordSearchSettings = {
    topics: ['animals'],
    wordCount: 5,
    enableHints: true,
    autoSpeak: true,
    showTimer: true,
  }

  it('renders all configuration fields: topics, wordCount options, hints, autoSpeak and showTimer', () => {
    const onChange = vi.fn()
    render(<WordSearchConfigForm settings={defaultSettings} onChange={onChange} />)

    // Topic section
    expect(screen.getByText(/chủ đề từ vựng/i)).toBeInTheDocument()
    // Word count options (4, 5, 6)
    expect(screen.getByLabelText(/4 từ/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/5 từ/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/6 từ/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/5 từ/i)).toBeChecked()

    // EnableHints toggle
    expect(screen.getByLabelText(/bật tính năng gợi ý/i)).toBeChecked()

    // AutoSpeak toggle
    expect(screen.getByLabelText(/tự động phát âm/i)).toBeChecked()

    // ShowTimer toggle
    expect(screen.getByLabelText(/hiển thị đồng hồ/i)).toBeChecked()
  })

  it('handles topic selection toggling', () => {
    const onChange = vi.fn()
    render(<WordSearchConfigForm settings={defaultSettings} onChange={onChange} />)

    const animalsCheckbox = screen.getByRole('checkbox', { name: /động vật/i })
    expect(animalsCheckbox).toBeChecked()

    // Uncheck animals
    fireEvent.click(animalsCheckbox)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        topics: [],
      })
    )

    // Check fruits
    const fruitsCheckbox = screen.getByRole('checkbox', { name: /trái cây|hoa quả/i })
    fireEvent.click(fruitsCheckbox)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        topics: ['animals', 'fruits'],
      })
    )
  })

  it('handles wordCount selection changes', () => {
    const onChange = vi.fn()
    render(<WordSearchConfigForm settings={defaultSettings} onChange={onChange} />)

    const radio4 = screen.getByLabelText(/4 từ/i)
    fireEvent.click(radio4)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        wordCount: 4,
      })
    )

    const radio6 = screen.getByLabelText(/6 từ/i)
    fireEvent.click(radio6)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        wordCount: 6,
      })
    )
  })

  it('handles toggles for enableHints, autoSpeak, and showTimer', () => {
    const onChange = vi.fn()
    render(<WordSearchConfigForm settings={defaultSettings} onChange={onChange} />)

    const hintsToggle = screen.getByLabelText(/bật tính năng gợi ý/i)
    fireEvent.click(hintsToggle)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        enableHints: false,
      })
    )

    const autoSpeakToggle = screen.getByLabelText(/tự động phát âm/i)
    fireEvent.click(autoSpeakToggle)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        autoSpeak: false,
      })
    )

    const timerToggle = screen.getByLabelText(/hiển thị đồng hồ/i)
    fireEvent.click(timerToggle)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        showTimer: false,
      })
    )
  })
})
