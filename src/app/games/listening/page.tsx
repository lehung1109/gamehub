"use client";

import React, { useState, useMemo, useCallback, Suspense } from "react";
import topicsData from "@/data/topics.json";
import animalsWords from "@/data/words/animals.json";
import fruitsWords from "@/data/words/fruits.json";
import familyWords from "@/data/words/family.json";
import schoolWords from "@/data/words/school.json";
import bodyPartsWords from "@/data/words/body-parts.json";

import { Topic, Word } from "@/types";
import { QuizEngine, QuizQuestion } from "@/components/game/QuizEngine";
import { BackButton } from "@/components/custom/BackButton";
import { SpeechUnsupportedBanner } from "@/components/custom/SpeechUnsupportedBanner";
import { ConfigBanner } from "@/components/game/ConfigBanner";
import { PreviewBanner } from "@/components/game/PreviewBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSpeech } from "@/hooks/useSpeech";
import { useGameConfig } from "@/hooks/useGameConfig";
import { useGameTracking } from "@/hooks/use-game-tracking";
import type { ListeningSettings } from "@/types/config";
import { shuffle } from "@/lib/shuffle";
import { Volume2, Ear, Sparkles, Filter, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const allTopics = topicsData as Topic[];

const allWords: Word[] = [
  ...(animalsWords as Word[]),
  ...(fruitsWords as Word[]),
  ...(familyWords as Word[]),
  ...(schoolWords as Word[]),
  ...(bodyPartsWords as Word[]),
];

const topicWordsMap: Record<string, Word[]> = {
  animals: animalsWords as Word[],
  fruits: fruitsWords as Word[],
  family: familyWords as Word[],
  school: schoolWords as Word[],
  "body-parts": bodyPartsWords as Word[],
};

function generateListeningQuestions(
  wordPool: Word[],
  fallbackPool: Word[],
  questionCount = 10,
  randomize = true
): QuizQuestion<Word>[] {
  const targetPool = randomize ? shuffle([...wordPool]) : wordPool;
  const selectedTargets = targetPool.slice(0, Math.min(questionCount, targetPool.length));

  return selectedTargets.map((target) => {
    // Find 3 distractors from wordPool or fallbackPool
    let poolForDistractors = wordPool.length >= 4 ? wordPool : fallbackPool;
    let seenEnglish = new Set([target.english]);

    let uniqueOtherWords = poolForDistractors.filter((w) => {
      if (seenEnglish.has(w.english)) return false;
      seenEnglish.add(w.english);
      return true;
    });

    // If there aren't enough unique words in the specific topic pool, fallback to all words
    if (uniqueOtherWords.length < 3) {
      poolForDistractors = fallbackPool;
      seenEnglish = new Set([target.english]);
      uniqueOtherWords = poolForDistractors.filter((w) => {
        if (seenEnglish.has(w.english)) return false;
        seenEnglish.add(w.english);
        return true;
      });
    }

    const distractors = randomize
      ? shuffle(uniqueOtherWords).slice(0, 3)
      : uniqueOtherWords.slice(0, 3);
    const options = randomize
      ? shuffle([target, ...distractors])
      : [target, ...distractors];
    const correctIndex = options.findIndex((opt) => opt.id === target.id);

    return {
      id: target.id,
      prompt: target,
      options,
      correctIndex,
      correctAnswerText: `${target.emoji} ${target.english} (${target.vietnamese})`,
    };
  });
}

const emptySubscribe = () => () => {};

function ListeningGameContent() {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const { settings, configName, isPreview, configId } = useGameConfig<ListeningSettings>("listening");

  const topicsConfig = settings?.topics;

  // Filter topics if specified in config
  const displayedTopics = useMemo(() => {
    if (topicsConfig && Array.isArray(topicsConfig) && topicsConfig.length > 0) {
      const allowed = new Set(topicsConfig);
      const filtered = allTopics.filter((t) => allowed.has(t.id));
      return filtered.length > 0 ? filtered : allTopics;
    }
    return allTopics;
  }, [topicsConfig]);

  const [selectedTopicId, setSelectedTopicId] = useState<string>("all");
  const [gameKey, setGameKey] = useState(0);
  const [dismissUnsupported, setDismissUnsupported] = useState(false);

  const { speak, cancel, isSupported } = useSpeech();

  // Active word pool based on selected topic or config topics
  const activeWordPool = useMemo(() => {
    if (selectedTopicId !== "all") {
      return topicWordsMap[selectedTopicId] || allWords;
    }
    if (topicsConfig && Array.isArray(topicsConfig) && topicsConfig.length > 0) {
      const words: Word[] = [];
      topicsConfig.forEach((tId) => {
        if (topicWordsMap[tId]) {
          words.push(...topicWordsMap[tId]);
        }
      });
      return words.length > 0 ? words : allWords;
    }
    return allWords;
  }, [selectedTopicId, topicsConfig]);

  const questionCount = settings?.questionCount || 10;
  const showHint = settings?.showHint ?? true;

  // Generate randomized listening quiz questions
  const questions = useMemo(() => {
    return generateListeningQuestions(activeWordPool, allWords, questionCount, mounted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWordPool, questionCount, gameKey, mounted]);

  const { recordQuestion, submitSession, resetSession } = useGameTracking({
    gameType: "listening",
    topic: selectedTopicId,
    configId: configId || undefined,
    totalQuestions: questions.length,
  });

  const handleTopicChange = useCallback(
    (topicId: string) => {
      cancel();
      resetSession();
      setSelectedTopicId(topicId);
      setGameKey((prev) => prev + 1);
    },
    [cancel, resetSession]
  );

  const handleRestart = useCallback(() => {
    cancel();
    resetSession();
    setGameKey((prev) => prev + 1);
  }, [cancel, resetSession]);

  const handleSpeakWord = useCallback(
    (promptWord: Word) => {
      speak(promptWord.english);
    },
    [speak]
  );

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
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight flex items-center gap-2">
                <span>👂</span>
                <span>Nghe hiểu</span>
              </h1>
            </div>
            <p className="text-sm sm:text-base font-semibold text-muted-foreground mt-0.5">
              Lắng nghe từ tiếng Anh và chọn hình ảnh chính xác
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
            <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:border-primary hover:bg-primary/5"
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
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:border-primary hover:bg-primary/5"
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

        {/* Listening Game Card */}
        <Card className="p-4 sm:p-6 md:p-8 rounded-3xl border-4 border-primary/20 bg-card shadow-xl">
          <QuizEngine<Word>
            key={gameKey}
            questions={questions}
            title="🎯 Luyện nghe và nhận diện từ"
            autoAdvance={true}
            autoAdvanceMs={1500}
            getOptionAriaLabel={(_opt, idx) => `Lựa chọn hình ảnh ${idx + 1}`}
            onSpeak={handleSpeakWord}
            onAnswer={({ promptText, selectedAnswerText, correctAnswerText, isCorrect, timeTakenMs }) => {
              recordQuestion({
                prompt: promptText,
                selectedAnswer: selectedAnswerText,
                correctAnswer: correctAnswerText,
                isCorrect,
                timeTakenMs,
                attempts: 1,
              });
            }}
            onComplete={(finalScore, total) => {
              submitSession({
                score: finalScore,
                totalQuestions: total,
                topic: selectedTopicId,
              });
            }}
            onRestart={handleRestart}
            renderPrompt={(targetWord) => (
              <div className="flex flex-col items-center text-center space-y-4 py-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-sm sm:text-base font-bold">
                  <Ear className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Bé hãy lắng nghe và chọn hình ảnh đúng nhé!</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => speak(targetWord.english)}
                    aria-label={`Nghe lại âm thanh phát âm`}
                    className="rounded-2xl px-6 sm:px-8 py-6 text-lg sm:text-xl font-extrabold shadow-lg cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-transform flex items-center gap-3"
                  >
                    <Volume2 className="w-7 h-7 animate-pulse" />
                    <span>Nghe lại âm thanh</span>
                  </Button>
                  {showHint ? (
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      (Gợi ý: Nhấn vào nút trên để nghe lại âm thanh từ vựng)
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                      (Nhấn vào nút trên để nghe lại từ)
                    </span>
                  )}
                </div>
              </div>
            )}
            renderOption={(option, _idx, _isSelected, isCorrect) => (
              <div className="flex flex-col items-center justify-center p-3 sm:p-5 gap-2 text-center w-full">
                <span
                  aria-hidden="true"
                  className="text-5xl sm:text-6xl md:text-7xl transform group-hover:scale-110 group-active:scale-95 transition-transform duration-200 select-none"
                >
                  {option.emoji}
                </span>
                {isCorrect !== null && (
                  <div className="flex flex-col items-center animate-in fade-in-0 duration-150">
                    <span className="text-base sm:text-lg font-black text-foreground">
                      {option.english}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                      {option.vietnamese}
                    </span>
                  </div>
                )}
              </div>
            )}
          />
        </Card>
      </div>
    </div>
  );
}

export default function ListeningGamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ListeningGameContent />
    </Suspense>
  );
}
