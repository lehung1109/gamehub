import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOddOneOutGame } from "@/hooks/use-odd-one-out-game";
import { OddOneOutQuestion, OddOneOutState } from "@/types/odd-one-out";

const MOCK_QUESTIONS: OddOneOutQuestion[] = [
  {
    id: "q-animals-1",
    difficulty: "easy",
    themeVi: "Động vật",
    themeEn: "Animals",
    commonTraitVi: "Động vật trên cạn",
    commonTraitEn: "Land animals",
    explanationVi: "Cá mập sống dưới biển, không phải thú trên cạn.",
    explanationEn: "Shark lives in the sea, not a land animal.",
    items: [
      {
        id: "item-dog",
        word: "Dog",
        vietnameseMeaning: "Con chó",
        phonetic: "/dɒɡ/",
        partOfSpeech: "noun",
        emoji: "🐶",
        isOdd: false,
      },
      {
        id: "item-cat",
        word: "Cat",
        vietnameseMeaning: "Con mèo",
        phonetic: "/kæt/",
        partOfSpeech: "noun",
        emoji: "🐱",
        isOdd: false,
      },
      {
        id: "item-shark",
        word: "Shark",
        vietnameseMeaning: "Cá mập",
        phonetic: "/ʃɑːk/",
        partOfSpeech: "noun",
        emoji: "🦈",
        isOdd: true,
      },
      {
        id: "item-elephant",
        word: "Elephant",
        vietnameseMeaning: "Con voi",
        phonetic: "/ˈelɪfənt/",
        partOfSpeech: "noun",
        emoji: "🐘",
        isOdd: false,
      },
    ],
  },
  {
    id: "q-fruits-1",
    difficulty: "easy",
    themeVi: "Hoa quả",
    themeEn: "Fruits",
    commonTraitVi: "Trái cây ngọt",
    commonTraitEn: "Sweet fruits",
    explanationVi: "Cà rốt là loại rau củ rễ, không phải trái cây.",
    explanationEn: "Carrot is a root vegetable, not a fruit.",
    items: [
      {
        id: "item-apple",
        word: "Apple",
        vietnameseMeaning: "Quả táo",
        phonetic: "/ˈæpl/",
        partOfSpeech: "noun",
        emoji: "🍎",
        isOdd: false,
      },
      {
        id: "item-carrot",
        word: "Carrot",
        vietnameseMeaning: "Củ cà rốt",
        phonetic: "/ˈkærət/",
        partOfSpeech: "noun",
        emoji: "🥕",
        isOdd: true,
      },
      {
        id: "item-banana",
        word: "Banana",
        vietnameseMeaning: "Quả chuối",
        phonetic: "/bəˈnɑːnə/",
        partOfSpeech: "noun",
        emoji: "🍌",
        isOdd: false,
      },
      {
        id: "item-orange",
        word: "Orange",
        vietnameseMeaning: "Quả cam",
        phonetic: "/ˈɒrɪndʒ/",
        partOfSpeech: "noun",
        emoji: "🍊",
        isOdd: false,
      },
    ],
  },
];

describe("useOddOneOutGame hook", () => {
  describe("Initial state and question queue generation", () => {
    it("initializes with provided questions and default state", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      expect(result.current.questions).toEqual(MOCK_QUESTIONS);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.currentQuestion?.id).toBe("q-animals-1");
      expect(result.current.selectedId).toBeNull();
      expect(result.current.eliminatedIds).toEqual([]);
      expect(result.current.isClueVisible).toBe(false);
      expect(result.current.showThemeHint).toBe(false);
      expect(result.current.isFiftyFiftyUsed).toBe(false);
      expect(result.current.isAnswerChecked).toBe(false);
      expect(result.current.score).toBe(0);
      expect(result.current.streak).toBe(0);
      expect(result.current.bestStreak).toBe(0);
      expect(result.current.hintsUsed).toBe(0);
      expect(result.current.history).toEqual([]);
      expect(result.current.isCompleted).toBe(false);
      expect(result.current.currentResult).toBeNull();
    });

    it("generates random curriculum questions when none are provided", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ questionCount: 5, difficulty: "easy" })
      );

      expect(result.current.questions).toHaveLength(5);
      result.current.questions.forEach((q) => {
        expect(q.difficulty).toBe("easy");
      });
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.isCompleted).toBe(false);
    });

    it("defaults to 10 questions when options are omitted", () => {
      const { result } = renderHook(() => useOddOneOutGame());

      expect(result.current.questions.length).toBeGreaterThanOrEqual(1);
      expect(result.current.questions.length).toBeLessThanOrEqual(10);
      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe("Card selection", () => {
    it("allows selecting an available card", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.selectCard("item-dog");
      });
      expect(result.current.selectedId).toBe("item-dog");

      act(() => {
        result.current.selectCard("item-shark");
      });
      expect(result.current.selectedId).toBe("item-shark");
    });

    it("ignores selecting eliminated cards", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.applyFiftyFifty();
      });

      const eliminated = result.current.eliminatedIds;
      expect(eliminated.length).toBe(2);

      const eliminatedCardId = eliminated[0];
      act(() => {
        result.current.selectCard(eliminatedCardId);
      });

      expect(result.current.selectedId).not.toBe(eliminatedCardId);
    });

    it("ignores selection after answer has been checked", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.selectCard("item-shark");
      });

      act(() => {
        result.current.checkAnswer();
      });
      expect(result.current.isAnswerChecked).toBe(true);

      act(() => {
        result.current.selectCard("item-dog");
      });
      expect(result.current.selectedId).toBe("item-shark");
    });
  });

  describe("Answer checking & scoring", () => {
    it("does nothing when checkAnswer is called without a selection", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      let checkRes: unknown;
      act(() => {
        checkRes = result.current.checkAnswer();
      });

      expect(checkRes).toBeNull();
      expect(result.current.isAnswerChecked).toBe(false);
      expect(result.current.score).toBe(0);
      expect(result.current.history).toHaveLength(0);
    });

    it("answers correctly: increments score, increments streak, records history", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.selectCard("item-shark"); // Odd item
      });

      act(() => {
        const res = result.current.checkAnswer();
        expect(res?.isCorrect).toBe(true);
      });

      expect(result.current.isAnswerChecked).toBe(true);
      expect(result.current.score).toBe(100); // Base 100 with streak 0
      expect(result.current.streak).toBe(1);
      expect(result.current.bestStreak).toBe(1);
      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].isCorrect).toBe(true);
      expect(result.current.history[0].selectedItem.id).toBe("item-shark");
      expect(result.current.currentResult?.isCorrect).toBe(true);
    });

    it("answers incorrectly: yields 0 points, resets streak, records history", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.selectCard("item-dog"); // Non-odd item
      });

      act(() => {
        const res = result.current.checkAnswer();
        expect(res?.isCorrect).toBe(false);
      });

      expect(result.current.isAnswerChecked).toBe(true);
      expect(result.current.score).toBe(0);
      expect(result.current.streak).toBe(0);
      expect(result.current.bestStreak).toBe(0);
      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].isCorrect).toBe(false);
    });

    it("accumulates streak bonus across consecutive correct answers", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      // Question 1: Correct (Base 100 + streak 0 bonus = 100)
      act(() => {
        result.current.selectCard("item-shark");
      });
      act(() => {
        result.current.checkAnswer();
      });
      expect(result.current.score).toBe(100);
      expect(result.current.streak).toBe(1);

      // Advance to Question 2
      act(() => {
        result.current.nextQuestion();
      });
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.streak).toBe(1);

      // Question 2: Correct (Base 100 + streak 1 bonus 20 = 120, total = 220)
      act(() => {
        result.current.selectCard("item-carrot"); // Odd item in q2
      });
      act(() => {
        result.current.checkAnswer();
      });
      expect(result.current.score).toBe(220);
      expect(result.current.streak).toBe(2);
      expect(result.current.bestStreak).toBe(2);
    });

    it("preserves bestStreak when current streak is broken", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      // Q1 correct
      act(() => {
        result.current.selectCard("item-shark");
      });
      act(() => {
        result.current.checkAnswer();
      });
      expect(result.current.streak).toBe(1);
      expect(result.current.bestStreak).toBe(1);

      // Advance
      act(() => {
        result.current.nextQuestion();
      });

      // Q2 incorrect
      act(() => {
        result.current.selectCard("item-apple"); // Not odd
      });
      act(() => {
        result.current.checkAnswer();
      });
      expect(result.current.streak).toBe(0);
      expect(result.current.bestStreak).toBe(1);
      expect(result.current.score).toBe(100);
    });
  });

  describe("50/50 hint (applyFiftyFifty)", () => {
    it("eliminates 2 non-odd cards and increments hintsUsed", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        const eliminated = result.current.applyFiftyFifty();
        expect(eliminated).toHaveLength(2);
      });

      expect(result.current.eliminatedIds).toHaveLength(2);
      expect(result.current.isFiftyFiftyUsed).toBe(true);
      expect(result.current.hintsUsed).toBe(1);
      // Odd item shark must never be eliminated
      expect(result.current.eliminatedIds).not.toContain("item-shark");
    });

    it("unselects currently selected card if it gets eliminated", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      // Select dog (non-odd)
      act(() => {
        result.current.selectCard("item-dog");
      });
      expect(result.current.selectedId).toBe("item-dog");

      act(() => {
        result.current.applyFiftyFifty();
      });

      if (result.current.eliminatedIds.includes("item-dog")) {
        expect(result.current.selectedId).toBeNull();
      } else {
        expect(result.current.selectedId).toBe("item-dog");
      }
    });

    it("cannot be applied twice on the same question", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.applyFiftyFifty();
      });
      const firstEliminated = [...result.current.eliminatedIds];
      expect(result.current.hintsUsed).toBe(1);

      act(() => {
        const secondEliminated = result.current.applyFiftyFifty();
        expect(secondEliminated).toEqual([]);
      });

      expect(result.current.eliminatedIds).toEqual(firstEliminated);
      expect(result.current.hintsUsed).toBe(1);
    });

    it("cannot be applied after answer is checked", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.selectCard("item-shark");
      });
      act(() => {
        result.current.checkAnswer();
      });

      act(() => {
        result.current.applyFiftyFifty();
      });

      expect(result.current.isFiftyFiftyUsed).toBe(false);
      expect(result.current.eliminatedIds).toEqual([]);
      expect(result.current.hintsUsed).toBe(0);
    });

    it("deducts 25 points hint penalty when scoring correct answer", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.applyFiftyFifty();
      });
      act(() => {
        result.current.selectCard("item-shark");
      });
      act(() => {
        result.current.checkAnswer();
      });

      // 100 base - 25 hint penalty = 75
      expect(result.current.score).toBe(75);
    });
  });

  describe("Theme clue (revealClue & toggleClue)", () => {
    it("reveals clue, activates showThemeHint and isClueVisible, increments hintsUsed", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.revealClue();
      });

      expect(result.current.isClueVisible).toBe(true);
      expect(result.current.showThemeHint).toBe(true);
      expect(result.current.hintsUsed).toBe(1);
    });

    it("does not increment hintsUsed again if revealClue is called repeatedly", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.revealClue();
      });
      expect(result.current.hintsUsed).toBe(1);

      act(() => {
        result.current.revealClue();
      });
      expect(result.current.hintsUsed).toBe(1);
      expect(result.current.isClueVisible).toBe(true);
    });

    it("toggles clue visibility without re-incrementing hints count", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.toggleClue();
      });
      expect(result.current.isClueVisible).toBe(true);
      expect(result.current.hintsUsed).toBe(1);

      act(() => {
        result.current.toggleClue();
      });
      expect(result.current.isClueVisible).toBe(false);
      expect(result.current.hintsUsed).toBe(1);

      act(() => {
        result.current.toggleClue();
      });
      expect(result.current.isClueVisible).toBe(true);
      expect(result.current.hintsUsed).toBe(1);
    });

    it("cannot reveal clue after answer is checked", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.selectCard("item-shark");
      });
      act(() => {
        result.current.checkAnswer();
      });

      act(() => {
        result.current.revealClue();
      });
      expect(result.current.isClueVisible).toBe(false);
      expect(result.current.hintsUsed).toBe(0);
    });

    it("deducts 25 points hint penalty for clue when answering correctly", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.revealClue();
      });
      act(() => {
        result.current.selectCard("item-shark");
      });
      act(() => {
        result.current.checkAnswer();
      });

      // 100 base - 25 clue penalty = 75
      expect(result.current.score).toBe(75);
    });
  });

  describe("Question queue navigation (nextQuestion)", () => {
    it("resets question-level state and advances currentIndex", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.applyFiftyFifty();
      });
      act(() => {
        result.current.revealClue();
      });
      act(() => {
        result.current.selectCard("item-shark");
      });
      act(() => {
        result.current.checkAnswer();
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.isAnswerChecked).toBe(true);
      expect(result.current.isFiftyFiftyUsed).toBe(true);
      expect(result.current.isClueVisible).toBe(true);

      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentQuestion?.id).toBe("q-fruits-1");
      expect(result.current.selectedId).toBeNull();
      expect(result.current.eliminatedIds).toEqual([]);
      expect(result.current.isClueVisible).toBe(false);
      expect(result.current.showThemeHint).toBe(false);
      expect(result.current.isFiftyFiftyUsed).toBe(false);
      expect(result.current.isAnswerChecked).toBe(false);
      expect(result.current.currentResult).toBeNull();

      // Cumulative game state remains intact
      expect(result.current.score).toBe(50); // 100 - 25 - 25 = 50
      expect(result.current.streak).toBe(1);
      expect(result.current.hintsUsed).toBe(2);
      expect(result.current.history).toHaveLength(1);
    });

    it("marks isCompleted: true and invokes onGameComplete on advancing past final question", () => {
      const onGameComplete = vi.fn();
      const { result } = renderHook(() =>
        useOddOneOutGame({
          initialQuestions: MOCK_QUESTIONS,
          onGameComplete,
        })
      );

      // Q1
      act(() => {
        result.current.selectCard("item-shark");
      });
      act(() => {
        result.current.checkAnswer();
      });
      act(() => {
        result.current.nextQuestion();
      });
      expect(result.current.isCompleted).toBe(false);
      expect(onGameComplete).not.toHaveBeenCalled();

      // Q2 (final question)
      act(() => {
        result.current.selectCard("item-carrot");
      });
      act(() => {
        result.current.checkAnswer();
      });
      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.isCompleted).toBe(true);
      expect(onGameComplete).toHaveBeenCalledTimes(1);
      const passedState: OddOneOutState = onGameComplete.mock.calls[0][0];
      expect(passedState.isCompleted).toBe(true);
      expect(passedState.score).toBe(220);
      expect(passedState.history).toHaveLength(2);
    });

    it("does nothing when nextQuestion is called after game is completed", () => {
      const onGameComplete = vi.fn();
      const { result } = renderHook(() =>
        useOddOneOutGame({
          initialQuestions: [MOCK_QUESTIONS[0]],
          onGameComplete,
        })
      );

      act(() => {
        result.current.selectCard("item-shark");
      });
      act(() => {
        result.current.checkAnswer();
      });
      act(() => {
        result.current.nextQuestion();
      });
      expect(result.current.isCompleted).toBe(true);
      expect(onGameComplete).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.nextQuestion();
      });
      expect(onGameComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe("Reset game (resetGame)", () => {
    it("resets all state back to initial values", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: MOCK_QUESTIONS })
      );

      act(() => {
        result.current.selectCard("item-shark");
      });
      act(() => {
        result.current.checkAnswer();
      });
      expect(result.current.score).toBe(100);

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.score).toBe(0);
      expect(result.current.streak).toBe(0);
      expect(result.current.bestStreak).toBe(0);
      expect(result.current.hintsUsed).toBe(0);
      expect(result.current.selectedId).toBeNull();
      expect(result.current.eliminatedIds).toEqual([]);
      expect(result.current.isClueVisible).toBe(false);
      expect(result.current.isFiftyFiftyUsed).toBe(false);
      expect(result.current.isAnswerChecked).toBe(false);
      expect(result.current.history).toEqual([]);
      expect(result.current.isCompleted).toBe(false);
      expect(result.current.questions).toEqual(MOCK_QUESTIONS);
    });

    it("resets game with new questions if provided", () => {
      const { result } = renderHook(() =>
        useOddOneOutGame({ initialQuestions: [MOCK_QUESTIONS[0]] })
      );

      expect(result.current.questions).toHaveLength(1);

      act(() => {
        result.current.resetGame(MOCK_QUESTIONS);
      });

      expect(result.current.questions).toHaveLength(2);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.currentQuestion?.id).toBe("q-animals-1");
    });
  });
});
