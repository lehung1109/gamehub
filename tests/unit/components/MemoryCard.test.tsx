import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryCard } from '@/components/game/MemoryCard'
import type { MemoryCard as MemoryCardType } from '@/types/memory-match'

describe('MemoryCard component (TDD)', () => {
  const baseCard: MemoryCardType = {
    id: 'card-1',
    wordId: 'cat',
    type: 'word',
    content: 'Cat',
    english: 'Cat',
    phonetic: '/kæt/',
    vietnamese: 'Con mèo',
    isFlipped: false,
    isMatched: false,
  }

  it('renders face-down state by default with accessible label', () => {
    const onClick = vi.fn()
    render(<MemoryCard card={baseCard} onClick={onClick} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Thẻ úp')
    // English word should not be visible when face-down
    expect(screen.queryByText('Cat')).not.toBeInTheDocument()
  })

  it('renders face-up state when isFlipped is true and displays content', () => {
    const flippedCard: MemoryCardType = {
      ...baseCard,
      isFlipped: true,
    }
    render(<MemoryCard card={flippedCard} onClick={vi.fn()} />)

    expect(screen.getByText('Cat')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Thẻ chữ: Cat')
  })

  it('renders emoji face-up state correctly', () => {
    const emojiCard: MemoryCardType = {
      ...baseCard,
      type: 'emoji',
      content: '🐱',
      isFlipped: true,
    }
    render(<MemoryCard card={emojiCard} onClick={vi.fn()} />)

    expect(screen.getByText('🐱')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Thẻ hình ảnh: Cat')
  })

  it('calls onClick when clicked in interactive state', () => {
    const onClick = vi.fn()
    render(<MemoryCard card={baseCard} onClick={onClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not trigger onClick when disabled', () => {
    const onClick = vi.fn()
    render(<MemoryCard card={baseCard} onClick={onClick} disabled={true} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('indicates matched status visually when isMatched is true', () => {
    const matchedCard: MemoryCardType = {
      ...baseCard,
      isFlipped: true,
      isMatched: true,
    }
    render(<MemoryCard card={matchedCard} onClick={vi.fn()} />)

    const button = screen.getByRole('button')
    expect(button.className).toMatch(/emerald|border-emerald|bg-emerald|green/i)
  })
})
