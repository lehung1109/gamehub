// src/components/game/grammar-detective/CaseColdModal.tsx
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
import { AlertOctagon, RotateCcw, ArrowLeft } from 'lucide-react';

interface CaseColdModalProps {
  isOpen: boolean;
  caseFile: CaseFile | null;
  mistakes: number;
  solvedCount: number;
  onRetry: () => void;
  onReturnToDossier: () => void;
}

export const CaseColdModal: React.FC<CaseColdModalProps> = ({
  isOpen,
  caseFile,
  mistakes,
  solvedCount,
  onRetry,
  onReturnToDossier,
}) => {
  if (!caseFile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onReturnToDossier()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <DialogTitle className="text-2xl font-black text-foreground">
            ⚠️ Vụ án bị đình chỉ (Case Cold)
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Bạn đã làm mất hết điểm Uy tín thám tử ({mistakes} lần phán đoán chưa chính xác). Hồ sơ &ldquo;{caseFile.title}&rdquo; tạm thời khép lại.
          </DialogDescription>

          <div className="p-3 rounded-xl bg-muted/60 border text-xs text-muted-foreground">
            Tiến độ đã đạt: <strong className="text-foreground">{solvedCount}/{caseFile.errors.length} manh mối</strong>
          </div>
        </DialogHeader>

        <div className="space-y-2.5 my-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            💡 Lời khuyên cho thám tử:
          </h4>
          <p className="text-xs text-foreground/90 bg-card p-3 rounded-lg border">
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
            <span>Điều tra lại từ đầu</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
