import { useState, useCallback } from 'react';
import { FillBlankQuestion, TypingGameState } from '@/types/typing';
import { validateAnswer } from '@/lib/validation';

export function useTypingGame(questions: FillBlankQuestion[]) {
  const [state, setState] = useState<TypingGameState>({
    currentIndex: 0,
    score: 0,
    status: 'playing',
    userInput: '',
    isCorrect: null,
  });

  const currentQuestion = questions[state.currentIndex];

  const handleInputChange = useCallback((value: string) => {
    if (state.isCorrect !== null) return; // prevent typing if already answered
    setState(prev => ({ ...prev, userInput: value }));
  }, [state.isCorrect]);

  const handleSubmit = useCallback(() => {
    if (state.isCorrect !== null || !currentQuestion || !state.userInput.trim()) return;

    const correct = validateAnswer(
      state.userInput,
      currentQuestion.correctAnswer,
      currentQuestion.acceptableAlternatives
    );

    setState(prev => ({
      ...prev,
      isCorrect: correct,
      score: correct ? prev.score + 1 : prev.score,
    }));
  }, [state.isCorrect, currentQuestion, state.userInput]);

  const handleNext = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentIndex + 1;
      const isFinished = nextIndex >= questions.length;
      return {
        ...prev,
        currentIndex: isFinished ? prev.currentIndex : nextIndex,
        status: isFinished ? 'completed' : 'playing',
        userInput: '',
        isCorrect: null,
      };
    });
  }, [questions.length]);

  return {
    state,
    currentQuestion,
    handleInputChange,
    handleSubmit,
    handleNext,
    totalQuestions: questions.length,
  };
}
