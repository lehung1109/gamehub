import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { FeedbackOverlay } from "@/components/custom/FeedbackOverlay";

describe("FeedbackOverlay component", () => {
  it("renders correct state with celebratory feedback", () => {
    const handleContinue = vi.fn();
    render(
      <FeedbackOverlay
        open={true}
        type="correct"
        onContinue={handleContinue}
      />
    );

    expect(screen.getByText(/đúng rồi/i)).toBeInTheDocument();
    const continueBtn = screen.getByRole("button", { name: /tiếp tục/i });
    fireEvent.click(continueBtn);
    expect(handleContinue).toHaveBeenCalledTimes(1);
  });

  it("renders wrong state with correct answer display", () => {
    const handleContinue = vi.fn();
    render(
      <FeedbackOverlay
        open={true}
        type="wrong"
        correctAnswer="Elephant"
        onContinue={handleContinue}
      />
    );

    expect(screen.getByText(/chưa chính xác/i)).toBeInTheDocument();
    expect(screen.getByText(/Elephant/i)).toBeInTheDocument();

    const continueBtn = screen.getByRole("button", { name: /tiếp tục/i });
    fireEvent.click(continueBtn);
    expect(handleContinue).toHaveBeenCalledTimes(1);
  });

  it("supports autoAdvance timer when enabled", () => {
    vi.useFakeTimers();
    const handleContinue = vi.fn();

    render(
      <FeedbackOverlay
        open={true}
        type="correct"
        autoAdvance={true}
        autoAdvanceMs={1500}
        onContinue={handleContinue}
      />
    );

    expect(handleContinue).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(handleContinue).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("does NOT auto-advance when answer is wrong, even if autoAdvance is true", () => {
    vi.useFakeTimers();
    const handleContinue = vi.fn();

    render(
      <FeedbackOverlay
        open={true}
        type="wrong"
        autoAdvance={true}
        autoAdvanceMs={1500}
        onContinue={handleContinue}
      />
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    // Student must manually click Continue to proceed on wrong answer
    expect(handleContinue).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
