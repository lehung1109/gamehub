import type {
  RoadmapNode,
  RoadmapWorld,
  RoadmapProgressState,
  StudentNodeProgress,
} from '@/types/roadmap';

export function calculateNodeStars(score: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  const percentage = Math.floor((score / totalQuestions) * 100);
  if (percentage >= 100) return 3;
  if (percentage >= 80) return 2;
  if (percentage >= 60) return 1;
  return 0;
}

export function isNodeUnlocked(
  node: RoadmapNode,
  progressState: RoadmapProgressState
): boolean {
  if (!node.prerequisites || node.prerequisites.length === 0) {
    return true;
  }
  return node.prerequisites.every((prereqId) => {
    const prereq = progressState.nodesProgress[prereqId];
    return Boolean(prereq && prereq.isCompleted && prereq.stars >= 1);
  });
}

export function isWorldUnlocked(
  world: RoadmapWorld,
  worlds: RoadmapWorld[],
  progressState: RoadmapProgressState
): boolean {
  if (world.order === 1) return true;
  if (progressState.totalStars < world.minStarsToUnlock) return false;

  const previousWorld = worlds.find((w) => w.order === world.order - 1);
  if (!previousWorld) return true;

  const bossNode = previousWorld.nodes.find((n) => n.isBossCheckpoint);
  if (!bossNode) return true;

  const bossProgress = progressState.nodesProgress[bossNode.id];
  return Boolean(bossProgress && bossProgress.isCompleted && bossProgress.stars >= 2);
}

export function mergeNodeProgress(
  current: StudentNodeProgress | undefined,
  newScore: number,
  totalQuestions: number,
  nodeId: string,
  worldId: string,
  completedAtOverride?: string
): StudentNodeProgress {
  const percentage =
    totalQuestions > 0 ? Math.floor((newScore / totalQuestions) * 100) : 0;
  const newStars = calculateNodeStars(newScore, totalQuestions);
  const now = completedAtOverride || new Date().toISOString();

  if (!current) {
    return {
      nodeId,
      worldId,
      stars: newStars,
      highScore: percentage,
      attempts: 1,
      isCompleted: newStars >= 1,
      completedAt: newStars >= 1 ? now : undefined,
    };
  }

  const isNowCompleted = current.isCompleted || newStars >= 1;
  return {
    ...current,
    stars: Math.max(current.stars, newStars),
    highScore: Math.max(current.highScore, percentage),
    attempts: current.attempts + 1,
    isCompleted: isNowCompleted,
    completedAt: current.completedAt || (newStars >= 1 ? now : undefined),
  };
}
