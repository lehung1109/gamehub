"use client";

import React, { Suspense } from 'react';
import { useTypingGame } from '@/hooks/useTypingGame';
import { parseTenseDataToTypingQuestions } from '@/lib/typingParser';
import presentSimpleData from '@/data/tenses/present-simple.json';
import { SentenceWithInput } from '@/components/typing/SentenceWithInput';
import { BackButton } from '@/components/custom/BackButton';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useGameConfig } from '@/hooks/useGameConfig';
import { TypingSettings } from '@/types/config';

function TypingGameContent() {
  const { isLoading } = useGameConfig<TypingSettings>('typing');
  const [questions, setQuestions] = React.useState<ReturnType<typeof parseTenseDataToTypingQuestions>>([]);

  React.useEffect(() => {
    // In a full app, we would load the tenses based on settings.topics
    // For now we just load present-simple as the base data to satisfy User Story 1
    const allQuestions = parseTenseDataToTypingQuestions(presentSimpleData);
    // shuffle and take first 10 for a session
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestions(shuffled);
  }, []);

  const {
    state,
    currentQuestion,
    handleInputChange,
    handleSubmit,
    handleNext,
    totalQuestions,
  } = useTypingGame(questions);

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="container py-8 max-w-2xl mx-auto">
        <BackButton />
        <Card className="p-8 text-center mt-6">
          <p className="text-muted-foreground">No typing questions found.</p>
        </Card>
      </div>
    );
  }

  if (state.status === 'completed') {
    return (
      <div className="container py-8 max-w-2xl mx-auto text-center space-y-6">
        <BackButton />
        <Card className="p-8 mt-6">
          <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-xl mb-6">
            Your score: {state.score} / {totalQuestions}
          </p>
          <Button onClick={() => window.location.reload()} size="lg">
            Play Again
          </Button>
        </Card>
      </div>
    );
  }

  const progress = (state.currentIndex / totalQuestions) * 100;

  return (
    <div className="container py-4 md:py-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <div className="text-sm font-medium">
          Score: {state.score}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {state.currentIndex + 1} of {totalQuestions}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-6 md:p-10 mt-8 min-h-[300px] flex flex-col justify-center items-center gap-8">
        <SentenceWithInput
          textBefore={currentQuestion.textBefore}
          textAfter={currentQuestion.textAfter}
          value={state.userInput}
          hint={currentQuestion.baseVerb}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          disabled={state.isCorrect !== null}
          isCorrect={state.isCorrect}
        />

        {state.isCorrect !== null && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className={`flex items-center gap-2 text-lg font-semibold ${
              state.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {state.isCorrect ? (
                <><CheckCircle2 className="w-6 h-6" /> Correct!</>
              ) : (
                <><AlertCircle className="w-6 h-6" /> Incorrect</>
              )}
            </div>

            {!state.isCorrect && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">The correct answer was:</p>
                <p className="text-lg font-mono bg-muted px-4 py-2 rounded-md font-medium">
                  {currentQuestion.correctAnswer}
                </p>
              </div>
            )}

            {currentQuestion.explanation && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg max-w-md text-center mt-2 border">
                <p className="font-semibold text-foreground mb-1">{currentQuestion.explanation.ruleVi}</p>
                <p>{currentQuestion.explanation.detailedAnalysisVi}</p>
              </div>
            )}

            <Button onClick={handleNext} className="mt-4 min-w-[120px]">
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function TypingGamePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading game...</div>}>
      <TypingGameContent />
    </Suspense>
  );
}
