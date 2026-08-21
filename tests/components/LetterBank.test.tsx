import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LetterBank, DraggableItem } from "@/components/game/LetterBank";
import { DndContext } from "@dnd-kit/core";

const mockItems: DraggableItem[] = [
  { id: "item-C-1", label: "C" },
  { id: "item-A-2", label: "A" },
  { id: "item-T-3", label: "T" },
  { id: "item-X-4", label: "X" },
];

describe("LetterBank Component", () => {
  it("renders all letter tiles with correct labels and accessibility labels", () => {
    render(
      <DndContext>
        <LetterBank items={mockItems} />
      </DndContext>
    );

    mockItems.forEach((item) => {
      expect(screen.getByRole("button", { name: new RegExp(`Chữ cái ${item.label}`, "i") })).toBeInTheDocument();
    });
  });

  it("calls onItemClick when an unplaced letter tile is clicked", () => {
    const handleClick = vi.fn();
    render(
      <DndContext>
        <LetterBank items={mockItems} onItemClick={handleClick} />
      </DndContext>
    );

    const tileA = screen.getByRole("button", { name: /Chữ cái A/i });
    fireEvent.click(tileA);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockItems[1]);
  });

  it("disables or hides items that are marked as placed in placedIds", () => {
    const handleClick = vi.fn();
    render(
      <DndContext>
        <LetterBank
          items={mockItems}
          placedIds={["item-A-2"]}
          onItemClick={handleClick}
        />
      </DndContext>
    );

    const tileA = screen.getByRole("button", { name: /Chữ cái A/i });
    expect(tileA).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(tileA);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("disables all tiles when disabled prop is true", () => {
    const handleClick = vi.fn();
    render(
      <DndContext>
        <LetterBank items={mockItems} disabled={true} onItemClick={handleClick} />
      </DndContext>
    );

    const tileC = screen.getByRole("button", { name: /Chữ cái C/i });
    expect(tileC).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(tileC);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
