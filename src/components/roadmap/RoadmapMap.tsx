'use client';

import React from 'react';
import type { RoadmapWorld, RoadmapNode, RoadmapProgressState } from '@/types/roadmap';
import { isNodeUnlocked } from '@/lib/roadmap';
import { RoadmapNodeComponent } from './RoadmapNode';

export interface RoadmapMapProps {
  world: RoadmapWorld;
  progressState: RoadmapProgressState;
  onSelectNode: (node: RoadmapNode) => void;
  isWorldUnlocked?: boolean;
  className?: string;
}

export function RoadmapMap({
  world,
  progressState,
  onSelectNode,
  isWorldUnlocked: isWorldUnlockedProp = true,
  className = '',
}: RoadmapMapProps) {
  const nodes = world.nodes;
  const rowHeight = 140;
  const topPadding = 60;
  const totalHeight = nodes.length * rowHeight + topPadding;
  const isWorldOpen = isWorldUnlockedProp;

  // Determine current active node (first incomplete unlocked node, or last unlocked)
  const unlockedNodes = isWorldOpen
    ? nodes.filter((node) => isNodeUnlocked(node, progressState))
    : [];
  const currentActiveNode =
    unlockedNodes.find((node) => {
      const p = progressState.nodesProgress[node.id];
      return !p || !p.isCompleted;
    }) || (unlockedNodes.length > 0 ? unlockedNodes[unlockedNodes.length - 1] : undefined);

  // S-Curve horizontal percentage offsets (alternating center -> right -> center -> left -> center)
  const getXPercent = (index: number, isBoss: boolean): number => {
    if (isBoss) return 50;
    const pattern = [50, 72, 50, 28];
    return pattern[index % pattern.length];
  };

  const nodePositions = nodes.map((node, index) => ({
    node,
    x: getXPercent(index, node.isBossCheckpoint),
    y: index * rowHeight + topPadding,
    isUnlocked: isWorldOpen && isNodeUnlocked(node, progressState),
    isCurrent: Boolean(currentActiveNode && node.id === currentActiveNode.id),
    progress: progressState.nodesProgress[node.id],
  }));

  return (
    <div
      className={`relative w-full max-w-xl mx-auto py-6 px-4 select-none ${className}`}
      style={{ minHeight: `${totalHeight}px` }}
    >
      {/* SVG S-Curve Path connecting nodes */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 100 ${totalHeight}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {nodePositions.slice(0, -1).map((current, i) => {
          const next = nodePositions[i + 1];
          const midY = (current.y + next.y) / 2;
          const d = `M ${current.x} ${current.y} C ${current.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
          const isPathActive = next.isUnlocked;

          return (
            <g key={`path-${current.node.id}-${next.node.id}`}>
              {/* Outer shadow / track line */}
              <path
                d={d}
                fill="none"
                stroke="currentColor"
                strokeWidth={10}
                vectorEffect="non-scaling-stroke"
                className="text-slate-200 dark:text-slate-800/80"
                strokeLinecap="round"
              />
              {/* Inner connector path (active colored or locked dashed) */}
              <path
                d={d}
                fill="none"
                stroke={isPathActive ? '#10b981' : '#94a3b8'}
                strokeWidth={5}
                strokeDasharray={isPathActive ? 'none' : '8 8'}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                className="transition-colors duration-300"
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes placed on top of SVG */}
      <div className="relative w-full h-full">
        {nodePositions.map(({ node, x, y, isUnlocked, isCurrent, progress }) => (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${x}%`,
              top: `${y}px`,
            }}
          >
            <RoadmapNodeComponent
              node={node}
              progress={progress}
              isUnlocked={isUnlocked}
              isCurrent={isCurrent}
              onSelect={onSelectNode}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoadmapMap;
