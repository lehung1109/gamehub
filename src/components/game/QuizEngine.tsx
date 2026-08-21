"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FeedbackOverlay } from "@/components/custom/FeedbackOverlay";
import { cn } from "@/lib/utils";

export interface QuizQuestion<T = unknown> {
  id?: string;
  prompt: T;
  options: T[];
  correctIndex: number;
  correctAnswerText?: string;
  explanation?: string;
}

export interface QuizEngineProps<T = unknown> {
  questions: QuizQuestion<T>[];
  renderPrompt?: (prompt: T, question: QuizQuestion<T>) => React.ReactNode;
  renderOption: (
    option: T,
    index: number,
    isSelected: boolean,
    isCorrect: boolean | null
  ) => React.ReactNode;
  onSpeak?: (prompt: T) => void;
  onComplete: (score: number, total: number) => void;
  onRestart?: () => void;
  title?: string;
  autoAdvance?: boolean;
  autoAdvanceMs?: number;
  className?: string;
}

function extractOptionText(option: unknown): string | undefined {
  if (typeof option === "string") return option;
  if (typeof option === "object" && option !== null) {
    const record = option as Record<string, unknown>;
    if (typeof record.word === "string") return record.word;
    if (typeof record.english === "string") return record.english;
    if (typeof record.name === "string") return record.name;
    if (typeof record.letter === "string") return record.letter;
  }
  return undefined;
}

export function QuizEngine<T = unknown>({
  questions,
  renderPrompt,
  renderOption,
  onSpeak,
  onComplete,
  onRestart,
  title,
  autoAdvance = true,
  autoAdvanceMs = 1500,
  className,
}: QuizEngineProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    type: "correct" | "wrong";
    correctAnswer?: string;
  }>({
    open: false,
    type: "correct",
  });
  const [isCompleted, setIsCompleted] = useState(false);

  const hasQuestions = questions && questions.length > 0;
  const currentQuestion = hasQuestions ? questions[currentIndex] : undefined;

  // Automatically trigger onSpeak when a new question is presented
  useEffect(() => {
    if (onSpeak && currentQuestion && !isCompleted) {
      onSpeak(currentQuestion.prompt);
    }
  }, [currentIndex, onSpeak, isCompleted, currentQuestion]);

  if (!hasQuestions || !currentQuestion) {
    return (
      <div className="text-center p-8 text-muted-foreground font-medium">
        Không có câu hỏi nào. (No questions available.)
      </div>
    );
  }

  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null || feedback.open || isCompleted) return;

    setSelectedOption(index);
    const isCorrect = index === currentQuestion.correctIndex;
    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(nextScore);
      setFeedback({
        open: true,
        type: "correct",
      });
    } else {
      const answerText =
        currentQuestion.correctAnswerText ||
        extractOptionText(currentQuestion.options[currentQuestion.correctIndex]);

      setFeedback({
        open: true,
        type: "wrong",
        correctAnswer: answerText,
      });
    }
  };

  const handleContinue = () => {
    if (!feedback.open && selectedOption === null) return;
    setFeedback((prev) => ({ ...prev, open: false }));
    setSelectedOption(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      onComplete(score, questions.length);
    }
  };

  const handlePlayAgain = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsCompleted(false);
    setFeedback({ open: false, type: "correct" });
    if (onRestart) {
      onRestart();
    }
  };

  if (isCompleted) {
    const perfectScore = score === questions.length;
    const goodScore = score >= Math.ceil(questions.length / 2);

    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 text-center max-w-md mx-auto space-y-6 bg-card rounded-3xl border-4 border-primary/20 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="text-7xl animate-bounce">
          {perfectScore ? "👑" : goodScore ? "🎉" : "💪"}
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-primary">
            {perfectScore
              ? "Tuyệt đỉnh! (Perfect!)"
              : goodScore
              ? "Chúc mừng bạn! (Well Done!)"
              : "Hoàn thành bài tập! (Completed!)"}
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Bạn đã trả lời đúng <strong className="text-primary text-xl">{score}</strong> / {questions.length} câu hỏi!
          </p>
        </div>

        <div className="flex justify-center gap-2 text-4xl py-2">
          <span className={score > 0 ? "scale-110" : "grayscale opacity-40"}>⭐</span>
          <span className={goodScore ? "scale-110" : "grayscale opacity-40"}>⭐</span>
          <span className={perfectScore ? "scale-110" : "grayscale opacity-40"}>⭐</span>
        </div>

        <Button
          type="button"
          size="lg"
          onClick={handlePlayAgain}
          className="w-full rounded-2xl py-6 text-xl font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer"
        >
          🔄 Chơi lại (Play Again)
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-2xl mx-auto space-y-6", className)}>
      {/* Header & Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm sm:text-base font-bold text-muted-foreground px-1">
          <span>{title || "Trắc nghiệm / Quiz"}</span>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-extrabold">
            Câu {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Prompt Area */}
      {renderPrompt ? (
        <div className="py-2">
          {renderPrompt(currentQuestion.prompt, currentQuestion)}
        </div>
      ) : null}

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = selectedOption !== null ? idx === currentQuestion.correctIndex : null;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectOption(idx)}
              disabled={selectedOption !== null}
              className={cn(
                "p-4 sm:p-6 rounded-3xl border-3 text-left font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-default flex items-center justify-between",
                selectedOption === null && "border-border bg-card hover:border-primary hover:bg-primary/5 hover:scale-102",
                isSelected && isCorrect && "border-emerald-500 bg-emerald-100 text-emerald-950 ring-4 ring-emerald-300 dark:bg-emerald-950",
                isSelected && !isCorrect && "border-rose-500 bg-rose-100 text-rose-950 ring-4 ring-rose-300 dark:bg-rose-950",
                selectedOption !== null && !isSelected && idx === currentQuestion.correctIndex && "border-emerald-500 bg-emerald-50 text-emerald-900",
                selectedOption !== null && !isSelected && idx !== currentQuestion.correctIndex && "opacity-60 border-border bg-muted/40"
              )}
            >
              <div className="flex-1">
                {renderOption(option, idx, isSelected, isCorrect)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback Dialog */}
      <FeedbackOverlay
        open={feedback.open}
        type={feedback.type}
        correctAnswer={feedback.correctAnswer}
        autoAdvance={autoAdvance}
        autoAdvanceMs={autoAdvanceMs}
        onContinue={handleContinue}
      />
    </div>
  );
}
