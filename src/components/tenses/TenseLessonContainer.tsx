"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { BookOpen, Sparkles, ArrowRight, Play, ArrowLeft, CheckCircle2, HelpCircle } from "lucide-react";
import { TenseModuleData, StageType } from "@/types/tenses";
import { LessonHeader } from "@/components/tenses/LessonHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface TenseLessonContainerProps {
  lessonData: TenseModuleData;
}

export function TenseLessonContainer({ lessonData }: TenseLessonContainerProps) {
  const [activeTab, setActiveTab] = useState<"rules" | "practice">("rules");
  const [currentStage, setCurrentStage] = useState<StageType | "summary" | null>(null);

  const rulesTabRef = useRef<HTMLButtonElement>(null);
  const practiceTabRef = useRef<HTMLButtonElement>(null);

  const { metadata, challenges, quickRules } = lessonData;

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

  const selectedStageMeta = stageList.find((s) => s.id === currentStage);

  return (
    <div className="flex-1 flex flex-col justify-between py-2 sm:py-6 max-w-5xl mx-auto w-full px-3 sm:px-6">
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
          <div id="tabpanel-rules" role="tabpanel" aria-labelledby="tab-rules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickRules.map((rule) => (
                <Card key={rule.id} className="border border-border/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {rule.titleEn}
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground">
                      {rule.titleVi}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground leading-relaxed">
                    <p className="mb-3">{rule.summaryVi}</p>

                    {rule.formulas && rule.formulas.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {rule.formulas.map((f, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-muted/60 text-xs font-mono">
                            <span className="font-bold text-foreground">{f.label}:</span>{" "}
                            <span className="text-indigo-600 dark:text-indigo-300">{f.structure}</span>
                            <div className="text-muted-foreground font-sans mt-1 text-xs">
                              VD: <em>&quot;{f.example}&quot;</em> ({f.vietnameseTranslation})
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center pt-4 pb-2">
              <Button
                onClick={() => {
                  setActiveTab("practice");
                  setCurrentStage("conjugation");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm sm:text-base gap-2 shadow-sm"
              >
                <span>Bắt đầu Luyện Tập 3 Chặng</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {/* Tab Panel 2: Practice Stages */}
        {activeTab === "practice" && (
          <div id="tabpanel-practice" role="tabpanel" aria-labelledby="tab-practice" className="space-y-6">
            {currentStage && selectedStageMeta ? (
              /* Single Stage View */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStage(null)}
                    className="gap-1.5 text-xs sm:text-sm font-semibold"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                    <span>Quay lại danh sách chặng</span>
                  </Button>

                  <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedStageMeta.itemCount} câu hỏi thực chiến
                  </span>
                </div>

                <Card className="border-2 border-indigo-200 dark:border-indigo-800 p-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {selectedStageMeta.subtitleVi}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-foreground mt-1">
                        {selectedStageMeta.titleVi}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {selectedStageMeta.descriptionVi}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
                      <HelpCircle className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>
                        Mẹo làm bài: Đọc kỹ ngữ cảnh email/tình huống công sở và áp dụng quy tắc thì Hiện Tại Đơn trước khi chọn hoặc nộp đáp án.
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              /* 3 Stages Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {stageList.map((stage, index) => (
                  <Card
                    key={stage.id}
                    className="flex flex-col justify-between border-2 border-border/80 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all bg-card shadow-xs"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        <span>CHẶNG {index + 1}</span>
                        <span>{stage.itemCount} câu hỏi</span>
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
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm gap-1.5"
                      >
                        <Play className="size-3.5" aria-hidden="true" />
                        <span>Vào Chặng {index + 1}</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 mt-12 text-xs sm:text-sm font-medium text-muted-foreground border-t border-border/50">
        <p>💼 Workplace English Tense Practice — Thì Hiện Tại Đơn</p>
      </footer>
    </div>
  );
}
