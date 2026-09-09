import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CrosswordCompletionModal } from "@/components/game/crossword/CrosswordCompletionModal";

describe("CrosswordCompletionModal Component", () => {
  it("renders victory heading, score, and next puzzle button", () => {
    const handleNext = vi.fn();
    render(
      <CrosswordCompletionModal
        isOpen={true}
        score={500}
        stars={3}
        elapsedSeconds={85}
        hintsUsed={0}
        onNextPuzzle={handleNext}
      />
    );

    expect(screen.getByText("HOÀN THÀNH Ô CHỮ!")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
    const nextBtn = screen.getByRole("button", { name: /Lưới Tiếp Theo/i });
    fireEvent.click(nextBtn);
    expect(handleNext).toHaveBeenCalled();
  });

  it("does not render when isOpen is false", () => {
    const handleNext = vi.fn();
    const { container } = render(
      <CrosswordCompletionModal
        isOpen={false}
        score={500}
        stars={3}
        elapsedSeconds={85}
        hintsUsed={0}
        onNextPuzzle={handleNext}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("has accessible dialog attributes and displays formatted time", () => {
    render(
      <CrosswordCompletionModal
        isOpen={true}
        score={250}
        stars={2}
        elapsedSeconds={125}
        hintsUsed={2}
        onNextPuzzle={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "crossword-modal-title");
    expect(screen.getByText("02:05")).toBeInTheDocument();
  });
});
