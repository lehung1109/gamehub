import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { WordSolvedToast } from "@/components/game/crossword/WordSolvedToast";
import { CrosswordWord } from "@/types/crossword";

const mockWord: CrosswordWord = {
  id: "lion",
  word: "LION",
  clue: "Chúa sơn lâm",
  direction: "across",
  startRow: 1,
  startCol: 2,
  number: 3,
  isSolved: true,
  isRevealed: false,
};

describe("WordSolvedToast Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when word is null", () => {
    const { container } = render(
      <WordSolvedToast word={null} onDismiss={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders celebration toast with word and direction when word is provided", () => {
    render(
      <WordSolvedToast word={mockWord} onDismiss={vi.fn()} />
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/Chính xác/i)).toBeInTheDocument();
    expect(screen.getByText(/LION/i)).toBeInTheDocument();
    expect(screen.getByText(/Hàng ngang/i)).toBeInTheDocument();
  });

  it("calls onDismiss when close button is clicked", () => {
    const handleDismiss = vi.fn();
    render(
      <WordSolvedToast word={mockWord} onDismiss={handleDismiss} />
    );

    const closeBtn = screen.getByRole("button", { name: /đóng/i });
    fireEvent.click(closeBtn);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it("auto dismisses after timeout", () => {
    const handleDismiss = vi.fn();
    render(
      <WordSolvedToast word={mockWord} onDismiss={handleDismiss} autoDismissMs={2500} />
    );

    expect(handleDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
