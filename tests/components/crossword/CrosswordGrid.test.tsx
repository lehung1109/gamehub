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
});
