import type { RoadmapProgressState, StudentNodeProgress } from '@/types/roadmap';
import { calculateNodeStars, mergeNodeProgress } from '@/lib/roadmap';

export const ROADMAP_STORAGE_KEY = 'gamehub_roadmap_progress';

function getDefaultRoadmapState(): RoadmapProgressState {
  return {
    totalStars: 0,
    completedNodeIds: [],
    nodesProgress: {},
  };
}

export function getStoredRoadmapProgress(): RoadmapProgressState {
  if (typeof window === 'undefined') {
    return getDefaultRoadmapState();
  }

  try {
    const raw = window.localStorage.getItem(ROADMAP_STORAGE_KEY);
    if (!raw) {
      return getDefaultRoadmapState();
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return getDefaultRoadmapState();
    }

    const nodesProgress: Record<string, StudentNodeProgress> =
      parsed.nodesProgress && typeof parsed.nodesProgress === 'object' && !Array.isArray(parsed.nodesProgress)
        ? parsed.nodesProgress
        : {};

    const nodeEntries = Object.values(nodesProgress).filter(
      (n): n is StudentNodeProgress =>
        Boolean(n && typeof n === 'object' && typeof n.nodeId === 'string' && typeof n.stars === 'number')
    );

    const totalStars =
      typeof parsed.totalStars === 'number'
        ? parsed.totalStars
        : nodeEntries.reduce((sum, n) => sum + (n.stars || 0), 0);

    const completedNodeIds: string[] = Array.isArray(parsed.completedNodeIds)
      ? parsed.completedNodeIds
      : nodeEntries.filter((n) => n.isCompleted).map((n) => n.nodeId);

    return {
      totalStars,
      completedNodeIds,
      nodesProgress,
    };
  } catch {
    return getDefaultRoadmapState();
  }
}

export function saveStoredRoadmapProgress(state: RoadmapProgressState): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[roadmap-storage] Failed to save roadmap progress:', err);
  }
}

export function recordLocalNodeCompletion(
  nodeId: string,
  worldId: string,
  score: number,
  totalQuestions: number
): { state: RoadmapProgressState; stars: number } {
  const current = getStoredRoadmapProgress();
  const existing = current.nodesProgress[nodeId];

  const updatedNode = mergeNodeProgress(existing, score, totalQuestions, nodeId, worldId);
  const updatedNodesProgress: Record<string, StudentNodeProgress> = {
    ...current.nodesProgress,
    [nodeId]: updatedNode,
  };

  const totalStars = Object.values(updatedNodesProgress).reduce(
    (sum, n) => sum + (n.stars || 0),
    0
  );

  const completedNodeIds = Object.values(updatedNodesProgress)
    .filter((n) => n.isCompleted)
    .map((n) => n.nodeId);

  const newState: RoadmapProgressState = {
    totalStars,
    completedNodeIds,
    nodesProgress: updatedNodesProgress,
  };

  saveStoredRoadmapProgress(newState);

  const attemptStars = calculateNodeStars(score, totalQuestions);
  return {
    state: newState,
    stars: attemptStars,
  };
}

export function clearStoredRoadmapProgress(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(ROADMAP_STORAGE_KEY);
  } catch (err) {
    console.warn('[roadmap-storage] Failed to clear roadmap progress:', err);
  }
}
