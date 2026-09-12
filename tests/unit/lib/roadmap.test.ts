import { describe, it, expect } from 'vitest';
import {
  calculateNodeStars,
  isNodeUnlocked,
  isWorldUnlocked,
  mergeNodeProgress,
} from '@/lib/roadmap';
import type { RoadmapNode, RoadmapWorld, RoadmapProgressState } from '@/types/roadmap';

describe('Roadmap Domain Engine', () => {
  describe('calculateNodeStars', () => {
    it('returns 0 stars for score under 60%', () => {
      expect(calculateNodeStars(5, 10)).toBe(0);
      expect(calculateNodeStars(59, 100)).toBe(0);
      expect(calculateNodeStars(0, 10)).toBe(0);
    });

    it('returns 1 star for score between 60% and 79%', () => {
      expect(calculateNodeStars(6, 10)).toBe(1);
      expect(calculateNodeStars(79, 100)).toBe(1);
      expect(calculateNodeStars(60, 100)).toBe(1);
    });

    it('returns 2 stars for score between 80% and 99%', () => {
      expect(calculateNodeStars(8, 10)).toBe(2);
      expect(calculateNodeStars(99, 100)).toBe(2);
      expect(calculateNodeStars(80, 100)).toBe(2);
    });

    it('returns 3 stars for 100% score', () => {
      expect(calculateNodeStars(10, 10)).toBe(3);
      expect(calculateNodeStars(100, 100)).toBe(3);
    });

    it('handles edge case of 0 or negative total questions safely', () => {
      expect(calculateNodeStars(0, 0)).toBe(0);
      expect(calculateNodeStars(5, 0)).toBe(0);
      expect(calculateNodeStars(5, -1)).toBe(0);
    });
  });

  describe('isNodeUnlocked', () => {
    const mockNode: RoadmapNode = {
      id: 'w1-n2',
      worldId: 'world-1',
      order: 2,
      titleVi: 'Số 1-10',
      titleEn: 'Numbers 1-10',
      descriptionVi: '',
      descriptionEn: '',
      gameType: 'numbers-colors',
      gameRoute: '/games/numbers-colors',
      gameParams: {},
      targetScore: 60,
      xpReward: 50,
      bonusStars: 5,
      isBossCheckpoint: false,
      prerequisites: ['w1-n1'],
    };

    it('returns false when prerequisite node is not completed', () => {
      const state: RoadmapProgressState = {
        totalStars: 0,
        completedNodeIds: [],
        nodesProgress: {},
      };
      expect(isNodeUnlocked(mockNode, state)).toBe(false);
    });

    it('returns false when prerequisite node has progress but 0 stars / not completed', () => {
      const state: RoadmapProgressState = {
        totalStars: 0,
        completedNodeIds: [],
        nodesProgress: {
          'w1-n1': {
            nodeId: 'w1-n1',
            worldId: 'world-1',
            stars: 0,
            highScore: 50,
            attempts: 1,
            isCompleted: false,
          },
        },
      };
      expect(isNodeUnlocked(mockNode, state)).toBe(false);
    });

    it('returns true when prerequisite node is completed with >= 1 star', () => {
      const state: RoadmapProgressState = {
        totalStars: 1,
        completedNodeIds: ['w1-n1'],
        nodesProgress: {
          'w1-n1': {
            nodeId: 'w1-n1',
            worldId: 'world-1',
            stars: 1,
            highScore: 70,
            attempts: 1,
            isCompleted: true,
          },
        },
      };
      expect(isNodeUnlocked(mockNode, state)).toBe(true);
    });

    it('always unlocks nodes with empty prerequisites', () => {
      const rootNode = { ...mockNode, id: 'w1-n1', prerequisites: [] };
      const emptyState: RoadmapProgressState = {
        totalStars: 0,
        completedNodeIds: [],
        nodesProgress: {},
      };
      expect(isNodeUnlocked(rootNode, emptyState)).toBe(true);
    });

    it('requires all prerequisites to be completed when multiple exist', () => {
      const multiPrereqNode: RoadmapNode = {
        ...mockNode,
        id: 'w1-n3',
        prerequisites: ['w1-n1', 'w1-n2'],
      };

      const partialState: RoadmapProgressState = {
        totalStars: 3,
        completedNodeIds: ['w1-n1'],
        nodesProgress: {
          'w1-n1': {
            nodeId: 'w1-n1',
            worldId: 'world-1',
            stars: 3,
            highScore: 100,
            attempts: 1,
            isCompleted: true,
          },
        },
      };
      expect(isNodeUnlocked(multiPrereqNode, partialState)).toBe(false);

      const fullState: RoadmapProgressState = {
        ...partialState,
        completedNodeIds: ['w1-n1', 'w1-n2'],
        nodesProgress: {
          ...partialState.nodesProgress,
          'w1-n2': {
            nodeId: 'w1-n2',
            worldId: 'world-1',
            stars: 2,
            highScore: 80,
            attempts: 1,
            isCompleted: true,
          },
        },
      };
      expect(isNodeUnlocked(multiPrereqNode, fullState)).toBe(true);
    });
  });

  describe('isWorldUnlocked', () => {
    const world1Nodes: RoadmapNode[] = [
      {
        id: 'w1-n1',
        worldId: 'world-1',
        order: 1,
        titleVi: 'Node 1',
        titleEn: 'Node 1',
        descriptionVi: '',
        descriptionEn: '',
        gameType: 'flashcard',
        gameRoute: '/games/flashcard',
        gameParams: {},
        targetScore: 60,
        xpReward: 50,
        bonusStars: 5,
        isBossCheckpoint: false,
        prerequisites: [],
      },
      {
        id: 'w1-boss',
        worldId: 'world-1',
        order: 2,
        titleVi: 'Boss 1',
        titleEn: 'Boss 1',
        descriptionVi: '',
        descriptionEn: '',
        gameType: 'flashcard',
        gameRoute: '/games/flashcard',
        gameParams: {},
        targetScore: 60,
        xpReward: 100,
        bonusStars: 10,
        isBossCheckpoint: true,
        prerequisites: ['w1-n1'],
      },
    ];

    const world1: RoadmapWorld = {
      id: 'world-1',
      order: 1,
      titleVi: 'Thế giới 1',
      titleEn: 'World 1',
      levelBadge: 'Starter',
      description: 'First world',
      themeColor: 'emerald',
      icon: 'sparkles',
      minStarsToUnlock: 0,
      nodes: world1Nodes,
    };

    const world2: RoadmapWorld = {
      id: 'world-2',
      order: 2,
      titleVi: 'Thế giới 2',
      titleEn: 'World 2',
      levelBadge: 'Explorer',
      description: 'Second world',
      themeColor: 'sky',
      icon: 'compass',
      minStarsToUnlock: 12,
      nodes: [],
    };

    const worlds = [world1, world2];

    it('always unlocks world order 1 regardless of stars', () => {
      const emptyState: RoadmapProgressState = {
        totalStars: 0,
        completedNodeIds: [],
        nodesProgress: {},
      };
      expect(isWorldUnlocked(world1, worlds, emptyState)).toBe(true);
    });

    it('locks world 2 if total stars < minStarsToUnlock', () => {
      const state: RoadmapProgressState = {
        totalStars: 11, // min is 12
        completedNodeIds: ['w1-boss'],
        nodesProgress: {
          'w1-boss': {
            nodeId: 'w1-boss',
            worldId: 'world-1',
            stars: 3,
            highScore: 100,
            attempts: 1,
            isCompleted: true,
          },
        },
      };
      expect(isWorldUnlocked(world2, worlds, state)).toBe(false);
    });

    it('locks world 2 if previous world boss checkpoint has fewer than 2 stars', () => {
      const state: RoadmapProgressState = {
        totalStars: 15,
        completedNodeIds: ['w1-boss'],
        nodesProgress: {
          'w1-boss': {
            nodeId: 'w1-boss',
            worldId: 'world-1',
            stars: 1, // < 2 stars
            highScore: 65,
            attempts: 1,
            isCompleted: true,
          },
        },
      };
      expect(isWorldUnlocked(world2, worlds, state)).toBe(false);
    });

    it('locks world 2 if previous world boss checkpoint has not been completed', () => {
      const state: RoadmapProgressState = {
        totalStars: 20,
        completedNodeIds: [],
        nodesProgress: {},
      };
      expect(isWorldUnlocked(world2, worlds, state)).toBe(false);
    });

    it('unlocks world 2 when totalStars >= minStarsToUnlock and boss has >= 2 stars', () => {
      const state: RoadmapProgressState = {
        totalStars: 12,
        completedNodeIds: ['w1-boss'],
        nodesProgress: {
          'w1-boss': {
            nodeId: 'w1-boss',
            worldId: 'world-1',
            stars: 2,
            highScore: 85,
            attempts: 1,
            isCompleted: true,
          },
        },
      };
      expect(isWorldUnlocked(world2, worlds, state)).toBe(true);
    });
  });

  describe('mergeNodeProgress', () => {
    it('initializes new progress correctly on first pass with pass score', () => {
      const progress = mergeNodeProgress(undefined, 8, 10, 'w1-n1', 'world-1');
      expect(progress.stars).toBe(2);
      expect(progress.highScore).toBe(80);
      expect(progress.attempts).toBe(1);
      expect(progress.isCompleted).toBe(true);
      expect(progress.completedAt).toBeDefined();
    });

    it('initializes new progress correctly on first pass with failing score', () => {
      const progress = mergeNodeProgress(undefined, 4, 10, 'w1-n1', 'world-1');
      expect(progress.stars).toBe(0);
      expect(progress.highScore).toBe(40);
      expect(progress.attempts).toBe(1);
      expect(progress.isCompleted).toBe(false);
      expect(progress.completedAt).toBeUndefined();
    });

    it('preserves higher stars and highScore when replaying with lower score', () => {
      const initial = mergeNodeProgress(undefined, 10, 10, 'w1-n1', 'world-1');
      expect(initial.stars).toBe(3);
      expect(initial.completedAt).toBeDefined();
      const originalCompletedAt = initial.completedAt;

      const replay = mergeNodeProgress(initial, 6, 10, 'w1-n1', 'world-1');
      expect(replay.stars).toBe(3); // Does NOT regress to 1
      expect(replay.highScore).toBe(100); // Does NOT regress to 60
      expect(replay.attempts).toBe(2);
      expect(replay.isCompleted).toBe(true);
      expect(replay.completedAt).toBe(originalCompletedAt);
    });

    it('updates stars and highScore when replaying with higher score', () => {
      const initial = mergeNodeProgress(undefined, 6, 10, 'w1-n1', 'world-1');
      expect(initial.stars).toBe(1);
      expect(initial.highScore).toBe(60);

      const replay = mergeNodeProgress(initial, 9, 10, 'w1-n1', 'world-1');
      expect(replay.stars).toBe(2);
      expect(replay.highScore).toBe(90);
      expect(replay.attempts).toBe(2);
      expect(replay.isCompleted).toBe(true);
    });

    it('sets isCompleted to true on replay if initially failed but now passed', () => {
      const initial = mergeNodeProgress(undefined, 3, 10, 'w1-n1', 'world-1');
      expect(initial.isCompleted).toBe(false);
      expect(initial.completedAt).toBeUndefined();

      const replay = mergeNodeProgress(initial, 7, 10, 'w1-n1', 'world-1');
      expect(replay.isCompleted).toBe(true);
      expect(replay.stars).toBe(1);
      expect(replay.completedAt).toBeDefined();
      expect(replay.attempts).toBe(2);
    });

    it('uses completedAtOverride when provided', () => {
      const customIsoDate = '2026-09-12T12:00:00.000Z';
      const progress = mergeNodeProgress(undefined, 8, 10, 'w1-n1', 'world-1', customIsoDate);
      expect(progress.completedAt).toBe(customIsoDate);
    });
  });
});
