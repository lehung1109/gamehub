// src/components/game/grammar-detective/CaseColdModal.tsx
'use client';

import React from 'react';
import type { CaseFile, CaseError } from '@/types/grammar-detective';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertOctagon, RotateCcw, ArrowLeft } from 'lucide-react';

interface CaseColdModalProps {
  isOpen: boolean;
  caseFile: CaseFile | null;
  mistakes: number;
  solvedCount: number;
  unsolvedErrors?: CaseError[];
  mode?: 'case' | 'endless';
  streak?: number;
  highestStreak?: number;
  onRetry: () => void;
  onReturnToDossier: () => void;
}

export const CaseColdModal: React.FC<CaseColdModalProps> = ({
  isOpen,
  caseFile,
  mistakes,
  solvedCount,
  unsolvedErrors = [],
  mode = 'case',
  streak = 0,
  highestStreak = 0,
  onRetry,
  onReturnToDossier,
}) => {
  if (!caseFile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onReturnToDossier()}>
      <DialogContent className="sm:max-w-md p-5 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertOctagon className="w-6 h-6" />
          </div>

          <DialogTitle className="text-xl font-black text-foreground">
            ⚠️ Vụ án bị đình chỉ (Case Cold)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Bạn đã làm mất hết điểm Uy tín thám tử ({mistakes} lần phán đoán chưa chính xác). Hồ sơ &ldquo;{caseFile.title}&rdquo; tạm thời khép lại.
          </DialogDescription>

          <div className="p-2.5 rounded-lg bg-muted/60 border text-xs text-muted-foreground">
            Tiến độ đã đạt: <strong className="text-foreground">{solvedCount}/{caseFile.errors.length} manh mối</strong>
          </div>

          {mode === 'endless' && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-800 dark:text-orange-300">
              <span>🔥 Chuỗi vô tận: <strong>{streak} vụ</strong></span>
              {highestStreak > 0 && (
                <span>• Kỷ lục: <strong>{highestStreak}</strong></span>
              )}
            </div>
          )}
        </DialogHeader>

        {/* Undiscovered clues recap */}
        {unsolvedErrors.length > 0 && (
          <div className="space-y-2 my-2">
            <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              🔍 Các manh mối chưa tìm ra ({unsolvedErrors.length}):
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {unsolvedErrors.map((err) => (
                <div key={err.id} className="p-2 rounded-lg border bg-card/70 text-xs space-y-0.5">
                  <div className="font-semibold text-foreground flex items-center justify-between">
                    <span>
                      Từ sai: <span className="line-through text-rose-500">{err.targetWord}</span> ➔{' '}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {err.options.find((o) => o.isCorrect)?.text}
                      </span>
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {err.errorType}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground italic text-xs">{err.explanationVi}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5 my-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            💡 Lời khuyên cho thám tử:
          </h4>
          <p className="text-xs text-foreground/90 bg-card p-2.5 rounded-lg border">
            Đọc kỹ ngữ cảnh cả câu trước khi bôi highlight. Chú ý các dấu hiệu về thời gian (yesterday, today), đại từ số ít/nhiều (everyone, team), và các giới từ đi liền với động từ (comply with, responsible for).
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReturnToDossier}
            className="gap-1.5 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Chọn vụ khác</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onRetry}
            className="gap-1.5 font-bold text-xs flex-1 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{mode === 'endless' ? 'Chơi lại vòng vô tận 🔥' : 'Điều tra lại từ đầu'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
