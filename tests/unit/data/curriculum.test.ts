import { describe, it, expect } from 'vitest';
import worldsData from '@/data/curriculum/worlds.json';
import type { RoadmapWorld } from '@/types/roadmap';

describe('Curriculum Roadmap Dataset', () => {
  const worlds = worldsData as RoadmapWorld[];

  it('contains exactly 4 CEFR-aligned worlds in ascending order', () => {
    expect(worlds).toHaveLength(4);
    expect(worlds.map((w) => w.id)).toEqual(['world-1', 'world-2', 'world-3', 'world-4']);
    expect(worlds[0].levelBadge).toBe('Pre-A1');
    expect(worlds[1].levelBadge).toBe('A1');
    expect(worlds[2].levelBadge).toBe('A2');
    expect(worlds[3].levelBadge).toBe('B1-B2');
  });

  it('ensures each world has at least 5 nodes with valid gameRoutes and unique IDs', () => {
    const allNodeIds = new Set<string>();
    worlds.forEach((world) => {
      expect(world.nodes.length).toBeGreaterThanOrEqual(5);
      const lastNode = world.nodes[world.nodes.length - 1];
      expect(lastNode.isBossCheckpoint).toBe(true);

      world.nodes.forEach((node) => {
        expect(allNodeIds.has(node.id)).toBe(false);
        allNodeIds.add(node.id);
        expect(node.worldId).toBe(world.id);
        expect(node.gameRoute.startsWith('/')).toBe(true);
        expect(node.targetScore).toBeGreaterThanOrEqual(50);
      });
    });
  });

  it('ensures the first node of world-1 has empty prerequisites', () => {
    expect(worlds[0].nodes[0].prerequisites).toEqual([]);
  });

  it('ensures every node has required fields and valid schema properties', () => {
    worlds.forEach((world) => {
      expect(world.id).toBeTruthy();
      expect(world.order).toBeGreaterThan(0);
      expect(world.titleVi).toBeTruthy();
      expect(world.titleEn).toBeTruthy();
      expect(world.themeColor).toBeTruthy();
      expect(world.icon).toBeTruthy();
      expect(typeof world.minStarsToUnlock).toBe('number');

      world.nodes.forEach((node) => {
        expect(node.id).toBeTruthy();
        expect(node.order).toBeGreaterThan(0);
        expect(node.titleVi).toBeTruthy();
        expect(node.titleEn).toBeTruthy();
        expect(node.descriptionVi).toBeDefined();
        expect(node.descriptionEn).toBeDefined();
        expect(node.gameType).toBeTruthy();
        expect(node.gameRoute).toBeTruthy();
        expect(node.gameParams).toBeDefined();
        expect(typeof node.targetScore).toBe('number');
        expect(typeof node.xpReward).toBe('number');
        expect(typeof node.bonusStars).toBe('number');
        expect(typeof node.isBossCheckpoint).toBe('boolean');
        expect(Array.isArray(node.prerequisites)).toBe(true);
      });
    });
  });

  it('ensures prerequisite references point to existing nodes within the dataset', () => {
    const allNodeIds = new Set(worlds.flatMap((w) => w.nodes.map((n) => n.id)));
    worlds.forEach((world) => {
      world.nodes.forEach((node) => {
        node.prerequisites.forEach((prereqId) => {
          expect(allNodeIds.has(prereqId)).toBe(true);
        });
      });
    });
  });
});
