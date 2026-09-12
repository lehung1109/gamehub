'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PronunciationItem } from '@/types/pronunciation';
import { PhoneticWordCard } from './PhoneticWordCard';
import { MicrophoneRecorder } from './MicrophoneRecorder';
import { PronunciationResultCard } from './PronunciationResultCard';
import { PronunciationScoreModal } from './PronunciationScoreModal';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeech } from '@/hooks/useSpeech';
import { useGameTracking } from '@/hooks/use-game-tracking';
import { evaluatePronunciation } from '@/lib/pronunciation-evaluator';

export interface PronunciationArenaProps {
  items: PronunciationItem[];
  topicId: string;
  passThreshold?: number;
  configId?: string;
}

export function PronunciationArena({
  items,
  topicId,
  passThreshold = 70,
  configId,
}: PronunciationArenaProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const recordedTranscriptRef = useRef<string | null>(null);

  const currentItem = items[currentIndex] || items[0];
  const { speak } = useSpeech({ rate: 0.85 });
  const { isTracking, recordQuestion, submitSession, resetSession } = useGameTracking({
    gameType: 'pronunciation',
    topic: topicId,
    configId,
  });

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ lang: 'en-US' });

  // Derive evaluation result directly from speech recognition state
  const evaluationResult = useMemo(() => {
    if (!isListening && transcript && currentItem) {
      return evaluatePronunciation(currentItem.targetText, transcript, passThreshold);
    }
    return null;
  }, [isListening, transcript, currentItem, passThreshold]);

  // When speech transcript completes, record question tracking to session
  useEffect(() => {
    if (evaluationResult && isTracking && recordedTranscriptRef.current !== transcript) {
      recordedTranscriptRef.current = transcript;
      recordQuestion({
        prompt: currentItem.targetText,
        selectedAnswer: transcript,
        correctAnswer: currentItem.targetText,
        isCorrect: evaluationResult.isPassed,
        timeTakenMs: 3000,
      });
    }
  }, [evaluationResult, isTracking, transcript, currentItem, recordQuestion]);

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      recordedTranscriptRef.current = null;
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleNext = useCallback(async () => {
    const accuracy = evaluationResult?.accuracy || 0;
    const isPassed = evaluationResult?.isPassed || false;
    const newTotalScore = totalScore + accuracy;
    const newPassedCount = passedCount + (isPassed ? 1 : 0);

    setTotalScore(newTotalScore);
    setPassedCount(newPassedCount);
    recordedTranscriptRef.current = null;
    resetTranscript();

    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      await submitSession({
        score: newPassedCount,
        totalQuestions: items.length,
        topic: topicId,
        gameType: 'pronunciation',
        configId,
      });
    }
  }, [
    currentIndex,
    items.length,
    evaluationResult,
    resetTranscript,
    submitSession,
    totalScore,
    passedCount,
    topicId,
    configId,
  ]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setTotalScore(0);
    setPassedCount(0);
    setIsCompleted(false);
    recordedTranscriptRef.current = null;
    resetTranscript();
    resetSession();
  }, [resetTranscript, resetSession]);

  if (!currentItem) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>Câu {currentIndex + 1} / {items.length}</span>
        <span>Điểm: {totalScore}</span>
      </div>

      <PhoneticWordCard
        targetText={currentItem.targetText}
        phonetic={currentItem.phonetic}
        vietnameseMeaning={currentItem.vietnameseMeaning}
        focusSound={currentItem.focusSound}
        onPlayAudio={(text) => speak(text)}
      />

      {!evaluationResult ? (
        <MicrophoneRecorder
          isListening={isListening}
          interimTranscript={interimTranscript}
          isSupported={isSupported}
          error={error}
          onToggleListening={handleToggleListening}
        />
      ) : (
        <PronunciationResultCard
          result={evaluationResult}
          onRetry={() => {
            recordedTranscriptRef.current = null;
            resetTranscript();
          }}
          onNext={handleNext}
          isLastQuestion={currentIndex + 1 >= items.length}
        />
      )}

      <PronunciationScoreModal
        isOpen={isCompleted}
        score={totalScore}
        totalQuestions={items.length}
        onRestart={handleRestart}
      />
    </div>
  );
}
