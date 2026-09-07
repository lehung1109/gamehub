// tests/unit/components/WordSearchBoard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WordSearchBoard } from '@/components/game/WordSearchBoard'
import type { WordSearchCell } from '@/types/word-search'

function createMockGrid(): WordSearchCell[][] {
  const grid: WordSearchCell[][] = []
  for (let r = 0; r < 8; r++) {
    const row: WordSearchCell[] = []
    for (let c = 0; c < 8; c++) {
      row.push({
        id: `cell-r${r}-c${c}`,
        row: r,
        col: c,
        letter: String.fromCharCode(65 + ((r * 8 + c) % 26)),
        isSelected: false,
        isHinted: false,
        matchedColors: [],
      })
    }
    grid.push(row)
  }
  return grid
}

describe('WordSearchBoard component', () => {
  it('renders an 8x8 grid with 64 accessible cells', () => {
    const grid = createMockGrid()
    render(
      <WordSearchBoard
        grid={grid}
        onCellPointerDown={vi.fn()}
        onCellPointerEnter={vi.fn()}
        onCellPointerUp={vi.fn()}
        onCellClick={vi.fn()}
      />
    )

    const cells = screen.getAllByRole('gridcell')
    expect(cells).toHaveLength(64)
  })

  it('triggers pointer and click handlers with correct row and column coordinates', () => {
    const grid = createMockGrid()
    const onCellPointerDown = vi.fn()
    const onCellPointerEnter = vi.fn()
    const onCellPointerUp = vi.fn()
    const onCellClick = vi.fn()

    render(
      <WordSearchBoard
        grid={grid}
        onCellPointerDown={onCellPointerDown}
        onCellPointerEnter={onCellPointerEnter}
        onCellPointerUp={onCellPointerUp}
        onCellClick={onCellClick}
      />
    )

    const cell23 = screen.getByTestId('cell-r2-c3')
    fireEvent.pointerDown(cell23)
    expect(onCellPointerDown).toHaveBeenCalledWith(2, 3)

    fireEvent.pointerEnter(cell23)
    expect(onCellPointerEnter).toHaveBeenCalledWith(2, 3)

    fireEvent.pointerUp(cell23)
    expect(onCellPointerUp).toHaveBeenCalled()

    fireEvent.click(cell23)
    expect(onCellClick).toHaveBeenCalledWith(2, 3)
  })

  it('renders linear gradient background when cell has multiple matched colors', () => {
    const grid = createMockGrid()
    grid[0][0].matchedColors = ['#10B981', '#3B82F6']

    render(
      <WordSearchBoard
        grid={grid}
        onCellPointerDown={vi.fn()}
        onCellPointerEnter={vi.fn()}
        onCellPointerUp={vi.fn()}
        onCellClick={vi.fn()}
      />
    )

    const cell00 = screen.getByTestId('cell-r0-c0')
    expect(cell00.getAttribute('style')).toContain('linear-gradient')
  })

  it('applies pulsing ring class when cell is hinted', () => {
    const grid = createMockGrid()
    grid[1][1].isHinted = true

    render(
      <WordSearchBoard
        grid={grid}
        onCellPointerDown={vi.fn()}
        onCellPointerEnter={vi.fn()}
        onCellPointerUp={vi.fn()}
        onCellClick={vi.fn()}
      />
    )

    const cell11 = screen.getByTestId('cell-r1-c1')
    expect(cell11.className).toContain('animate-pulse')
  })
})
