import { useState, useCallback, useRef, useEffect } from "react";
import {
  OddOneOutAnswerResult,
  OddOneOutDifficulty,
  OddOneOutQuestion,
  OddOneOutState,
} from "@/types/odd-one-out";
import {
  checkOddOneOutAnswer,
  calculateFiftyFiftyElimination,
  calculateQuestionScore,
} from "@/lib/odd-one-out/engine";
import { getRandomChallenges } from "@/data/odd-one-out/challenges";

export interface UseOddOneOutGameOptions {
  initialQuestions?: OddOneOutQuestion[];
  difficulty?: OddOneOutDifficulty;
  questionCount?: number;
  onGameComplete?: (state: OddOneOutState) => void;
}

export interface UseOddOneOutGameReturn extends OddOneOutState {
  currentQuestion: OddOneOutQuestion | undefined;
  currentResult: OddOneOutAnswerResult | null;
  showThemeHint: boolean;
  selectCard: (id: string) => void;
  checkAnswer: () => OddOneOutAnswerResult | null;
  applyFiftyFifty: () => string[];
  revealClue: () => void;
  toggleClue: () => void;
  nextQuestion: () => void;
  resetGame: (newQuestions?: OddOneOutQuestion[]) => void;
}

/**
 * State machine hook managing Odd One Out gameplay, card selection,
 * hint aids (50/50 elimination & theme clue), scoring combo streaks,
 * question navigation, and session completion.
 */
export function useOddOneOutGame(
  options?: UseOddOneOutGameOptions
): UseOddOneOutGameReturn {
  const {
    initialQuestions,
    difficulty,
    questionCount,
    onGameComplete,
  } = options ?? {};

  const [questions, setQuestions] = useState<OddOneOutQuestion[]>(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      return questionCount
        ? initialQuestions.slice(0, questionCount)
        : initialQuestions;
    }
    return getRandomChallenges(questionCount ?? 10, difficulty);
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [eliminatedIds, setEliminatedIds] = useState<string[]>([]);
  const [isClueVisible, setIsClueVisible] = useState<boolean>(false);
  const [hasClueBeenUsedThisQuestion, setHasClueBeenUsedThisQuestion] =
    useState<boolean>(false);
  const [isFiftyFiftyUsed, setIsFiftyFiftyUsed] = useState<boolean>(false);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [history, setHistory] = useState<OddOneOutAnswerResult[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const onGameCompleteRef = useRef(onGameComplete);
  useEffect(() => {
    onGameCompleteRef.current = onGameComplete;
  }, [onGameComplete]);

  const currentQuestion = questions[currentIndex];
  const currentResult =
    isAnswerChecked && history.length > 0 ? history[history.length - 1] : null;

  const selectCard = useCallback(
    (id: string) => {
      if (isCompleted || isAnswerChecked) return;
      if (eliminatedIds.includes(id)) return;
      setSelectedId(id);
    },
    [isCompleted, isAnswerChecked, eliminatedIds]
  );

  const applyFiftyFifty = useCallback((): string[] => {
    if (isCompleted || isAnswerChecked || isFiftyFiftyUsed || !currentQuestion) {
      return [];
    }

    const eliminated = calculateFiftyFiftyElimination(currentQuestion);
    setEliminatedIds(eliminated);
    setIsFiftyFiftyUsed(true);
    setHintsUsed((prev) => prev + 1);
    setSelectedId((prev) => (prev && eliminated.includes(prev) ? null : prev));
    return eliminated;
  }, [isCompleted, isAnswerChecked, isFiftyFiftyUsed, currentQuestion]);

  const revealClue = useCallback(() => {
    if (isCompleted || isAnswerChecked) return;
    if (!isClueVisible) {
      setIsClueVisible(true);
      if (!hasClueBeenUsedThisQuestion) {
        setHasClueBeenUsedThisQuestion(true);
        setHintsUsed((prev) => prev + 1);
      }
    }
  }, [isCompleted, isAnswerChecked, isClueVisible, hasClueBeenUsedThisQuestion]);

  const toggleClue = useCallback(() => {
    if (isCompleted || isAnswerChecked) return;
    setIsClueVisible((prev) => {
      const next = !prev;
      if (next && !hasClueBeenUsedThisQuestion) {
        setHasClueBeenUsedThisQuestion(true);
        setHintsUsed((h) => h + 1);
      }
      return next;
    });
  }, [isCompleted, isAnswerChecked, hasClueBeenUsedThisQuestion]);

  const checkAnswer = useCallback((): OddOneOutAnswerResult | null => {
    if (isCompleted || isAnswerChecked || !selectedId || !currentQuestion) {
      return null;
    }

    const result = checkOddOneOutAnswer(currentQuestion, selectedId);
    const hintsOnThisQuestion =
      (isFiftyFiftyUsed ? 1 : 0) +
      (hasClueBeenUsedThisQuestion || isClueVisible ? 1 : 0);
    const earnedScore = calculateQuestionScore(
      result.isCorrect,
      streak,
      hintsOnThisQuestion
    );

    setIsAnswerChecked(true);
    setScore((prev) => prev + earnedScore);
    setStreak((prev) => (result.isCorrect ? prev + 1 : 0));
    setBestStreak((prev) =>
      result.isCorrect ? Math.max(prev, streak + 1) : prev
    );
    setHistory((prev) => [...prev, result]);

    return result;
  }, [
    isCompleted,
    isAnswerChecked,
    selectedId,
    currentQuestion,
    isFiftyFiftyUsed,
    hasClueBeenUsedThisQuestion,
    isClueVisible,
    streak,
  ]);

  const nextQuestion = useCallback(() => {
    if (isCompleted) return;

    if (currentIndex >= questions.length - 1) {
      setIsCompleted(true);
      const finalState: OddOneOutState = {
        questions,
        currentIndex,
        selectedId,
        eliminatedIds,
        isClueVisible,
        isFiftyFiftyUsed,
        isAnswerChecked,
        score,
        streak,
        bestStreak,
        hintsUsed,
        history,
        isCompleted: true,
      };
      onGameCompleteRef.current?.(finalState);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedId(null);
    setEliminatedIds([]);
    setIsClueVisible(false);
    setIsFiftyFiftyUsed(false);
    setIsAnswerChecked(false);
    setHasClueBeenUsedThisQuestion(false);
  }, [
    isCompleted,
    currentIndex,
    questions,
    selectedId,
    eliminatedIds,
    isClueVisible,
    isFiftyFiftyUsed,
    isAnswerChecked,
    score,
    streak,
    bestStreak,
    hintsUsed,
    history,
  ]);

  const resetGame = useCallback(
    (newQuestions?: OddOneOutQuestion[]) => {
      if (newQuestions && newQuestions.length > 0) {
        setQuestions(newQuestions);
      } else if (initialQuestions && initialQuestions.length > 0) {
        setQuestions(
          questionCount
            ? initialQuestions.slice(0, questionCount)
            : initialQuestions
        );
      } else {
        setQuestions(getRandomChallenges(questionCount ?? 10, difficulty));
      }

      setCurrentIndex(0);
      setSelectedId(null);
      setEliminatedIds([]);
      setIsClueVisible(false);
      setIsFiftyFiftyUsed(false);
      setIsAnswerChecked(false);
      setHasClueBeenUsedThisQuestion(false);
      setScore(0);
      setStreak(0);
      setBestStreak(0);
      setHintsUsed(0);
      setHistory([]);
      setIsCompleted(false);
    },
    [initialQuestions, questionCount, difficulty]
  );

  return {
    questions,
    currentIndex,
    selectedId,
    eliminatedIds,
    isClueVisible,
    showThemeHint: isClueVisible,
    isFiftyFiftyUsed,
    isAnswerChecked,
    score,
    streak,
    bestStreak,
    hintsUsed,
    history,
    isCompleted,
    currentQuestion,
    currentResult,
    selectCard,
    checkAnswer,
    applyFiftyFifty,
    revealClue,
    toggleClue,
    nextQuestion,
    resetGame,
  };
}
