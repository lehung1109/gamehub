'use client';

import React from 'react';
import { Star, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { PronunciationResult } from '@/types/pronunciation';
import { Button } from '@/components/ui/button';

interface PronunciationResultCardProps {
  result: PronunciationResult;
  onRetry: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function PronunciationResultCard({
  result,
  onRetry,
  onNext,
  isLastQuestion,
}: PronunciationResultCardProps) {
  return (
    <div className="p-5 border rounded-2xl bg-card space-y-4 shadow-sm animate-in fade-in-50 duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((starIndex) => (
            <Star
              key={starIndex}
              className={`w-6 h-6 ${
                starIndex <= result.stars
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-bold text-foreground">{result.accuracy}%</span>
      </div>

      <div className="flex flex-wrap gap-2 py-2">
        {result.wordDetails.map((wordEval, idx) => (
          <span
            key={idx}
            className={`px-3 py-1 rounded-lg text-base font-semibold border ${
              wordEval.isMatch
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}
          >
            {wordEval.word}
          </span>
        ))}
      </div>

      <p className="text-sm font-medium text-foreground">{result.feedbackVi}</p>

      <div className="flex items-center gap-3 pt-2">
        <Button variant="outline" onClick={onRetry} className="flex-1 gap-2">
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </Button>
        <Button onClick={onNext} className="flex-1 gap-2">
          {isLastQuestion ? (
            <>
              <CheckCircle className="w-4 h-4" /> Hoàn thành
            </>
          ) : (
            <>
              Tiếp tục <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
