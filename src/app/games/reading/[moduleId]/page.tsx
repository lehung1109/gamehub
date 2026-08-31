'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ReadingModule } from '@/types/reading';
import { useReadingGame } from '@/hooks/useReadingGame';
import { PassageText } from '@/components/reading/PassageText';
import { QuestionList } from '@/components/reading/QuestionList';
import { Button } from '@/components/ui/button';

// Mock fetching function
async function fetchModule(id: string): Promise<ReadingModule | null> {
  try {
    // For MVP, we directly import the mock file. 
    // In a real app we'd fetch from API or load dynamically.
    if (id === 'test-module' || id === 'a-day-at-the-park') {
      const data = await import('@/data/reading/a-day-at-the-park.json');
      return data.default as ReadingModule;
    }
    return null;
  } catch {
    return null;
  }
}

export default function ReadingGamePage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.moduleId as string;
  
  const [moduleData, setModuleData] = useState<ReadingModule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModule(moduleId).then(data => {
      setModuleData(data);
      setLoading(false);
    });
  }, [moduleId]);

  if (loading) {
    return <div className="p-8 text-center">Loading module...</div>;
  }

  if (!moduleData) {
    return <div className="p-8 text-center">Module not found</div>;
  }

  return <ReadingGame moduleData={moduleData} onExit={() => router.push('/games')} />;
}

function ReadingGame({ moduleData, onExit }: { moduleData: ReadingModule, onExit: () => void }) {
  const { gameState, handleAnswer, nextQuestion, resetGame } = useReadingGame(moduleData);

  if (gameState.status === 'completed') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-6">Quiz Completed!</h1>
        <div className="bg-muted p-8 rounded-xl mb-8">
          <p className="text-xl mb-2">Your Score</p>
          <p className="text-5xl font-extrabold text-primary">
            {gameState.score} / {moduleData.questions.length}
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={resetGame}>Try Again</Button>
          <Button onClick={onExit}>Exit Game</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        {/* Left Column: Passage Text (Scrollable) */}
        <div className="bg-card rounded-xl shadow-sm border overflow-y-auto p-6 md:p-8 h-[40vh] md:h-full">
          <PassageText title={moduleData.title} text={moduleData.passageText} vocabulary={moduleData.vocabulary} />
        </div>

        {/* Right Column: Questions (Scrollable) */}
        <div className="bg-card rounded-xl shadow-sm border overflow-y-auto p-6 md:p-8 h-[40vh] md:h-full flex flex-col">
          <QuestionList
            questions={moduleData.questions}
            currentQuestionIndex={gameState.currentQuestionIndex}
            answers={gameState.answers}
            onAnswer={handleAnswer}
            onNext={nextQuestion}
          />
        </div>
      </div>
    </div>
  );
}
