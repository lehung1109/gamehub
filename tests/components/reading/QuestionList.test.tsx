import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuestionList } from "@/components/reading/QuestionList";
import { ReadingQuestion } from "@/types/reading";

const mockQuestions: ReadingQuestion[] = [
  {
    id: "q1",
    questionText: "What was the weather like?",
    options: ["Sunny", "Rainy", "Cold", "Windy"],
    correctOptionIndex: 0,
    explanation: "It was a sunny day.",
  },
  {
    id: "q2",
    questionText: "Where did they go?",
    options: ["Park", "School", "Store", "Beach"],
    correctOptionIndex: 0,
    explanation: "They went to the park.",
  },
];

describe("QuestionList Component", () => {
  it("renders the question and options at the current index", () => {
    render(
      <QuestionList
        questions={mockQuestions}
        currentQuestionIndex={0}
        answers={[]}
        onAnswer={vi.fn()}
        onNext={vi.fn()}
      />
    );

    expect(screen.getByText("What was the weather like?")).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Sunny")).toBeInTheDocument();
  });

  it("safely handles out of bounds index without crashing", () => {
    const { container } = render(
      <QuestionList
        questions={mockQuestions}
        currentQuestionIndex={5}
        answers={[]}
        onAnswer={vi.fn()}
        onNext={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("safely handles empty questions list without crashing", () => {
    const { container } = render(
      <QuestionList
        questions={[]}
        currentQuestionIndex={0}
        answers={[]}
        onAnswer={vi.fn()}
        onNext={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
