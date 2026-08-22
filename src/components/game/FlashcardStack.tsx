"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles } from "lucide-react";
import { Word } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SpeakButton } from "@/components/custom/SpeakButton";
import { useSpeech } from "@/hooks/useSpeech";
import { cn } from "@/lib/utils";

export interface FlashcardStackProps {
  words: Word[];
  topicTitle?: string;
  autoSpeak?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function FlashcardStack({
  words,
  topicTitle,
  autoSpeak = false,
  onComplete,
  className,
}: FlashcardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const { speak, cancel: cancelSpeech } = useSpeech();
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const total = words.length;
  const currentWord = words[currentIndex];

  useEffect(() => {
    if (autoSpeak && currentWord && !isCompleted) {
      speak(currentWord.english);
    }
  }, [autoSpeak, currentIndex, currentWord, isCompleted, speak]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      const nextFlipped = !prev;
      if (nextFlipped && currentWord) {
        speak(currentWord.english);
      } else {
        cancelSpeech();
      }
      return nextFlipped;
    });
  }, [currentWord, speak, cancelSpeech]);

  const handleNext = useCallback(() => {
    cancelSpeech();
    if (currentIndex < total - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, total, onComplete, cancelSpeech]);

  const handlePrev = useCallback(() => {
    cancelSpeech();
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, cancelSpeech]);

  const handleRestart = useCallback(() => {
    cancelSpeech();
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  }, [cancelSpeech]);

  // Touch swipe handling for mobile / tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }

    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartXRef.current;
    const diffY = touch.clientY - touchStartYRef.current;

    // Reset touch coordinates
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Only process horizontal swipes if horizontal diff is greater than vertical diff
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX < 0) {
        // Swiped left -> Next card
        handleNext();
      } else {
        // Swiped right -> Prev card
        handlePrev();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if modifier keys are pressed (e.g. Alt+Left for browser back)
      if (e.altKey || e.ctrlKey || e.metaKey) {
        return;
      }

      if (
        e.target instanceof Element &&
        (["INPUT", "TEXTAREA"].includes(e.target.tagName) ||
          e.target.closest("button"))
      ) {
        return;
      }

      if (isCompleted) {
        if (e.key === "Enter" || e.key === " ") {
          handleRestart();
        }
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === " " || e.key === "Enter") {
        if (
          e.target === document.body ||
          (e.target instanceof Element &&
            (e.target.getAttribute("data-slot") === "card" ||
              e.target.id === "flashcard-interactive" ||
              e.target.closest("#flashcard-interactive")))
        ) {
          e.preventDefault();
          handleFlip();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, handleFlip, handleRestart, isCompleted]);

  if (!words || words.length === 0) {
    return (
      <div className={cn("text-center p-8 bg-card rounded-3xl border-2 border-border shadow-md", className)}>
        <p className="text-xl text-muted-foreground font-medium">
          Chưa có từ vựng nào trong chủ đề này.
        </p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div
        className={cn(
          "w-full max-w-xl mx-auto flex flex-col items-center justify-center p-8 bg-card rounded-3xl border-4 border-primary/20 shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300",
          className
        )}
      >
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-6xl animate-bounce">
          🎉
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-2">
            <span>Xuất sắc!</span>
            <Sparkles className="w-8 h-8 text-amber-600 fill-amber-500" />
          </h2>
          <p className="text-lg text-muted-foreground">
            Bé đã hoàn thành xuất sắc {total} từ vựng
            {topicTitle ? ` trong chủ đề ${topicTitle}` : ""}!
          </p>
        </div>

        <div className="w-full pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={handleRestart}
            className="rounded-2xl text-lg font-bold h-14 px-8 shadow-lg cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Học lại
          </Button>
        </div>
      </div>
    );
  }

  const progressPercent = ((currentIndex + 1) / total) * 100;
  const isLastCard = currentIndex === total - 1;

  return (
    <div className={cn("w-full max-w-xl mx-auto flex flex-col items-center space-y-6", className)}>
      {/* Screen Reader Live Region for Accessibility */}
      <div aria-live="polite" className="sr-only">
        {isFlipped
          ? `Mặt sau thẻ. Từ vựng tiếng Anh: ${currentWord.english}, phiên âm: ${currentWord.phonetic}, nghĩa tiếng Việt: ${currentWord.vietnamese}`
          : `Mặt trước thẻ ${currentIndex + 1} trên ${total}.`}
      </div>

      {/* Header Info: Topic title & Progress */}
      <div className="w-full flex items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          {topicTitle && (
            <Badge variant="secondary" className="text-base font-bold py-1.5 px-3.5 rounded-full shadow-sm">
              {topicTitle}
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="text-base font-bold py-1.5 px-3.5 rounded-full border-2">
          {currentIndex + 1} / {total}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="w-full px-2">
        <Progress value={progressPercent} className="h-3.5 rounded-full bg-muted shadow-inner" />
      </div>

      {/* 3D Flip Card Container */}
      <div
        id="flashcard-interactive"
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? "Lật thẻ lại / Flip card back" : "Lật thẻ / Flip card"}
        onClick={(e) => {
          if (e.target instanceof Element && e.target.closest("button")) {
            return;
          }
          handleFlip();
        }}
        onKeyDown={(e) => {
          if (e.target instanceof Element && e.target.closest("button")) {
            return;
          }
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFlip();
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full min-h-[360px] sm:min-h-[400px] perspective-1000 cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 rounded-3xl"
      >
        <div
          key={currentIndex}
          className={cn(
            "relative w-full h-full min-h-[360px] sm:min-h-[400px] transition-transform duration-500 transform-style-preserve-3d",
            isFlipped && "rotate-y-180"
          )}
        >
          {/* FRONT FACE */}
          <Card
            className={cn(
              "absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-between p-6 sm:p-8 rounded-3xl border-4 border-border bg-card shadow-xl hover:border-primary/40 transition-colors overflow-visible",
              !isFlipped && "z-10"
            )}
          >
            <div className="w-full flex justify-end">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted text-muted-foreground">
                Mặt trước
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-4 my-auto">
              <div className="text-8xl sm:text-9xl transform hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                {currentWord.emoji}
              </div>
            </div>

            <div className="w-full text-center">
              <p className="text-sm sm:text-base font-semibold text-muted-foreground/80 flex items-center justify-center gap-1.5 animate-pulse">
                <span>Chạm để lật thẻ</span>
                <span>👆</span>
              </p>
            </div>
          </Card>

          {/* BACK FACE */}
          <Card
            className={cn(
              "absolute inset-0 w-full h-full backface-hidden rotate-y-180 flex flex-col items-center justify-between p-6 sm:p-8 rounded-3xl border-4 border-primary/40 bg-card shadow-xl overflow-visible",
              isFlipped && "z-10"
            )}
          >
            <div className="w-full flex justify-between items-center">
              <div className="text-3xl sm:text-4xl">{currentWord.emoji}</div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                Mặt sau
              </span>
            </div>

            <CardContent className="flex-1 flex flex-col items-center justify-center space-y-4 p-0 my-auto text-center">
              <div className="space-y-1">
                <h2 className="text-4xl sm:text-5xl font-black text-emerald-700 dark:text-emerald-400 tracking-wide">
                  {currentWord.english}
                </h2>
                <p className="text-lg sm:text-xl font-mono font-medium text-muted-foreground">
                  {currentWord.phonetic}
                </p>
              </div>

              <div className="pt-2">
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {currentWord.vietnamese}
                </p>
              </div>

              <div
                className="pt-3"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <SpeakButton
                  text={currentWord.english}
                  className="w-14 h-14 shadow-lg ring-4 ring-primary/20 hover:scale-105"
                />
              </div>
            </CardContent>

            <div className="w-full text-center">
              <p className="text-sm sm:text-base font-semibold text-muted-foreground/80 flex items-center justify-center gap-1.5">
                <span>Chạm để lật lại</span>
                <span>🔄</span>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="w-full flex items-center justify-between gap-4 px-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={currentIndex === 0}
          onClick={handlePrev}
          aria-label="Trước / Previous card"
          className="rounded-2xl text-base font-bold h-12 sm:h-14 px-5 sm:px-7 border-2 shadow-sm cursor-pointer disabled:opacity-40"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
          <span>Trước</span>
        </Button>

        <Button
          type="button"
          size="lg"
          onClick={handleNext}
          aria-label={isLastCard ? "Hoàn thành / Finish" : "Tiếp / Next card"}
          className={cn(
            "rounded-2xl text-base font-bold h-12 sm:h-14 px-6 sm:px-8 shadow-md cursor-pointer transition-all",
            isLastCard
              ? "bg-accent text-accent-foreground hover:bg-accent/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <span>{isLastCard ? "Hoàn thành" : "Tiếp"}</span>
          <ChevronRight className="w-6 h-6 ml-1" />
        </Button>
      </div>
    </div>
  );
}
