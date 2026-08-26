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

  it("invokes onAnswer with question answer details when option is selected", () => {
    const handleAnswer = vi.fn();
    render(
      <QuizEngine
        questions={mockQuestions}
        renderPrompt={(prompt) => <div>Prompt: {prompt.word}</div>}
        renderOption={(option) => <span>Option: {option.word}</span>}
        onAnswer={handleAnswer}
        onComplete={vi.fn()}
      />
    );

    const options = screen.getAllByRole("button", { name: /Option:/i });
    fireEvent.click(options[0]); // Option 0 is correct

    expect(handleAnswer).toHaveBeenCalledTimes(1);
    expect(handleAnswer).toHaveBeenCalledWith(
      expect.objectContaining({
        promptText: "Cat",
        selectedAnswerText: "Cat",
        isCorrect: true,
        timeTakenMs: expect.any(Number),
      })
    );
  });

  it("does not display a back button on the first question", () => {
    render(
      <QuizEngine
        questions={mockQuestions}
        renderPrompt={(prompt) => <div>Prompt: {prompt.word}</div>}
        renderOption={(option) => <span>Option: {option.word}</span>}
        onComplete={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /quay lại/i })).not.toBeInTheDocument();
  });

  it("navigates back to the previous question when back button is clicked", () => {
    vi.useFakeTimers();
    render(
      <QuizEngine
        questions={mockQuestions}
        renderPrompt={(prompt) => <div>Prompt: {prompt.word}</div>}
        renderOption={(option) => <span>Option: {option.word}</span>}
        onComplete={vi.fn()}
        autoAdvance={true}
      />
    );

    // Answer Question 1
    const optionsQ1 = screen.getAllByRole("button", { name: /Option:/i });
    fireEvent.click(optionsQ1[0]);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // We are on Question 2
    expect(screen.getByText("Prompt: Dog")).toBeInTheDocument();
    const backBtn = screen.getByRole("button", { name: /quay lại/i });
    expect(backBtn).toBeInTheDocument();

    // Click Back
    fireEvent.click(backBtn);

    // Back to Question 1
    expect(screen.getByText("Prompt: Cat")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("allows re-selecting an answer and recalculates final score", () => {
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

    // Step 1: Answer Question 1 WRONGLY (option 1: "Dog", correct is 0: "Cat")
    const optionsQ1 = screen.getAllByRole("button", { name: /Option:/i });
    fireEvent.click(optionsQ1[1]);

    // For wrong answers, FeedbackOverlay does not auto-advance; click continue button
    const continueBtn = screen.getByRole("button", { name: /tiếp tục/i });
    fireEvent.click(continueBtn);

    // Step 2: Now on Question 2. Click Back to Question 1.
    expect(screen.getByText("Prompt: Dog")).toBeInTheDocument();
    const backBtn = screen.getByRole("button", { name: /quay lại/i });
    fireEvent.click(backBtn);

    // Step 3: We are on Question 1. Change answer to CORRECT (option 0: "Cat")
    expect(screen.getByText("Prompt: Cat")).toBeInTheDocument();
    const reOptionsQ1 = screen.getAllByRole("button", { name: /Option:/i });
    fireEvent.click(reOptionsQ1[0]);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Step 4: Now on Question 2 again. Answer CORRECTLY (option 1: "Dog")
    expect(screen.getByText("Prompt: Dog")).toBeInTheDocument();
    const optionsQ2 = screen.getAllByRole("button", { name: /Option:/i });
    fireEvent.click(optionsQ2[1]);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Quiz completed. Score should be 2 out of 2.
    expect(handleComplete).toHaveBeenCalledWith(2, 2);
    vi.useRealTimers();
  });
});

