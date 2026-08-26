"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  Mail,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Lightbulb,
  Check,
} from "lucide-react";
import { ConjugationItem, WorkplaceContextType } from "@/types/tenses";
import { isConjugationAnswerCorrect, normalizeAnswer } from "@/lib/tenses/validation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";

interface ContextConfig {
  label: string;
  icon: typeof Mail;
  badgeClass: string;
}

const CONTEXT_CONFIG: Record<WorkplaceContextType, ContextConfig> = {
  email: {
    label: "Email trao đổi",
    icon: Mail,
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
  },
  meeting: {
    label: "Cuộc họp",
    icon: Users,
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
  },
  routine: {
    label: "Quy trình & Lịch trình",
    icon: Calendar,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  },
  report: {
    label: "Báo cáo công việc",
    icon: FileText,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  },
  chat: {
    label: "Tin nhắn nội bộ",
    icon: MessageSquare,
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
  },
};

export interface ConjugationQuestionUIProps {
  item: ConjugationItem;
  currentIndex: number;
  total: number;
  score: number;
  onNext: (isCorrect: boolean) => void;
  onBack?: () => void;
  className?: string;
}

export function ConjugationQuestionUI({
  item,
  currentIndex,
  total,
  score,
  onNext,
  onBack,
  className,
}: ConjugationQuestionUIProps) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const { speak, isSpeaking, isSupported } = useSpeech({ rate: 0.85, lang: "en-US" });

  useEffect(() => {
    setSelectedAnswer("");
    setIsSubmitted(false);
    setIsCorrect(null);
  }, [item]);

  useEffect(() => {
    if (isSubmitted && nextButtonRef.current) {
      nextButtonRef.current.focus();
    } else if (!isSubmitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isSubmitted]);

  const contextMeta = CONTEXT_CONFIG[item.contextType] || CONTEXT_CONFIG.email;
  const ContextIcon = contextMeta.icon;

  const fullSentence = `${item.textBefore}${
    isSubmitted ? item.correctAnswer : item.baseVerb
  }${item.textAfter}`;

  const handleSubmit = () => {
    if (!selectedAnswer.trim() || isSubmitted) return;

    const correct = isConjugationAnswerCorrect(selectedAnswer, item);
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    onNext(isCorrect ?? false);
  };

  const handleOptionClick = (option: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(option);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isSubmitted && selectedAnswer.trim()) {
        handleSubmit();
      } else if (isSubmitted) {
        handleNext();
      }
    }
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
                Chặng 1 • Chia Động Từ
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
        {/* Workplace Context Header (Email/Chat/Meeting Mockup) */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border",
                  contextMeta.badgeClass
                )}
              >
                <ContextIcon className="size-3.5" aria-hidden="true" />
                {contextMeta.label}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Tình huống công sở thực chiến
              </span>
            </div>
          </div>

          <div className="space-y-1 text-xs sm:text-sm">
            {item.subject && (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-muted-foreground min-w-[60px]">Subject:</span>
                <span className="font-semibold text-foreground">{item.subject}</span>
              </div>
            )}
            {item.sender && (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-muted-foreground min-w-[60px]">From:</span>
                <span className="text-muted-foreground">{item.sender}</span>
              </div>
            )}
            {item.recipient && (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-muted-foreground min-w-[60px]">To:</span>
                <span className="text-muted-foreground">{item.recipient}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sentence Cloze Body */}
        <CardContent className="p-5 sm:p-7 space-y-6">
          {/* Sentence Display */}
          <div className="p-4 sm:p-6 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
            <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed text-foreground">
              <span>{item.textBefore}</span>
              <span
                className={cn(
                  "inline-block px-3 py-1 mx-1.5 rounded-lg font-bold border-2 transition-all",
                  !isSubmitted && !selectedAnswer && "bg-white dark:bg-slate-800 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400",
                  !isSubmitted && selectedAnswer && "bg-indigo-100 dark:bg-indigo-900/60 border-indigo-500 text-indigo-900 dark:text-indigo-100",
                  isSubmitted && isCorrect && "bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-100",
                  isSubmitted && !isCorrect && "bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-900 dark:text-rose-100 line-through"
                )}
              >
                {isSubmitted
                  ? selectedAnswer || "___"
                  : selectedAnswer || `(${item.baseVerb})`}
              </span>
              <span>{item.textAfter}</span>
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-indigo-100/80 dark:border-indigo-900/40">
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                Động từ nguyên thể: <strong className="font-mono">({item.baseVerb})</strong>
              </span>

              {isSubmitted && isSupported && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => speak(fullSentence)}
                  className="min-h-[44px] h-11 px-3 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer"
                  aria-label="Nghe phát âm câu hoàn chỉnh"
                >
                  <Volume2 className={cn("size-4", isSpeaking && "animate-pulse")} aria-hidden="true" />
                  <span>Nghe phát âm</span>
                </Button>
              )}
            </div>
          </div>

          {/* Interactive Inputs & Options */}
          <div className="space-y-4">
            <div>
              <label htmlFor="conjugation-input" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Cách 1: Gõ trực tiếp dạng đúng của động từ
              </label>
              <div className="flex gap-2">
                <Input
                  id="conjugation-input"
                  ref={inputRef}
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitted}
                  placeholder="Nhập dạng đúng của động từ (ví dụ: works, does not have...)"
                  className="h-12 text-sm sm:text-base font-semibold px-4 border-2 focus-visible:ring-indigo-500"
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Cách 2: Hoặc chọn nhanh một trong các đáp án sau
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {item.options.map((option, idx) => {
                  const isSelected = normalizeAnswer(selectedAnswer) === normalizeAnswer(option);
                  return (
                    <Button
                      key={idx}
                      type="button"
                      variant="outline"
                      disabled={isSubmitted}
                      onClick={() => handleOptionClick(option)}
                      className={cn(
                        "min-h-[48px] h-auto py-2.5 px-3 text-sm sm:text-base font-semibold border-2 transition-all cursor-pointer",
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-100 ring-2 ring-indigo-500/20"
                          : "hover:border-indigo-300 dark:hover:border-indigo-700"
                      )}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Feedback & Detailed Grammar Explanation */}
          {isSubmitted && (
            <div
              role="alert"
              aria-live="polite"
              className={cn(
                "p-4 sm:p-5 rounded-xl border-2 space-y-3 transition-all animate-in fade-in-50 duration-300",
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
                    Đáp án đúng: <span className="font-mono text-emerald-700 dark:text-emerald-400 underline">{item.correctAnswer}</span>
                  </div>
                )}
              </div>

              {/* Explanation Content */}
              <div className="pt-2 border-t border-border/40 space-y-1.5 text-xs sm:text-sm leading-relaxed">
                <div className="flex items-start gap-2">
                  <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="font-bold">Quy tắc áp dụng: </strong>
                    <span>{item.explanation.ruleVi}</span>
                  </div>
                </div>
                <div className="pl-6 text-muted-foreground">
                  {item.explanation.detailedAnalysisVi}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer Actions */}
        <CardFooter className="p-4 sm:p-6 bg-slate-50/60 dark:bg-slate-900/40 border-t border-border flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground font-medium hidden sm:block">
            {!isSubmitted
              ? "Nhấn Enter hoặc nút Kiểm Tra để nộp đáp án"
              : "Xem kỹ giải thích ngữ pháp trước khi qua câu kế tiếp"}
          </div>

          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
            {!isSubmitted ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedAnswer.trim()}
                className="w-full sm:w-auto min-h-[44px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="size-4" aria-hidden="true" />
                <span>Kiểm tra đáp án</span>
              </Button>
            ) : (
              <Button
                ref={nextButtonRef}
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto min-h-[44px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2 cursor-pointer animate-pulse"
              >
                <span>{isLastQuestion ? "Xem kết quả chặng 1" : "Câu tiếp theo"}</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
