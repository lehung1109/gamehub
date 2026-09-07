// src/hooks/useWordSearchGame.ts
import { useState, useEffect, useRef, useCallback } from 'react'
import type { Word } from '@/types'
import type {
  Coordinate,
  WordSearchCell,
  WordSearchTargetWord,
} from '@/types/word-search'
import {
  generateWordSearchGrid,
  getCellsBetween,
  isValidSelectionPath,
} from '@/lib/word-search-generator'

export interface UseWordSearchGameOptions {
  words: Word[]
  wordCount?: 4 | 5 | 6
  topicId?: string
  enableHints?: boolean
  autoSpeak?: boolean
  showTimer?: boolean
  onWordFound?: (word: WordSearchTargetWord) => void
  onGameComplete?: (results: {
    wordsFound: number
    totalWords: number
    elapsedSeconds: number
    hintsUsed: number
    stars: 1 | 2 | 3
  }) => void
}

export function calculateWordSearchStars(hintCount: number): 1 | 2 | 3 {
  if (hintCount === 0) return 3
  if (hintCount === 1) return 2
  return 1
}

export function useWordSearchGame({
  words,
  wordCount = 5,
  onWordFound,
  onGameComplete,
}: UseWordSearchGameOptions) {
  const [grid, setGrid] = useState<WordSearchCell[][]>(() => {
    const { grid: initialGrid } = generateWordSearchGrid(words, {
      wordCount,
      gridSize: 8,
    })
    return initialGrid
  })
  const [targetWords, setTargetWords] = useState<WordSearchTargetWord[]>(() => {
    const { targetWords: initialTargets } = generateWordSearchGrid(words, {
      wordCount,
      gridSize: 8,
    })
    return initialTargets
  })
  const [status, setStatus] = useState<'idle' | 'playing' | 'completed'>('idle')
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinate[]>([])
  const [startCoordinate, setStartCoordinate] = useState<Coordinate | null>(null)
  const [hintedCoordinate, setHintedCoordinate] = useState<Coordinate | null>(null)
  const [hintCount, setHintCount] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const isDraggingRef = useRef(false)
  const startCoordinateRef = useRef<Coordinate | null>(null)
  const selectedCoordinatesRef = useRef<Coordinate[]>([])
  const targetWordsRef = useRef<WordSearchTargetWord[]>(targetWords)
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    targetWordsRef.current = targetWords
  }, [targetWords])

  // Initialize or reset game round
  const restartGame = useCallback(
    (customWords?: Word[]) => {
      const activeWordList = customWords || words
      const { grid: newGrid, targetWords: newTargets } = generateWordSearchGrid(
        activeWordList,
        { wordCount, gridSize: 8 }
      )
      setGrid(newGrid)
      setTargetWords(newTargets)
      targetWordsRef.current = newTargets
      setStatus('idle')
      setSelectedCoordinates([])
      setStartCoordinate(null)
      startCoordinateRef.current = null
      selectedCoordinatesRef.current = []
      setHintedCoordinate(null)
      setHintCount(0)
      setElapsedSeconds(0)
      isDraggingRef.current = false
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
      }
    },
    [words, wordCount]
  )

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
      }
    }
  }, [])

  // Stopwatch timer
  useEffect(() => {
    if (status !== 'playing') return
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [status])

  // Check if selected coordinate sequence matches any target word
  const evaluateSelection = useCallback(
    (coords: Coordinate[]) => {
      if (coords.length === 0) return

      let matchedWord: WordSearchTargetWord | null = null
      const currentTargets = targetWordsRef.current

      for (const target of currentTargets) {
        if (target.isFound) continue
        if (target.coordinates.length !== coords.length) continue

        const isExactMatch = target.coordinates.every(
          (c, idx) => c.row === coords[idx].row && c.col === coords[idx].col
        )

        if (isExactMatch) {
          matchedWord = target
          break
        }
      }

      if (matchedWord) {
        const foundWord = matchedWord
        // Update target words state
        const updatedTargets = currentTargets.map((tw) =>
          tw.id === foundWord.id ? { ...tw, isFound: true } : tw
        )
        setTargetWords(updatedTargets)
        targetWordsRef.current = updatedTargets

        // Update grid cells with matched color
        setGrid((prevGrid) =>
          prevGrid.map((row) =>
            row.map((cell) => {
              const isCellInMatchedWord = foundWord.coordinates.some(
                (c) => c.row === cell.row && c.col === cell.col
              )
              if (isCellInMatchedWord) {
                return {
                  ...cell,
                  matchedColors: cell.matchedColors.includes(foundWord.color)
                    ? cell.matchedColors
                    : [...cell.matchedColors, foundWord.color],
                }
              }
              return cell
            })
          )
        )

        onWordFound?.(foundWord)

        // Check if all words found
        const remainingUnfound = updatedTargets.filter((tw) => !tw.isFound)
        if (remainingUnfound.length === 0) {
          setStatus('completed')
          const stars = calculateWordSearchStars(hintCount)
          onGameComplete?.({
            wordsFound: updatedTargets.length,
            totalWords: updatedTargets.length,
            elapsedSeconds,
            hintsUsed: hintCount,
            stars,
          })
        }
      }
    },
    [onWordFound, onGameComplete, hintCount, elapsedSeconds]
  )

  // Pointer drag event handlers
  const handleCellPointerDown = useCallback((row: number, col: number) => {
    isDraggingRef.current = true
    setStatus((prev) => (prev === 'idle' ? 'playing' : prev))
    const start = { row, col }
    startCoordinateRef.current = start
    selectedCoordinatesRef.current = [start]
    setStartCoordinate(start)
    setSelectedCoordinates([start])
  }, [])

  const handleCellPointerEnter = useCallback(
    (row: number, col: number) => {
      if (!isDraggingRef.current || !startCoordinateRef.current) return
      if (isValidSelectionPath(startCoordinateRef.current, { row, col })) {
        const path = getCellsBetween(startCoordinateRef.current, { row, col })
        selectedCoordinatesRef.current = path
        setSelectedCoordinates(path)
      }
    },
    []
  )

  const handleCellPointerUp = useCallback(() => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    const coordsToEvaluate = selectedCoordinatesRef.current
    evaluateSelection(coordsToEvaluate)
    startCoordinateRef.current = null
    selectedCoordinatesRef.current = []
    setSelectedCoordinates([])
    setStartCoordinate(null)
  }, [evaluateSelection])

  // Two-tap click handler
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      setStatus((prev) => (prev === 'idle' ? 'playing' : prev))

      if (!startCoordinateRef.current) {
        // First tap
        const start = { row, col }
        startCoordinateRef.current = start
        selectedCoordinatesRef.current = [start]
        setStartCoordinate(start)
        setSelectedCoordinates([start])
      } else {
        // Second tap
        const endCoord = { row, col }
        if (isValidSelectionPath(startCoordinateRef.current, endCoord)) {
          const path = getCellsBetween(startCoordinateRef.current, endCoord)
          evaluateSelection(path)
        }
        startCoordinateRef.current = null
        selectedCoordinatesRef.current = []
        setStartCoordinate(null)
        setSelectedCoordinates([])
      }
    },
    [evaluateSelection]
  )

  // Hint action
  const useHint = useCallback(() => {
    const firstUnfound = targetWords.find((w) => !w.isFound)
    if (!firstUnfound || firstUnfound.coordinates.length === 0) return null

    const startCoord = firstUnfound.coordinates[0]
    setHintCount((prev) => prev + 1)
    setHintedCoordinate(startCoord)

    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current)
    }

    hintTimeoutRef.current = setTimeout(() => {
      setHintedCoordinate(null)
    }, 2500)

    return startCoord
  }, [targetWords])

  const foundCount = targetWords.filter((w) => w.isFound).length
  const remainingCount = targetWords.length - foundCount
  const isCompleted = status === 'completed' || (targetWords.length > 0 && remainingCount === 0)
  const stars = calculateWordSearchStars(hintCount)

  return {
    grid,
    targetWords,
    status,
    selectedCoordinates,
    startCoordinate,
    hintedCoordinate,
    hintCount,
    elapsedSeconds,
    stars,
    foundCount,
    remainingCount,
    isCompleted,
    handleCellPointerDown,
    handleCellPointerEnter,
    handleCellPointerUp,
    handleCellClick,
    useHint,
    calculateStars: calculateWordSearchStars,
    restartGame,
  }
}
