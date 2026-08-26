"use client";

import { useState } from "react";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { DevOpsItem } from "@/types/tenses";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSessionQuestions } from "@/hooks/useSessionQuestions";
import { ConjugationQuestionUI } from "./ui/ConjugationQuestionUI";
import { ErrorHunterQuestionUI } from "./ui/ErrorHunterQuestionUI";
import { SentenceBuilderQuestionUI } from "./ui/SentenceBuilderQuestionUI";

export interface DevOpsChallengeStageProps {
  items: DevOpsItem[];
  onStageComplete: (score: number, total: number, attemptHistory?: import("@/types/tenses").AttemptItem[]) => void;
  onBack?: () => void;
  className?: string;
}

export function DevOpsChallengeStage({
  items,
  onStageComplete,
  onBack,
  className,
}: DevOpsChallengeStageProps) {
  const sessionQuestions = useSessionQuestions(items, 10, 'gamehub-session-present-simple-devops');
  
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
            Dữ liệu chặng thử thách IT/DevOps hiện chưa sẵn sàng hoặc rỗng.
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

    let correctAnswer = "";
    let explanationVi = "";
    
    if (currentItem.challengeType === "conjugation") {
      const cItem = currentItem as import("@/types/tenses").ConjugationItem;
      correctAnswer = cItem.correctAnswer || "";
      explanationVi = cItem.explanation.ruleVi || "";
    } else if (currentItem.challengeType === "sentenceBuilding") {
      const sItem = currentItem as import("@/types/tenses").SentenceBuilderItem;
      correctAnswer = sItem.fullSentenceEn || "";
      explanationVi = sItem.grammarTip.tipVi || "";
    } else if (currentItem.challengeType === "errorHunting") {
      const eItem = currentItem as import("@/types/tenses").ErrorHunterItem;
      correctAnswer = eItem.correctToken || "";
      explanationVi = eItem.explanation.whyWrongVi || "";
    }

    const attempt: import("@/types/tenses").AttemptItem = {
      questionId: currentItem.id,
      contextVi: currentItem.scenarioVi,
      userAnswer,
      correctAnswer,
      isCorrect,
      explanationVi,
    };
    const newHistory = [...attemptHistory, attempt];
    setAttemptHistory(newHistory);

    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onStageComplete(newScore, total, newHistory);
    }
  };

  if (currentItem.challengeType === "conjugation") {
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

  if (currentItem.challengeType === "errorHunting") {
    return (
      <ErrorHunterQuestionUI
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

  if (currentItem.challengeType === "sentenceBuilding") {
    return (
      <SentenceBuilderQuestionUI
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

  return null;
}
