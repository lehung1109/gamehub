"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, Check } from "lucide-react";
import { FillInBlankItem } from "@/types/parts-of-speech";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FillInBlankStageProps {
  questions: FillInBlankItem[];
  onComplete: (score: number, total: number) => void;
}

export function FillInBlankStage({ questions, onComplete }: FillInBlankStageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentQuestion = questions[currentIndex];

  const handleSelect = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || isSubmitted) return;

    const correct = selectedOption === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setIsSubmitted(true);
    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setIsCorrect(null);
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
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600 capitalize">
              {currentQuestion.contextType}
            </span>
          </div>

          <div className="p-4 sm:p-6 bg-slate-50 border rounded-xl text-lg sm:text-xl font-medium leading-relaxed">
            {currentQuestion.textBefore}
            <span className={cn(
              "inline-block min-w-[120px] border-b-2 mx-2 text-center pb-1 transition-all",
              !selectedOption && "border-slate-300",
              selectedOption && !isSubmitted && "border-emerald-400 text-emerald-700",
              isSubmitted && isCorrect && "border-emerald-500 text-emerald-600 font-bold",
              isSubmitted && !isCorrect && "border-rose-500 text-rose-600 line-through"
            )}>
              {selectedOption || "\u00A0"}
            </span>
            {currentQuestion.textAfter}
          </div>

          {!isSubmitted && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-left font-medium transition-all hover:border-emerald-300 hover:bg-emerald-50/50",
                    selectedOption === opt ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {isSubmitted && (
            <div className={cn(
              "mt-6 p-4 rounded-xl border text-left animate-in fade-in-50",
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
              {!isCorrect && (
                <p className="font-semibold mb-2">Đáp án đúng: <span className="text-emerald-700">{currentQuestion.correctAnswer}</span></p>
              )}
              <p className="text-sm text-muted-foreground">{currentQuestion.explanationVi}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 bg-slate-50 border-t flex justify-end">
        {!isSubmitted ? (
          <Button onClick={handleSubmit} disabled={!selectedOption} className="bg-emerald-600 hover:bg-emerald-700">
            <Check className="size-4 mr-2" /> Kiểm tra
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
