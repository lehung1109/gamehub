// src/components/game/grammar-detective/DeductionCard.tsx
'use client';

import React, { useState } from 'react';
import type { CaseError } from '@/types/grammar-detective';
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
import { Volume2, Sparkles, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeductionCardProps {
  activeError: CaseError | null;
  isOpen: boolean;
  onSelectOption: (optionId: string) => boolean;
  onClose: () => void;
  onSpeak: (text: string) => void;
}

const errorCategoryLabels = {
  tense: 'Thì động từ (Verb Tense)',
  preposition: 'Giới từ (Preposition)',
  collocation: 'Kết hợp từ (Collocation)',
  politeness: 'Văn phong lịch sự (Politeness)',
  spelling: 'Chính tả (Spelling)',
};

export const DeductionCard: React.FC<DeductionCardProps> = ({
  activeError,
  isOpen,
  onSelectOption,
  onClose,
  onSpeak,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [lastAttemptResult, setLastAttemptResult] = useState<boolean | null>(null);

  if (!activeError) return null;

  const handleOptionClick = (optionId: string) => {
    setSelectedOptionId(optionId);
    const isCorrect = onSelectOption(optionId);
    setLastAttemptResult(isCorrect);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedOptionId(null);
      setLastAttemptResult(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="default" className="text-xs px-2.5 py-1 font-bold">
              🔍 Thẻ suy luận thám tử
            </Badge>
            <Badge variant="outline" className="text-xs">
              {errorCategoryLabels[activeError.errorType]}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <span>Manh mối:</span>
            <span className="bg-yellow-200 dark:bg-yellow-900/80 px-2.5 py-0.5 rounded text-yellow-950 dark:text-yellow-100 font-mono underline decoration-wavy">
              &ldquo;{activeError.targetWord}&rdquo;
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => onSpeak(activeError.targetWord)}
              aria-label="Nghe phát âm từ nghi vấn"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Phát hiện dấu hiệu bất thường về ngữ pháp/từ vựng. Hãy chọn phương án sửa chính xác nhất:
          </DialogDescription>
        </DialogHeader>

        {/* Options List */}
        <div className="space-y-2.5 my-4">
          {activeError.options.map((option, idx) => {
            const isChosen = selectedOptionId === option.id;
            return (
              <Button
                key={option.id}
                type="button"
                variant={isChosen ? (option.isCorrect ? 'default' : 'destructive') : 'outline'}
                className={cn(
                  'w-full justify-start text-left h-auto py-3 px-4 transition-all duration-150',
                  'border-2 text-sm sm:text-base font-medium',
                  !isChosen && 'hover:bg-accent hover:border-primary/50'
                )}
                onClick={() => handleOptionClick(option.id)}
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-foreground text-xs font-bold mr-3 shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 font-semibold">{option.text}</span>
                {isChosen && option.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                )}
                {isChosen && !option.isCorrect && (
                  <XCircle className="w-5 h-5 text-white shrink-0 ml-2" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Feedback & Rule Explanation Box */}
        {selectedOptionId && (
          <div
            className={cn(
              'p-4 rounded-xl border text-sm space-y-2 animate-in fade-in-50 duration-200',
              lastAttemptResult
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
            )}
          >
            <div className="flex items-center gap-2 font-bold">
              {lastAttemptResult ? (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Chính xác! Quy tắc điều tra:</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Chưa chính xác! Chú ý suy luận:</span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm">{activeError.explanationEn}</p>
            <p className="text-xs sm:text-sm font-medium italic">{activeError.explanationVi}</p>
          </div>
        )}

        <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleOpenChange(false)}
            className="text-xs"
          >
            Đóng bảng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
