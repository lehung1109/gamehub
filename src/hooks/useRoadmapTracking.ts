'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import worldsData from '@/data/curriculum/worlds.json';
import type { RoadmapWorld, RoadmapNode } from '@/types/roadmap';
import { useStudentSession } from '@/contexts/StudentSessionContext';
import { calculateNodeStars } from '@/lib/roadmap';

export interface RoadmapTrackingResult {
  stars: number;
  isNewUnlock: boolean;
  nextNodeTitle?: string;
}

export interface UseRoadmapTrackingReturn {
  isRoadmapStage: boolean;
  node: RoadmapNode | null;
  recordStageCompletion: (
    score: number,
    totalQuestions: number
  ) => Promise<{ stars: number; isNewUnlock: boolean; nextNode?: RoadmapNode | null }>;
  status: 'idle' | 'recording' | 'completed';
  result: RoadmapTrackingResult | null;
}

export function useRoadmapTracking(): UseRoadmapTrackingReturn {
  const searchParams = useSearchParams();
  let nodeId = searchParams?.get('roadmapNode') || null;

  if (!nodeId && typeof window !== 'undefined' && window.location?.search) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      nodeId = urlParams.get('roadmapNode') || null;
    } catch {
      // ignore
    }
  }

  const worlds = worldsData as RoadmapWorld[];

  // Lookup node in curriculum
  const node = useMemo<RoadmapNode | null>(() => {
    if (!nodeId) return null;
    for (const world of worlds) {
      const found = world.nodes.find((n) => n.id === nodeId);
      if (found) return found;
    }
    return null;
  }, [nodeId, worlds]);

  const isRoadmapStage = Boolean(node);

  const { roadmapState, recordRoadmapCompletion } = useStudentSession();

  const [status, setStatus] = useState<'idle' | 'recording' | 'completed'>('idle');
  const [result, setResult] = useState<RoadmapTrackingResult | null>(null);

  const recordStageCompletion = useCallback(
    async (
      score: number,
      totalQuestions: number
    ): Promise<{ stars: number; isNewUnlock: boolean; nextNode?: RoadmapNode | null }> => {
      if (!node) {
        const stars = calculateNodeStars(score, totalQuestions);
        const fallbackRes = { stars, isNewUnlock: false, nextNode: null };
        setResult(fallbackRes);
        setStatus('completed');
        return fallbackRes;
      }

      setStatus('recording');

      try {
        const stars = calculateNodeStars(score, totalQuestions);

        // Check if node was already passed with at least 1 star before this attempt
        const previousProgress = roadmapState.nodesProgress[node.id];
        const wasPreviouslyCompleted = Boolean(
          previousProgress && previousProgress.isCompleted && previousProgress.stars >= 1
        );

        // Record stage completion locally and sync with cloud
        await recordRoadmapCompletion(node.id, node.worldId, score, totalQuestions);

        // An unlock is considered "new" if the stage was successfully passed for the first time
        const isNewUnlock = stars >= 1 && !wasPreviouslyCompleted;

        // Resolve next sequential node
        const currentWorld = worlds.find((w) => w.id === node.worldId);
        let nextNode: RoadmapNode | null = null;

        if (currentWorld) {
          const sortedWorldNodes = [...currentWorld.nodes].sort((a, b) => a.order - b.order);
          const nextInWorld = sortedWorldNodes.find((n) => n.order === node.order + 1);

          if (nextInWorld) {
            nextNode = nextInWorld;
          } else {
            // Check first node of the subsequent world
            const sortedWorlds = [...worlds].sort((a, b) => a.order - b.order);
            const nextWorld = sortedWorlds.find((w) => w.order === currentWorld.order + 1);
            if (nextWorld && nextWorld.nodes.length > 0) {
              const sortedNextWorldNodes = [...nextWorld.nodes].sort((a, b) => a.order - b.order);
              nextNode = sortedNextWorldNodes[0] || null;
            }
          }
        }

        const nextNodeTitle = nextNode?.titleVi;

        const trackResult: RoadmapTrackingResult = {
          stars,
          isNewUnlock,
          nextNodeTitle,
        };

        setResult(trackResult);
        setStatus('completed');

        return {
          stars,
          isNewUnlock,
          nextNode,
        };
      } catch (err) {
        console.error('[useRoadmapTracking] recordStageCompletion failed:', err);
        setStatus('idle');
        throw err;
      }
    },
    [node, worlds, roadmapState, recordRoadmapCompletion]
  );

  return {
    isRoadmapStage,
    node,
    recordStageCompletion,
    status,
    result,
  };
}
