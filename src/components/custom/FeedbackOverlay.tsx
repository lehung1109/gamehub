"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FeedbackOverlayProps {
  open: boolean;
  type: "correct" | "wrong";
  title?: string;
  message?: string;
  correctAnswer?: string;
  onContinue: () => void;
  autoAdvance?: boolean;
  autoAdvanceMs?: number;
}

export function FeedbackOverlay({
  open,
  type,
  title,
  message,
  correctAnswer,
  onContinue,
  autoAdvance = false,
  autoAdvanceMs = 1500,
}: FeedbackOverlayProps) {
  const isCorrect = type === "correct";

  useEffect(() => {
    if (!open || !autoAdvance || !isCorrect) return;

    const timer = setTimeout(() => {
      onContinue();
    }, autoAdvanceMs);

    return () => clearTimeout(timer);
  }, [open, autoAdvance, autoAdvanceMs, onContinue, isCorrect]);

  const defaultTitle = isCorrect ? "🎉 Đúng rồi! (Correct!)" : "❌ Chưa chính xác! (Try again!)";
  const defaultMessage = isCorrect
    ? "Tuyệt vời lắm bạn ơi! ⭐⭐⭐"
    : "Đừng buồn nhé, hãy thử lại lần sau!";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onContinue()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-w-md p-6 text-center border-4 rounded-3xl shadow-2xl flex flex-col items-center gap-4 transition-all duration-200",
          isCorrect
            ? "border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/90 dark:text-emerald-50"
            : "border-rose-500 bg-rose-50 text-rose-950 dark:bg-rose-950/90 dark:text-rose-50"
        )}
      >
        <div className="text-6xl animate-bounce">
          {isCorrect ? "🌟" : "💪"}
        </div>

        <DialogTitle className={cn("text-2xl sm:text-3xl font-extrabold tracking-tight", isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}>
          {title || defaultTitle}
        </DialogTitle>

        <DialogDescription className="text-base sm:text-lg font-medium text-foreground/80">
          {message || defaultMessage}
        </DialogDescription>

        {!isCorrect && correctAnswer && (
          <div className="w-full bg-white/80 dark:bg-black/40 rounded-2xl p-3 border-2 border-rose-200 dark:border-rose-900">
            <span className="text-sm font-semibold text-muted-foreground block">
              Đáp án đúng:
            </span>
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {correctAnswer}
            </span>
          </div>
        )}

        <Button
          type="button"
          onClick={onContinue}
          size="lg"
          className={cn(
            "w-full rounded-2xl py-6 text-xl font-bold shadow-lg transition-transform active:scale-95 cursor-pointer mt-2",
            isCorrect
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-rose-600 hover:bg-rose-700 text-white"
          )}
        >
          Tiếp tục (Continue) ➡️
        </Button>
      </DialogContent>
    </Dialog>
  );
}
