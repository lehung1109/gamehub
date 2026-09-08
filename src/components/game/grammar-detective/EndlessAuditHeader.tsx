// src/components/game/grammar-detective/EndlessAuditHeader.tsx
'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Trophy, ArrowLeft } from 'lucide-react';

interface EndlessAuditHeaderProps {
  streak: number;
  highestStreak: number;
  onExitEndless: () => void;
}

export const EndlessAuditHeader: React.FC<EndlessAuditHeaderProps> = ({
  streak,
  highestStreak,
  onExitEndless,
}) => {
  return (
    <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-card border-2 border-orange-400/40 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3">
        <Badge
          variant="default"
          className="bg-orange-600 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider gap-1 px-2.5 py-1"
        >
          <Flame className="w-3.5 h-3.5 fill-white" />
          <span>Chế độ vô tận (Endless Audit)</span>
        </Badge>
        <div className="text-xs text-muted-foreground hidden sm:inline">
          Phá giải liên tục các văn bản để giữ chuỗi bất bại!
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Current Streak */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-background/80 rounded-lg border text-xs font-bold text-orange-600 dark:text-orange-400">
          <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
          <span>Chuỗi: {streak}</span>
        </div>

        {/* High Score Streak */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-background/80 rounded-lg border text-xs font-bold text-amber-600 dark:text-amber-400">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Kỷ lục: {highestStreak}</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExitEndless}
          className="text-xs font-semibold gap-1 h-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Thoát vô tận</span>
        </Button>
      </div>
    </div>
  );
};
