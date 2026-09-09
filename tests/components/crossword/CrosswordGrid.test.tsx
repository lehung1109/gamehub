import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CrosswordGrid } from "@/components/game/crossword/CrosswordGrid";
import { generateCrosswordBoard } from "@/lib/crossword/crossword-generator";

describe("CrosswordGrid Component", () => {
  const board = generateCrosswordBoard("animals", 5);

  it("renders crossword matrix with correct grid size and cell elements", () => {
    render(
      <CrosswordGrid
        board={board}
        selectedCell={{ row: board.words[0].startRow, col: board.words[0].startCol }}
        direction="across"
        activeWord={board.words[0]}
        onSelectCell={vi.fn()}
      />
    );

    const interactiveCells = screen.getAllByRole("button");
    expect(interactiveCells.length).toBeGreaterThanOrEqual(10);
  });

  it("calls onSelectCell when an unblocked cell is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <CrosswordGrid
        board={board}
        selectedCell={{ row: 0, col: 0 }}
        direction="across"
        activeWord={board.words[0]}
        onSelectCell={handleSelect}
      />
    );

    const firstWordCell = screen.getByTestId(
      `cell-${board.words[0].startRow}-${board.words[0].startCol}`
    );
    fireEvent.click(firstWordCell);
    expect(handleSelect).toHaveBeenCalledWith(
      board.words[0].startRow,
      board.words[0].startCol
    );
  });

  it("sets aria-selected and high contrast text on selected cell", () => {
    // Create a modified cell that is both revealed and selected
    const selectedRow = board.words[0].startRow;
    const selectedCol = board.words[0].startCol;
    const boardWithRevealed = {
      ...board,
      grid: board.grid.map((r, rIdx) =>
        r.map((c, cIdx) =>
          rIdx === selectedRow && cIdx === selectedCol
            ? { ...c, isRevealed: true, userChar: "A" }
            : c
        )
      ),
    };

    render(
      <CrosswordGrid
        board={boardWithRevealed}
        selectedCell={{ row: selectedRow, col: selectedCol }}
        direction="across"
        activeWord={board.words[0]}
        onSelectCell={vi.fn()}
      />
    );

    const cellBtn = screen.getByTestId(`cell-${selectedRow}-${selectedCol}`);
    expect(cellBtn).toHaveAttribute("aria-selected", "true");
    // Text container span should not apply text-amber-300 when selected
    const charSpan = cellBtn.querySelector("span:last-child");
    expect(charSpan?.className).not.toContain("text-amber-300");
  });

  it("renders role=region container and keeps blocked cells non-interactive", () => {
    render(
      <CrosswordGrid
        board={board}
        selectedCell={{ row: 0, col: 0 }}
        direction="across"
        activeWord={board.words[0]}
        onSelectCell={vi.fn()}
      />
    );

    expect(screen.getByRole("region", { name: /crossword grid/i })).toBeInTheDocument();

    // Total tiles = rows * cols
    const totalTiles = board.rows * board.cols;
    const buttons = screen.getAllByRole("button");
    // Some tiles are blocked, so interactive buttons < totalTiles
    expect(buttons.length).toBeLessThan(totalTiles);
  });
});
