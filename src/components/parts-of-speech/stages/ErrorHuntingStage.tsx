"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, Check, AlertCircle } from "lucide-react";
import { ErrorHunterItem } from "@/types/parts-of-speech";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorHuntingStageProps {
  questions: ErrorHunterItem[];
  onComplete: (score: number, total: number) => void;
}

export function ErrorHuntingStage({ questions, onComplete }: ErrorHuntingStageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [selectedReplacement, setSelectedReplacement] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [nonErrorNotice, setNonErrorNotice] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];

  const isErrorTokenChosen = selectedTokenIndex === currentQuestion?.errorTokenIndex;

  const handleTokenClick = (index: number) => {
    if (isSubmitted) return;

    setSelectedTokenIndex(index);

    if (index === currentQuestion.errorTokenIndex) {
      setNonErrorNotice(null);
    } else {
      setSelectedReplacement(null);
      setNonErrorNotice(
        `Vị trí này không có lỗi. Từ "${currentQuestion.tokens[index]}" đã đúng. Hãy tìm từ khác bị sai!`
      );
    }
  };

  const handleReplacementSelect = (val: string) => {
    if (isSubmitted) return;
    setSelectedReplacement(val);
  };

  const handleSubmit = () => {
    if (selectedTokenIndex === null || !selectedReplacement || isSubmitted) return;

    // Check if the selected replacement is correct
    const correctOption = currentQuestion.options.find(opt => opt.value === selectedReplacement);
    const correct = correctOption?.isCorrect ?? false;
    
    setIsCorrect(correct);
    setIsSubmitted(true);
    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedTokenIndex(null);
      setSelectedReplacement(null);
      setIsSubmitted(false);
      setIsCorrect(null);
      setNonErrorNotice(null);
    } else {
      onComplete(score, questions.length);
    }
  };

  if (!currentQuestion) return null;

  return (
    <Card className="max-w-2xl mx-auto border-2 border-emerald-100 shadow-sm bg-card">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground mb-4">
          <span>Câu {currentIndex + 1} / {questions.length}</span>
          <span className="text-emerald-600">Điểm: {score}</span>
        </div>

        <div className="space-y-6">
          <p className="text-sm font-medium text-slate-500">
            Nghĩa: {currentQuestion.vietnameseMeaning}
          </p>

          <div className="space-y-3">
            <span className="text-xs font-bold text-muted-foreground uppercase">
              {isSubmitted ? "Câu hoàn chỉnh" : "Bước 1: Chọn từ dùng sai từ loại"}
            </span>
            
            {!isSubmitted ? (
              <div className="p-4 sm:p-6 rounded-xl bg-slate-50 border flex flex-wrap gap-2">
                {currentQuestion.tokens.map((token, index) => {
                  const isSelected = selectedTokenIndex === index;
                  const isTargetError = index === currentQuestion.errorTokenIndex;

                  return (
                    <button
                      key={index}
                      onClick={() => handleTokenClick(index)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-lg transition-all",
                        isSelected && isTargetError ? "bg-amber-200 text-amber-900 border-2 border-amber-500 font-bold" :
                        isSelected && !isTargetError ? "bg-slate-200 border-2 border-slate-400" :
                        "bg-white border-2 border-transparent hover:border-amber-300"
                      )}
                    >
                      {token}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 sm:p-6 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-lg font-medium text-foreground">
                  {currentQuestion.fullCorrectSentence}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Thay thế cho: <span className="line-through text-rose-500">{currentQuestion.tokens[currentQuestion.errorTokenIndex]}</span>
                </p>
              </div>
            )}
          </div>

          {nonErrorNotice && !isSubmitted && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{nonErrorNotice}</span>
            </div>
          )}

          {isErrorTokenChosen && !isSubmitted && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                Bước 2: Chọn từ đúng thay thế
              </span>
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((opt) => (
                  <Button
                    key={opt.value}
                    variant="outline"
                    onClick={() => handleReplacementSelect(opt.value)}
                    className={cn(
                      "h-auto py-3 transition-all text-sm",
                      selectedReplacement === opt.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold"
                        : "hover:border-emerald-300"
                    )}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isSubmitted && (
            <div className={cn(
              "p-4 rounded-xl border text-left",
              isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle2 className="size-5 text-emerald-600" />
                ) : (
                  <XCircle className="size-5 text-rose-600" />
                )}
                <span className="font-bold">{isCorrect ? "Chính xác!" : "Chưa chính xác!"}</span>
              </div>
              <div className="text-sm mt-3 space-y-2">
                <p><strong>Lỗi sai:</strong> {currentQuestion.explanation.whyWrongVi}</p>
                <p><strong>Tác động:</strong> {currentQuestion.explanation.workplaceImpactVi}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 bg-slate-50 border-t flex justify-end">
        {!isSubmitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!isErrorTokenChosen || !selectedReplacement} 
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="size-4 mr-2" /> Xác nhận
          </Button>
        ) : (
          <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
            {currentIndex < questions.length - 1 ? "Câu tiếp theo" : "Hoàn thành chặng"} <ArrowRight className="size-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
