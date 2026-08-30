"use client";

import { useState, useCallback } from "react";
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
import { CheckCircle2, XCircle, ArrowRight, GripVertical, Check } from "lucide-react";
import { WordFamilyItem } from "@/types/parts-of-speech";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WordFamilyStageProps {
  questions: WordFamilyItem[];
  onComplete: (score: number, total: number) => void;
}

function DraggableOption({ option, isPlaced = false, disabled = false, onClick }: { option: string, isPlaced?: boolean, disabled?: boolean, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: isPlaced ? `placed-${option}` : option,
    data: { option, isPlaced },
    disabled,
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...attributes}
      {...listeners}
      className={cn(
        "px-4 py-2 rounded-lg text-sm sm:text-base font-semibold border-2 transition-all cursor-pointer select-none inline-flex items-center gap-1.5 focus-visible:outline-none",
        isDragging && "opacity-30 scale-95",
        isPlaced
          ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm"
          : "bg-white text-foreground border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 shadow-sm"
      )}
    >
      <GripVertical className="size-4 text-muted-foreground/50 shrink-0" />
      <span>{option}</span>
    </button>
  );
}

function DroppableZone({ placedOption, disabled, onRemove }: { placedOption: string | null, disabled: boolean, onRemove: () => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "drop-zone",
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[48px] min-w-[100px] px-4 py-2 rounded-lg border-2 border-dashed flex items-center justify-center transition-all",
        isOver ? "border-emerald-500 bg-emerald-50/60" : "border-slate-300 bg-slate-50",
        placedOption && "border-solid border-emerald-300 bg-emerald-50/20"
      )}
    >
      {placedOption ? (
        <DraggableOption option={placedOption} isPlaced disabled={disabled} onClick={onRemove} />
      ) : (
        <span className="text-sm text-muted-foreground">Thả đuôi từ vào đây</span>
      )}
    </div>
  );
}

export function WordFamilyStage({ questions, onComplete }: WordFamilyStageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [placedOption, setPlacedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [activeOption, setActiveOption] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, keyboardSensor);

  const handlePlace = useCallback((option: string) => {
    if (isSubmitted) return;
    setPlacedOption(option);
  }, [isSubmitted]);

  const handleRemove = useCallback(() => {
    if (isSubmitted) return;
    setPlacedOption(null);
  }, [isSubmitted]);

  const handleDragStart = (event: DragStartEvent) => {
    if (isSubmitted) return;
    const option = event.active.data.current?.option as string | undefined;
    if (option) setActiveOption(option);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveOption(null);
    if (isSubmitted) return;

    const { active, over } = event;
    if (!over) return;

    const isPlaced = active.data.current?.isPlaced as boolean | undefined;
    const option = active.data.current?.option as string | undefined;
    if (!option) return;

    if (over.id === "drop-zone" && !isPlaced) {
      handlePlace(option);
    }
  };

  const handleSubmit = () => {
    if (!placedOption || isSubmitted) return;

    const cleanSuffix = placedOption.replace(/^-/, '').toLowerCase();
    const correct = currentQuestion.targetWord.toLowerCase().endsWith(cleanSuffix);
    
    setIsCorrect(correct);
    setIsSubmitted(true);
    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setPlacedOption(null);
      setIsSubmitted(false);
      setIsCorrect(null);
    } else {
      // score is already updated in handleSubmit, just pass score
      onComplete(score, questions.length);
    }
  };

  if (!currentQuestion) return null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Card className="max-w-2xl mx-auto border-2 border-emerald-100 shadow-sm bg-card">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground mb-4">
            <span>Câu {currentIndex + 1} / {questions.length}</span>
            <span className="text-emerald-600">Điểm: {score}</span>
          </div>

          <div className="text-center space-y-6">
            <h3 className="text-lg font-bold text-foreground">Ghép tiền tố/hậu tố phù hợp</h3>
            
            <div className="flex flex-wrap items-center justify-center gap-2 text-2xl font-black">
              <span className="px-4 py-2 bg-slate-100 rounded-lg">{currentQuestion.baseWord}</span>
              <span className="text-muted-foreground">+</span>
              <DroppableZone placedOption={placedOption} disabled={isSubmitted} onRemove={handleRemove} />
            </div>

            {!isSubmitted && (
              <div className="flex flex-wrap justify-center gap-3 pt-6">
                {currentQuestion.options.map((opt) => (
                  <DraggableOption
                    key={opt}
                    option={opt}
                    disabled={isSubmitted || placedOption === opt}
                    onClick={() => handlePlace(opt)}
                  />
                ))}
              </div>
            )}

            {isSubmitted && (
              <div className={cn(
                "mt-6 p-4 rounded-xl border text-left",
                isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="size-5 text-emerald-600" />
                  ) : (
                    <XCircle className="size-5 text-rose-600" />
                  )}
                  <span className="font-bold">{isCorrect ? "Chính xác!" : "Chưa chính xác!"}</span>
                </div>
                <p className="font-semibold text-lg mb-2">Từ đúng: <span className="text-emerald-700">{currentQuestion.targetWord}</span></p>
                <p className="text-sm text-muted-foreground">{currentQuestion.explanationVi}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-slate-50 border-t flex justify-end">
          {!isSubmitted ? (
            <Button onClick={handleSubmit} disabled={!placedOption} className="bg-emerald-600 hover:bg-emerald-700">
              <Check className="size-4 mr-2" /> Kiểm tra
            </Button>
          ) : (
            <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
              {currentIndex < questions.length - 1 ? "Câu tiếp theo" : "Hoàn thành chặng"} <ArrowRight className="size-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <DragOverlay>
        {activeOption ? (
          <div className="px-4 py-2 rounded-lg text-sm sm:text-base font-semibold border-2 border-emerald-500 bg-emerald-100 text-emerald-900 shadow-xl opacity-90 rotate-2 inline-flex items-center gap-1.5">
            <GripVertical className="size-4 text-emerald-600" />
            <span>{activeOption}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
