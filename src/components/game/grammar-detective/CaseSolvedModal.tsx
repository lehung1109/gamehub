// src/components/game/grammar-detective/CaseSolvedModal.tsx
'use client';

import React from 'react';
import type { CaseFile } from '@/types/grammar-detective';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle2, Clock, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseSolvedModalProps {
  isOpen: boolean;
  caseFile: CaseFile | null;
  starsEarned: number;
  credibility: number;
  elapsedSeconds: number;
  onNextCase: () => void;
  onRetry: () => void;
  onReturnToDossier: () => void;
}

export const CaseSolvedModal: React.FC<CaseSolvedModalProps> = ({
  isOpen,
  caseFile,
  starsEarned,
  credibility,
  elapsedSeconds,
  onNextCase,
  onRetry,
  onReturnToDossier,
}) => {
  if (!caseFile) return null;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onReturnToDossier()}>
      <DialogContent className="sm:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <DialogTitle className="text-2xl font-black text-foreground">
            🎉 Vụ án đã được phá giải!
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Hồ sơ &ldquo;{caseFile.title}&rdquo; ({caseFile.titleVi}) đã được xác minh và làm sạch
            lỗi ngữ pháp.
          </DialogDescription>

          {/* Star Rating Display */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3].map((starIndex) => (
              <Star
                key={starIndex}
                className={cn(
                  'w-8 h-8 transition-transform duration-300',
                  starIndex <= starsEarned
                    ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-md'
                    : 'text-muted-foreground/30 scale-95'
                )}
              />
            ))}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/60 border text-xs font-semibold">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>Thời gian: <strong className="text-foreground">{formattedTime}</strong></span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Uy tín còn lại: <strong className="text-foreground">{credibility}/3</strong></span>
            </div>
          </div>
        </DialogHeader>

        {/* Solved Clues Rule Recap */}
        <div className="space-y-3 my-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            📚 Điểm ngữ pháp cốt lõi đã phá giải ({caseFile.errors.length}):
          </h4>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {caseFile.errors.map((err, idx) => (
              <div
                key={err.id}
                className="p-3 rounded-lg border bg-card/60 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2 font-bold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      #{idx + 1}
                    </Badge>
                    <span className="line-through text-rose-500">{err.targetWord}</span>
                    <span>➔</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {err.options.find((o) => o.isCorrect)?.text}
                    </span>
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {err.errorType}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{err.explanationEn}</p>
                <p className="text-foreground font-medium italic">{err.explanationVi}</p>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Điều tra lại</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onNextCase}
            className="gap-1.5 font-bold text-xs flex-1"
          >
            <span>Vụ án tiếp theo</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
