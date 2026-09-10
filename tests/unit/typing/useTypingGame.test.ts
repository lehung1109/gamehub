import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTypingGame } from "@/hooks/useTypingGame";
import { FillBlankQuestion } from "@/types/typing";

const mockQuestions: FillBlankQuestion[] = [
  {
    id: "q1",
    textBefore: "She",
    textAfter: "to school every day.",
    correctAnswer: "goes",
    baseVerb: "go",
    acceptableAlternatives: [],
  },
  {
    id: "q2",
    textBefore: "They",
    textAfter: "football on Sundays.",
    correctAnswer: "play",
    baseVerb: "play",
    acceptableAlternatives: [],
  },
];

describe("useTypingGame Hook", () => {
  it("initializes with first question and playing status", () => {
    const { result } = renderHook(() => useTypingGame(mockQuestions));

    expect(result.current.state.status).toBe("playing");
    expect(result.current.state.currentIndex).toBe(0);
    expect(result.current.state.score).toBe(0);
    expect(result.current.state.userInput).toBe("");
    expect(result.current.currentQuestion.id).toBe("q1");
  });

  it("updates userInput when handleInputChange is called", () => {
    const { result } = renderHook(() => useTypingGame(mockQuestions));

    act(() => {
      result.current.handleInputChange("goes");
    });

    expect(result.current.state.userInput).toBe("goes");
  });

  it("validates correct answer and updates score on handleSubmit", () => {
    const { result } = renderHook(() => useTypingGame(mockQuestions));

    act(() => {
      result.current.handleInputChange("goes");
    });

    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.state.isCorrect).toBe(true);
    expect(result.current.state.score).toBe(1);
  });

  it("validates incorrect answer on handleSubmit", () => {
    const { result } = renderHook(() => useTypingGame(mockQuestions));

    act(() => {
      result.current.handleInputChange("go");
    });

    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.state.isCorrect).toBe(false);
    expect(result.current.state.score).toBe(0);
  });

  it("advances to next question and marks completed at end", () => {
    const { result } = renderHook(() => useTypingGame(mockQuestions));

    // Question 1
    act(() => {
      result.current.handleInputChange("goes");
    });
    act(() => {
      result.current.handleSubmit();
    });
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.state.currentIndex).toBe(1);
    expect(result.current.state.isCorrect).toBeNull();
    expect(result.current.state.userInput).toBe("");

    // Question 2
    act(() => {
      result.current.handleInputChange("play");
    });
    act(() => {
      result.current.handleSubmit();
    });
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.state.status).toBe("completed");
    expect(result.current.state.score).toBe(2);
  });

  it("resets state when resetGame is called", () => {
    const { result } = renderHook(() => useTypingGame(mockQuestions));

    act(() => {
      result.current.handleInputChange("goes");
    });
    act(() => {
      result.current.handleSubmit();
    });
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.state.currentIndex).toBe(0);
    expect(result.current.state.score).toBe(0);
    expect(result.current.state.userInput).toBe("");
    expect(result.current.state.isCorrect).toBeNull();
    expect(result.current.state.status).toBe("playing");
  });
});
