export interface RoadmapNode {
  id: string;
  worldId: string;
  order: number;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  gameType: string;
  gameRoute: string;
  gameParams: Record<string, unknown>;
  targetScore: number;
  xpReward: number;
  bonusStars: number;
  isBossCheckpoint: boolean;
  prerequisites: string[];
}

export interface RoadmapWorld {
  id: string;
  order: number;
  titleVi: string;
  titleEn: string;
  levelBadge: string;
  description: string;
  themeColor: string;
  icon: string;
  minStarsToUnlock: number;
  nodes: RoadmapNode[];
}

export interface StudentNodeProgress {
  nodeId: string;
  worldId: string;
  stars: number;
  highScore: number;
  attempts: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface RoadmapProgressState {
  totalStars: number;
  completedNodeIds: string[];
  nodesProgress: Record<string, StudentNodeProgress>;
}
