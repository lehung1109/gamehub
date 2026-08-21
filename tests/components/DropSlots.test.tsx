import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DropSlots, SlotItem } from "@/components/game/DropSlots";
import { DndContext } from "@dnd-kit/core";

const mockSlots: (SlotItem | null)[] = [
  { id: "item-C-1", label: "C" },
  null,
  { id: "item-T-3", label: "T" },
];

describe("DropSlots Component", () => {
  it("renders the correct number of drop slots", () => {
    render(
      <DndContext>
        <DropSlots slots={mockSlots} />
      </DndContext>
    );

    const slots = screen.getAllByRole("button", { name: /Ô chữ cái \d+/i });
    expect(slots).toHaveLength(3);
  });

  it("displays the placed item letter in filled slots and placeholder in empty slots", () => {
    render(
      <DndContext>
        <DropSlots slots={mockSlots} />
      </DndContext>
    );

    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("T")).toBeInTheDocument();
    // Empty slot at index 1
    const emptySlot = screen.getByRole("button", { name: /Ô chữ cái 2: trống/i });
    expect(emptySlot).toBeInTheDocument();
  });

  it("calls onSlotClick when a slot is clicked", () => {
    const handleSlotClick = vi.fn();
    render(
      <DndContext>
        <DropSlots slots={mockSlots} onSlotClick={handleSlotClick} />
      </DndContext>
    );

    const firstSlot = screen.getByRole("button", { name: /Ô chữ cái 1: C/i });
    fireEvent.click(firstSlot);

    expect(handleSlotClick).toHaveBeenCalledTimes(1);
    expect(handleSlotClick).toHaveBeenCalledWith(0, mockSlots[0]);
  });

  it("applies correct status styling when status is 'correct'", () => {
    render(
      <DndContext>
        <DropSlots slots={mockSlots} status="correct" />
      </DndContext>
    );

    const firstSlot = screen.getByRole("button", { name: /Ô chữ cái 1: C/i });
    expect(firstSlot.className).toContain("bg-emerald");
  });

  it("applies wrong status styling when status is 'wrong'", () => {
    render(
      <DndContext>
        <DropSlots slots={mockSlots} status="wrong" />
      </DndContext>
    );

    const firstSlot = screen.getByRole("button", { name: /Ô chữ cái 1: C/i });
    expect(firstSlot.className).toContain("bg-rose");
  });

  it("disables interaction when disabled prop is true", () => {
    const handleSlotClick = vi.fn();
    render(
      <DndContext>
        <DropSlots slots={mockSlots} disabled={true} onSlotClick={handleSlotClick} />
      </DndContext>
    );

    const firstSlot = screen.getByRole("button", { name: /Ô chữ cái 1: C/i });
    expect(firstSlot).toBeDisabled();

    fireEvent.click(firstSlot);
    expect(handleSlotClick).not.toHaveBeenCalled();
  });
});
