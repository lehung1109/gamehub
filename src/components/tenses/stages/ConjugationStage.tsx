"use client";

import { useState } from "react";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { ConjugationItem } from "@/types/tenses";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSessionQuestions } from "@/hooks/useSessionQuestions";
import { ConjugationQuestionUI } from "./ui/ConjugationQuestionUI";

export interface ConjugationStageProps {
  items: ConjugationItem[];
  onStageComplete: (score: number, total: number, attemptHistory?: import("@/types/tenses").AttemptItem[]) => void;
  onBack?: () => void;
  className?: string;
}

export function ConjugationStage({
  items,
  onStageComplete,
  onBack,
  className,
}: ConjugationStageProps) {
  const sessionQuestions = useSessionQuestions(items, 10, 'gamehub-session-present-simple-conjugation');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const [attemptHistory, setAttemptHistory] = useState<import("@/types/tenses").AttemptItem[]>([]);

  const total = sessionQuestions?.length || 0;
  const currentItem = sessionQuestions?.[currentIndex];

  if (items && items.length > 0 && sessionQuestions.length === 0) {
    return null; // or a loading spinner
  }

  if (!sessionQuestions || sessionQuestions.length === 0 || !currentItem) {
    return (
      <Card className="p-8 text-center border-dashed">
        <div className="flex flex-col items-center justify-center space-y-4">
          <HelpCircle className="size-12 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-lg font-bold text-foreground">Không có câu hỏi bài tập</h3>
          <p className="text-sm text-muted-foreground">
            Dữ liệu chặng chia động từ hiện chưa sẵn sàng hoặc rỗng.
          </p>
          {onBack && (
            <Button onClick={onBack} variant="outline" className="gap-2 min-h-[44px]">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Quay lại danh sách
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const handleNext = (isCorrect: boolean, userAnswer: string) => {
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    const attempt: import("@/types/tenses").AttemptItem = {
      questionId: currentItem.id,
      contextVi: currentItem.scenarioVi,
      userAnswer,
      correctAnswer: currentItem.correctAnswer,
      isCorrect,
      explanationVi: currentItem.explanation.ruleVi,
    };
    const newHistory = [...attemptHistory, attempt];
    setAttemptHistory(newHistory);

    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onStageComplete(newScore, total, newHistory);
    }
  };

  return (
    <ConjugationQuestionUI
      item={currentItem}
      currentIndex={currentIndex}
      total={total}
      score={score}
      onNext={handleNext}
      onBack={onBack}
      className={className}
    />
  );
}
