'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, RefreshCw, Home } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PronunciationScoreModalProps {
  isOpen: boolean;
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

export function PronunciationScoreModal({
  isOpen,
  score,
  totalQuestions,
  onRestart,
}: PronunciationScoreModalProps) {
  const percentage = totalQuestions > 0 ? Math.round((score / (totalQuestions * 100)) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto my-3 p-3 bg-amber-500/15 text-amber-500 rounded-full w-fit">
            <Trophy className="w-10 h-10" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Hoàn Thành Bài Luyện Nói!
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <p className="text-3xl font-extrabold text-primary">{percentage}%</p>
          <p className="text-sm text-muted-foreground">
            Bạn đã hoàn thành {totalQuestions} mục phát âm và đạt tổng điểm {score}!
          </p>
        </div>
        <DialogFooter className="flex gap-2 sm:justify-center">
          <Button variant="outline" onClick={onRestart} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Luyện lại
          </Button>
          <Link href="/" className={cn(buttonVariants(), "gap-2")}>
            <Home className="w-4 h-4" /> Về trang chủ
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
