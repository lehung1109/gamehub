"use client";

import { RotateCcw, ArrowLeft, Lightbulb, Trophy } from "lucide-react";
import { StageType, AttemptItem } from "@/types/tenses";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HistoryReviewUI } from "./HistoryReviewUI";
import { useState } from "react";

export interface StageResultUIProps {
  stage: StageType;
  score: number;
  total: number;
  attemptHistory?: AttemptItem[];
  onReplay: () => void;
  onBackToList: () => void;
  className?: string;
}

export function StageResultUI({
  score,
  total,
  attemptHistory,
  onReplay,
  onBackToList,
  className,
}: StageResultUIProps) {
  const [showHistory, setShowHistory] = useState(false);
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  const getEvaluation = (acc: number) => {
    if (acc >= 90) {
      return {
        label: "Xuất Sắc",
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
        message: "Tuyệt vời! Bạn nắm rất vững kiến thức phần này.",
      };
    }
    if (acc >= 70) {
      return {
        label: "Tốt",
        color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800",
        message: "Khá tốt! Bạn đã vượt qua chặng này thành công.",
      };
    }
    return {
      label: "Cần cố gắng",
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800",
      message: "Hãy xem lại chi tiết và thử làm lại nhé!",
    };
  };

  const evaluation = getEvaluation(accuracy);

  return (
    <div className={cn("space-y-6 max-w-3xl mx-auto w-full", className)}>
      <Card className="border-2 border-indigo-200/80 dark:border-indigo-900/80 bg-linear-to-b from-indigo-50/60 via-card to-card dark:from-indigo-950/30 p-6 sm:p-8 text-center shadow-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-16 rounded-2xl bg-linear-to-tr from-amber-400 to-amber-200 text-amber-950 flex items-center justify-center shadow-lg transform -rotate-3 transition-transform">
            <Trophy className="size-8" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Hoàn thành chặng!
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-semibold mt-1">
              Bạn vừa hoàn tất {total} câu hỏi
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-md pt-2">
            <div className="p-4 rounded-xl bg-card border-2 border-border/80 shadow-xs flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Số câu đúng
              </span>
              <div className="text-3xl font-black text-foreground mt-1">
                {score} <span className="text-lg font-bold text-muted-foreground">/ {total}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border-2 border-border/80 shadow-xs flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Chính xác
              </span>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {accuracy}%
              </div>
            </div>
          </div>

          <div className={cn("mt-4 p-3 rounded-lg border font-medium text-sm max-w-md w-full", evaluation.color)}>
            <span className="font-bold">{evaluation.label}: </span>
            {evaluation.message}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full max-w-md">
            {attemptHistory && attemptHistory.length > 0 && (
              <Button
                onClick={() => setShowHistory(!showHistory)}
                variant={showHistory ? "secondary" : "outline"}
                className="flex-1 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-950 font-bold"
              >
                <Lightbulb className="mr-2 size-4" />
                {showHistory ? "Đóng chi tiết" : "Xem chi tiết"}
              </Button>
            )}
            <Button
              onClick={onReplay}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              <RotateCcw className="mr-2 size-4" />
              Làm lại
            </Button>
          </div>
          
          <Button
            onClick={onBackToList}
            variant="ghost"
            className="w-full max-w-md text-muted-foreground hover:text-foreground mt-2"
          >
            <ArrowLeft className="mr-2 size-4" />
            Về danh sách chặng
          </Button>
        </div>
      </Card>

      {showHistory && attemptHistory && attemptHistory.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 px-2">Chi tiết bài làm</h3>
          <HistoryReviewUI history={attemptHistory} />
        </div>
      )}
    </div>
  );
}
