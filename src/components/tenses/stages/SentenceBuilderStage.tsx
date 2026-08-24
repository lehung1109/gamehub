"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Lightbulb,
  Briefcase,
  HelpCircle,
  Check,
  RotateCcw,
  GripVertical,
} from "lucide-react";
import { SentenceBuilderItem, SentenceBuilderToken } from "@/types/tenses";
import { isSentenceOrderCorrect } from "@/lib/tenses/validation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";

export interface SentenceBuilderStageProps {
  items: SentenceBuilderItem[];
  onStageComplete: (score: number, total: number) => void;
  onBack?: () => void;
  className?: string;
}

interface DraggableTokenChipProps {
  token: SentenceBuilderToken;
  isPlaced?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function DraggableTokenChip({
  token,
  isPlaced = false,
  disabled = false,
  onClick,
}: DraggableTokenChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: token.id,
    data: { token, isPlaced },
    disabled,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...attributes}
      {...listeners}
      aria-label={isPlaced ? `Xóa "${token.text}" khỏi câu` : `Thêm "${token.text}" vào câu`}
      className={cn(
        "min-h-[44px] px-3.5 py-2 rounded-lg text-sm sm:text-base font-semibold border-2 transition-all cursor-pointer select-none inline-flex items-center gap-1.5 touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        isDragging && "opacity-30 scale-95",
        isPlaced
          ? "bg-indigo-50/90 text-indigo-900 border-indigo-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 dark:hover:border-rose-700 shadow-xs"
          : "bg-white text-foreground border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/40 shadow-xs active:scale-95"
      )}
    >
      <GripVertical className="size-3.5 text-muted-foreground/50 shrink-0" aria-hidden="true" />
      <span>{token.text}</span>
    </button>
  );
}

function DroppableSentenceZone({
  tokens,
  isSubmitted,
  onTokenClick,
}: {
  tokens: SentenceBuilderToken[];
  isSubmitted: boolean;
  onTokenClick: (token: SentenceBuilderToken) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "drop-zone",
    disabled: isSubmitted,
  });

  return (
    <div
      ref={setNodeRef}
      role="region"
      aria-label="Hàng ghép câu"
      className={cn(
        "min-h-[96px] sm:min-h-[110px] p-4 sm:p-5 rounded-xl border-2 border-dashed transition-all flex flex-wrap items-center gap-2 sm:gap-2.5",
        isOver
          ? "border-indigo-500 bg-indigo-50/60 dark:border-indigo-400 dark:bg-indigo-950/40"
          : tokens.length > 0
          ? "border-indigo-200 bg-slate-50/80 dark:border-indigo-900/60 dark:bg-slate-900/50"
          : "border-slate-300 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/30"
      )}
    >
      {tokens.length === 0 ? (
        <div className="w-full text-center py-4 text-xs sm:text-sm text-muted-foreground select-none font-medium flex items-center justify-center gap-2">
          <span>Chạm hoặc kéo thả các từ bên dưới vào đây để ghép câu</span>
        </div>
      ) : (
        tokens.map((token) => (
          <DraggableTokenChip
            key={token.id}
            token={token}
            isPlaced
            disabled={isSubmitted}
            onClick={() => !isSubmitted && onTokenClick(token)}
          />
        ))
      )}
    </div>
  );
}

function DroppableBankZone({
  tokens,
  isSubmitted,
  onTokenClick,
}: {
  tokens: SentenceBuilderToken[];
  isSubmitted: boolean;
  onTokenClick: (token: SentenceBuilderToken) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "bank-zone",
    disabled: isSubmitted,
  });

  return (
    <div
      ref={setNodeRef}
      role="region"
      aria-label="Ngân hàng từ vựng"
      className={cn(
        "p-4 sm:p-5 rounded-xl border flex flex-wrap items-center gap-2 sm:gap-2.5 min-h-[72px] transition-all",
        isOver
          ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40"
          : "bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
      )}
    >
      {tokens.length === 0 ? (
        <span className="text-xs text-muted-foreground italic">
          Đã đưa hết các từ vào câu. Nhấn &quot;Kiểm tra câu&quot; để nộp bài!
        </span>
      ) : (
        tokens.map((token) => (
          <DraggableTokenChip
            key={token.id}
            token={token}
            disabled={isSubmitted}
            onClick={() => onTokenClick(token)}
          />
        ))
      )}
    </div>
  );
}

export function SentenceBuilderStage({
  items,
  onStageComplete,
  onBack,
  className,
}: SentenceBuilderStageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placedTokens, setPlacedTokens] = useState<SentenceBuilderToken[]>([]);
  const [bankTokens, setBankTokens] = useState<SentenceBuilderToken[]>(() =>
    items?.[0]?.scrambledTokens ? [...items[0].scrambledTokens] : []
  );
  const [activeToken, setActiveToken] = useState<SentenceBuilderToken | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const { speak, isSpeaking, isSupported } = useSpeech({ rate: 0.85, lang: "en-US" });

  const total = items?.length || 0;
  const currentItem = items?.[currentIndex];

  useEffect(() => {
    if (isSubmitted && nextButtonRef.current) {
      nextButtonRef.current.focus();
    }
  }, [isSubmitted]);

  // Pointer sensor with distance activation constraint
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, keyboardSensor);

  const handlePlaceToken = useCallback(
    (token: SentenceBuilderToken) => {
      if (isSubmitted) return;
      setBankTokens((prev) => prev.filter((t) => t.id !== token.id));
      setPlacedTokens((prev) => [...prev, token]);
    },
    [isSubmitted]
  );

  const handleRemoveToken = useCallback(
    (token: SentenceBuilderToken) => {
      if (isSubmitted) return;
      setPlacedTokens((prev) => prev.filter((t) => t.id !== token.id));
      setBankTokens((prev) => [...prev, token]);
    },
    [isSubmitted]
  );

  const handleResetSentence = () => {
    if (isSubmitted || !currentItem) return;
    setPlacedTokens([]);
    setBankTokens([...currentItem.scrambledTokens]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (isSubmitted) return;
    const token = event.active.data.current?.token as SentenceBuilderToken | undefined;
    if (token) {
      setActiveToken(token);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveToken(null);
    if (isSubmitted) return;

    const { active, over } = event;
    if (!over) return;

    const isPlaced = active.data.current?.isPlaced as boolean | undefined;
    const token = active.data.current?.token as SentenceBuilderToken | undefined;
    if (!token) return;

    if (over.id === "drop-zone" && !isPlaced) {
      handlePlaceToken(token);
    } else if (over.id === "bank-zone" && isPlaced) {
      handleRemoveToken(token);
    }
  };

  const handleSubmit = () => {
    if (placedTokens.length === 0 || isSubmitted || !currentItem) return;

    const tokenTexts = placedTokens.map((t) => t.text);
    const correct = isSentenceOrderCorrect(tokenTexts, currentItem.correctTokenOrder);

    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      setScore((prev) => prev + 1);
      speak(currentItem.fullSentenceEn);
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextItem = items[nextIdx];
      if (nextItem) {
        setBankTokens([...nextItem.scrambledTokens]);
        setPlacedTokens([]);
        setIsSubmitted(false);
        setIsCorrect(null);
      }
    } else {
      onStageComplete(score, total);
    }
  };

  if (!items || items.length === 0 || !currentItem) {
    return (
      <Card className="p-8 text-center border-dashed">
        <div className="flex flex-col items-center justify-center space-y-4">
          <HelpCircle className="size-12 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-lg font-bold text-foreground">Không có câu hỏi bài tập</h3>
          <p className="text-sm text-muted-foreground">
            Dữ liệu chặng ghép câu hiện chưa sẵn sàng hoặc rỗng.
          </p>
          {onBack && (
            <Button onClick={onBack} variant="outline" className="gap-2 min-h-[44px]">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Quay lại danh sách
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const isLastQuestion = currentIndex === total - 1;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                  Chặng 3 • Ghép Câu Lịch Trình & Giao Tiếp
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  (Câu {currentIndex + 1} / {total})
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium line-clamp-1 xl:line-clamp-2">
                {currentItem.scenarioVi}
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
          {/* Context Header */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Sentence Builder
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Trật tự từ & Trạng từ tần suất
              </span>
            </div>

            <div className="flex items-start gap-2 text-xs sm:text-sm text-foreground">
              <Briefcase className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-bold text-muted-foreground">Nghĩa tiếng Việt cần ghép: </span>
                <span className="font-semibold">{currentItem.vietnameseMeaning}</span>
              </div>
            </div>
          </div>

          {/* Builder Interactive Area */}
          <CardContent className="p-5 sm:p-7 space-y-6">
            {/* Target Placed Sentence Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Hàng ghép câu
                </span>
                {!isSubmitted && placedTokens.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetSentence}
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                  >
                    <RotateCcw className="size-3" aria-hidden="true" />
                    <span>Đặt lại câu</span>
                  </Button>
                )}
              </div>

              <DroppableSentenceZone
                tokens={placedTokens}
                isSubmitted={isSubmitted}
                onTokenClick={handleRemoveToken}
              />
            </div>

            {/* Token Bank Area */}
            {!isSubmitted && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ngân hàng từ (Chạm để chọn)
                </span>

                <DroppableBankZone
                  tokens={bankTokens}
                  isSubmitted={isSubmitted}
                  onTokenClick={handlePlaceToken}
                />
              </div>
            )}

            {/* Post-submit feedback & Grammar Tip */}
            {isSubmitted && (
              <div
                role="status"
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

                  {isSupported && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => speak(currentItem.fullSentenceEn)}
                      className="min-h-[44px] h-11 px-3 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer"
                      aria-label="Nghe phát âm câu chuẩn"
                    >
                      <Volume2 className={cn("size-4", isSpeaking && "animate-pulse")} aria-hidden="true" />
                      <span>Nghe phát âm câu chuẩn</span>
                    </Button>
                  )}
                </div>

                {/* Display Full Correct Sentence */}
                <div className="pt-2 border-t border-border/40">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    {isCorrect ? "Câu hoàn chỉnh:" : "Câu chuẩn xác là:"}
                  </span>
                  <p className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
                    {currentItem.fullSentenceEn}
                  </p>
                </div>

                {/* Grammar Tip */}
                <div className="pt-2 border-t border-border/40 space-y-1 text-xs sm:text-sm leading-relaxed">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong className="font-bold text-foreground">
                        Mẹo ngữ pháp ({currentItem.grammarTip.titleVi}):{" "}
                      </strong>
                      <span>{currentItem.grammarTip.tipVi}</span>
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
                ? "Chạm hoặc kéo các từ để xếp đúng trật tự câu"
                : "Xem kỹ mẹo ngữ pháp trước khi tiếp tục"}
            </div>

            <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
              {!isSubmitted ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={placedTokens.length === 0}
                  className="w-full sm:w-auto min-h-[44px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="size-4" aria-hidden="true" />
                  <span>Kiểm tra câu</span>
                </Button>
              ) : (
                <Button
                  ref={nextButtonRef}
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto min-h-[44px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2 cursor-pointer animate-pulse"
                >
                  <span>{isLastQuestion ? "Xem kết quả Chặng 3" : "Câu tiếp theo"}</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Drag Overlay Preview */}
      <DragOverlay>
        {activeToken ? (
          <div className="min-h-[44px] px-3.5 py-2 rounded-lg text-sm sm:text-base font-semibold border-2 border-indigo-500 bg-indigo-100 dark:bg-indigo-900 text-indigo-950 dark:text-indigo-100 shadow-xl opacity-90 rotate-2 inline-flex items-center gap-1.5">
            <GripVertical className="size-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
            <span>{activeToken.text}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
