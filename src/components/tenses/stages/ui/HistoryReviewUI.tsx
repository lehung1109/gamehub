"use client";

import { AttemptItem } from "@/types/tenses";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HistoryReviewUIProps {
  history: AttemptItem[];
  className?: string;
}

export function HistoryReviewUI({ history, className }: HistoryReviewUIProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
        Không có dữ liệu lịch sử cho chặng này.
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {history.map((item, index) => (
        <div
          key={`${item.questionId}-${index}`}
          className={cn(
            "p-4 rounded-xl border-2 transition-all",
            item.isCorrect
              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
              : "border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {item.isCorrect ? (
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="size-5 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <span className="font-bold text-sm text-muted-foreground mr-2">Câu {index + 1}:</span>
                <span className="text-sm font-medium">{item.contextVi}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div className="p-2.5 rounded-lg bg-card/80 border text-sm">
                  <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                    Bạn chọn
                  </div>
                  <div className={cn("font-medium", item.isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400 line-through")}>
                    {item.userAnswer || "(Không trả lời)"}
                  </div>
                </div>
                
                {!item.isCorrect && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-sm">
                    <div className="text-xs font-semibold text-emerald-600/70 dark:text-emerald-400/70 mb-1 uppercase tracking-wider flex items-center gap-1">
                      <ArrowRight className="size-3" /> Đáp án đúng
                    </div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-400">
                      {item.correctAnswer}
                    </div>
                  </div>
                )}
              </div>

              {item.explanationVi && (
                <div className="mt-3 text-sm text-muted-foreground bg-card/50 p-3 rounded-lg border border-border/50">
                  <span className="font-semibold text-foreground">Giải thích: </span>
                  {item.explanationVi}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
