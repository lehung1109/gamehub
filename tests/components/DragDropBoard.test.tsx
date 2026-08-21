import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DragDropBoard, DraggableItem } from "@/components/game/DragDropBoard";

const sampleTarget = ["D", "O", "G"];
const sampleBank: DraggableItem[] = [
  { id: "dog-D-0", label: "D" },
  { id: "dog-O-1", label: "O" },
  { id: "dog-G-2", label: "G" },
  { id: "distractor-A-3", label: "A" },
  { id: "distractor-M-4", label: "M" },
];

describe("DragDropBoard Component", () => {
  it("renders the correct number of empty slots and all bank items", () => {
    render(<DragDropBoard targetItems={sampleTarget} bankItems={sampleBank} />);

    // 3 slots for D-O-G
    const slots = screen.getAllByRole("button", { name: /Ô chữ cái \d+: trống/i });
    expect(slots).toHaveLength(3);

    // Bank items
    expect(screen.getByRole("button", { name: /Chữ cái D/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chữ cái O/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chữ cái G/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chữ cái A/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chữ cái M/i })).toBeInTheDocument();
  });

  it("places bank letters sequentially into slots when tapped (tap-to-place)", () => {
    render(<DragDropBoard targetItems={sampleTarget} bankItems={sampleBank} />);

    const tileD = screen.getByRole("button", { name: /Chữ cái D/i });
    fireEvent.click(tileD);

    // Slot 1 should now contain D
    expect(screen.getByRole("button", { name: /Ô chữ cái 1: D/i })).toBeInTheDocument();
    // Bank item D is now marked placed (disabled)
    expect(tileD).toHaveAttribute("aria-disabled", "true");

    const tileO = screen.getByRole("button", { name: /Chữ cái O/i });
    fireEvent.click(tileO);

    // Slot 2 should now contain O
    expect(screen.getByRole("button", { name: /Ô chữ cái 2: O/i })).toBeInTheDocument();
  });

  it("removes a placed letter back to bank when the filled slot is tapped", () => {
    render(<DragDropBoard targetItems={sampleTarget} bankItems={sampleBank} />);

    const tileD = screen.getByRole("button", { name: /Chữ cái D/i });
    fireEvent.click(tileD);

    const filledSlot1 = screen.getByRole("button", { name: /Ô chữ cái 1: D/i });
    fireEvent.click(filledSlot1);

    // Slot 1 should be empty again
    expect(screen.getByRole("button", { name: /Ô chữ cái 1: trống/i })).toBeInTheDocument();
    // Bank item D is available again
    expect(tileD).toHaveAttribute("aria-disabled", "false");
  });

  it("triggers onComplete with true when the word is spelled correctly", () => {
    const handleComplete = vi.fn();
    render(
      <DragDropBoard
        targetItems={sampleTarget}
        bankItems={sampleBank}
        onComplete={handleComplete}
      />
    );

    // Tap D, O, G in correct order
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái D/i }));
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái O/i }));
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái G/i }));

    expect(handleComplete).toHaveBeenCalledTimes(1);
    expect(handleComplete).toHaveBeenCalledWith(true, "DOG");
  });

  it("triggers onComplete with false when the word is spelled incorrectly", () => {
    const handleComplete = vi.fn();
    render(
      <DragDropBoard
        targetItems={sampleTarget}
        bankItems={sampleBank}
        onComplete={handleComplete}
      />
    );

    // Tap G, O, D (wrong order)
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái G/i }));
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái O/i }));
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái D/i }));

    expect(handleComplete).toHaveBeenCalledTimes(1);
    expect(handleComplete).toHaveBeenCalledWith(false, "GOD");
  });

  it("clears all slots when the reset/clear button is clicked", () => {
    render(<DragDropBoard targetItems={sampleTarget} bankItems={sampleBank} />);

    fireEvent.click(screen.getByRole("button", { name: /Chữ cái D/i }));
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái O/i }));

    const clearButton = screen.getByRole("button", { name: /Xóa làm lại|Làm lại|Xóa hết/i });
    fireEvent.click(clearButton);

    const emptySlots = screen.getAllByRole("button", { name: /Ô chữ cái \d+: trống/i });
    expect(emptySlots).toHaveLength(3);
  });

  it("handles duplicate letters correctly (e.g. APPLE)", () => {
    const appleTarget = ["A", "P", "P", "L", "E"];
    const appleBank: DraggableItem[] = [
      { id: "p1", label: "P" },
      { id: "a1", label: "A" },
      { id: "p2", label: "P" },
      { id: "e1", label: "E" },
      { id: "l1", label: "L" },
    ];

    const handleComplete = vi.fn();
    render(
      <DragDropBoard
        targetItems={appleTarget}
        bankItems={appleBank}
        onComplete={handleComplete}
      />
    );

    const pButtons = screen.getAllByRole("button", { name: /Chữ cái P/i });
    expect(pButtons).toHaveLength(2);

    // Tap A, P (first), P (second), L, E
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái A/i }));
    fireEvent.click(pButtons[0]);
    fireEvent.click(pButtons[1]);
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái L/i }));
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái E/i }));

    expect(handleComplete).toHaveBeenCalledWith(true, "APPLE");
  });

  it("calls onItemPlaced when an item is tapped and placed into a slot", () => {
    const handleItemPlaced = vi.fn();
    render(
      <DragDropBoard
        targetItems={sampleTarget}
        bankItems={sampleBank}
        onItemPlaced={handleItemPlaced}
      />
    );

    const tileD = screen.getByRole("button", { name: /Chữ cái D/i });
    fireEvent.click(tileD);

    expect(handleItemPlaced).toHaveBeenCalledTimes(1);
    expect(handleItemPlaced).toHaveBeenCalledWith(
      expect.objectContaining({ id: "dog-D-0", label: "D" })
    );
  });
});
