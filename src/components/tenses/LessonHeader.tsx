import Link from "next/link";
import { ChevronRight, Volume2, Sparkles, Home, Layers } from "lucide-react";
import { TenseMetadata, StageType } from "@/types/tenses";
import { Badge } from "@/components/ui/badge";

export interface LessonHeaderProps {
  tenseMetadata: TenseMetadata;
  activeTab?: "rules" | "practice";
  currentStage?: StageType | "rules" | "summary";
  completedStagesCount?: number;
  totalStages?: number;
}

export function LessonHeader({
  tenseMetadata,
  activeTab = "rules",
  currentStage,
  completedStagesCount = 0,
  totalStages = 3,
}: LessonHeaderProps) {
  const getStageDisplay = () => {
    if (activeTab === "rules" || currentStage === "rules") {
      return null;
    }
    if (currentStage === "summary") {
      return "Tổng Kết Bài Học";
    }
    if (currentStage === "conjugation") {
      return `Chặng 1/${totalStages}: Chia Động Từ Email`;
    }
    if (currentStage === "errorHunting") {
      return `Chặng 2/${totalStages}: Săn Lỗi Sai Văn Phòng`;
    }
    if (currentStage === "sentenceBuilding") {
      return `Chặng 3/${totalStages}: Ghép Câu Lịch Trình`;
    }
    return `Chặng ${Math.min(completedStagesCount + 1, totalStages)}/${totalStages}`;
  };

  const stageLabel = getStageDisplay();

  return (
    <header className="w-full bg-card border-b border-border/80 pb-4 pt-2 mb-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" className="mb-3">
        <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground flex-wrap">
          <li className="flex items-center gap-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Home className="size-3.5" aria-hidden="true" />
              <span>Trang chủ</span>
            </Link>
          </li>
          <li className="flex items-center" aria-hidden="true">
            <ChevronRight className="size-3 text-muted-foreground/60" />
          </li>
          <li className="flex items-center gap-1">
            <Link
              href="/tenses"
              className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Layers className="size-3.5" aria-hidden="true" />
              <span>12 Thì</span>
            </Link>
          </li>
          <li className="flex items-center" aria-hidden="true">
            <ChevronRight className="size-3 text-muted-foreground/60" />
          </li>
          <li className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
            {tenseMetadata.vietnameseName}
          </li>
        </ol>
      </nav>

      {/* Main Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-xs font-medium">
              {tenseMetadata.level}
            </Badge>
            {tenseMetadata.badge && (
              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 text-xs font-semibold flex items-center gap-1">
                <Sparkles className="size-3 text-amber-500" aria-hidden="true" />
                {tenseMetadata.badge}
              </Badge>
            )}
            <div className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 font-medium">
              <Volume2 className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>Phát âm chuẩn bản xứ</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            {tenseMetadata.vietnameseName}
          </h1>
          <div className="text-xs sm:text-sm font-semibold text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-foreground/80">{tenseMetadata.name}</span>
            <span>•</span>
            <span>{tenseMetadata.description}</span>
          </div>
        </div>

        {/* Practice Stage Status Indicator if in practice mode */}
        {stageLabel && (
          <div className="flex items-center self-start sm:self-center">
            <div className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300">
              {stageLabel}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
