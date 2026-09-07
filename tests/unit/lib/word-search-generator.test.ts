// tests/unit/lib/word-search-generator.test.ts
import { describe, it, expect } from 'vitest'
import {
  generateWordSearchGrid,
  getCellsBetween,
  isValidSelectionPath,
} from '@/lib/word-search-generator'
import type { Word } from '@/types'

const sampleWords: Word[] = [
  { id: '1', english: 'Apple', phonetic: '/ˈæp.əl/', vietnamese: 'Quả táo', emoji: '🍎', topicId: 'fruits' },
  { id: '2', english: 'Banana', phonetic: '/bəˈnæn.ə/', vietnamese: 'Quả chuối', emoji: '🍌', topicId: 'fruits' },
  { id: '3', english: 'Orange', phonetic: '/ˈɒr.ɪndʒ/', vietnamese: 'Quả cam', emoji: '🍊', topicId: 'fruits' },
  { id: '4', english: 'Mango', phonetic: '/ˈmæŋ.ɡəʊ/', vietnamese: 'Quả xoài', emoji: '🥭', topicId: 'fruits' },
  { id: '5', english: 'Grape', phonetic: '/ɡreɪp/', vietnamese: 'Quả nho', emoji: '🍇', topicId: 'fruits' },
  { id: '6', english: 'Peach', phonetic: '/piːtʃ/', vietnamese: 'Quả đào', emoji: '🍑', topicId: 'fruits' },
]

describe('word-search-generator', () => {
  it('generates an 8x8 matrix with target words placed', () => {
    const result = generateWordSearchGrid(sampleWords, { wordCount: 5, gridSize: 8 })

    expect(result.grid).toHaveLength(8)
    for (const row of result.grid) {
      expect(row).toHaveLength(8)
      for (const cell of row) {
        expect(cell.letter).toMatch(/^[A-Z]$/)
        expect(cell.row).toBeGreaterThanOrEqual(0)
        expect(cell.row).toBeLessThan(8)
        expect(cell.col).toBeGreaterThanOrEqual(0)
        expect(cell.col).toBeLessThan(8)
      }
    }

    expect(result.targetWords).toHaveLength(5)
  })

  it('places target words only horizontally (L→R) or vertically (T→B)', () => {
    const result = generateWordSearchGrid(sampleWords, { wordCount: 4, gridSize: 8 })

    for (const target of result.targetWords) {
      expect(['horizontal', 'vertical']).toContain(target.direction)
      expect(target.coordinates).toHaveLength(target.english.length)

      // Verify coordinate path matches direction and contains matching letters in grid
      for (let i = 0; i < target.coordinates.length; i++) {
        const coord = target.coordinates[i]
        const expectedLetter = target.english[i].toUpperCase()
        expect(result.grid[coord.row][coord.col].letter).toBe(expectedLetter)

        if (i > 0) {
          const prev = target.coordinates[i - 1]
          if (target.direction === 'horizontal') {
            expect(coord.row).toBe(prev.row)
            expect(coord.col).toBe(prev.col + 1)
          } else {
            expect(coord.col).toBe(prev.col)
            expect(coord.row).toBe(prev.row + 1)
          }
        }
      }
    }
  })

  it('assigns unique colors to each target word', () => {
    const result = generateWordSearchGrid(sampleWords, { wordCount: 5, gridSize: 8 })
    const colors = result.targetWords.map((w) => w.color)
    const uniqueColors = new Set(colors)
    expect(uniqueColors.size).toBe(5)
  })

  it('calculates straight line cells between two coordinates correctly', () => {
    // Horizontal
    const hCells = getCellsBetween({ row: 1, col: 2 }, { row: 1, col: 5 })
    expect(hCells).toEqual([
      { row: 1, col: 2 },
      { row: 1, col: 3 },
      { row: 1, col: 4 },
      { row: 1, col: 5 },
    ])

    // Vertical
    const vCells = getCellsBetween({ row: 0, col: 3 }, { row: 3, col: 3 })
    expect(vCells).toEqual([
      { row: 0, col: 3 },
      { row: 1, col: 3 },
      { row: 2, col: 3 },
      { row: 3, col: 3 },
    ])
  })

  it('validates only straight horizontal and vertical forward paths', () => {
    expect(isValidSelectionPath({ row: 0, col: 0 }, { row: 0, col: 4 })).toBe(true) // H forward
    expect(isValidSelectionPath({ row: 0, col: 0 }, { row: 4, col: 0 })).toBe(true) // V forward
    expect(isValidSelectionPath({ row: 0, col: 4 }, { row: 0, col: 0 })).toBe(false) // H backwards rejected
    expect(isValidSelectionPath({ row: 4, col: 0 }, { row: 0, col: 0 })).toBe(false) // V backwards rejected
    expect(isValidSelectionPath({ row: 0, col: 0 }, { row: 3, col: 3 })).toBe(false) // Diagonal rejected
  })
})
