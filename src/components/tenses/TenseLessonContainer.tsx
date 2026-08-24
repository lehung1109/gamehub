"use client";

import { useState, useRef, useSyncExternalStore, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  Play,
  Award,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import { TenseModuleData, StageType, TenseUserProgressRecord } from "@/types/tenses";
import { LessonHeader } from "@/components/tenses/LessonHeader";
import { QuickRulesTab } from "@/components/tenses/QuickRulesTab";
import { ConjugationStage } from "@/components/tenses/stages/ConjugationStage";
import { ErrorHunterStage } from "@/components/tenses/stages/ErrorHunterStage";
import { SentenceBuilderStage } from "@/components/tenses/stages/SentenceBuilderStage";
import { CompletionDashboard } from "@/components/tenses/CompletionDashboard";
import { getProgress, saveStageProgress, resetProgress } from "@/lib/tenses/storage";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const emptySubscribe = () => () => {};

export interface TenseLessonContainerProps {
  lessonData: TenseModuleData;
}

export function TenseLessonContainer({ lessonData }: TenseLessonContainerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"rules" | "practice">("rules");
  const [currentStage, setCurrentStage] = useState<StageType | "summary" | null>(null);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const rulesTabRef = useRef<HTMLButtonElement>(null);
  const practiceTabRef = useRef<HTMLButtonElement>(null);

  const { metadata, challenges, quickRules } = lessonData;

  const [overrideProgress, setOverrideProgress] = useState<TenseUserProgressRecord | null | undefined>(undefined);
  const progressRecord: TenseUserProgressRecord | null =
    overrideProgress !== undefined ? overrideProgress : isClient ? getProgress(metadata.id) : null;

  const stageList: Array<{
    id: StageType;
    titleVi: string;
    subtitleVi: string;
    itemCount: number;
    descriptionVi: string;
  }> = [
    {
      id: "conjugation",
      titleVi: "Chặng 1: Chia Động Từ Email & Ngữ Cảnh Công Sở",
      subtitleVi: "Conjugation & Email Context",
      itemCount: challenges.conjugation.length,
      descriptionVi: "Điền và chọn dạng đúng của động từ trong các tình huống viết email, trao đổi công việc hằng ngày.",
    },
    {
      id: "errorHunting",
      titleVi: "Chặng 2: Săn Lỗi Sai Văn Phòng",
      subtitleVi: "Workplace Error Hunter",
      itemCount: challenges.errorHunting.length,
      descriptionVi: "Rèn luyện phản xạ phát hiện từ sai và sửa lại cho chuẩn trong các mẫu câu giao tiếp văn phòng.",
    },
    {
      id: "sentenceBuilding",
      titleVi: "Chặng 3: Ghép Câu Lịch Trình & Giao Tiếp",
      subtitleVi: "Sentence Builder & Order",
      itemCount: challenges.sentenceBuilding.length,
      descriptionVi: "Kéo thả hoặc chạm chọn từ để xếp thành câu hoàn chỉnh đúng trật tự trạng từ và ngữ pháp.",
    },
  ];

  const handleTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, tab: "rules" | "practice") => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      if (tab === "rules") {
        setActiveTab("practice");
        practiceTabRef.current?.focus();
      } else {
        setActiveTab("rules");
        setCurrentStage(null);
        rulesTabRef.current?.focus();
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveTab("rules");
      setCurrentStage(null);
      rulesTabRef.current?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveTab("practice");
      practiceTabRef.current?.focus();
    }
  };

  const handleStageComplete = (stage: StageType, score: number, total: number) => {
    const updated = saveStageProgress(metadata.id, stage, score, total);
    setOverrideProgress(updated);

    // Check if all stages have been completed
    const stages: StageType[] = ["conjugation", "errorHunting", "sentenceBuilding"];
    const allDone = stages.every((s) => (updated.stageScores[s]?.total || 0) > 0);

    if (allDone || updated.completed) {
      setCurrentStage("summary");
    } else {
      setCurrentStage(null);
    }
  };

  const handleResetAll = () => {
    resetProgress(metadata.id);
    setOverrideProgress(null);
    setCurrentStage("conjugation");
  };

  const handleReturnToHub = () => {
    router.push("/tenses");
  };

  const isAllAttempted = Boolean(
    isClient &&
      progressRecord &&
      (["conjugation", "errorHunting", "sentenceBuilding"] as StageType[]).every(
        (s) => (progressRecord.stageScores[s]?.total || 0) > 0
      )
  );

  return (
    <div className="flex-1 flex flex-col justify-between py-2 sm:py-6 max-w-5xl xl:max-w-6xl mx-auto w-full px-3 sm:px-6">
      <div>
        {/* Lesson Header with Breadcrumbs & Indicators */}
        <LessonHeader
          tenseMetadata={metadata}
          activeTab={activeTab}
          currentStage={currentStage ?? (activeTab === "rules" ? "rules" : undefined)}
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border mb-6" role="tablist" aria-label="Chế độ học">
          <button
            ref={rulesTabRef}
            role="tab"
            id="tab-rules"
            aria-controls="tabpanel-rules"
            aria-selected={activeTab === "rules"}
            tabIndex={activeTab === "rules" ? 0 : -1}
            onClick={() => {
              setActiveTab("rules");
              setCurrentStage(null);
            }}
            onKeyDown={(e) => handleTabKeyDown(e, "rules")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              activeTab === "rules"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="size-4" aria-hidden="true" />
            <span>Quy Tắc Cốt Lõi (Quick Rules)</span>
          </button>

          <button
            ref={practiceTabRef}
            role="tab"
            id="tab-practice"
            aria-controls="tabpanel-practice"
            aria-selected={activeTab === "practice"}
            tabIndex={activeTab === "practice" ? 0 : -1}
            onClick={() => {
              setActiveTab("practice");
            }}
            onKeyDown={(e) => handleTabKeyDown(e, "practice")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              activeTab === "practice"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="size-4" aria-hidden="true" />
            <span>Luyện Tập 3 Chặng (Practice)</span>
          </button>
        </div>

        {/* Tab Panel 1: Quick Rules Overview */}
        {activeTab === "rules" && (
          <div id="tabpanel-rules" role="tabpanel" aria-labelledby="tab-rules">
            <QuickRulesTab
              rules={quickRules}
              onStartPractice={() => {
                setActiveTab("practice");
                setCurrentStage("conjugation");
              }}
            />
          </div>
        )}

        {/* Tab Panel 2: Practice Stages or Completion Dashboard */}
        {activeTab === "practice" && (
          <div id="tabpanel-practice" role="tabpanel" aria-labelledby="tab-practice" className="space-y-6">
            {currentStage === "summary" && progressRecord ? (
              <CompletionDashboard
                tenseMetadata={metadata}
                progress={progressRecord}
                onReplayStage={(s) => setCurrentStage(s)}
                onResetAll={handleResetAll}
                onReturnToHub={handleReturnToHub}
              />
            ) : currentStage === "conjugation" ? (
              <ConjugationStage
                items={challenges.conjugation}
                onStageComplete={(score, total) => handleStageComplete("conjugation", score, total)}
                onBack={() => setCurrentStage(null)}
              />
            ) : currentStage === "errorHunting" ? (
              <ErrorHunterStage
                items={challenges.errorHunting}
                onStageComplete={(score, total) => handleStageComplete("errorHunting", score, total)}
                onBack={() => setCurrentStage(null)}
              />
            ) : currentStage === "sentenceBuilding" ? (
              <SentenceBuilderStage
                items={challenges.sentenceBuilding}
                onStageComplete={(score, total) => handleStageComplete("sentenceBuilding", score, total)}
                onBack={() => setCurrentStage(null)}
              />
            ) : (
              /* 3 Stages Cards Grid */
              <div className="space-y-6">
                {/* Summary quick-access banner if completed or all stages attempted */}
                {isClient && progressRecord && (progressRecord.completed || isAllAttempted) && (
                  <div className="p-4 sm:p-5 rounded-xl bg-linear-to-r from-emerald-500/10 via-indigo-500/10 to-sky-500/10 border-2 border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Trophy className="size-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-foreground">
                          {progressRecord.completed
                            ? "Bạn đã hoàn thành trọn vẹn bài học này!"
                            : "Bạn đã hoàn tất cả 3 chặng thử thách!"}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                          Tổng điểm: {progressRecord.totalScore}/{progressRecord.maxPossibleScore} ({progressRecord.accuracyPercentage}% chính xác)
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setCurrentStage("summary")}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm gap-1.5 shrink-0 min-h-[44px] cursor-pointer"
                    >
                      <Award className="size-4" aria-hidden="true" />
                      <span>Xem bảng tổng kết</span>
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {stageList.map((stage, index) => {
                    const stProgress = isClient && progressRecord ? progressRecord.stageScores[stage.id] : null;
                    const isPassed = stProgress?.passed;
                    const hasScore = (stProgress?.total || 0) > 0;

                    return (
                      <Card
                        key={stage.id}
                        className="flex flex-col justify-between border-2 border-border/80 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all bg-card shadow-xs"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                            <span>CHẶNG {index + 1}</span>
                            {stProgress && hasScore ? (
                              isPassed ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px] px-1.5 py-0.5 gap-1">
                                  <CheckCircle2 className="size-3" aria-hidden="true" />
                                  <span>{stProgress.score}/{stProgress.total} đúng</span>
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[10px] px-1.5 py-0.5">
                                  <span>{stProgress.score}/{stProgress.total}</span>
                                </Badge>
                              )
                            ) : (
                              <span>{stage.itemCount} câu hỏi</span>
                            )}
                          </div>
                          <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                            {stage.titleVi}
                          </CardTitle>
                          <div className="text-xs text-muted-foreground">
                            {stage.subtitleVi}
                          </div>
                        </CardHeader>

                        <CardContent className="pb-4">
                          <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {stage.descriptionVi}
                          </CardDescription>
                        </CardContent>

                        <CardFooter className="pt-2 border-t border-border/40 mt-auto">
                          <Button
                            onClick={() => setCurrentStage(stage.id)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm gap-1.5 min-h-[44px] cursor-pointer"
                          >
                            <Play className="size-3.5" aria-hidden="true" />
                            <span>{hasScore ? `Luyện lại Chặng ${index + 1}` : `Vào Chặng ${index + 1}`}</span>
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 mt-12 text-xs sm:text-sm font-medium text-muted-foreground border-t border-border/50">
        <p>💼 Workplace English Tense Practice — {metadata.vietnameseName}</p>
      </footer>
    </div>
  );
}
