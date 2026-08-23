"use client";

import Link from "next/link";
import {
  Trophy,
  Award,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { TenseMetadata, TenseUserProgressRecord, StageType } from "@/types/tenses";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CompletionDashboardProps {
  tenseMetadata: TenseMetadata;
  progress: TenseUserProgressRecord;
  onReplayStage: (stage: StageType) => void;
  onResetAll?: () => void;
  onReturnToHub?: () => void;
  className?: string;
}

interface StageInfo {
  id: StageType;
  titleVi: string;
  subtitleVi: string;
  total: number;
}

const STAGES: StageInfo[] = [
  {
    id: "conjugation",
    titleVi: "Chặng 1: Chia Động Từ Email & Ngữ Cảnh Công Sở",
    subtitleVi: "Conjugation & Email Context",
    total: 8,
  },
  {
    id: "errorHunting",
    titleVi: "Chặng 2: Săn Lỗi Sai Văn Phòng",
    subtitleVi: "Workplace Error Hunter",
    total: 6,
  },
  {
    id: "sentenceBuilding",
    titleVi: "Chặng 3: Ghép Câu Lịch Trình & Giao Tiếp",
    subtitleVi: "Sentence Builder & Order",
    total: 6,
  },
];

export function CompletionDashboard({
  tenseMetadata,
  progress,
  onReplayStage,
  onResetAll,
  onReturnToHub,
  className,
}: CompletionDashboardProps) {
  const accuracy = progress.accuracyPercentage;
  const totalScore = progress.totalScore;
  const maxScore = progress.maxPossibleScore || 20;

  const getEvaluation = (acc: number) => {
    if (acc >= 90) {
      return {
        label: "Xuất Sắc (Mastered)",
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
        message: `Bạn đã làm chủ hoàn hảo các quy tắc và mẫu câu ${tenseMetadata.vietnameseName} trong môi trường công sở!`,
      };
    }
    if (acc >= 80) {
      return {
        label: "Rất Tốt (Proficient)",
        color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800",
        message: "Kỹ năng chia động từ và phản xạ ngữ pháp của bạn rất vững vàng.",
      };
    }
    if (acc >= 70) {
      return {
        label: "Đạt Yêu Cầu (Passed)",
        color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800",
        message: "Bạn đã nắm được các nguyên tắc cốt lõi, hãy luyện lại các câu chưa đúng để hoàn thiện hơn.",
      };
    }
    return {
      label: "Cần Ôn Tập Thêm (Needs Review)",
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800",
      message: "Hãy xem lại phần Quy Tắc Cốt Lõi và thử sức lại với các chặng bài tập nhé!",
    };
  };

  const evaluation = getEvaluation(accuracy);

  return (
    <div className={cn("space-y-8 max-w-4xl mx-auto w-full pb-8", className)}>
      {/* Header Banner */}
      <Card className="border-2 border-indigo-200/80 dark:border-indigo-900/80 bg-linear-to-b from-indigo-50/60 via-card to-card dark:from-indigo-950/30 p-6 sm:p-8 text-center shadow-md relative overflow-hidden">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-16 sm:size-20 rounded-2xl bg-linear-to-tr from-amber-400 to-amber-200 text-amber-950 flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
            <Trophy className="size-8 sm:size-10 text-amber-900" aria-hidden="true" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 mb-2">
              <Sparkles className="size-3.5" aria-hidden="true" />
              <span>Tổng kết bài học</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              Chúc mừng bạn đã hoàn thành bài học!
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground font-semibold mt-1">
              {tenseMetadata.vietnameseName} • <span className="font-normal">{tenseMetadata.name}</span>
            </p>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl pt-2">
            <div className="p-4 rounded-xl bg-card border-2 border-border/80 shadow-xs flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tỉ lệ chính xác
              </span>
              <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {accuracy}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border-2 border-border/80 shadow-xs flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tổng câu đúng
              </span>
              <div className="text-3xl sm:text-4xl font-black text-foreground mt-1">
                {totalScore} <span className="text-lg sm:text-xl font-bold text-muted-foreground">/ {maxScore}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border-2 border-border/80 shadow-xs flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Đánh giá tổng quan
              </span>
              <Badge variant="outline" className={cn("text-xs font-bold mt-2 px-2.5 py-1 border", evaluation.color)}>
                {evaluation.label}
              </Badge>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed pt-1">
            {evaluation.message}
          </p>
        </div>
      </Card>

      {/* Stage Breakdown Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
            <Award className="size-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <span>Kết quả chi tiết từng chặng</span>
          </h2>
          <span className="text-xs font-bold text-muted-foreground">3 / 3 Chặng</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STAGES.map((stage, idx) => {
            const stageScore = progress.stageScores[stage.id];
            const score = stageScore?.score ?? 0;
            const total = stageScore?.total || stage.total;
            const isPassed = stageScore?.passed;

            return (
              <Card key={stage.id} className="border-2 border-border/80 flex flex-col justify-between shadow-xs bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    <span>CHẶNG {idx + 1}</span>
                    {isPassed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                        Đã đạt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                        <AlertCircle className="size-3.5" aria-hidden="true" />
                        Chưa đạt
                      </span>
                    )}
                  </div>

                  <CardTitle className="text-base font-bold text-foreground">
                    {stage.titleVi}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {stage.subtitleVi}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-4">
                  <div className="flex items-baseline gap-1 text-2xl font-black text-foreground">
                    <span>{score}</span>
                    <span className="text-sm font-semibold text-muted-foreground">/ {total} câu đúng</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-border/40 mt-auto">
                  <Button
                    variant="outline"
                    onClick={() => onReplayStage(stage.id)}
                    className="w-full text-xs font-bold gap-1.5 min-h-[44px] cursor-pointer hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    aria-label={`Luyện lại Chặng ${idx + 1}`}
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    <span>Luyện lại Chặng {idx + 1}</span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Workplace Takeaways Card */}
      <Card className="border-2 border-indigo-100 dark:border-indigo-900/60 p-5 sm:p-6 bg-slate-50/60 dark:bg-slate-900/40">
        <div className="flex items-center gap-2 mb-3 text-sm font-black text-foreground">
          <Lightbulb className="size-4 text-amber-500" aria-hidden="true" />
          <span>Ghi nhớ cốt lõi cho môi trường công sở</span>
        </div>

        <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">•</span>
            <span>
              <strong>Chủ ngữ số ít (He/She/It/Danh từ số ít):</strong> Động từ luôn thêm <em>-s/-es</em> khi viết báo cáo hoặc trao đổi email.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">•</span>
            <span>
              <strong>Vị trí trạng từ tần suất:</strong> Đứng <em>TRƯỚC động từ thường</em> (e.g. <em>always send</em>) và <em>SAU động từ To Be</em> (e.g. <em>is often</em>).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">•</span>
            <span>
              <strong>Câu phủ định & nghi vấn:</strong> Dùng trợ động từ <em>do/does</em> và đưa động từ chính về dạng nguyên thể (infinitive).
            </span>
          </li>
        </ul>
      </Card>

      {/* Global Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {onReturnToHub ? (
          <Button
            variant="outline"
            onClick={onReturnToHub}
            className="w-full sm:w-auto min-h-[44px] px-6 gap-2 text-sm font-bold cursor-pointer"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Quay về Hub 12 Thì</span>
          </Button>
        ) : (
          <Link
            href="/tenses"
            className="inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-6 gap-2 text-sm font-bold border border-border bg-card rounded-lg hover:bg-accent text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Quay về Hub 12 Thì</span>
          </Link>
        )}

        {onResetAll && (
          <Button
            onClick={onResetAll}
            className="w-full sm:w-auto min-h-[44px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2 cursor-pointer shadow-xs"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            <span>Luyện tập lại từ đầu</span>
          </Button>
        )}
      </div>
    </div>
  );
}
