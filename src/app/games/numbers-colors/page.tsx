"use client";

import React, { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import numbersData from "@/data/numbers.json";
import colorsData from "@/data/colors.json";
import { GameNumber, Color } from "@/types";
import { TabSwitcher } from "@/components/game/TabSwitcher";
import { QuizEngine, QuizQuestion } from "@/components/game/QuizEngine";
import { BackButton } from "@/components/custom/BackButton";
import { SpeakButton } from "@/components/custom/SpeakButton";
import { SpeechUnsupportedBanner } from "@/components/custom/SpeechUnsupportedBanner";
import { ConfigBanner } from "@/components/game/ConfigBanner";
import { useGameConfig } from "@/hooks/useGameConfig";
import type { NumbersColorsSettings } from "@/types/config";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/useSpeech";
import { shuffle } from "@/lib/shuffle";
import {
  Volume2,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Palette,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

const allNumbers = numbersData as GameNumber[];
const allColors = colorsData as Color[];

function generateNumberQuizQuestions(
  pool: GameNumber[],
  count = 10
): QuizQuestion<GameNumber>[] {
  const shuffledPool = shuffle([...pool]);
  const selectedTargets = shuffledPool.slice(0, Math.min(count, shuffledPool.length));

  return selectedTargets.map((target) => {
    const otherInPool = pool.filter((n) => n.value !== target.value);
    const poolForDistractors =
      otherInPool.length >= 3
        ? otherInPool
        : allNumbers.filter((n) => n.value !== target.value);
    const distractors = shuffle(poolForDistractors).slice(0, 3);
    const options = shuffle([target, ...distractors]);
    const correctIndex = options.findIndex((opt) => opt.value === target.value);

    return {
      id: `num-${target.value}`,
      prompt: target,
      options,
      correctIndex,
      correctAnswerText: `Số ${target.value} (${target.english} - ${target.vietnamese})`,
    };
  });
}

function generateColorQuizQuestions(
  pool: Color[],
  count = 10
): QuizQuestion<Color>[] {
  const shuffledPool = shuffle([...pool]);
  const selectedTargets = shuffledPool.slice(0, Math.min(count, shuffledPool.length));

  return selectedTargets.map((target) => {
    const distractors = shuffle(pool.filter((c) => c.id !== target.id)).slice(0, 3);
    const options = shuffle([target, ...distractors]);
    const correctIndex = options.findIndex((opt) => opt.id === target.id);

    return {
      id: `color-${target.id}`,
      prompt: target,
      options,
      correctIndex,
      correctAnswerText: `Màu ${target.english} (${target.vietnamese})`,
    };
  });
}

function NumbersColorsContent() {
  const { settings, configName } = useGameConfig<NumbersColorsSettings>("numbers-colors");

  const filteredNumbers = useMemo(() => {
    if (settings?.numberRange && Array.isArray(settings.numberRange) && settings.numberRange.length === 2) {
      const [min, max] = settings.numberRange;
      const res = allNumbers.filter((n) => n.value >= min && n.value <= max);
      return res.length > 0 ? res : allNumbers;
    }
    return allNumbers;
  }, [settings?.numberRange]);

  const showColors = settings?.includeColors ?? true;

  const [userActiveCategory, setUserActiveCategory] = useState<"numbers" | "colors" | null>(null);
  const requestedCategory = userActiveCategory ?? "numbers";
  const activeCategory = (!showColors && requestedCategory === "colors") ? "numbers" : requestedCategory;

  const [userActiveMode, setUserActiveMode] = useState<"learn" | "quiz" | null>(null);
  const activeMode = userActiveMode ?? settings?.mode ?? "learn";

  const [userSelectedNumberValue, setUserSelectedNumberValue] = useState<number | null>(null);
  const selectedNumber = useMemo(() => {
    if (userSelectedNumberValue !== null) {
      const found = filteredNumbers.find((n) => n.value === userSelectedNumberValue);
      if (found) return found;
    }
    return filteredNumbers[0] || allNumbers[0];
  }, [userSelectedNumberValue, filteredNumbers]);

  const [selectedColor, setSelectedColor] = useState<Color>(allColors[0]);

  const [quizKey, setQuizKey] = useState(0);
  const [dismissUnsupported, setDismissUnsupported] = useState(false);

  const { speak, cancel, isSupported } = useSpeech();

  // Category switch
  const handleCategoryChange = useCallback(
    (val: string) => {
      cancel();
      setUserActiveCategory(val as "numbers" | "colors");
    },
    [cancel]
  );

  // Mode switch
  const handleModeChange = useCallback(
    (val: string) => {
      cancel();
      setUserActiveMode(val as "learn" | "quiz");
    },
    [cancel]
  );

  // Current Number index
  const currentNumberIndex = useMemo(() => {
    const idx = filteredNumbers.findIndex((n) => n.value === selectedNumber.value);
    return idx >= 0 ? idx : 0;
  }, [selectedNumber, filteredNumbers]);

  // Current Color index
  const currentColorIndex = useMemo(() => {
    const idx = allColors.findIndex((c) => c.id === selectedColor.id);
    return idx >= 0 ? idx : 0;
  }, [selectedColor]);

  // Number selection
  const handleSelectNumber = useCallback(
    (num: GameNumber) => {
      setUserSelectedNumberValue(num.value);
      speak(num.english);
    },
    [speak]
  );

  // Color selection
  const handleSelectColor = useCallback(
    (color: Color) => {
      setSelectedColor(color);
      speak(color.english);
    },
    [speak]
  );

  // Sequential number navigation
  const handlePrevNumber = useCallback(() => {
    if (currentNumberIndex > 0) {
      const prev = filteredNumbers[currentNumberIndex - 1];
      handleSelectNumber(prev);
    }
  }, [currentNumberIndex, filteredNumbers, handleSelectNumber]);

  const handleNextNumber = useCallback(() => {
    if (currentNumberIndex < filteredNumbers.length - 1) {
      const next = filteredNumbers[currentNumberIndex + 1];
      handleSelectNumber(next);
    }
  }, [currentNumberIndex, filteredNumbers, handleSelectNumber]);

  // Sequential color navigation
  const handlePrevColor = useCallback(() => {
    if (currentColorIndex > 0) {
      const prev = allColors[currentColorIndex - 1];
      handleSelectColor(prev);
    }
  }, [currentColorIndex, handleSelectColor]);

  const handleNextColor = useCallback(() => {
    if (currentColorIndex < allColors.length - 1) {
      const next = allColors[currentColorIndex + 1];
      handleSelectColor(next);
    }
  }, [currentColorIndex, handleSelectColor]);

  // Keyboard navigation in Learn mode
  useEffect(() => {
    if (activeMode !== "learn") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (
        e.target instanceof Element &&
        (["INPUT", "TEXTAREA"].includes(e.target.tagName) || e.target.closest("button"))
      ) {
        return;
      }

      if (activeCategory === "numbers") {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNextNumber();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrevNumber();
        } else if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          speak(selectedNumber.english);
        }
      } else {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNextColor();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrevColor();
        } else if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          speak(selectedColor.english);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeCategory,
    activeMode,
    handleNextColor,
    handleNextNumber,
    handlePrevColor,
    handlePrevNumber,
    selectedColor,
    selectedNumber,
    speak,
  ]);

  // Quiz questions
  const numberQuizQuestions = useMemo(() => {
    return generateNumberQuizQuestions(filteredNumbers, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredNumbers, quizKey]);

  const colorQuizQuestions = useMemo(() => {
    return generateColorQuizQuestions(allColors, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizKey]);

  const handleRestartQuiz = useCallback(() => {
    setQuizKey((k) => k + 1);
  }, []);

  const handleNumberQuizSpeak = useCallback(
    (promptNum: GameNumber) => {
      speak(promptNum.english);
    },
    [speak]
  );

  const handleColorQuizSpeak = useCallback(
    (promptColor: Color) => {
      speak(promptColor.english);
    },
    [speak]
  );

  const categoryTabs = useMemo(() => {
    const tabs = [
      { id: "numbers", label: `Số đếm (${filteredNumbers.length} số)`, emoji: "🔢", icon: <Hash className="w-4 h-4" /> },
    ];
    if (showColors) {
      tabs.push({ id: "colors", label: "Màu sắc (Colors)", emoji: "🎨", icon: <Palette className="w-4 h-4" /> });
    }
    return tabs;
  }, [filteredNumbers.length, showColors]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header navigation and title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <BackButton href="/" label="Về trang chủ" />
          <div className="text-center sm:text-right flex-1">
            <div className="flex items-center gap-2 justify-center sm:justify-end flex-wrap">
              {configName && <ConfigBanner configName={configName} />}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight flex items-center gap-2">
                <span>🔢</span>
                <span>Số & Màu sắc</span>
              </h1>
            </div>
            <p className="text-sm sm:text-base font-semibold text-muted-foreground mt-0.5">
              Học đếm số và nhận diện các màu sắc cơ bản bằng tiếng Anh
            </p>
          </div>
        </div>

        {/* Speech support alert */}
        {!dismissUnsupported && !isSupported && (
          <SpeechUnsupportedBanner
            show={true}
            onDismiss={() => setDismissUnsupported(true)}
          />
        )}

        {/* Primary Category Switcher (Numbers vs Colors) */}
        {showColors && (
          <TabSwitcher
            tabs={categoryTabs}
            activeTab={activeCategory}
            onTabChange={handleCategoryChange}
          />
        )}

        {/* Mode Switcher (Learn vs Quiz) */}
        <Tabs
          value={activeMode}
          onValueChange={handleModeChange}
          className="w-full space-y-6"
        >
          <div className="flex justify-center">
            <TabsList className="h-auto p-1.5 rounded-2xl bg-muted/80 border-2 border-border shadow-sm grid grid-cols-2 w-full max-w-md">
              <TabsTrigger
                value="learn"
                className="rounded-xl font-bold text-sm sm:text-base py-2.5 sm:py-3 px-4 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Học tập</span>
              </TabsTrigger>
              <TabsTrigger
                value="quiz"
                className="rounded-xl font-bold text-sm sm:text-base py-2.5 sm:py-3 px-4 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Luyện tập (Quiz)</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ===================== NUMBERS CATEGORY ===================== */}
          {activeCategory === "numbers" && (
            <>
              {/* LEARN MODE */}
              <TabsContent value="learn" className="space-y-6 mt-2 focus:outline-none">
                {/* Number Focus Card */}
                <Card
                  className="rounded-3xl border-4 border-primary/20 bg-card shadow-xl overflow-hidden"
                  aria-label={`Chi tiết số: ${selectedNumber.value} - ${selectedNumber.english}`}
                >
                  <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left: Big Number */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                      <div className="flex items-center gap-4">
                        <span className="text-7xl sm:text-8xl md:text-9xl font-black text-emerald-700 dark:text-emerald-400 tracking-wider drop-shadow-sm leading-none">
                          {selectedNumber.value}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl sm:text-3xl font-black text-foreground">
                          {selectedNumber.english}
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-muted-foreground">
                          {selectedNumber.vietnamese}
                        </p>
                      </div>
                    </div>

                    {/* Center: Emoji Quantity Illustration */}
                    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 bg-muted/40 rounded-2xl border-2 border-border/80 min-w-[220px] max-w-[320px] space-y-2">
                      <div className="text-3xl sm:text-4xl tracking-widest break-words text-center line-clamp-3">
                        {selectedNumber.emoji}
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-sm font-bold">
                        <span>Số lượng: {selectedNumber.value}</span>
                      </div>
                    </div>

                    {/* Right: Audio action & Navigation */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <SpeakButton
                          text={selectedNumber.english}
                          className="w-16 h-16 sm:w-20 sm:h-20 shadow-lg ring-4 ring-primary/20 hover:scale-105"
                        />
                        <span className="text-xs sm:text-sm font-bold text-muted-foreground">
                          Bấm để nghe
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={currentNumberIndex === 0}
                          onClick={handlePrevNumber}
                          aria-label="Số trước"
                          className="rounded-xl w-12 h-12 border-2 cursor-pointer disabled:opacity-30"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <span className="text-sm font-bold text-muted-foreground px-2">
                          {selectedNumber.value} / {allNumbers.length}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={currentNumberIndex === allNumbers.length - 1}
                          onClick={handleNextNumber}
                          aria-label="Số tiếp theo"
                          className="rounded-xl w-12 h-12 border-2 cursor-pointer disabled:opacity-30"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Numbers Grid (1-20) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
                      <span>Bảng số từ 1 đến 20</span>
                      <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
                    </h2>
                    <span className="text-xs sm:text-sm text-muted-foreground font-semibold">
                      Chạm vào số để nghe & xem
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2.5 sm:gap-3">
                    {filteredNumbers.map((num) => {
                      const isSelected = selectedNumber.value === num.value;
                      return (
                        <button
                          key={num.value}
                          type="button"
                          aria-label={`Số ${num.value} (${num.english})`}
                          onClick={() => handleSelectNumber(num)}
                          className={cn(
                            "h-16 sm:h-20 rounded-2xl font-black text-xl sm:text-2xl flex flex-col items-center justify-center transition-all cursor-pointer border-3 shadow-sm",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary scale-105 shadow-md ring-4 ring-primary/20"
                              : "bg-card text-foreground border-border hover:border-primary/60 hover:bg-primary/5 hover:scale-105 active:scale-95"
                          )}
                        >
                          <span>{num.value}</span>
                          <span
                            className={cn(
                              "text-[10px] sm:text-xs font-semibold truncate max-w-full px-1",
                              isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                            )}
                          >
                            {num.english}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* QUIZ MODE */}
              <TabsContent value="quiz" className="mt-2 focus:outline-none">
                <Card className="p-4 sm:p-6 rounded-3xl border-4 border-primary/20 bg-card shadow-xl">
                  <QuizEngine<GameNumber>
                    key={`numbers-quiz-${quizKey}`}
                    questions={numberQuizQuestions}
                    title="🎯 Thử thách nhận diện số đếm"
                    onSpeak={handleNumberQuizSpeak}
                    onComplete={() => {}}
                    onRestart={handleRestartQuiz}
                    getOptionAriaLabel={(option) => `Lựa chọn số ${option.value} (${option.english})`}
                    renderPrompt={(target) => (
                      <div className="flex flex-col items-center text-center space-y-4 py-4">
                        <p className="text-lg sm:text-xl font-extrabold text-foreground">
                          Bé hãy nghe và chọn đáp án đúng nhé!
                        </p>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            size="lg"
                            onClick={() => speak(target.english)}
                            aria-label="Nghe lại phát âm số"
                            className="rounded-2xl px-6 py-6 text-lg font-bold shadow-md cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                          >
                            <Volume2 className="w-6 h-6" />
                            <span>Nghe lại âm thanh</span>
                          </Button>
                        </div>
                      </div>
                    )}
                    renderOption={(option) => (
                      <div className="flex items-center justify-between gap-3 py-2 px-1">
                        <span className="text-4xl sm:text-5xl font-black tracking-wider text-emerald-700 dark:text-emerald-400">
                          {option.value}
                        </span>
                        <div className="flex flex-col text-right">
                          <span className="text-lg sm:text-xl font-bold text-foreground">
                            {option.english}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                            {option.vietnamese}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                </Card>
              </TabsContent>
            </>
          )}

          {/* ===================== COLORS CATEGORY ===================== */}
          {activeCategory === "colors" && (
            <>
              {/* LEARN MODE */}
              <TabsContent value="learn" className="space-y-6 mt-2 focus:outline-none">
                {/* Color Focus Card */}
                <Card
                  className="rounded-3xl border-4 border-primary/20 bg-card shadow-xl overflow-hidden"
                  aria-label={`Chi tiết màu: ${selectedColor.english}`}
                >
                  <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left: Color Swatch Tile */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                      <div
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shadow-lg border-4 border-slate-300 dark:border-slate-700 flex items-center justify-center"
                        style={{ backgroundColor: selectedColor.hex }}
                      >
                        {selectedColor.id === "white" && (
                          <span className="text-xs font-bold text-slate-500">Trắng</span>
                        )}
                      </div>
                    </div>

                    {/* Center: English and Vietnamese Names */}
                    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 bg-muted/40 rounded-2xl border-2 border-border/80 min-w-[220px] space-y-1.5">
                      <p className="text-3xl sm:text-4xl font-black text-foreground">
                        {selectedColor.english}
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {selectedColor.vietnamese}
                      </p>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-xs font-mono font-bold text-muted-foreground mt-1">
                        <span>Mã: {selectedColor.hex}</span>
                      </div>
                    </div>

                    {/* Right: Audio action & Navigation */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <SpeakButton
                          text={selectedColor.english}
                          className="w-16 h-16 sm:w-20 sm:h-20 shadow-lg ring-4 ring-primary/20 hover:scale-105"
                        />
                        <span className="text-xs sm:text-sm font-bold text-muted-foreground">
                          Bấm để nghe
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={currentColorIndex === 0}
                          onClick={handlePrevColor}
                          aria-label="Màu trước"
                          className="rounded-xl w-12 h-12 border-2 cursor-pointer disabled:opacity-30"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <span className="text-sm font-bold text-muted-foreground px-2">
                          {currentColorIndex + 1} / {allColors.length}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={currentColorIndex === allColors.length - 1}
                          onClick={handleNextColor}
                          aria-label="Màu tiếp theo"
                          className="rounded-xl w-12 h-12 border-2 cursor-pointer disabled:opacity-30"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Colors Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
                      <span>Bảng màu sắc</span>
                      <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
                    </h2>
                    <span className="text-xs sm:text-sm text-muted-foreground font-semibold">
                      Chạm vào màu để nghe & xem
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {allColors.map((color) => {
                      const isSelected = selectedColor.id === color.id;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          aria-label={`Màu ${color.english} (${color.vietnamese})`}
                          onClick={() => handleSelectColor(color)}
                          className={cn(
                            "p-3 sm:p-4 rounded-2xl font-bold flex items-center gap-3 transition-all cursor-pointer border-3 shadow-sm text-left",
                            isSelected
                              ? "bg-card border-primary ring-4 ring-primary/20 scale-105 shadow-md"
                              : "bg-card border-border hover:border-primary/60 hover:bg-muted/40 hover:scale-102 active:scale-95"
                          )}
                        >
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-sm border-2 border-slate-300 dark:border-slate-700 shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm sm:text-base font-black text-foreground truncate">
                              {color.english}
                            </p>
                            <p className="text-xs font-semibold text-muted-foreground truncate">
                              {color.vietnamese}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* QUIZ MODE */}
              <TabsContent value="quiz" className="mt-2 focus:outline-none">
                <Card className="p-4 sm:p-6 rounded-3xl border-4 border-primary/20 bg-card shadow-xl">
                  <QuizEngine<Color>
                    key={`colors-quiz-${quizKey}`}
                    questions={colorQuizQuestions}
                    title="🎯 Thử thách nhận diện màu sắc"
                    onSpeak={handleColorQuizSpeak}
                    onComplete={() => {}}
                    onRestart={handleRestartQuiz}
                    getOptionAriaLabel={(option) => `Lựa chọn màu ${option.english} (${option.vietnamese})`}
                    renderPrompt={(target) => (
                      <div className="flex flex-col items-center text-center space-y-4 py-4">
                        <p className="text-lg sm:text-xl font-extrabold text-foreground">
                          Bé hãy nghe và chọn màu sắc đúng nhé!
                        </p>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            size="lg"
                            onClick={() => speak(target.english)}
                            aria-label="Nghe lại phát âm màu sắc"
                            className="rounded-2xl px-6 py-6 text-lg font-bold shadow-md cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                          >
                            <Volume2 className="w-6 h-6" />
                            <span>Nghe lại âm thanh</span>
                          </Button>
                        </div>
                      </div>
                    )}
                    renderOption={(option) => (
                      <div className="flex items-center gap-4 py-2 px-1">
                        <div
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-sm border-2 border-slate-300 dark:border-slate-700 shrink-0"
                          style={{ backgroundColor: option.hex }}
                        />
                        <div className="flex flex-col">
                          <span className="text-lg sm:text-xl font-black text-foreground">
                            {option.english}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                            {option.vietnamese}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default function NumbersColorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <NumbersColorsContent />
    </Suspense>
  );
}
