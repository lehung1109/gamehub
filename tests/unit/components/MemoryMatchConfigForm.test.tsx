import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryMatchConfigForm } from '@/components/config/MemoryMatchConfigForm'
import type { MemoryMatchSettings } from '@/types/config'

describe('MemoryMatchConfigForm (TDD)', () => {
  const defaultSettings: MemoryMatchSettings = {
    topics: ['animals'],
    pairCount: 6,
    autoSpeak: true,
    showTimer: true,
  }

  it('renders all configuration fields: topics, pairCount options, autoSpeak and showTimer', () => {
    const onChange = vi.fn()
    render(<MemoryMatchConfigForm settings={defaultSettings} onChange={onChange} />)

    // Topic section
    expect(screen.getByText(/chủ đề từ vựng/i)).toBeInTheDocument()
    // Pair count options (4, 6, 8)
    expect(screen.getByLabelText(/4 cặp/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/6 cặp/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/8 cặp/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/6 cặp/i)).toBeChecked()

    // AutoSpeak toggle
    expect(screen.getByLabelText(/tự động phát âm/i)).toBeChecked()

    // ShowTimer toggle
    expect(screen.getByLabelText(/hiển thị đồng hồ/i)).toBeChecked()
  })

  it('handles topic selection toggling', () => {
    const onChange = vi.fn()
    render(<MemoryMatchConfigForm settings={defaultSettings} onChange={onChange} />)

    // Topic 'animals' is currently checked
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
    const fruitsCheckbox = screen.getByRole('checkbox', { name: /trái cây/i })
    fireEvent.click(fruitsCheckbox)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        topics: ['animals', 'fruits'],
      })
    )
  })

  it('handles pairCount changes (4, 6, 8)', () => {
    const onChange = vi.fn()
    render(<MemoryMatchConfigForm settings={defaultSettings} onChange={onChange} />)

    const radio4 = screen.getByLabelText(/4 cặp/i)
    fireEvent.click(radio4)

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        pairCount: 4,
      })
    )

    const radio8 = screen.getByLabelText(/8 cặp/i)
    fireEvent.click(radio8)

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        pairCount: 8,
      })
    )
  })

  it('handles autoSpeak and showTimer toggles', () => {
    const onChange = vi.fn()
    render(<MemoryMatchConfigForm settings={defaultSettings} onChange={onChange} />)

    const autoSpeakCheckbox = screen.getByLabelText(/tự động phát âm/i)
    fireEvent.click(autoSpeakCheckbox)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        autoSpeak: false,
      })
    )

    const timerCheckbox = screen.getByLabelText(/hiển thị đồng hồ/i)
    fireEvent.click(timerCheckbox)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        showTimer: false,
      })
    )
  })

  it('disables all inputs when disabled prop is true', () => {
    const onChange = vi.fn()
    render(<MemoryMatchConfigForm settings={defaultSettings} onChange={onChange} disabled />)

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((cb) => {
      expect(cb).toBeDisabled()
    })

    const radios = screen.getAllByRole('radio')
    radios.forEach((r) => {
      expect(r).toBeDisabled()
    })
  })
})
