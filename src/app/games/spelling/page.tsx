"use client";

import React, { useState, useMemo, useCallback, Suspense } from "react";
import topicsData from "@/data/topics.json";
import animalsWords from "@/data/words/animals.json";
import fruitsWords from "@/data/words/fruits.json";
import familyWords from "@/data/words/family.json";
import schoolWords from "@/data/words/school.json";
import bodyPartsWords from "@/data/words/body-parts.json";

import { Topic, Word } from "@/types";
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
import type { SpellingSettings } from "@/types/config";
import { shuffle } from "@/lib/shuffle";
import {
  Volume2,
  Sparkles,
  Filter,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const allTopics = topicsData as Topic[];

const allWords: Word[] = [
  ...(animalsWords as Word[]),
  ...(fruitsWords as Word[]),
  ...(familyWords as Word[]),
  ...(schoolWords as Word[]),
  ...(bodyPartsWords as Word[]),
];

// Filter to 3-5 letter words for spelling
const spellingEligibleAll = allWords.filter(
  (w) => w.english.trim().length >= 3 && w.english.trim().length <= 5
);

const topicWordsMap: Record<string, Word[]> = {
  animals: (animalsWords as Word[]).filter(
    (w) => w.english.trim().length >= 3 && w.english.trim().length <= 5
  ),
  fruits: (fruitsWords as Word[]).filter(
    (w) => w.english.trim().length >= 3 && w.english.trim().length <= 5
  ),
  family: (familyWords as Word[]).filter(
    (w) => w.english.trim().length >= 3 && w.english.trim().length <= 5
  ),
  school: (schoolWords as Word[]).filter(
    (w) => w.english.trim().length >= 3 && w.english.trim().length <= 5
  ),
  "body-parts": (bodyPartsWords as Word[]).filter(
    (w) => w.english.trim().length >= 3 && w.english.trim().length <= 5
  ),
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function generateSpellingBank(targetWord: string, seed = 0): DraggableItem[] {
  const letters = targetWord.trim().toUpperCase().split("");
  const targetItems: DraggableItem[] = letters.map((letter, idx) => ({
    id: `target-${idx}-${letter}`,
    label: letter,
  }));

  const distractorCount = letters.length <= 3 ? 3 : 2;
  const wordLettersSet = new Set(letters);
  const candidateDistractors = ALPHABET.filter((c) => !wordLettersSet.has(c));

  // Pick distinct distractors deterministically
  const charSum = targetWord.split("").reduce((acc, c, idx) => acc + c.charCodeAt(0) * (idx + 1), 0);
  const pickedDistractors: string[] = [];
  for (let i = 0; i < distractorCount; i++) {
    const idx = (charSum + i * 7 + seed) % candidateDistractors.length;
    pickedDistractors.push(candidateDistractors[idx]);
  }

  const distractorItems: DraggableItem[] = pickedDistractors.map((letter, idx) => ({
    id: `distractor-${idx}-${letter}`,
    label: letter,
  }));

  const combined = [...targetItems, ...distractorItems];
  // Scramble deterministically based on character hash for seamless SSR and CSR match
  return combined.sort((a, b) => {
    const hashA = (a.label.charCodeAt(0) * 17 + charSum + seed) % 31;
    const hashB = (b.label.charCodeAt(0) * 17 + charSum + seed) % 31;
    return hashA - hashB || a.id.localeCompare(b.id);
  });
}

function SpellingGameContent() {
  const { settings, configName, isPreview } = useGameConfig<SpellingSettings>("spelling");

  const topicsConfig = settings?.topics;

  const displayedTopics = useMemo(() => {
    if (topicsConfig && Array.isArray(topicsConfig) && topicsConfig.length > 0) {
      const allowed = new Set(topicsConfig);
      const filtered = allTopics.filter((t) => allowed.has(t.id));
      return filtered.length > 0 ? filtered : allTopics;
    }
    return allTopics;
  }, [topicsConfig]);

  const [selectedTopicId, setSelectedTopicId] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [boardKey, setBoardKey] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackState, setFeedbackState] = useState<{
    show: boolean;
    isCorrect: boolean;
    formedWord: string;
  }>({
    show: false,
    isCorrect: false,
    formedWord: "",
  });
  const [dismissUnsupported, setDismissUnsupported] = useState(false);

  const { speak, cancel, isSupported } = useSpeech();

  // Active word pool based on selected topic or config topics
  const activeWordPool = useMemo(() => {
    if (selectedTopicId !== "all") {
      return topicWordsMap[selectedTopicId] || spellingEligibleAll;
    }
    if (topicsConfig && Array.isArray(topicsConfig) && topicsConfig.length > 0) {
      const words: Word[] = [];
      topicsConfig.forEach((tId) => {
        if (topicWordsMap[tId]) {
          words.push(...topicWordsMap[tId]);
        }
      });
      return words.length > 0 ? words : spellingEligibleAll;
    }
    return spellingEligibleAll;
  }, [selectedTopicId, topicsConfig]);

  const wordLimit =
    settings?.wordLimit && settings.wordLimit > 0
      ? settings.wordLimit
      : 10;
  const showEmoji = settings?.showEmoji ?? true;

  // Session words
  const gameWords = useMemo(() => {
    const pool = activeWordPool.length > 0 ? activeWordPool : spellingEligibleAll;
    const targetPool = gameKey > 0 ? shuffle([...pool]) : pool;
    return targetPool.slice(0, Math.min(wordLimit, targetPool.length));
  }, [activeWordPool, wordLimit, gameKey]);

  const totalQuestions = gameWords.length;
  const currentWord = gameWords[currentIndex] || gameWords[0] || spellingEligibleAll[0];
  const targetLetters = useMemo(() => {
    return (currentWord?.english || "").trim().toUpperCase().split("");
  }, [currentWord]);

  // Initial letter bank items scrambled
  const bankItems = useMemo(() => {
    return generateSpellingBank(currentWord?.english || "CAT", boardKey + currentIndex * 5);
  }, [currentWord?.english, boardKey, currentIndex]);

  const handleTopicChange = useCallback(
    (topicId: string) => {
      cancel();
      setSelectedTopicId(topicId);
      setCurrentIndex(0);
      setScore(0);
      setIsCompleted(false);
      setFeedbackState({ show: false, isCorrect: false, formedWord: "" });
      setGameKey((k) => k + 1);
      setBoardKey((k) => k + 1);
    },
    [cancel]
  );

  const handleRestart = useCallback(() => {
    cancel();
    setCurrentIndex(0);
    setScore(0);
    setIsCompleted(false);
    setFeedbackState({ show: false, isCorrect: false, formedWord: "" });
    setGameKey((k) => k + 1);
    setBoardKey((k) => k + 1);
  }, [cancel]);

  const handleRetryWord = useCallback(() => {
    cancel();
    setBoardKey((k) => k + 1);
    setFeedbackState({ show: false, isCorrect: false, formedWord: "" });
  }, [cancel]);

  const handleItemPlaced = useCallback(
    (item: DraggableItem | SlotItem) => {
      if (item && item.label) {
        speak(item.label);
      }
    },
    [speak]
  );

  const currentWordEnglish = currentWord?.english;

  const handleCompleteSpelling = useCallback(
    (isCorrect: boolean, formedString: string) => {
      if (isCorrect) {
        setScore((s) => s + 1);
        if (currentWordEnglish) {
          speak(currentWordEnglish);
        }
      }

      setFeedbackState({
        show: true,
        isCorrect,
        formedWord: formedString,
      });
    },
    [currentWordEnglish, speak]
  );

  const handleNextWord = useCallback(() => {
    cancel();
    setFeedbackState({ show: false, isCorrect: false, formedWord: "" });
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setBoardKey((k) => k + 1);
    } else {
      setIsCompleted(true);
    }
  }, [currentIndex, totalQuestions, cancel]);

  const handleSpeakCurrentWord = useCallback(() => {
    if (currentWordEnglish) {
      speak(currentWordEnglish);
    }
  }, [currentWordEnglish, speak]);

  const progressPercent =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-3xl space-y-6">
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight flex items-center gap-2">
                <span>✏️</span>
                <span>Đánh vần & Ghép từ</span>
              </h1>
            </div>
            <p className="text-sm sm:text-base font-semibold text-muted-foreground mt-0.5">
              Kéo thả hoặc chạm các chữ cái để ghép thành từ tiếng Anh đúng nhé!
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

        {/* Topic Filter Pill Buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-muted-foreground px-1">
            <Filter className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Chọn chủ đề từ vựng:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <Button
              type="button"
              variant={selectedTopicId === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTopicChange("all")}
              className={cn(
                "rounded-full font-bold px-4 py-2 text-xs sm:text-sm whitespace-nowrap shadow-sm cursor-pointer transition-all",
                selectedTopicId === "all"
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md"
                  : "hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              <span>Tất cả ({activeWordPool.length})</span>
            </Button>

            {displayedTopics.map((topic) => {
              const count = topicWordsMap[topic.id]?.length || 0;
              const isSelected = selectedTopicId === topic.id;

              return (
                <Button
                  key={topic.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTopicChange(topic.id)}
                  className={cn(
                    "rounded-full font-bold px-3.5 py-2 text-xs sm:text-sm whitespace-nowrap shadow-sm cursor-pointer transition-all flex items-center gap-1.5",
                    isSelected
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md"
                      : "hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  )}
                >
                  <span>{topic.emoji}</span>
                  <span>{topic.nameVi}</span>
                  <span className="opacity-70 text-xs">({count})</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Main Game Area */}
        <Card className="p-4 sm:p-6 md:p-8 rounded-3xl border-4 border-amber-300 dark:border-amber-700/60 bg-card shadow-xl space-y-6">
          {!isCompleted ? (
            <>
              {/* Progress & Header */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm sm:text-base font-extrabold text-muted-foreground">
                  <span className="text-amber-600 dark:text-amber-400">
                    Từ {currentIndex + 1} / {totalQuestions}
                  </span>
                  <span>Điểm: {score}</span>
                </div>
                <Progress value={progressPercent} className="h-3 rounded-full" />
              </div>

              {/* Word Visual Prompt */}
              <div className="flex flex-col items-center text-center space-y-3 py-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-3xl p-4 border-2 border-amber-200/60 dark:border-amber-800/40">
                {showEmoji ? (
                  <span
                    aria-hidden="true"
                    className="text-7xl sm:text-8xl md:text-9xl select-none animate-in zoom-in-50 duration-200"
                  >
                    {currentWord?.emoji}
                  </span>
                ) : (
                  <div className="size-20 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-300">
                    <HelpCircle className="size-12" />
                  </div>
                )}

                <div className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-black text-foreground">
                    {currentWord?.vietnamese}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                    {currentWord?.phonetic}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSpeakCurrentWord}
                  aria-label={`Nghe phát âm từ`}
                  className="rounded-full font-bold px-4 py-2 text-xs sm:text-sm cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 hover:bg-amber-200"
                >
                  <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Nghe phát âm</span>
                </Button>
              </div>

              {/* Interactive Drag Drop Spelling Board */}
              <DragDropBoard
                key={`${currentIndex}-${boardKey}`}
                targetItems={targetLetters}
                bankItems={bankItems}
                onItemPlaced={handleItemPlaced}
                onComplete={handleCompleteSpelling}
              />
            </>
          ) : (
            /* Celebration Screen when completed */
            <div className="flex flex-col items-center justify-center text-center py-8 space-y-6 animate-in zoom-in-75 duration-300">
              <div className="text-7xl sm:text-8xl select-none animate-bounce">🏆</div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                  🎉 Bé đã hoàn thành xuất sắc!
                </h2>
                <p className="text-base sm:text-lg font-bold text-muted-foreground">
                  Bé đã ghép đúng {score} / {totalQuestions} từ vựng tiếng Anh!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleRestart}
                  className="rounded-2xl px-6 py-6 text-lg font-extrabold cursor-pointer bg-amber-500 hover:bg-amber-600 text-white shadow-lg flex items-center gap-2"
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

      {/* Feedback Dialog Overlay */}
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
                  Từ đúng là:{" "}
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                    {currentWord?.english}
                  </span>{" "}
                  ({currentWord?.vietnamese})
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
                  <span className="text-lg font-black text-rose-600 line-through">
                    {feedbackState.formedWord}
                  </span>
                  <br />
                  <span className="text-sm text-muted-foreground">
                    Gợi ý: Từ này có {targetLetters.length} chữ cái. Bé hãy thử lại nhé!
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
                onClick={handleNextWord}
                className="w-full rounded-2xl py-6 text-base sm:text-lg font-black cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center gap-2"
              >
                <span>Từ tiếp theo</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                onClick={handleRetryWord}
                className="w-full rounded-2xl py-6 text-base sm:text-lg font-black cursor-pointer bg-amber-500 hover:bg-amber-600 text-white shadow-lg flex items-center justify-center gap-2"
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

export default function SpellingGamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SpellingGameContent />
    </Suspense>
  );
}
