"use client";

import React from "react";
import { Trophy, Star, ArrowRight, RotateCcw, Volume2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WordConnectWordInfo } from "@/types/word-connect";

export interface WordConnectResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  levelNumber: number;
  totalLevels: number;
  score: number;
  targetWords: WordConnectWordInfo[];
  foundBonusWords?: string[];
  hintsUsed?: number;
  onNextLevel: () => void;
  onReplayLevel?: () => void;
  onSpeakWord?: (word: string) => void;
}

export const WordConnectResultDialog: React.FC<WordConnectResultDialogProps> = ({
  open,
  onOpenChange,
  levelNumber,
  totalLevels,
  score,
  targetWords,
  foundBonusWords = [],
  hintsUsed = 0,
  onNextLevel,
  onReplayLevel,
  onSpeakWord,
}) => {
  // 1-3 star calculation based on hints used
  const stars = hintsUsed === 0 ? 3 : hintsUsed <= 2 ? 2 : 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="word-connect-result-dialog"
        className="sm:max-w-lg bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <DialogHeader className="flex flex-col items-center text-center gap-1">
          {/* Trophy Header Icon */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-amber-950 shadow-xl shadow-amber-500/20 mb-2">
            <Trophy className="w-8 h-8" />
          </div>

          <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            HOÀN THÀNH MÀN CHƠI!
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Bạn đã xuất sắc vượt qua Màn {levelNumber} / {totalLevels}!
          </DialogDescription>

          {/* Stars */}
          <div className="flex items-center gap-2 my-2">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 ${
                  starIdx <= stars
                    ? "text-amber-400 fill-amber-400 filter drop-shadow-md scale-105"
                    : "text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-800"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        {/* Level Stats Summary */}
        <div className="grid grid-cols-3 gap-2 w-full my-1">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
              Tổng điểm
            </span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              {score}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
              Gợi ý dùng
            </span>
            <span className="text-lg font-black text-slate-700 dark:text-slate-300">
              {hintsUsed}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
              Từ thưởng
            </span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {foundBonusWords.length}
            </span>
          </div>
        </div>

        {/* Vocabulary Cards List */}
        <div className="w-full my-2 space-y-2">
          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Từ vựng đã học ({targetWords.length}):
          </h4>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {targetWords.map((tw) => (
              <div
                key={tw.word}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-left transition-all"
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base sm:text-lg font-black tracking-wide text-slate-900 dark:text-slate-100 uppercase">
                      {tw.word}
                    </span>
                    {tw.phonetic && (
                      <span className="text-xs text-slate-400 font-mono">
                        {tw.phonetic}
                      </span>
                    )}
                    {tw.partOfSpeech && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        {tw.partOfSpeech}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {tw.vietnameseMeaning}
                  </p>

                  {tw.exampleSentence && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      &ldquo;{tw.exampleSentence}&rdquo;
                    </p>
                  )}
                </div>

                {/* Pronunciation speaker button */}
                {onSpeakWord && (
                  <button
                    type="button"
                    onClick={() => onSpeakWord(tw.word)}
                    aria-label={`Phát âm từ ${tw.word}`}
                    className="min-h-[44px] min-w-[44px] w-11 h-11 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 transition-colors shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
                    title={`Phát âm từ ${tw.word}`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          {onReplayLevel && (
            <Button
              type="button"
              variant="outline"
              onClick={onReplayLevel}
              className="flex-1 rounded-2xl min-h-[44px] font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Chơi lại
            </Button>
          )}

          <Button
            type="button"
            onClick={onNextLevel}
            className="flex-1 rounded-2xl min-h-[44px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md cursor-pointer"
          >
            <span>Màn tiếp theo</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
