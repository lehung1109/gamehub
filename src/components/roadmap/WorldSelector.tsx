'use client';

import React from 'react';
import { Lock, Star, Sparkles, Compass, BookOpen, Layers, Briefcase } from 'lucide-react';
import type { RoadmapWorld, RoadmapProgressState } from '@/types/roadmap';
import { isWorldUnlocked } from '@/lib/roadmap';

export interface WorldSelectorProps {
  worlds: RoadmapWorld[];
  selectedWorldId: string;
  onSelectWorld: (worldId: string) => void;
  progressState: RoadmapProgressState;
  className?: string;
}

const WORLD_ICONS: Record<string, React.ElementType> = {
  Compass,
  BookOpen,
  Layers,
  Briefcase,
};

export function WorldSelector({
  worlds,
  selectedWorldId,
  onSelectWorld,
  progressState,
  className = '',
}: WorldSelectorProps) {
  return (
    <div
      className={`w-full overflow-x-auto no-scrollbar py-2 ${className}`}
      role="tablist"
      aria-label="Chọn thế giới học tập"
    >
      <div className="flex items-center gap-3 min-w-max px-2 sm:px-0">
        {worlds.map((world) => {
          const isUnlocked = isWorldUnlocked(world, worlds, progressState);
          const isSelected = world.id === selectedWorldId;
          const IconComponent = WORLD_ICONS[world.icon] || Sparkles;

          // Compute stars earned in this world
          const worldStars = world.nodes.reduce(
            (sum, n) => sum + (progressState.nodesProgress[n.id]?.stars || 0),
            0
          );
          const maxWorldStars = world.nodes.length * 3;

          return (
            <button
              key={world.id}
              role="tab"
              type="button"
              aria-selected={isSelected}
              onClick={() => onSelectWorld(world.id)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isSelected
                  ? 'bg-card border-primary shadow-md scale-100 text-foreground'
                  : isUnlocked
                  ? 'bg-card/70 border-border/70 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground'
                  : 'bg-muted/40 border-dashed border-border/50 text-muted-foreground/60 hover:border-border'
              }`}
            >
              {/* World Icon or Lock */}
              <div
                className={`size-10 rounded-xl flex items-center justify-center font-black ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : isUnlocked
                    ? 'bg-muted text-foreground'
                    : 'bg-muted/80 text-muted-foreground'
                }`}
              >
                {!isUnlocked ? (
                  <Lock className="size-5" />
                ) : (
                  <IconComponent className="size-5" />
                )}
              </div>

              {/* Title & Level Info */}
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                    {world.levelBadge}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Thế giới {world.order}
                  </span>
                </div>
                <div className="text-sm font-extrabold line-clamp-1">{world.titleVi}</div>

                {/* Stars / Lock info */}
                <div className="flex items-center gap-1 mt-0.5 text-xs">
                  {!isUnlocked ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <Star className="size-3 fill-current" />
                      Cần {world.minStarsToUnlock} sao
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <Star className="size-3 text-amber-500 fill-amber-400" />
                      {worldStars}/{maxWorldStars} sao
                    </span>
                  )}
                </div>
              </div>

              {/* Selected Bottom Indicator */}
              {isSelected && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default WorldSelector;
