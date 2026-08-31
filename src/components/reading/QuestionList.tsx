import React from 'react';
import { ReadingQuestion } from '@/types/reading';
import { Button } from '@/components/ui/button';

interface QuestionItemProps {
  question: ReadingQuestion;
  selectedOptionIndex?: number;
  isCorrect?: boolean;
  onAnswer: (questionId: string, index: number) => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function QuestionItem({
  question,
  selectedOptionIndex,
  isCorrect,
  onAnswer,
  onNext,
  isLastQuestion,
}: QuestionItemProps) {
  const hasAnswered = selectedOptionIndex !== undefined;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{question.questionText}</h3>
      <div className="space-y-2">
        {question.options.map((option, index) => {
          let variant: 'default' | 'outline' | 'destructive' | 'secondary' = 'outline';
          
          if (hasAnswered) {
            if (index === question.correctOptionIndex) {
              variant = 'default'; // Correct answer gets highlighted
            } else if (index === selectedOptionIndex && !isCorrect) {
              variant = 'destructive'; // Wrong answer selected
            } else {
              variant = 'outline';
            }
          }

          return (
            <Button
              key={index}
              variant={variant}
              className={`w-full justify-start text-left h-auto py-3 px-4 ${
                hasAnswered && index === question.correctOptionIndex
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                  : ''
              }`}
              onClick={() => !hasAnswered && onAnswer(question.id, index)}
              disabled={hasAnswered}
            >
              {option}
            </Button>
          );
        })}
      </div>

      {hasAnswered && (
        <div className="mt-6 p-4 rounded-lg bg-muted border border-border">
          <p className="font-medium mb-2">
            {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
          </p>
          <p className="text-muted-foreground">{question.explanation}</p>
          <Button className="mt-4" onClick={onNext}>
            {isLastQuestion ? 'Finish' : 'Next Question'}
          </Button>
        </div>
      )}
    </div>
  );
}

interface QuestionListProps {
  questions: ReadingQuestion[];
  currentQuestionIndex: number;
  answers: Array<{
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }>;
  onAnswer: (questionId: string, index: number) => void;
  onNext: () => void;
}

export function QuestionList({
  questions,
  currentQuestionIndex,
  answers,
  onAnswer,
  onNext,
}: QuestionListProps) {
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);

  return (
    <div className="w-full">
      <div className="mb-4 text-sm font-medium text-muted-foreground">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
      <QuestionItem
        question={currentQuestion}
        selectedOptionIndex={currentAnswer?.selectedOptionIndex}
        isCorrect={currentAnswer?.isCorrect}
        onAnswer={onAnswer}
        onNext={onNext}
        isLastQuestion={currentQuestionIndex === questions.length - 1}
      />
    </div>
  );
}
