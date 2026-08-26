"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Lightbulb,
  Briefcase,
  AlertCircle,
  Check,
} from "lucide-react";
import { ErrorHunterItem } from "@/types/tenses";
import { isErrorHunterAnswerCorrect } from "@/lib/tenses/validation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";

export interface ErrorHunterQuestionUIProps {
  item: ErrorHunterItem;
  currentIndex: number;
  total: number;
  score: number;
  onNext: (isCorrect: boolean, userAnswer: string) => void;
  onBack?: () => void;
  className?: string;
}

export function ErrorHunterQuestionUI({
  item,
  currentIndex,
  total,
  score,
  onNext,
  onBack,
  className,
}: ErrorHunterQuestionUIProps) {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [selectedReplacement, setSelectedReplacement] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [nonErrorNotice, setNonErrorNotice] = useState<string | null>(null);

  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const { speak, isSpeaking, isSupported } = useSpeech({ rate: 0.85, lang: "en-US" });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedTokenIndex(null);
    setSelectedReplacement(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setNonErrorNotice(null);
  }, [item]);

  useEffect(() => {
    if (isSubmitted && nextButtonRef.current) {
      nextButtonRef.current.focus();
    }
  }, [isSubmitted]);

  const isErrorTokenChosen =
    selectedTokenIndex !== null && selectedTokenIndex === item.errorTokenIndex;

  const handleTokenClick = (index: number) => {
    if (isSubmitted) return;

    setSelectedTokenIndex(index);

    if (index === item.errorTokenIndex) {
      setNonErrorNotice(null);
    } else {
      setSelectedReplacement(null);
      setNonErrorNotice(
        `Vị trí này không có lỗi. Từ "${item.tokens[index]}" đã đúng ngữ pháp. Hãy tìm vị trí từ khác bị sai!`
      );
    }
  };

  const handleReplacementSelect = (val: string) => {
    if (isSubmitted) return;
    setSelectedReplacement(val);
  };

  const handleSubmit = () => {
    if (selectedTokenIndex === null || !selectedReplacement || isSubmitted) return;

    const correct = isErrorHunterAnswerCorrect(
      selectedTokenIndex,
      selectedReplacement,
      item
    );
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    onNext(isCorrect ?? false, selectedReplacement || "");
  };

  const isLastQuestion = currentIndex === total - 1;

  return (
    <div className={cn("space-y-6 max-w-4xl xl:max-w-5xl mx-auto w-full", className)}>
      {/* Stage Header & Progress Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="gap-1.5 min-h-[44px] text-xs font-semibold"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              <span>Quay lại</span>
            </Button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Chặng 2 • Săn Lỗi Sai Văn Phòng
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                (Câu {currentIndex + 1} / {total})
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium line-clamp-1 xl:line-clamp-2">
              {item.scenarioVi}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-xs text-muted-foreground font-medium">Điểm tích lũy</span>
            <div className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
              {score * 10} <span className="text-xs font-semibold text-muted-foreground">pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-bold text-muted-foreground">
          <span>Tiến độ chặng</span>
          <span>{Math.round(((currentIndex + (isSubmitted ? 1 : 0)) / total) * 100)}%</span>
        </div>
        <Progress
          value={Math.round(((currentIndex + (isSubmitted ? 1 : 0)) / total) * 100)}
          className="h-2 bg-indigo-100 dark:bg-indigo-950/60"
        />
      </div>

      {/* Main Challenge Card */}
      <Card className="border-2 border-indigo-100 dark:border-indigo-900/60 shadow-sm overflow-hidden bg-card">
        {/* Workplace Context Header */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
              <Search className="size-3.5" aria-hidden="true" />
              Săn lỗi ngữ pháp công sở
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Proofreading Challenge
            </span>
          </div>

          <div className="flex items-start gap-2 text-xs sm:text-sm text-foreground">
            <Briefcase className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-bold text-muted-foreground">Nghĩa tiếng Việt của câu: </span>
              <span className="font-semibold">{item.vietnameseMeaning}</span>
            </div>
          </div>
        </div>

        {/* Proofreading Interactive Area */}
        <CardContent className="p-5 sm:p-7 space-y-6">
          {/* Step 1: Interactive Token Chips */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isSubmitted
                  ? "Câu hoàn chỉnh sau khi rà soát"
                  : "Bước 1: Chạm/Bấm vào từ bị sai trong câu bên dưới"}
              </span>
            </div>

            {!isSubmitted ? (
              <div className="p-4 sm:p-6 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  {item.tokens.map((token, index) => {
                    const isSelected = selectedTokenIndex === index;
                    const isTargetError = index === item.errorTokenIndex;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleTokenClick(index)}
                        className={cn(
                          "min-h-[44px] px-3.5 py-2 rounded-lg text-sm sm:text-base font-semibold border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                          isSelected && isTargetError && "border-amber-500 bg-amber-100 text-amber-950 dark:border-amber-400 dark:bg-amber-950/80 dark:text-amber-100 shadow-xs ring-2 ring-amber-500/20",
                          isSelected && !isTargetError && "border-slate-400 bg-slate-200/80 text-foreground dark:border-slate-600 dark:bg-slate-800",
                          !isSelected && "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-foreground hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50/40"
                        )}
                        aria-pressed={isSelected}
                        aria-label={token}
                      >
                        {token}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Corrected sentence display after submit */
              <div className="p-4 sm:p-6 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed text-foreground">
                  {item.fullCorrectSentence}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-indigo-100/80 dark:border-indigo-900/40">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Từ đúng: <strong className="font-mono">{item.correctToken}</strong> (thay thế cho <span className="line-through text-rose-600 dark:text-rose-400">{item.tokens[item.errorTokenIndex]}</span>)
                  </span>

                  {isSupported && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => speak(item.fullCorrectSentence)}
                      className="min-h-[44px] h-11 px-3 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer"
                      aria-label="Nghe phát âm câu chuẩn"
                    >
                      <Volume2 className={cn("size-4", isSpeaking && "animate-pulse")} aria-hidden="true" />
                      <span>Nghe phát âm câu chuẩn</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Non-Error Notice (Acceptance Scenario 4) */}
          {nonErrorNotice && !isSubmitted && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-in fade-in-50 duration-200"
            >
              <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{nonErrorNotice}</span>
            </div>
          )}

          {/* Step 2: Replacement Options (Shown when target error token is clicked) */}
          {isErrorTokenChosen && !isSubmitted && (
            <div className="space-y-3 pt-2 animate-in fade-in-50 duration-200">
              <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Bước 2: Chọn phương án sửa đúng cho từ &quot;{item.tokens[selectedTokenIndex]}&quot;
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {item.options.map((option, idx) => {
                  const isSelected = selectedReplacement === option.value;
                  return (
                    <Button
                      key={idx}
                      type="button"
                      variant="outline"
                      onClick={() => handleReplacementSelect(option.value)}
                      className={cn(
                        "min-h-[48px] h-auto py-2.5 px-3 text-sm sm:text-base font-semibold border-2 transition-all cursor-pointer",
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-100 ring-2 ring-indigo-500/20 font-bold"
                          : "hover:border-indigo-300 dark:hover:border-indigo-700"
                      )}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback & Detailed Workplace Grammar Analysis */}
          {isSubmitted && (
            <div
              role="alert"
              aria-live="polite"
              className={cn(
                "p-4 sm:p-5 rounded-xl border-2 space-y-3.5 transition-all animate-in fade-in-50 duration-300",
                isCorrect
                  ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-950 dark:text-emerald-100"
                  : "bg-rose-50/80 dark:bg-rose-950/40 border-rose-500/50 text-rose-950 dark:text-rose-100"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="size-5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                  )}
                  <span className="text-sm sm:text-base font-black">
                    {isCorrect ? "Chính xác! (+10 điểm)" : "Chưa chính xác"}
                  </span>
                </div>

                {!isCorrect && (
                  <div className="text-xs sm:text-sm font-bold text-foreground">
                    Sửa đúng là: <span className="font-mono text-emerald-700 dark:text-emerald-400 underline">{item.correctToken}</span>
                  </div>
                )}
              </div>

              {/* Explanations */}
              <div className="pt-2 border-t border-border/40 space-y-2 text-xs sm:text-sm leading-relaxed">
                <div className="flex items-start gap-2">
                  <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="font-bold">Phân tích lỗi sai: </strong>
                    <span>{item.explanation.whyWrongVi}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pl-0.5">
                  <Briefcase className="size-3.5 text-indigo-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-muted-foreground">
                    <strong className="font-semibold text-foreground">Tác động công sở: </strong>
                    <span>{item.explanation.workplaceImpactVi}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer Actions */}
        <CardFooter className="p-4 sm:p-6 bg-slate-50/60 dark:bg-slate-900/40 border-t border-border flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground font-medium hidden sm:block">
            {!isSubmitted
              ? isErrorTokenChosen
                ? "Chọn phương án sửa và bấm Xác nhận"
                : "Bấm vào từ sai trong câu để mở phương án sửa"
              : "Xem kỹ phân tích lỗi sai và tác động công sở trước khi tiếp tục"}
          </div>

          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
            {!isSubmitted ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isErrorTokenChosen || !selectedReplacement}
                className="w-full sm:w-auto min-h-[44px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="size-4" aria-hidden="true" />
                <span>Xác nhận sửa lỗi</span>
              </Button>
            ) : (
              <Button
                ref={nextButtonRef}
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto min-h-[44px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2 cursor-pointer animate-pulse"
              >
                <span>{isLastQuestion ? "Xem kết quả Chặng 2" : "Câu tiếp theo"}</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
