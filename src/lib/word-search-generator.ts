// src/lib/word-search-generator.ts
import type { Word } from '@/types'
import type {
  Coordinate,
  WordSearchCell,
  WordSearchDirection,
  WordSearchTargetWord,
} from '@/types/word-search'

export const WORD_SEARCH_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
]

export function isValidSelectionPath(start: Coordinate, end: Coordinate): boolean {
  const isHorizontalForward = start.row === end.row && end.col >= start.col
  const isVerticalForward = start.col === end.col && end.row >= start.row
  return isHorizontalForward || isVerticalForward
}

export function getCellsBetween(start: Coordinate, end: Coordinate): Coordinate[] {
  const cells: Coordinate[] = []

  if (start.row === end.row) {
    const minCol = Math.min(start.col, end.col)
    const maxCol = Math.max(start.col, end.col)
    for (let c = minCol; c <= maxCol; c++) {
      cells.push({ row: start.row, col: c })
    }
  } else if (start.col === end.col) {
    const minRow = Math.min(start.row, end.row)
    const maxRow = Math.max(start.row, end.row)
    for (let r = minRow; r <= maxRow; r++) {
      cells.push({ row: r, col: start.col })
    }
  }

  return cells
}

interface PlacedWordInfo {
  word: Word
  englishClean: string
  direction: WordSearchDirection
  coordinates: Coordinate[]
}

function tryPlaceWordsOnGrid(
  words: Word[],
  gridSize: number
): PlacedWordInfo[] | null {
  const charGrid: (string | null)[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(null)
  )

  const placedWords: PlacedWordInfo[] = []

  for (const word of words) {
    const cleanWord = word.english.trim().toUpperCase().replace(/[^A-Z]/g, '')
    const wordLen = cleanWord.length

    if (wordLen > gridSize || wordLen === 0) continue

    const validPlacements: Array<{
      row: number
      col: number
      direction: WordSearchDirection
      coords: Coordinate[]
    }> = []

    // Check Horizontal placements (L -> R)
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c <= gridSize - wordLen; c++) {
        let canPlace = true
        const coords: Coordinate[] = []

        for (let i = 0; i < wordLen; i++) {
          const existing = charGrid[r][c + i]
          if (existing !== null && existing !== cleanWord[i]) {
            canPlace = false
            break
          }
          coords.push({ row: r, col: c + i })
        }

        if (canPlace) {
          validPlacements.push({ row: r, col: c, direction: 'horizontal', coords })
        }
      }
    }

    // Check Vertical placements (T -> B)
    for (let r = 0; r <= gridSize - wordLen; r++) {
      for (let c = 0; c < gridSize; c++) {
        let canPlace = true
        const coords: Coordinate[] = []

        for (let i = 0; i < wordLen; i++) {
          const existing = charGrid[r + i][c]
          if (existing !== null && existing !== cleanWord[i]) {
            canPlace = false
            break
          }
          coords.push({ row: r + i, col: c })
        }

        if (canPlace) {
          validPlacements.push({ row: r, col: c, direction: 'vertical', coords })
        }
      }
    }

    if (validPlacements.length === 0) {
      return null // placement failed, retry whole grid
    }

    const chosen = validPlacements[Math.floor(Math.random() * validPlacements.length)]
    for (let i = 0; i < wordLen; i++) {
      const coord = chosen.coords[i]
      charGrid[coord.row][coord.col] = cleanWord[i]
    }

    placedWords.push({
      word,
      englishClean: cleanWord,
      direction: chosen.direction,
      coordinates: chosen.coords,
    })
  }

  return placedWords
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function getRandomLetter(): string {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
}

export interface WordSearchGridResult {
  grid: WordSearchCell[][]
  targetWords: WordSearchTargetWord[]
}

export function generateWordSearchGrid(
  words: Word[],
  options?: {
    wordCount?: number
    gridSize?: number
  }
): WordSearchGridResult {
  const gridSize = options?.gridSize ?? 8
  const wordCount = options?.wordCount ?? 5

  // Filter words fitting inside grid
  const eligibleWords = words.filter((w) => {
    const clean = w.english.trim().replace(/[^A-Za-z]/g, '')
    return clean.length >= 3 && clean.length <= gridSize
  })

  const shuffledWords = [...eligibleWords].sort(() => Math.random() - 0.5)
  const selectedWords = shuffledWords.slice(0, wordCount)

  let placedWords: PlacedWordInfo[] | null = null
  let attempts = 0
  const maxAttempts = 150

  while (attempts < maxAttempts) {
    attempts++
    placedWords = tryPlaceWordsOnGrid(selectedWords, gridSize)
    if (placedWords && placedWords.length === selectedWords.length) {
      break
    }
  }

  // Fallback: If unable to place all words together, place as many as possible
  if (!placedWords) {
    placedWords = []
  }

  // Build grid matrix
  const grid: WordSearchCell[][] = []
  for (let r = 0; r < gridSize; r++) {
    const rowCells: WordSearchCell[] = []
    for (let c = 0; c < gridSize; c++) {
      rowCells.push({
        id: `cell-r${r}-c${c}`,
        row: r,
        col: c,
        letter: getRandomLetter(),
        isSelected: false,
        isHinted: false,
        matchedColors: [],
      })
    }
    grid.push(rowCells)
  }

  // Fill in placed words characters and targetWords list
  const targetWords: WordSearchTargetWord[] = []

  placedWords.forEach((pw, idx) => {
    const color = WORD_SEARCH_COLORS[idx % WORD_SEARCH_COLORS.length]

    for (let i = 0; i < pw.coordinates.length; i++) {
      const coord = pw.coordinates[i]
      grid[coord.row][coord.col].letter = pw.englishClean[i]
    }

    targetWords.push({
      id: pw.word.id || `target-word-${idx}`,
      english: pw.englishClean,
      vietnamese: pw.word.vietnamese,
      emoji: pw.word.emoji,
      phonetic: pw.word.phonetic,
      direction: pw.direction,
      coordinates: pw.coordinates,
      isFound: false,
      color,
    })
  })

  return { grid, targetWords }
}
