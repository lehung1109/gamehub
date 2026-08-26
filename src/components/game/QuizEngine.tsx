"use client";

import React, { useState, useEffect, useRef } from "react";
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

export interface QuestionAnswerDetail<T = unknown> {
  question: QuizQuestion<T>;
  promptText: string;
  selectedAnswerText?: string;
  correctAnswerText?: string;
  isCorrect: boolean;
  timeTakenMs: number;
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
  getOptionAriaLabel?: (option: T, index: number) => string | undefined;
  onSpeak?: (prompt: T) => void;
  onAnswer?: (detail: QuestionAnswerDetail<T>) => void;
  onComplete: (score: number, total: number) => void;
  onRestart?: () => void;
  title?: string;
  autoAdvance?: boolean;
  autoAdvanceMs?: number;
  className?: string;
}

export function extractOptionText(option: unknown): string {
  if (typeof option === "string") return option;
  if (typeof option === "number") return String(option);
  if (typeof option === "object" && option !== null) {
    const record = option as Record<string, unknown>;
    if (typeof record.english === "string") return record.english;
    if (typeof record.word === "string") return record.word;
    if (typeof record.name === "string") return record.name;
    if (typeof record.letter === "string") return record.letter;
    if (typeof record.value !== "undefined") return String(record.value);
    if (typeof record.full === "string") return record.full;
  }
  return "";
}

export function QuizEngine<T = unknown>({
  questions,
  renderPrompt,
  renderOption,
  getOptionAriaLabel,
  onSpeak,
  onAnswer,
  onComplete,
  onRestart,
  title,
  autoAdvance = true,
  autoAdvanceMs = 1500,
  className,
}: QuizEngineProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<{
    open: boolean;
    type: "correct" | "wrong";
    correctAnswer?: string;
  }>({
    open: false,
    type: "correct",
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const isSelectingRef = useRef(false);
  const questionStartTimeRef = useRef<number>(0);

  const hasQuestions = questions && questions.length > 0;
  const currentQuestion = hasQuestions ? questions[currentIndex] : undefined;

  const calculateScore = React.useCallback(
    (currentAnswers: Record<number, number>) => {
      if (!questions) return 0;
      return questions.reduce((acc, q, idx) => {
        return currentAnswers[idx] === q.correctIndex ? acc + 1 : acc;
      }, 0);
    },
    [questions]
  );

  const score = calculateScore(answers);

  // Reset timer whenever currentIndex changes
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentIndex]);

  // Automatically trigger onSpeak when a new question is presented
  useEffect(() => {
    if (onSpeak && currentQuestion && !isCompleted) {
      onSpeak(currentQuestion.prompt);
    }
  }, [currentIndex, onSpeak, isCompleted, currentQuestion]);

  const handleSelectOption = React.useCallback(
    (index: number) => {
      if (
        selectedOption !== null ||
        feedback.open ||
        isCompleted ||
        isSelectingRef.current ||
        !currentQuestion
      ) {
        return;
      }
      isSelectingRef.current = true;

      const timeTakenMs =
        questionStartTimeRef.current > 0
          ? Math.max(0, Date.now() - questionStartTimeRef.current)
          : 0;
      setSelectedOption(index);
      setAnswers((prev) => ({ ...prev, [currentIndex]: index }));

      const isCorrect = index === currentQuestion.correctIndex;

      const correctAnswer =
        currentQuestion.correctAnswerText ||
        extractOptionText(currentQuestion.options[currentQuestion.correctIndex]);

      const selectedAnswerText = extractOptionText(currentQuestion.options[index]);
      const promptText =
        extractOptionText(currentQuestion.prompt) ||
        correctAnswer ||
        `Question ${currentIndex + 1}`;

      if (onAnswer) {
        onAnswer({
          question: currentQuestion,
          promptText,
          selectedAnswerText,
          correctAnswerText: correctAnswer,
          isCorrect,
          timeTakenMs,
        });
      }

      if (isCorrect) {
        setFeedback({
          open: true,
          type: "correct",
        });
      } else {
        setFeedback({
          open: true,
          type: "wrong",
          correctAnswer,
        });
      }
    },
    [selectedOption, feedback.open, isCompleted, currentQuestion, currentIndex, onAnswer]
  );

  const handleContinue = React.useCallback(() => {
    if (!feedback.open && selectedOption === null) return;
    setFeedback((prev) => ({ ...prev, open: false }));
    setSelectedOption(null);
    isSelectingRef.current = false;

    if (currentIndex + 1 < (questions?.length || 0)) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      const finalAnswers =
        selectedOption !== null
          ? { ...answers, [currentIndex]: selectedOption }
          : answers;
      const finalScore = calculateScore(finalAnswers);
      onComplete(finalScore, questions?.length || 0);
    }
  }, [
    feedback.open,
    selectedOption,
    currentIndex,
    questions?.length,
    onComplete,
    answers,
    calculateScore,
  ]);

  const handleBack = React.useCallback(() => {
    if (currentIndex > 0) {
      setFeedback({ open: false, type: "correct" });
      setSelectedOption(null);
      isSelectingRef.current = false;
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  }, [currentIndex]);

  const handlePlayAgain = React.useCallback(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers({});
    setIsCompleted(false);
    isSelectingRef.current = false;
    questionStartTimeRef.current = Date.now();
    setFeedback({ open: false, type: "correct" });
    if (onRestart) {
      onRestart();
    }
  }, [onRestart]);

  if (!hasQuestions || !currentQuestion) {
    return (
      <div className="text-center p-8 text-muted-foreground font-medium">
        Không có câu hỏi nào. (No questions available.)
      </div>
    );
  }

  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  if (isCompleted) {
    const perfectScore = score === questions.length;
    const goodScore = score >= Math.ceil(questions.length / 2);

    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 text-center max-w-md mx-auto space-y-6 bg-card rounded-3xl border-4 border-primary/20 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="text-7xl animate-bounce">
          {perfectScore ? "👑" : goodScore ? "🎉" : "💪"}
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {perfectScore
              ? "Tuyệt đỉnh! (Perfect!)"
              : goodScore
              ? "Chúc mừng bạn! (Well Done!)"
              : "Hoàn thành bài tập! (Completed!)"}
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Bạn đã trả lời đúng{" "}
            <strong className="text-emerald-700 dark:text-emerald-400 font-black text-xl">
              {score}
            </strong>{" "}
            / {questions.length} câu hỏi!
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

  const recordedAnswer = answers[currentIndex];
  const currentSelected =
    selectedOption !== null
      ? selectedOption
      : recordedAnswer !== undefined
      ? recordedAnswer
      : null;

  return (
    <div className={cn("w-full max-w-2xl xl:max-w-3xl mx-auto space-y-6", className)}>
      {/* Header & Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm sm:text-base font-bold text-muted-foreground px-1">
          <div className="flex items-center gap-2">
            {currentIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="rounded-full px-3 py-1 text-xs sm:text-sm font-bold flex items-center gap-1 cursor-pointer hover:bg-muted"
                aria-label="Quay lại câu trước"
              >
                ⬅️ Quay lại
              </Button>
            )}
            <span>{title || "Trắc nghiệm / Quiz"}</span>
          </div>
          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full font-extrabold">
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
          const isSelected = currentSelected === idx;
          const isCorrect =
            currentSelected !== null ? idx === currentQuestion.correctIndex : null;
          const ariaLabel = getOptionAriaLabel ? getOptionAriaLabel(option, idx) : undefined;

          return (
            <button
              key={idx}
              type="button"
              aria-label={ariaLabel}
              onClick={() => handleSelectOption(idx)}
              disabled={selectedOption !== null}
              className={cn(
                "group p-4 sm:p-6 rounded-3xl border-4 text-left font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-default flex items-center justify-between",
                currentSelected === null &&
                  "border-border bg-card hover:border-primary hover:bg-primary/5 hover:scale-[1.02]",
                isSelected &&
                  isCorrect &&
                  "border-emerald-500 bg-emerald-100 text-emerald-950 ring-4 ring-emerald-300 dark:bg-emerald-950",
                isSelected &&
                  !isCorrect &&
                  "border-rose-500 bg-rose-100 text-rose-950 ring-4 ring-rose-300 dark:bg-rose-950",
                currentSelected !== null &&
                  !isSelected &&
                  idx === currentQuestion.correctIndex &&
                  "border-emerald-500 bg-emerald-50 text-emerald-900",
                currentSelected !== null &&
                  !isSelected &&
                  idx !== currentQuestion.correctIndex &&
                  "opacity-60 border-border bg-muted/40"
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
