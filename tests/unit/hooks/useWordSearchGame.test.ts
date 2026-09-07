// tests/unit/hooks/useWordSearchGame.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWordSearchGame } from '@/hooks/useWordSearchGame'
import type { Word } from '@/types'

const mockWords: Word[] = [
  { id: '1', english: 'Cat', phonetic: '/kæt/', vietnamese: 'Con mèo', emoji: '🐱', topicId: 'animals' },
  { id: '2', english: 'Dog', phonetic: '/dɒɡ/', vietnamese: 'Con chó', emoji: '🐶', topicId: 'animals' },
  { id: '3', english: 'Bird', phonetic: '/bɜːd/', vietnamese: 'Con chim', emoji: '🐦', topicId: 'animals' },
  { id: '4', english: 'Duck', phonetic: '/dʌk/', vietnamese: 'Con vịt', emoji: '🦆', topicId: 'animals' },
  { id: '5', english: 'Fish', phonetic: '/fɪʃ/', vietnamese: 'Con cá', emoji: '🐟', topicId: 'animals' },
]

describe('useWordSearchGame hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with 8x8 grid and target words', () => {
    const { result } = renderHook(() =>
      useWordSearchGame({ words: mockWords, wordCount: 5, topicId: 'animals' })
    )

    expect(result.current.grid).toHaveLength(8)
    expect(result.current.grid[0]).toHaveLength(8)
    expect(result.current.targetWords.length).toBeGreaterThanOrEqual(1)
    expect(result.current.status).toBe('idle')
    expect(result.current.hintCount).toBe(0)
    expect(result.current.elapsedSeconds).toBe(0)
  })

  it('highlights cells during pointer drag along horizontal line', () => {
    const { result } = renderHook(() =>
      useWordSearchGame({ words: mockWords, wordCount: 5, topicId: 'animals' })
    )

    act(() => {
      result.current.handleCellPointerDown(2, 1)
    })
    expect(result.current.selectedCoordinates).toEqual([{ row: 2, col: 1 }])

    act(() => {
      result.current.handleCellPointerEnter(2, 3)
    })
    expect(result.current.selectedCoordinates).toEqual([
      { row: 2, col: 1 },
      { row: 2, col: 2 },
      { row: 2, col: 3 },
    ])

    act(() => {
      result.current.handleCellPointerUp()
    })
    // Selection cleared after evaluation
    expect(result.current.selectedCoordinates).toEqual([])
  })

  it('matches a word and marks it as found when selecting exact coordinates', () => {
    const onWordFound = vi.fn()
    const { result } = renderHook(() =>
      useWordSearchGame({
        words: mockWords,
        wordCount: 5,
        topicId: 'animals',
        onWordFound,
      })
    )

    const target = result.current.targetWords[0]
    expect(target.isFound).toBe(false)

    // Simulate drag over the target's coordinates
    act(() => {
      const first = target.coordinates[0]
      const last = target.coordinates[target.coordinates.length - 1]
      result.current.handleCellPointerDown(first.row, first.col)
      result.current.handleCellPointerEnter(last.row, last.col)
      result.current.handleCellPointerUp()
    })

    expect(result.current.targetWords[0].isFound).toBe(true)
    expect(onWordFound).toHaveBeenCalledWith(
      expect.objectContaining({ english: target.english })
    )

    // Check cells have target color in matchedColors
    for (const coord of target.coordinates) {
      expect(result.current.grid[coord.row][coord.col].matchedColors).toContain(target.color)
    }
  })

  it('supports two-tap selection', () => {
    const { result } = renderHook(() =>
      useWordSearchGame({ words: mockWords, wordCount: 5, topicId: 'animals' })
    )

    const target = result.current.targetWords[0]
    const first = target.coordinates[0]
    const last = target.coordinates[target.coordinates.length - 1]

    // First tap
    act(() => {
      result.current.handleCellClick(first.row, first.col)
    })
    expect(result.current.selectedCoordinates).toEqual([first])

    // Second tap
    act(() => {
      result.current.handleCellClick(last.row, last.col)
    })

    expect(result.current.targetWords[0].isFound).toBe(true)
  })

  it('provides hint by pulsing the starting cell of an unfound word and tracks hint count', () => {
    const { result } = renderHook(() =>
      useWordSearchGame({ words: mockWords, wordCount: 5, topicId: 'animals' })
    )

    expect(result.current.hintCount).toBe(0)
    expect(result.current.hintedCoordinate).toBeNull()

    act(() => {
      result.current.useHint()
    })

    expect(result.current.hintCount).toBe(1)
    const firstUnfound = result.current.targetWords.find((w) => !w.isFound)
    expect(result.current.hintedCoordinate).toEqual(firstUnfound?.coordinates[0])

    // After hint duration (2500ms), hint clears
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(result.current.hintedCoordinate).toBeNull()
  })

  it('calculates star rating correctly based on hints: 0 hints = 3, 1 hint = 2, >=2 hints = 1', () => {
    const { result } = renderHook(() =>
      useWordSearchGame({ words: mockWords, wordCount: 4, topicId: 'animals' })
    )

    // With 0 hints
    expect(result.current.calculateStars(0)).toBe(3)
    // With 1 hint
    expect(result.current.calculateStars(1)).toBe(2)
    // With 2 or more hints
    expect(result.current.calculateStars(2)).toBe(1)
    expect(result.current.calculateStars(5)).toBe(1)
  })

  it('triggers onGameComplete with full progress tracking payload when all words are found', () => {
    const onGameComplete = vi.fn()
    const { result } = renderHook(() =>
      useWordSearchGame({
        words: mockWords.slice(0, 4),
        wordCount: 4,
        topicId: 'animals',
        onGameComplete,
      })
    )

    // Find all target words
    const targets = result.current.targetWords
    targets.forEach((target) => {
      act(() => {
        const first = target.coordinates[0]
        const last = target.coordinates[target.coordinates.length - 1]
        result.current.handleCellPointerDown(first.row, first.col)
        result.current.handleCellPointerEnter(last.row, last.col)
        result.current.handleCellPointerUp()
      })
    })

    expect(result.current.isCompleted).toBe(true)
    expect(onGameComplete).toHaveBeenCalledWith({
      wordsFound: targets.length,
      totalWords: targets.length,
      elapsedSeconds: expect.any(Number),
      hintsUsed: 0,
      stars: 3,
    })
  })
})
