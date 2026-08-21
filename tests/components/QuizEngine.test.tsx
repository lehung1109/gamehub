import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { QuizEngine, type QuizQuestion } from "@/components/game/QuizEngine";

interface TestPrompt {
  word: string;
  emoji: string;
}

const mockQuestions: QuizQuestion<TestPrompt>[] = [
  {
    prompt: { word: "Cat", emoji: "🐱" },
    options: [
      { word: "Cat", emoji: "🐱" },
      { word: "Dog", emoji: "🐶" },
      { word: "Pig", emoji: "🐷" },
    ],
    correctIndex: 0,
  },
  {
    prompt: { word: "Dog", emoji: "🐶" },
    options: [
      { word: "Cat", emoji: "🐱" },
      { word: "Dog", emoji: "🐶" },
      { word: "Pig", emoji: "🐷" },
    ],
    correctIndex: 1,
  },
];

describe("QuizEngine component", () => {
  it("renders the first question and options", () => {
    const handleComplete = vi.fn();
    render(
      <QuizEngine
        questions={mockQuestions}
        renderPrompt={(prompt) => <div>Prompt: {prompt.word}</div>}
        renderOption={(option) => <span>Option: {option.word}</span>}
        onComplete={handleComplete}
      />
    );

    expect(screen.getByText("Prompt: Cat")).toBeInTheDocument();
    expect(screen.getAllByText(/Option:/i)).toHaveLength(3);
  });

  it("handles correct answers and auto-advances to next question", () => {
    vi.useFakeTimers();
    const handleComplete = vi.fn();

    render(
      <QuizEngine
        questions={mockQuestions}
        renderPrompt={(prompt) => <div>Prompt: {prompt.word}</div>}
        renderOption={(option) => <span>Option: {option.word}</span>}
        onComplete={handleComplete}
        autoAdvance={true}
      />
    );

    // Pick first option (correct index 0)
    const options = screen.getAllByRole("button", { name: /Option:/i });
    fireEvent.click(options[0]);

    // Check feedback overlay is open
    expect(screen.getByText(/đúng rồi/i)).toBeInTheDocument();

    // Advance timer to trigger next question
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText("Prompt: Dog")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("completes quiz and displays completion screen when finished", () => {
    const handleComplete = vi.fn();

    render(
      <QuizEngine
        questions={[mockQuestions[0]]}
        renderPrompt={(prompt) => <div>Prompt: {prompt.word}</div>}
        renderOption={(option) => <span>Option: {option.word}</span>}
        onComplete={handleComplete}
        autoAdvance={false}
      />
    );

    const options = screen.getAllByRole("button", { name: /Option:/i });
    fireEvent.click(options[0]); // Correct

    const continueBtn = screen.getByRole("button", { name: /tiếp tục/i });
    fireEvent.click(continueBtn);

    expect(screen.getByText(/tuyệt đỉnh|hoàn thành|chúc mừng/i)).toBeInTheDocument();
    expect(handleComplete).toHaveBeenCalledWith(1, 1);
  });

  it("invokes onSpeak with question prompt on mount/question change", () => {
    const handleSpeak = vi.fn();
    render(
      <QuizEngine
        questions={mockQuestions}
        renderPrompt={(prompt) => <div>Prompt: {prompt.word}</div>}
        renderOption={(option) => <span>Option: {option.word}</span>}
        onSpeak={handleSpeak}
        onComplete={vi.fn()}
      />
    );

    expect(handleSpeak).toHaveBeenCalledWith(mockQuestions[0].prompt);
  });
});
