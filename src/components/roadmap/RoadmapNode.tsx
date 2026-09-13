'use client';

import React from 'react';
import { Star, Lock, Crown, Play, Check } from 'lucide-react';
import type { RoadmapNode, StudentNodeProgress } from '@/types/roadmap';

export interface RoadmapNodeProps {
  node: RoadmapNode;
  progress?: StudentNodeProgress;
  isUnlocked: boolean;
  isCurrent?: boolean;
  onSelect: (node: RoadmapNode) => void;
  className?: string;
}

export function RoadmapNodeComponent({
  node,
  progress,
  isUnlocked,
  isCurrent = false,
  onSelect,
  className = '',
}: RoadmapNodeProps) {
  const isCompleted = Boolean(progress?.isCompleted && (progress.stars ?? 0) > 0);
  const stars = progress?.stars ?? 0;
  const isBoss = node.isBossCheckpoint;

  return (
    <div
      data-testid={`roadmap-node-${node.id}`}
      onClick={() => onSelect(node)}
      className={`flex flex-col items-center select-none cursor-pointer group ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(node);
        }
      }}
      aria-label={`${node.titleVi}${!isUnlocked ? ' (Đang khóa)' : isCompleted ? ` (${stars} sao)` : ' (Sẵn sàng chơi)'}`}
    >
      {/* Node Circle */}
      <div
        className={`relative flex items-center justify-center rounded-full transition-all duration-300 transform group-hover:scale-105 active:scale-95 ${
          isBoss ? 'size-20 sm:size-24' : 'size-16 sm:size-20'
        } ${
          !isUnlocked
            ? 'bg-slate-200 dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 shadow-sm'
            : isCompleted
            ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white border-4 border-emerald-300 dark:border-emerald-500 shadow-lg shadow-emerald-500/30'
            : isCurrent
            ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-white border-4 border-amber-200 ring-4 ring-amber-400/60 ring-offset-2 animate-pulse shadow-lg shadow-amber-500/40'
            : 'bg-gradient-to-b from-sky-400 to-sky-600 text-white border-4 border-sky-200 dark:border-sky-400 shadow-md shadow-sky-500/25'
        }`}
      >
        {/* Boss Crown Badge */}
        {isBoss && (
          <div
            data-testid="node-boss-crown"
            className="absolute -top-3 sm:-top-4 bg-amber-400 text-amber-950 p-1 sm:p-1.5 rounded-full shadow-md border-2 border-white dark:border-slate-900 animate-bounce motion-reduce:animate-none z-10"
            title="Thử thách Trùm (Boss Checkpoint)"
          >
            <Crown className="size-4 sm:size-5 fill-amber-950" />
          </div>
        )}

        {/* Center Icon */}
        {!isUnlocked ? (
          <Lock data-testid="node-locked-icon" className="size-6 sm:size-8" />
        ) : isCompleted ? (
          <Check className="size-8 sm:size-10 stroke-[3]" />
        ) : (
          <Play className="size-6 sm:size-8 fill-current ml-0.5 sm:ml-1" />
        )}

        {/* Node Order Badge */}
        {!isBoss && (
          <span className="absolute -bottom-1 -right-1 bg-slate-900/90 text-white text-xs font-black size-5 sm:size-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-xs">
            {node.order}
          </span>
        )}
      </div>

      {/* Stars Display */}
      {isCompleted && stars > 0 && (
        <div
          data-testid={`node-stars-${stars}`}
          className="flex items-center gap-0.5 mt-2 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 shadow-xs"
        >
          {[1, 2, 3].map((starIndex) => (
            <Star
              key={starIndex}
              className={`size-3.5 sm:size-4 ${
                starIndex <= stars
                  ? 'text-amber-500 fill-amber-400'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          ))}
        </div>
      )}

      {/* Node Title */}
      <span className="mt-1.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 text-center max-w-[120px] sm:max-w-[150px] leading-tight group-hover:text-primary transition-colors">
        {node.titleVi}
      </span>
    </div>
  );
}

export default RoadmapNodeComponent;
