import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReadingGame } from "@/hooks/useReadingGame";
import { ReadingModule } from "@/types/reading";

const mockModule: ReadingModule = {
  id: "test-module",
  title: "A Day at the Park",
  difficulty: 1,
  passageText: "The sun was shining brightly...",
  vocabulary: [],
  questions: [
    {
      id: "q1",
      questionText: "What was shining?",
      options: ["The sun", "The moon", "A star"],
      correctOptionIndex: 0,
      explanation: "The sun was shining.",
    },
    {
      id: "q2",
      questionText: "Where were they?",
      options: ["At home", "At school", "At the park"],
      correctOptionIndex: 2,
      explanation: "They were at the park.",
    },
  ],
};

describe("useReadingGame Hook", () => {
  it("initializes with reading status, question index 0, and score 0", () => {
    const { result } = renderHook(() => useReadingGame(mockModule));

    expect(result.current.gameState.status).toBe("reading");
    expect(result.current.gameState.currentQuestionIndex).toBe(0);
    expect(result.current.gameState.score).toBe(0);
    expect(result.current.gameState.answers).toHaveLength(0);
  });

  it("records answer and calculates score for correct selection", () => {
    const { result } = renderHook(() => useReadingGame(mockModule));

    act(() => {
      result.current.handleAnswer("q1", 0);
    });

    expect(result.current.gameState.score).toBe(1);
    expect(result.current.gameState.answers).toEqual([
      { questionId: "q1", selectedOptionIndex: 0, isCorrect: true },
    ]);
  });

  it("advances question on nextQuestion and marks completed on last question", () => {
    const { result } = renderHook(() => useReadingGame(mockModule));

    act(() => {
      result.current.handleAnswer("q1", 0);
    });
    act(() => {
      result.current.nextQuestion();
    });

    expect(result.current.gameState.currentQuestionIndex).toBe(1);

    act(() => {
      result.current.handleAnswer("q2", 1); // wrong
    });
    act(() => {
      result.current.nextQuestion();
    });

    expect(result.current.gameState.status).toBe("completed");
    expect(result.current.gameState.score).toBe(1);
  });

  it("resets game when resetGame is called", () => {
    const { result } = renderHook(() => useReadingGame(mockModule));

    act(() => {
      result.current.handleAnswer("q1", 0);
    });
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.gameState.status).toBe("reading");
    expect(result.current.gameState.score).toBe(0);
    expect(result.current.gameState.currentQuestionIndex).toBe(0);
    expect(result.current.gameState.answers).toHaveLength(0);
  });

  it("handles empty questions gracefully without crashing", () => {
    const emptyModule = {
      ...mockModule,
      questions: [],
    };
    const { result } = renderHook(() => useReadingGame(emptyModule));

    expect(() => {
      act(() => {
        result.current.handleAnswer("nonexistent", 0);
      });
    }).not.toThrow();

    expect(() => {
      act(() => {
        result.current.nextQuestion();
      });
    }).not.toThrow();

    expect(result.current.gameState.status).toBe("completed");
  });
});
