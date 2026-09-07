// src/hooks/useWordSearchGame.ts
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { Word } from '@/types'
import type {
  Coordinate,
  WordSearchTargetWord,
} from '@/types/word-search'
import {
  generateWordSearchGrid,
  getCellsBetween,
  isValidSelectionPath,
  hashString,
  type WordSearchGridResult,
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
  topicId,
  onWordFound,
  onGameComplete,
}: UseWordSearchGameOptions) {
  const [{ grid, targetWords }, setPuzzleState] = useState<WordSearchGridResult>(
    () => {
      const initialSeed = hashString(
        `${topicId || 'default'}-${wordCount}-${words[0]?.id || ''}`
      )
      return generateWordSearchGrid(words, {
        wordCount,
        gridSize: 8,
        seed: initialSeed,
      })
    }
  )
  const [status, setStatus] = useState<'idle' | 'playing' | 'completed'>('idle')
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinate[]>([])
  const [startCoordinate, setStartCoordinate] = useState<Coordinate | null>(null)
  const [hintedCoordinate, setHintedCoordinate] = useState<Coordinate | null>(null)
  const [hintCount, setHintCount] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const isPointerDownRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const dragStartRef = useRef<Coordinate | null>(null)
  const tapStartRef = useRef<Coordinate | null>(null)
  const lastPointerUpTimeRef = useRef(0)
  const justFinishedDragRef = useRef(false)
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
      const newPuzzle = generateWordSearchGrid(activeWordList, {
        wordCount,
        gridSize: 8,
      })
      setPuzzleState(newPuzzle)
      targetWordsRef.current = newPuzzle.targetWords
      setStatus('idle')
      setSelectedCoordinates([])
      setStartCoordinate(null)
      tapStartRef.current = null
      dragStartRef.current = null
      selectedCoordinatesRef.current = []
      setHintedCoordinate(null)
      setHintCount(0)
      setElapsedSeconds(0)
      isPointerDownRef.current = false
      hasDraggedRef.current = false
      justFinishedDragRef.current = false
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
      }
    },
    [words, wordCount]
  )

  // Automatically reset board when topicId, wordCount, or words list change
  const prevTopicRef = useRef(topicId)
  const prevCountRef = useRef(wordCount)
  const prevWordsKeyRef = useRef(words.map((w) => w.id).join(','))

  useEffect(() => {
    const wordsKey = words.map((w) => w.id).join(',')
    if (
      prevTopicRef.current !== topicId ||
      prevCountRef.current !== wordCount ||
      prevWordsKeyRef.current !== wordsKey
    ) {
      prevTopicRef.current = topicId
      prevCountRef.current = wordCount
      prevWordsKeyRef.current = wordsKey
      restartGame()
    }
  }, [topicId, wordCount, words, restartGame])

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
        const updatedTargets = currentTargets.map((tw) =>
          tw.id === foundWord.id ? { ...tw, isFound: true } : tw
        )
        targetWordsRef.current = updatedTargets

        setPuzzleState((prev) => {
          const updatedGrid = prev.grid.map((row) =>
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
          return { grid: updatedGrid, targetWords: updatedTargets }
        })

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

  // Pointer drag & tap event handlers
  const handleCellPointerDown = useCallback((row: number, col: number) => {
    isPointerDownRef.current = true
    hasDraggedRef.current = false
    const coord = { row, col }
    dragStartRef.current = coord
    setStatus((prev) => (prev === 'idle' ? 'playing' : prev))
    if (!tapStartRef.current) {
      selectedCoordinatesRef.current = [coord]
      setSelectedCoordinates([coord])
      setStartCoordinate(coord)
    }
  }, [])

  const handleCellPointerEnter = useCallback(
    (row: number, col: number) => {
      if (!isPointerDownRef.current || !dragStartRef.current) return
      const start = dragStartRef.current
      if (start.row === row && start.col === col) return

      hasDraggedRef.current = true
      tapStartRef.current = null

      if (isValidSelectionPath(start, { row, col })) {
        const path = getCellsBetween(start, { row, col })
        selectedCoordinatesRef.current = path
        setSelectedCoordinates(path)
        setStartCoordinate(start)
      }
    },
    []
  )

  const handleCellPointerUp = useCallback(() => {
    if (!isPointerDownRef.current) return
    isPointerDownRef.current = false
    lastPointerUpTimeRef.current = Date.now()

    if (hasDraggedRef.current) {
      justFinishedDragRef.current = true
      const coordsToEvaluate = selectedCoordinatesRef.current
      evaluateSelection(coordsToEvaluate)
      dragStartRef.current = null
      hasDraggedRef.current = false
      selectedCoordinatesRef.current = []
      setSelectedCoordinates([])
      setStartCoordinate(null)
    } else if (dragStartRef.current) {
      // Tap on single cell
      const cell = dragStartRef.current
      dragStartRef.current = null
      hasDraggedRef.current = false

      if (!tapStartRef.current) {
        // First tap
        tapStartRef.current = cell
        setStartCoordinate(cell)
        selectedCoordinatesRef.current = [cell]
        setSelectedCoordinates([cell])
      } else if (
        tapStartRef.current.row === cell.row &&
        tapStartRef.current.col === cell.col
      ) {
        // Tapped same cell again -> toggle off
        tapStartRef.current = null
        setStartCoordinate(null)
        selectedCoordinatesRef.current = []
        setSelectedCoordinates([])
      } else {
        // Second tap on a different cell
        const start = tapStartRef.current
        if (isValidSelectionPath(start, cell)) {
          const path = getCellsBetween(start, cell)
          evaluateSelection(path)
          tapStartRef.current = null
          setStartCoordinate(null)
          selectedCoordinatesRef.current = []
          setSelectedCoordinates([])
        } else {
          // Invalid path -> switch tap selection to this new cell
          tapStartRef.current = cell
          setStartCoordinate(cell)
          selectedCoordinatesRef.current = [cell]
          setSelectedCoordinates([cell])
        }
      }
    }
  }, [evaluateSelection])

  // Global window pointerup listener to handle releasing mouse outside the board
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isPointerDownRef.current) {
        handleCellPointerUp()
      }
    }
    window.addEventListener('pointerup', handleGlobalPointerUp)
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp)
    }
  }, [handleCellPointerUp])

  // Two-tap click handler (primarily for keyboard navigation Enter/Space)
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      // Ignore click event if pointer interaction just handled it
      if (Date.now() - lastPointerUpTimeRef.current < 300) {
        return
      }
      if (justFinishedDragRef.current) {
        justFinishedDragRef.current = false
        return
      }

      setStatus((prev) => (prev === 'idle' ? 'playing' : prev))
      const cell = { row, col }

      if (!tapStartRef.current) {
        tapStartRef.current = cell
        setStartCoordinate(cell)
        selectedCoordinatesRef.current = [cell]
        setSelectedCoordinates([cell])
      } else if (
        tapStartRef.current.row === cell.row &&
        tapStartRef.current.col === cell.col
      ) {
        tapStartRef.current = null
        setStartCoordinate(null)
        selectedCoordinatesRef.current = []
        setSelectedCoordinates([])
      } else {
        const start = tapStartRef.current
        if (isValidSelectionPath(start, cell)) {
          const path = getCellsBetween(start, cell)
          evaluateSelection(path)
          tapStartRef.current = null
          setStartCoordinate(null)
          selectedCoordinatesRef.current = []
          setSelectedCoordinates([])
        } else {
          tapStartRef.current = cell
          setStartCoordinate(cell)
          selectedCoordinatesRef.current = [cell]
          setSelectedCoordinates([cell])
        }
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

  // Dynamically attach isSelected and isHinted to grid cells
  const displayGrid = useMemo(() => {
    const selectedLookup = new Set(
      selectedCoordinates.map((c) => `${c.row},${c.col}`)
    )
    return grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        isSelected: selectedLookup.has(`${cell.row},${cell.col}`),
        isHinted:
          hintedCoordinate?.row === cell.row &&
          hintedCoordinate?.col === cell.col,
      }))
    )
  }, [grid, selectedCoordinates, hintedCoordinate])

  return {
    grid: displayGrid,
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
