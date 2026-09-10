"use client";

import React from "react";
import { Sparkles, Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface BonusWordsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foundBonusWords: string[];
}

export const BonusWordsModal: React.FC<BonusWordsModalProps> = ({
  open,
  onOpenChange,
  foundBonusWords,
}) => {
  const bonusPoints = foundBonusWords.length * 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="bonus-words-modal"
        className="sm:max-w-md bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-900/60 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[85vh]"
      >
        <DialogHeader className="text-left gap-1">
          <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-6 h-6" />
            </span>
            <span>Hũ Từ Thưởng (Bonus Words)</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Các từ tiếng Anh hợp lệ bạn phát hiện thêm ngoài bảng chính.
          </DialogDescription>
        </DialogHeader>

        {foundBonusWords.length > 0 ? (
          <div className="space-y-4 my-2">
            {/* Total bonus points badge */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tổng điểm thưởng:
                </span>
              </div>
              <span className="text-base font-black text-purple-700 dark:text-purple-300">
                +{bonusPoints} điểm ({foundBonusWords.length} từ)
              </span>
            </div>

            {/* List of discovered words */}
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {foundBonusWords.map((word, idx) => (
                <div
                  key={`${word}-${idx}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <span className="font-extrabold uppercase text-slate-800 dark:text-slate-100 text-sm">
                    {word}
                  </span>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-1.5 py-0.5 rounded-md">
                    +10
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-6 px-4 space-y-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-dashed border-purple-200 dark:border-purple-800/60 my-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
              Hũ từ thưởng đang trống!
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Trong khi chơi, hãy tìm thêm các từ tiếng Anh hợp lệ khác ngoài bảng ô chữ để nhận thêm điểm thưởng nhé! 🌟
            </p>
          </div>
        )}

        <DialogFooter className="mt-3">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-2xl min-h-[44px] font-bold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
