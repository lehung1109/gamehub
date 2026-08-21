"use client";

import React, { useState, useMemo, useCallback } from "react";
import lettersData from "@/data/letters.json";
import { Letter } from "@/types";
import { LetterGrid } from "@/components/game/LetterGrid";
import { QuizEngine, QuizQuestion } from "@/components/game/QuizEngine";
import { BackButton } from "@/components/custom/BackButton";
import { SpeakButton } from "@/components/custom/SpeakButton";
import { SpeechUnsupportedBanner } from "@/components/custom/SpeechUnsupportedBanner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/useSpeech";
import { shuffle } from "@/lib/shuffle";
import { Volume2, BookOpen, Brain, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const allLetters = lettersData as Letter[];

function generateQuizQuestions(letterPool: Letter[], questionCount = 10): QuizQuestion<Letter>[] {
  const shuffledPool = shuffle([...letterPool]);
  const selectedTargets = shuffledPool.slice(0, Math.min(questionCount, shuffledPool.length));

  return selectedTargets.map((target) => {
    // Pick 3 distractors from remaining letters
    const otherLetters = letterPool.filter((l) => l.letter !== target.letter);
    const distractors = shuffle(otherLetters).slice(0, 3);
    const options = shuffle([target, ...distractors]);
    const correctIndex = options.findIndex((opt) => opt.letter === target.letter);

    return {
      prompt: target,
      options,
      correctIndex,
      correctAnswerText: `Chữ ${target.letter} (${target.exampleWord})`,
    };
  });
}

export default function AlphabetGamePage() {
  const [activeTab, setActiveTab] = useState<"learn" | "quiz">("learn");
  const [selectedLetter, setSelectedLetter] = useState<Letter>(allLetters[0]);
  const [quizKey, setQuizKey] = useState(0);
  const [dismissUnsupported, setDismissUnsupported] = useState(false);

  const { speak, cancel, isSupported } = useSpeech();

  const handleTabChange = useCallback(
    (val: string) => {
      cancel();
      setActiveTab(val as "learn" | "quiz");
    },
    [cancel]
  );

  // Selected letter index for prev/next buttons
  const currentIndex = useMemo(() => {
    const idx = allLetters.findIndex((l) => l.letter === selectedLetter.letter);
    return idx >= 0 ? idx : 0;
  }, [selectedLetter]);

  const handleSelectLetter = useCallback(
    (letter: Letter) => {
      setSelectedLetter(letter);
      speak(letter.letter);
    },
    [speak]
  );

  const handlePrevLetter = useCallback(() => {
    if (currentIndex > 0) {
      const prev = allLetters[currentIndex - 1];
      handleSelectLetter(prev);
    }
  }, [currentIndex, handleSelectLetter]);

  const handleNextLetter = useCallback(() => {
    if (currentIndex < allLetters.length - 1) {
      const next = allLetters[currentIndex + 1];
      handleSelectLetter(next);
    }
  }, [currentIndex, handleSelectLetter]);

  // Keyboard navigation in Learn mode (ArrowLeft, ArrowRight, Space/Enter)
  React.useEffect(() => {
    if (activeTab !== "learn") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (
        e.target instanceof Element &&
        (["INPUT", "TEXTAREA"].includes(e.target.tagName) || e.target.closest("button"))
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextLetter();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevLetter();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        speak(`${selectedLetter.letter}. ${selectedLetter.exampleWord}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, handleNextLetter, handlePrevLetter, selectedLetter, speak]);

  // Generate 10 quiz questions
  const quizQuestions = useMemo(() => {
    return generateQuizQuestions(allLetters, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizKey]);

  const handleRestartQuiz = useCallback(() => {
    setQuizKey((k) => k + 1);
  }, []);

  const handleQuizSpeak = useCallback(
    (promptLetter: Letter) => {
      speak(promptLetter.letter);
    },
    [speak]
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header navigation and title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <BackButton href="/" label="Về trang chủ" />
          <div className="text-center sm:text-right flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight flex items-center gap-2 justify-center sm:justify-end">
              <span>🔤</span>
              <span>Chữ cái & Phonics</span>
            </h1>
            <p className="text-sm sm:text-base font-semibold text-muted-foreground mt-0.5">
              Học phát âm bảng chữ cái tiếng Anh qua hình ảnh sinh động
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

        {/* Mode Switcher Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full space-y-6"
        >
          <div className="flex justify-center">
            <TabsList className="h-auto p-1.5 rounded-2xl bg-muted/80 border-2 border-border shadow-sm grid grid-cols-2 w-full max-w-md">
              <TabsTrigger
                value="learn"
                className="rounded-xl font-bold text-sm sm:text-base py-2.5 sm:py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Học chữ cái</span>
              </TabsTrigger>
              <TabsTrigger
                value="quiz"
                className="rounded-xl font-bold text-sm sm:text-base py-2.5 sm:py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Luyện tập (Quiz)</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* LEARN MODE CONTENT */}
          <TabsContent value="learn" className="space-y-6 mt-2 focus:outline-none">
            {/* Letter Focus Card */}
            <Card className="rounded-3xl border-4 border-primary/20 bg-card shadow-xl overflow-hidden">
              <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left: Big letter & sound */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-7xl sm:text-8xl md:text-9xl font-black text-emerald-700 dark:text-emerald-400 tracking-wider drop-shadow-sm leading-none">
                      {selectedLetter.letter}
                    </span>
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-muted-foreground">
                      {selectedLetter.letter.toLowerCase()}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-base sm:text-lg font-mono font-bold">
                    <span>Phát âm:</span>
                    <span>{selectedLetter.phonetic}</span>
                  </div>
                </div>

                {/* Center: Example Word and Emoji */}
                <div className="flex flex-col items-center justify-center text-center p-4 bg-muted/40 rounded-2xl border-2 border-border/80 min-w-[200px] space-y-2">
                  <div className="text-6xl sm:text-7xl transform hover:scale-110 transition-transform duration-200">
                    {selectedLetter.exampleEmoji}
                  </div>
                  <div className="space-y-0.5" aria-label={`Từ ví dụ: ${selectedLetter.exampleWord}`}>
                    <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-wide">
                      <strong className="text-emerald-700 dark:text-emerald-400 underline decoration-4 underline-offset-4">
                        {selectedLetter.exampleWord[0]}
                      </strong>
                      <span>{selectedLetter.exampleWord.slice(1)}</span>
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Từ ví dụ minh họa
                    </p>
                  </div>
                </div>

                {/* Right: Audio action & Navigation */}
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <SpeakButton
                      text={`${selectedLetter.letter}. ${selectedLetter.exampleWord}`}
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
                      disabled={currentIndex === 0}
                      onClick={handlePrevLetter}
                      aria-label="Chữ trước"
                      className="rounded-xl w-12 h-12 border-2 cursor-pointer disabled:opacity-30"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <span className="text-sm font-bold text-muted-foreground px-2">
                      {currentIndex + 1} / {allLetters.length}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={currentIndex === allLetters.length - 1}
                      onClick={handleNextLetter}
                      aria-label="Chữ tiếp theo"
                      className="rounded-xl w-12 h-12 border-2 cursor-pointer disabled:opacity-30"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Letter Grid for direct selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
                  <span>Bảng chữ cái A-Z</span>
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
                </h2>
                <span className="text-xs sm:text-sm text-muted-foreground font-semibold">
                  Chạm vào chữ để xem & nghe phát âm
                </span>
              </div>
              <LetterGrid
                letters={allLetters}
                selectedLetter={selectedLetter.letter}
                onSelectLetter={handleSelectLetter}
              />
            </div>
          </TabsContent>

          {/* QUIZ MODE CONTENT */}
          <TabsContent value="quiz" className="mt-2 focus:outline-none">
            <Card className="p-4 sm:p-6 rounded-3xl border-4 border-primary/20 bg-card shadow-xl">
              <QuizEngine<Letter>
                key={quizKey}
                questions={quizQuestions}
                title="🎯 Thử thách nhận diện chữ cái"
                onSpeak={handleQuizSpeak}
                onComplete={() => {}}
                onRestart={handleRestartQuiz}
                renderPrompt={(target) => (
                  <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <p className="text-lg sm:text-xl font-extrabold text-foreground">
                      Bé hãy nghe và chọn chữ cái đúng nhé!
                    </p>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        size="lg"
                        onClick={() => speak(target.letter)}
                        aria-label={`Nghe lại phát âm chữ cái`}
                        className="rounded-2xl px-6 py-6 text-lg font-bold shadow-md cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                      >
                        <Volume2 className="w-6 h-6" />
                        <span>Nghe lại âm thanh</span>
                      </Button>
                    </div>
                  </div>
                )}
                renderOption={(option) => (
                  <div className="flex items-center justify-center gap-3 py-2">
                    <span className="text-4xl sm:text-5xl font-black tracking-wider">
                      {option.letter}
                    </span>
                    <span className="text-2xl sm:text-3xl">
                      {option.exampleEmoji}
                    </span>
                  </div>
                )}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
