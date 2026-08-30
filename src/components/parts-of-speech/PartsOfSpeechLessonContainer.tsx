"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, Sparkles } from "lucide-react";
import { PartsOfSpeechModuleData, PartsOfSpeechStageType } from "@/types/parts-of-speech";
import { WordFamilyStage } from "@/components/parts-of-speech/stages/WordFamilyStage";
import { saveStageProgress, getProgress } from "@/lib/parts-of-speech-storage";
import { QuickRulesTab } from "@/components/tenses/QuickRulesTab";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface PartsOfSpeechLessonContainerProps {
  lessonData: PartsOfSpeechModuleData;
}

const emptySubscribe = () => () => {};

export function PartsOfSpeechLessonContainer({ lessonData }: PartsOfSpeechLessonContainerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"rules" | "practice">("rules");
  const [currentStage, setCurrentStage] = useState<PartsOfSpeechStageType | null>(null);
  
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const { metadata, challenges, quickRules } = lessonData;
  const progressRecord = isClient ? getProgress(metadata.id) : null;

  const handleStageComplete = (stage: PartsOfSpeechStageType, score: number, total: number) => {
    saveStageProgress(metadata.id, stage, score, total);
    setCurrentStage(null);
  };

  const stageList: Array<{
    id: PartsOfSpeechStageType;
    titleVi: string;
    itemCount: number;
    descriptionVi: string;
  }> = [
    {
      id: "wordFamily",
      titleVi: "Chặng 1: Nhận diện họ từ (Word Family)",
      itemCount: challenges.wordFamily?.length || 0,
      descriptionVi: "Ghép đúng tiền tố hoặc hậu tố để tạo thành từ loại phù hợp.",
    },
    {
      id: "fillInBlank",
      titleVi: "Chặng 2: Điền từ vào chỗ trống",
      itemCount: challenges.fillInBlank?.length || 0,
      descriptionVi: "Chọn dạng đúng của từ để điền vào ngữ cảnh email/báo cáo công sở.",
    },
    {
      id: "errorHunting",
      titleVi: "Chặng 3: Săn lỗi sai",
      itemCount: challenges.errorHunting?.length || 0,
      descriptionVi: "Phát hiện từ loại bị dùng sai trong câu và sửa lại cho đúng.",
    }
  ];

  return (
    <div className="flex-1 flex flex-col justify-between py-2 sm:py-6 max-w-5xl xl:max-w-6xl mx-auto w-full px-3 sm:px-6">
      <div>
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/parts-of-speech")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          >
            <ArrowLeft className="size-3.5" />
            Về danh sách
          </Button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Sparkles className="size-3.5" />
            {metadata.vietnameseName} ({metadata.name})
          </div>
        </div>
        
        {/* Tab Navigation */}
        {!currentStage && (
          <div className="flex items-center gap-2 border-b border-border mb-6">
            <button
              onClick={() => setActiveTab("rules")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "rules"
                  ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Quy Tắc Cốt Lõi (Quick Rules)</span>
            </button>

            <button
              onClick={() => setActiveTab("practice")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "practice"
                  ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Luyện Tập Chặng</span>
            </button>
          </div>
        )}

        {currentStage === "wordFamily" ? (
          <WordFamilyStage 
            questions={challenges.wordFamily} 
            onComplete={(score, total) => handleStageComplete("wordFamily", score, total)} 
          />
        ) : currentStage === "fillInBlank" ? (
          <div className="text-center p-12">Đang xây dựng Chặng 2...</div>
        ) : currentStage === "errorHunting" ? (
          <div className="text-center p-12">Đang xây dựng Chặng 3...</div>
        ) : activeTab === "rules" ? (
          <QuickRulesTab
            rules={quickRules}
            onStartPractice={() => {
              setActiveTab("practice");
              setCurrentStage("wordFamily");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {stageList.map((stage, index) => {
              const stProgress = progressRecord ? progressRecord.stageScores[stage.id] : null;
              const hasScore = (stProgress?.total || 0) > 0;
              
              return (
                <Card key={stage.id} className="flex flex-col justify-between border-2 border-border/80 hover:border-emerald-400 transition-all bg-card shadow-xs">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-emerald-600 mb-1">CHẶNG {index + 1}</div>
                      {stProgress && hasScore && (
                         <div className="text-xs font-semibold px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700">
                           {stProgress.score}/{stProgress.total}
                         </div>
                      )}
                    </div>
                    <CardTitle className="text-base sm:text-lg font-bold">{stage.titleVi}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 flex-grow">
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">{stage.descriptionVi}</CardDescription>
                    <div className="mt-4 pt-4 border-t border-border/40 text-xs font-medium">
                      Số câu hỏi: {stage.itemCount}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t mt-auto">
                    <Button
                      onClick={() => setCurrentStage(stage.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                      disabled={stage.itemCount === 0}
                    >
                      <Play className="size-3.5" /> {stage.itemCount === 0 ? "Sắp ra mắt" : "Bắt đầu chặng"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
