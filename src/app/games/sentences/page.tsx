"use client";

import React, { useState, useMemo, useCallback, Suspense } from "react";
import sentencesData from "@/data/sentences.json";
import { Sentence } from "@/types";
import { BackButton } from "@/components/custom/BackButton";
import { SpeechUnsupportedBanner } from "@/components/custom/SpeechUnsupportedBanner";
import { ConfigBanner } from "@/components/game/ConfigBanner";
import { PreviewBanner } from "@/components/game/PreviewBanner";
import { DragDropBoard, DraggableItem, SlotItem } from "@/components/game/DragDropBoard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSpeech } from "@/hooks/useSpeech";
import { useGameConfig } from "@/hooks/useGameConfig";
import { useGameTracking } from "@/hooks/use-game-tracking";
import type { SentencesSettings } from "@/types/config";
import { shuffle } from "@/lib/shuffle";
import {
  Volume2,
  Sparkles,
  Filter,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const allSentences = sentencesData as Sentence[];

interface SentenceCategory {
  id: string;
  nameVi: string;
  emoji: string;
}

const allSentenceCategories: SentenceCategory[] = [
  { id: "daily-actions", nameVi: "Hành động", emoji: "🍽️" },
  { id: "animals", nameVi: "Động vật", emoji: "🐱" },
  { id: "descriptions", nameVi: "Miêu tả", emoji: "🍎" },
  { id: "feelings-preferences", nameVi: "Cảm xúc & Sở thích", emoji: "😊" },
  { id: "school", nameVi: "Trường học", emoji: "🏫" },
];

function generateSentenceBank(targetWords: string[], seed = 0): DraggableItem[] {
  const wordItems: DraggableItem[] = targetWords.map((word, idx) => ({
    id: `word-${idx}-${word}`,
    label: word,
  }));

  // Deterministic initial scramble based on seed and word length
  const sumVal = targetWords.reduce((acc, w, i) => acc + w.length * (i + 1), 0);
  return [...wordItems].sort((a, b) => {
    const hashA = (a.label.length * 13 + a.id.charCodeAt(0) + sumVal + seed) % 19;
    const hashB = (b.label.length * 13 + b.id.charCodeAt(0) + sumVal + seed) % 19;
    return hashA - hashB || a.id.localeCompare(b.id);
  });
}

function SentencesGameContent() {
  const { settings, configName, isPreview, configId } = useGameConfig<SentencesSettings>("sentences");

  const categoriesConfig = settings?.categories;

  const displayedCategories = useMemo(() => {
    if (categoriesConfig && Array.isArray(categoriesConfig) && categoriesConfig.length > 0) {
      const allowed = new Set(categoriesConfig);
      const filtered = allSentenceCategories.filter((c) => allowed.has(c.id));
      return filtered.length > 0 ? filtered : allSentenceCategories;
    }
    return allSentenceCategories;
  }, [categoriesConfig]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [boardKey, setBoardKey] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackState, setFeedbackState] = useState<{
    show: boolean;
    isCorrect: boolean;
    formedSentence: string;
  }>({
    show: false,
    isCorrect: false,
    formedSentence: "",
  });
  const [dismissUnsupported, setDismissUnsupported] = useState(false);

  const { speak, cancel, isSupported } = useSpeech();
  const sentenceStartTimeRef = React.useRef<number>(0);
  const attemptsRef = React.useRef<number>(1);
  const totalTimeTakenRef = React.useRef<number>(0);

  // Active pool based on selected category or config categories
  const activePool = useMemo(() => {
    if (selectedCategory !== "all") {
      return allSentences.filter((s) => s.category === selectedCategory);
    }
    if (categoriesConfig && Array.isArray(categoriesConfig) && categoriesConfig.length > 0) {
      const allowed = new Set(categoriesConfig);
      const filtered = allSentences.filter((s) => allowed.has(s.category));
      return filtered.length > 0 ? filtered : allSentences;
    }
    return allSentences;
  }, [selectedCategory, categoriesConfig]);

  const sentenceLimit =
    settings?.sentenceCount && settings.sentenceCount > 0
      ? settings.sentenceCount
      : 10;
  const showVietnamese = settings?.showVietnamese ?? true;

  // Session sentences (up to sentenceLimit)
  const gameSentences = useMemo(() => {
    const pool = activePool.length > 0 ? activePool : allSentences;
    const targetPool = gameKey > 0 ? shuffle([...pool]) : pool;
    return targetPool.slice(0, Math.min(sentenceLimit, targetPool.length));
  }, [activePool, sentenceLimit, gameKey]);

  const totalQuestions = gameSentences.length;
  const currentSentence =
    gameSentences[currentIndex] || gameSentences[0] || allSentences[0];

  const { recordQuestion, submitSession, resetSession } = useGameTracking({
    gameType: "sentences",
    topic: selectedCategory,
    configId: configId || undefined,
    totalQuestions,
  });

  // Target words for current sentence
  const targetWords = useMemo(() => {
    if (!currentSentence?.words) return [];
    return currentSentence.words;
  }, [currentSentence]);

  // Initial bank items scrambled
  const bankItems = useMemo(() => {
    return generateSentenceBank(targetWords, boardKey + currentIndex * 7);
  }, [targetWords, boardKey, currentIndex]);

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      cancel();
      resetSession();
      setSelectedCategory(categoryId);
      setCurrentIndex(0);
      setScore(0);
      setIsCompleted(false);
      setFeedbackState({ show: false, isCorrect: false, formedSentence: "" });
      setGameKey((k) => k + 1);
      setBoardKey((k) => k + 1);
      attemptsRef.current = 1;
      totalTimeTakenRef.current = 0;
      sentenceStartTimeRef.current = Date.now();
    },
    [cancel, resetSession]
  );

  const handleRestart = useCallback(() => {
    cancel();
    resetSession();
    setCurrentIndex(0);
    setScore(0);
    setIsCompleted(false);
    setFeedbackState({ show: false, isCorrect: false, formedSentence: "" });
    setGameKey((k) => k + 1);
    setBoardKey((k) => k + 1);
    attemptsRef.current = 1;
    totalTimeTakenRef.current = 0;
    sentenceStartTimeRef.current = Date.now();
  }, [cancel, resetSession]);

  const handleRetrySentence = useCallback(() => {
    cancel();
    attemptsRef.current += 1;
    totalTimeTakenRef.current += Math.max(0, Date.now() - sentenceStartTimeRef.current);
    setBoardKey((k) => k + 1);
    setFeedbackState({ show: false, isCorrect: false, formedSentence: "" });
    sentenceStartTimeRef.current = Date.now();
  }, [cancel]);

  const handleItemPlaced = useCallback(
    (item: DraggableItem | SlotItem) => {
      if (item && item.label) {
        speak(item.label);
      }
    },
    [speak]
  );

  const fullSentence = currentSentence?.full;

  const handleCompleteSentence = useCallback(
    (isCorrect: boolean, formedString: string) => {
      const timeTakenMs = totalTimeTakenRef.current + Math.max(0, Date.now() - sentenceStartTimeRef.current);

      if (isCorrect) {
        recordQuestion({
          prompt: fullSentence || "",
          selectedAnswer: formedString,
          correctAnswer: fullSentence || "",
          isCorrect: true,
          timeTakenMs,
          attempts: attemptsRef.current,
        });

        setScore((s) => s + 1);
        if (fullSentence) {
          speak(fullSentence);
        }
      }

      setFeedbackState({
        show: true,
        isCorrect,
        formedSentence: formedString,
      });
    },
    [fullSentence, speak, recordQuestion]
  );

  const handleNextSentence = useCallback(() => {
    cancel();
    setFeedbackState({ show: false, isCorrect: false, formedSentence: "" });
    attemptsRef.current = 1;
    totalTimeTakenRef.current = 0;
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setBoardKey((k) => k + 1);
      sentenceStartTimeRef.current = Date.now();
    } else {
      setIsCompleted(true);
      submitSession({
        score,
        totalQuestions,
        topic: selectedCategory,
      });
    }
  }, [currentIndex, totalQuestions, cancel, submitSession, score, selectedCategory]);

  const handleSpeakSentence = useCallback(() => {
    if (fullSentence) {
      speak(fullSentence);
    }
  }, [fullSentence, speak]);

  const progressPercent =
    totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-3xl xl:max-w-4xl space-y-6">
        {/* Header navigation & Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <BackButton href="/" label="Về trang chủ" />
          <div className="text-center sm:text-right flex-1">
            <div className="flex items-center gap-2 justify-center sm:justify-end flex-wrap">
              {isPreview ? (
                <PreviewBanner />
              ) : (
                configName && <ConfigBanner configName={configName} />
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight flex items-center gap-2">
                <span>💬</span>
                <span>Luyện câu đơn giản</span>
              </h1>
            </div>
            <p className="text-sm sm:text-base font-semibold text-muted-foreground mt-0.5">
              Sắp xếp các từ để tạo thành câu tiếng Anh hoàn chỉnh nhé!
            </p>
          </div>
        </div>

        {/* Speech support alert if browser not supported */}
        {!dismissUnsupported && !isSupported && (
          <SpeechUnsupportedBanner
            show={true}
            onDismiss={() => setDismissUnsupported(true)}
          />
        )}

        {/* Category Filter Buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-muted-foreground px-1">
            <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Chọn chủ đề câu:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <Button
              type="button"
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange("all")}
              className={cn(
                "rounded-full font-bold px-4 py-2 text-xs sm:text-sm whitespace-nowrap shadow-sm cursor-pointer transition-all",
                selectedCategory === "all"
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                  : "hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              <span>Tất cả ({activePool.length})</span>
            </Button>

            {displayedCategories.map((cat) => {
              const count = allSentences.filter((s) => s.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <Button
                  key={cat.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={cn(
                    "rounded-full font-bold px-3.5 py-2 text-xs sm:text-sm whitespace-nowrap shadow-sm cursor-pointer transition-all flex items-center gap-1.5",
                    isSelected
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                      : "hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                  )}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.nameVi}</span>
                  <span className="opacity-70 text-xs">({count})</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Main Game Card */}
        <Card className="p-4 sm:p-6 md:p-8 rounded-3xl border-4 border-indigo-200 dark:border-indigo-800/60 bg-card shadow-xl space-y-6">
          {!isCompleted ? (
            <>
              {/* Progress & Score */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm sm:text-base font-extrabold text-muted-foreground">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    Câu {currentIndex + 1} / {totalQuestions}
                  </span>
                  <span>Điểm: {score}</span>
                </div>
                <Progress value={progressPercent} className="h-3 rounded-full" />
              </div>

              {/* Sentence Visual Situation Prompt */}
              <div className="flex flex-col items-center text-center space-y-3 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-3xl p-4 border-2 border-indigo-200/60 dark:border-indigo-800/40">
                <span
                  aria-hidden="true"
                  className="text-7xl sm:text-8xl select-none animate-in zoom-in-50 duration-200"
                >
                  {currentSentence?.emoji}
                </span>

                <div className="flex flex-col items-center">
                  {showVietnamese && (
                    <span className="text-xl sm:text-2xl font-black text-foreground">
                      {currentSentence?.vietnamese}
                    </span>
                  )}
                  <span className="text-xs sm:text-sm font-semibold text-muted-foreground mt-0.5">
                    Gợi ý: Câu gồm {targetWords.length} từ
                  </span>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSpeakSentence}
                  aria-label="Nghe câu mẫu"
                  className="rounded-full font-bold px-4 py-2 text-xs sm:text-sm cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 hover:bg-indigo-200"
                >
                  <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Nghe câu mẫu</span>
                </Button>
              </div>

              {/* Interactive Drag Drop Word Board */}
              <DragDropBoard
                key={`${currentIndex}-${boardKey}`}
                targetItems={targetWords}
                bankItems={bankItems}
                itemTypeLabel="từ"
                joinSeparator=" "
                onItemPlaced={handleItemPlaced}
                onComplete={handleCompleteSentence}
              />
            </>
          ) : (
            /* Celebration Screen when completed */
            <div className="flex flex-col items-center justify-center text-center py-8 space-y-6 animate-in zoom-in-75 duration-300">
              <div className="text-7xl sm:text-8xl select-none animate-bounce">🏆</div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  🎉 Bé đã hoàn thành xuất sắc!
                </h2>
                <p className="text-base sm:text-lg font-bold text-muted-foreground">
                  Bé đã ghép đúng {score} / {totalQuestions} câu tiếng Anh hoàn chỉnh!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleRestart}
                  className="rounded-2xl px-6 py-6 text-lg font-extrabold cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Chơi lại</span>
                </Button>
                <BackButton href="/" label="Về trang chủ" />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackState.show}
        onOpenChange={(open) => !open && setFeedbackState((prev) => ({ ...prev, show: false }))}
      >
        <DialogContent className="max-w-md rounded-3xl p-6 border-4 text-center">
          <DialogHeader className="flex flex-col items-center gap-2">
            {feedbackState.isCorrect ? (
              <>
                <div className="text-6xl animate-bounce">⭐🎉</div>
                <DialogTitle className="text-2xl font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span>Bé giỏi quá! Chính xác!</span>
                </DialogTitle>
                <DialogDescription className="text-base font-bold text-foreground">
                  Câu đúng là:{" "}
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 block mt-1">
                    &ldquo;{currentSentence?.full}&rdquo;
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground mt-1 block">
                    ({currentSentence?.vietnamese})
                  </span>
                </DialogDescription>
              </>
            ) : (
              <>
                <div className="text-6xl animate-pulse">🤔💡</div>
                <DialogTitle className="text-2xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-rose-600" />
                  <span>Chưa chính xác rồi!</span>
                </DialogTitle>
                <DialogDescription className="text-base font-bold text-foreground">
                  Bé đã ghép:{" "}
                  <span className="text-lg font-black text-rose-600 line-through block mt-1">
                    &ldquo;{feedbackState.formedSentence}&rdquo;
                  </span>
                  <span className="text-sm text-muted-foreground block mt-1">
                    Bé hãy thử sắp xếp lại các từ cho đúng thứ tự nhé!
                  </span>
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 justify-center">
            {feedbackState.isCorrect ? (
              <Button
                type="button"
                size="lg"
                onClick={handleNextSentence}
                className="w-full rounded-2xl py-6 text-base sm:text-lg font-black cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center gap-2"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                onClick={handleRetrySentence}
                className="w-full rounded-2xl py-6 text-base sm:text-lg font-black cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Thử lại</span>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SentencesGamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SentencesGameContent />
    </Suspense>
  );
}
