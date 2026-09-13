import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStoredRoadmapProgress,
  saveStoredRoadmapProgress,
  recordLocalNodeCompletion,
  clearStoredRoadmapProgress,
  ROADMAP_STORAGE_KEY,
} from '@/lib/roadmap-storage';
import type { RoadmapProgressState } from '@/types/roadmap';

describe('Roadmap LocalStorage Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default empty state when nothing is stored', () => {
    const state = getStoredRoadmapProgress();
    expect(state.totalStars).toBe(0);
    expect(state.completedNodeIds).toEqual([]);
    expect(state.nodesProgress).toEqual({});
  });

  it('returns default empty state when localStorage contains corrupted JSON', () => {
    localStorage.setItem(ROADMAP_STORAGE_KEY, '{invalid json');
    const state = getStoredRoadmapProgress();
    expect(state.totalStars).toBe(0);
    expect(state.completedNodeIds).toEqual([]);
    expect(state.nodesProgress).toEqual({});
  });

  it('saves and retrieves stored roadmap progress', () => {
    const customState: RoadmapProgressState = {
      totalStars: 5,
      completedNodeIds: ['w1-n1', 'w1-n2'],
      nodesProgress: {
        'w1-n1': {
          nodeId: 'w1-n1',
          worldId: 'world-1',
          stars: 3,
          highScore: 100,
          attempts: 1,
          isCompleted: true,
          completedAt: '2026-09-12T10:00:00.000Z',
        },
        'w1-n2': {
          nodeId: 'w1-n2',
          worldId: 'world-1',
          stars: 2,
          highScore: 80,
          attempts: 2,
          isCompleted: true,
          completedAt: '2026-09-12T10:30:00.000Z',
        },
      },
    };

    saveStoredRoadmapProgress(customState);
    const loaded = getStoredRoadmapProgress();
    expect(loaded.totalStars).toBe(5);
    expect(loaded.completedNodeIds).toEqual(['w1-n1', 'w1-n2']);
    expect(loaded.nodesProgress['w1-n1'].stars).toBe(3);
  });

  it('records local completion, updates total stars, and stores in localStorage', () => {
    const { state, stars } = recordLocalNodeCompletion('w1-n1', 'world-1', 10, 10);
    expect(stars).toBe(3);
    expect(state.totalStars).toBe(3);
    expect(state.completedNodeIds).toContain('w1-n1');
    expect(state.nodesProgress['w1-n1']).toBeDefined();
    expect(state.nodesProgress['w1-n1'].stars).toBe(3);
    expect(state.nodesProgress['w1-n1'].highScore).toBe(100);
    expect(state.nodesProgress['w1-n1'].isCompleted).toBe(true);

    const loaded = getStoredRoadmapProgress();
    expect(loaded.totalStars).toBe(3);
    expect(loaded.completedNodeIds).toContain('w1-n1');
  });

  it('preserves highest score and stars on subsequent lower attempt (non-regression)', () => {
    recordLocalNodeCompletion('w1-n1', 'world-1', 10, 10); // 3 stars, 100%
    const { state, stars } = recordLocalNodeCompletion('w1-n1', 'world-1', 7, 10); // 1 star, 70%

    expect(stars).toBe(1); // attempt stars
    expect(state.nodesProgress['w1-n1'].stars).toBe(3); // preserved highest
    expect(state.nodesProgress['w1-n1'].highScore).toBe(100); // preserved highest
    expect(state.nodesProgress['w1-n1'].attempts).toBe(2);
    expect(state.nodesProgress['w1-n1'].isCompleted).toBe(true);
    expect(state.totalStars).toBe(3);
  });

  it('does not mark node as completed when score is 0 stars (<60%)', () => {
    const { state, stars } = recordLocalNodeCompletion('w1-n2', 'world-1', 5, 10); // 50% = 0 stars
    expect(stars).toBe(0);
    expect(state.totalStars).toBe(0);
    expect(state.completedNodeIds).not.toContain('w1-n2');
    expect(state.nodesProgress['w1-n2'].isCompleted).toBe(false);
    expect(state.nodesProgress['w1-n2'].attempts).toBe(1);
  });

  it('accumulates stars across multiple nodes correctly', () => {
    recordLocalNodeCompletion('w1-n1', 'world-1', 10, 10); // 3 stars
    recordLocalNodeCompletion('w1-n2', 'world-1', 8, 10);  // 2 stars
    const { state } = recordLocalNodeCompletion('w1-n3', 'world-1', 6, 10); // 1 star

    expect(state.totalStars).toBe(6);
    expect(state.completedNodeIds).toEqual(expect.arrayContaining(['w1-n1', 'w1-n2', 'w1-n3']));
    expect(state.completedNodeIds.length).toBe(3);
  });

  it('clears stored roadmap progress', () => {
    recordLocalNodeCompletion('w1-n1', 'world-1', 10, 10);
    expect(getStoredRoadmapProgress().totalStars).toBe(3);

    clearStoredRoadmapProgress();
    const state = getStoredRoadmapProgress();
    expect(state.totalStars).toBe(0);
    expect(state.completedNodeIds).toEqual([]);
    expect(state.nodesProgress).toEqual({});
  });

  it('safely handles localStorage errors without throwing', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });

    expect(() => {
      saveStoredRoadmapProgress({
        totalStars: 1,
        completedNodeIds: ['w1-n1'],
        nodesProgress: {},
      });
    }).not.toThrow();

    setItemSpy.mockRestore();
  });
});
