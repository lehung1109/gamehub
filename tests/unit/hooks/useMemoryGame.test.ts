import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMemoryGame } from '@/hooks/useMemoryGame'
import type { Word } from '@/types'

const mockWords: Word[] = [
  { id: 'cat', english: 'Cat', phonetic: '/kæt/', vietnamese: 'Con mèo', emoji: '🐱', topicId: 'animals' },
  { id: 'dog', english: 'Dog', phonetic: '/dɒɡ/', vietnamese: 'Con chó', emoji: '🐶', topicId: 'animals' },
  { id: 'pig', english: 'Pig', phonetic: '/pɪɡ/', vietnamese: 'Con heo', emoji: '🐷', topicId: 'animals' },
  { id: 'duck', english: 'Duck', phonetic: '/dʌk/', vietnamese: 'Con vịt', emoji: '🦆', topicId: 'animals' },
  { id: 'bear', english: 'Bear', phonetic: '/beə/', vietnamese: 'Con gấu', emoji: '🐻', topicId: 'animals' },
  { id: 'lion', english: 'Lion', phonetic: '/ˈlaɪən/', vietnamese: 'Sư tử', emoji: '🦁', topicId: 'animals' },
  { id: 'tiger', english: 'Tiger', phonetic: '/ˈtaɪɡər/', vietnamese: 'Con hổ', emoji: '🐯', topicId: 'animals' },
  { id: 'rabbit', english: 'Rabbit', phonetic: '/ˈræbɪt/', vietnamese: 'Con thỏ', emoji: '🐰', topicId: 'animals' },
]

describe('useMemoryGame hook (TDD)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes deck with correct pair count and card distribution', () => {
    const { result } = renderHook(() =>
      useMemoryGame({ words: mockWords, pairCount: 6 })
    )

    expect(result.current.cards).toHaveLength(12)
    const emojiCards = result.current.cards.filter((c) => c.type === 'emoji')
    const wordCards = result.current.cards.filter((c) => c.type === 'word')
    expect(emojiCards).toHaveLength(6)
    expect(wordCards).toHaveLength(6)
    expect(result.current.flips).toBe(0)
    expect(result.current.isCompleted).toBe(false)
    expect(result.current.isLocked).toBe(false)
  })

  it('flips the first card and triggers speech if autoSpeak is enabled and card is a word', () => {
    const onSpeak = vi.fn()
    const { result } = renderHook(() =>
      useMemoryGame({ words: mockWords, pairCount: 4, autoSpeak: true, onSpeak })
    )

    const wordCardIndex = result.current.cards.findIndex((c) => c.type === 'word')
    act(() => {
      result.current.handleCardClick(wordCardIndex)
    })

    expect(result.current.cards[wordCardIndex].isFlipped).toBe(true)
    expect(result.current.flippedIndices).toEqual([wordCardIndex])
    expect(result.current.flips).toBe(0) // First card does not increment turns
    expect(onSpeak).toHaveBeenCalledWith(result.current.cards[wordCardIndex].english)
  })

  it('ignores clicks on already flipped card or invalid index', () => {
    const onSpeak = vi.fn()
    const { result } = renderHook(() =>
      useMemoryGame({ words: mockWords, pairCount: 4, onSpeak })
    )

    act(() => {
      result.current.handleCardClick(0)
    })
    expect(result.current.flippedIndices).toEqual([0])

    act(() => {
      result.current.handleCardClick(0) // click same card
    })
    expect(result.current.flippedIndices).toEqual([0])
    expect(result.current.flips).toBe(0)
  })

  it('handles matching pair: keeps cards flipped, sets matched, calls onSpeak and increments flips', () => {
    const onSpeak = vi.fn()
    const { result } = renderHook(() =>
      useMemoryGame({ words: mockWords, pairCount: 4, onSpeak })
    )

    // Find two cards with the same wordId
    const targetWordId = result.current.cards[0].wordId
    const firstIndex = 0
    const secondIndex = result.current.cards.findIndex((c, i) => i !== 0 && c.wordId === targetWordId)

    act(() => {
      result.current.handleCardClick(firstIndex)
    })
    act(() => {
      result.current.handleCardClick(secondIndex)
    })

    expect(result.current.cards[firstIndex].isMatched).toBe(true)
    expect(result.current.cards[secondIndex].isMatched).toBe(true)
    expect(result.current.cards[firstIndex].isFlipped).toBe(true)
    expect(result.current.cards[secondIndex].isFlipped).toBe(true)
    expect(result.current.matchedWordIds).toContain(targetWordId)
    expect(result.current.flips).toBe(1)
    expect(result.current.flippedIndices).toHaveLength(0)
  })

  it('handles mismatch: locks board, keeps open for 1000ms, then flips back', () => {
    const { result } = renderHook(() =>
      useMemoryGame({ words: mockWords, pairCount: 4 })
    )

    const firstIndex = 0
    const targetWordId = result.current.cards[0].wordId
    const mismatchIndex = result.current.cards.findIndex((c) => c.wordId !== targetWordId)

    act(() => {
      result.current.handleCardClick(firstIndex)
    })
    act(() => {
      result.current.handleCardClick(mismatchIndex)
    })

    expect(result.current.flips).toBe(1)
    expect(result.current.isLocked).toBe(true)
    expect(result.current.cards[firstIndex].isFlipped).toBe(true)
    expect(result.current.cards[mismatchIndex].isFlipped).toBe(true)

    // Clicking while locked should be ignored
    const thirdIndex = result.current.cards.findIndex((c, i) => i !== firstIndex && i !== mismatchIndex)
    act(() => {
      result.current.handleCardClick(thirdIndex)
    })
    expect(result.current.cards[thirdIndex].isFlipped).toBe(false)

    // Fast-forward 1000ms
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.isLocked).toBe(false)
    expect(result.current.cards[firstIndex].isFlipped).toBe(false)
    expect(result.current.cards[mismatchIndex].isFlipped).toBe(false)
    expect(result.current.flippedIndices).toHaveLength(0)
  })

  it('allows clicking an already matched card to replay audio without incrementing flips', () => {
    const onSpeak = vi.fn()
    const { result } = renderHook(() =>
      useMemoryGame({ words: mockWords, pairCount: 4, onSpeak })
    )

    const targetWordId = result.current.cards[0].wordId
    const firstIndex = 0
    const secondIndex = result.current.cards.findIndex((c, i) => i !== 0 && c.wordId === targetWordId)

    act(() => {
      result.current.handleCardClick(firstIndex)
      result.current.handleCardClick(secondIndex)
    })
    expect(result.current.flips).toBe(1)
    onSpeak.mockClear()

    // Click matched card again
    act(() => {
      result.current.handleCardClick(firstIndex)
    })

    expect(onSpeak).toHaveBeenCalledWith(result.current.cards[firstIndex].english)
    expect(result.current.flips).toBe(1) // Still 1!
    expect(result.current.cards[firstIndex].isMatched).toBe(true)
  })

  it('calculates proportional star rating correctly upon completion', () => {
    // For 4 pairs:
    // 3 stars: flips <= 4 + 2 = 6
    // 2 stars: flips 7 to 8
    // 1 star: flips > 8
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useMemoryGame({ words: mockWords.slice(0, 4), pairCount: 4, onComplete })
    )

    // Solve all 4 pairs
    const uniqueWordIds = Array.from(new Set(result.current.cards.map((c) => c.wordId)))
    uniqueWordIds.forEach((wordId) => {
      const pairIndices = result.current.cards
        .map((c, i) => (c.wordId === wordId ? i : -1))
        .filter((i) => i !== -1)
      act(() => {
        result.current.handleCardClick(pairIndices[0])
        result.current.handleCardClick(pairIndices[1])
      })
    })

    expect(result.current.isCompleted).toBe(true)
    expect(result.current.flips).toBe(4)
    expect(result.current.stars).toBe(3) // 4 <= 6
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        flips: 4,
        stars: 3,
      })
    )
  })
})
