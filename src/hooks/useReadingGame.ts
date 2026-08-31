import { useState } from 'react';
import { ReadingModule, ReadingGameState } from '@/types/reading';

export function useReadingGame(moduleData: ReadingModule) {
  const [gameState, setGameState] = useState<ReadingGameState>({
    status: 'reading',
    currentQuestionIndex: 0,
    score: 0,
    answers: [],
  });

  const handleAnswer = (questionId: string, selectedOptionIndex: number) => {
    if (gameState.status === 'completed') return;

    const currentQuestion = moduleData.questions[gameState.currentQuestionIndex];
    const isCorrect = currentQuestion.correctOptionIndex === selectedOptionIndex;

    setGameState((prev) => {
      const newAnswers = [...prev.answers, { questionId, selectedOptionIndex, isCorrect }];

      return {
        ...prev,
        answers: newAnswers,
        score: isCorrect ? prev.score + 1 : prev.score,
        // Wait for the user to explicitly go to the next question, 
        // or just auto-advance if we want. But the spec says: "an explanation is shown, and the user can proceed to the next question."
        // We'll manage proceeding in a separate function.
      };
    });
  };

  const nextQuestion = () => {
    setGameState((prev) => {
      const isLastQuestion = prev.currentQuestionIndex === moduleData.questions.length - 1;
      if (isLastQuestion) {
        return { ...prev, status: 'completed' };
      }
      return { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 };
    });
  };

  const resetGame = () => {
    setGameState({
      status: 'reading',
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
    });
  };

  return {
    gameState,
    handleAnswer,
    nextQuestion,
    resetGame,
  };
}
