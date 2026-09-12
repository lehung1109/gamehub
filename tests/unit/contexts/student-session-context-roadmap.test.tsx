import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StudentSessionProvider, useStudentSession } from '@/contexts/StudentSessionContext';
import * as roadmapActions from '@/app/actions/roadmap';
import {
  saveStoredRoadmapProgress,
  getStoredRoadmapProgress,
} from '@/lib/roadmap-storage';

vi.mock('@/app/actions/student-gamification', () => ({
  getStudentGamificationProfile: vi.fn(),
  syncStudentGamificationState: vi.fn(),
  purchaseShopItemAction: vi.fn(),
  equipShopItemAction: vi.fn(),
  claimQuestRewardAction: vi.fn(),
}));

vi.mock('@/app/actions/roadmap', () => ({
  getStudentRoadmapProgressAction: vi.fn(),
  recordRoadmapNodeCompletionAction: vi.fn(),
  syncLocalRoadmapProgressAction: vi.fn(),
  getClassRoadmapOverviewAction: vi.fn(),
}));

describe('StudentSessionContext Roadmap Progress Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <StudentSessionProvider>{children}</StudentSessionProvider>
  );

  it('exposes initial roadmapState and roadmap methods', () => {
    const { result } = renderHook(() => useStudentSession(), { wrapper });

    expect(result.current.roadmapState).toBeDefined();
    expect(result.current.roadmapState.totalStars).toBe(0);
    expect(result.current.roadmapState.completedNodeIds).toEqual([]);
    expect(typeof result.current.refreshRoadmapProgress).toBe('function');
    expect(typeof result.current.recordRoadmapCompletion).toBe('function');
    expect(typeof result.current.recordNodeCompletion).toBe('function');
  });

  it('hydrates roadmapState from localStorage on mount (0ms delay)', () => {
    saveStoredRoadmapProgress({
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
    });

    const { result } = renderHook(() => useStudentSession(), { wrapper });

    expect(result.current.roadmapState.totalStars).toBe(3);
    expect(result.current.roadmapState.completedNodeIds).toContain('w1-n1');
  });

  it('syncs local progress to cloud and loads cloud progress when joinClass is called', async () => {
    saveStoredRoadmapProgress({
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
    });

    vi.mocked(roadmapActions.syncLocalRoadmapProgressAction).mockResolvedValue({
      success: true,
      syncedCount: 1,
    });

    vi.mocked(roadmapActions.getStudentRoadmapProgressAction).mockResolvedValue({
      success: true,
      data: {
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
          },
          'w1-n2': {
            nodeId: 'w1-n2',
            worldId: 'world-1',
            stars: 2,
            highScore: 80,
            attempts: 1,
            isCompleted: true,
          },
        },
      },
    });

    const { result } = renderHook(() => useStudentSession(), { wrapper });

    await act(async () => {
      result.current.joinClass({
        classCode: 'ROAD_1',
        studentName: 'Bé Lan',
      });
    });

    await waitFor(() => {
      expect(roadmapActions.syncLocalRoadmapProgressAction).toHaveBeenCalledWith(
        'ROAD_1',
        'Bé Lan',
        expect.objectContaining({ 'w1-n1': expect.anything() })
      );
      expect(roadmapActions.getStudentRoadmapProgressAction).toHaveBeenCalledWith(
        'ROAD_1',
        'Bé Lan'
      );
      expect(result.current.roadmapState.totalStars).toBe(5);
      expect(result.current.roadmapState.completedNodeIds).toEqual(['w1-n1', 'w1-n2']);
    });
  });

  it('records completion locally and syncs to cloud when in active session', async () => {
    vi.mocked(roadmapActions.getStudentRoadmapProgressAction).mockResolvedValue({
      success: true,
      data: {
        totalStars: 0,
        completedNodeIds: [],
        nodesProgress: {},
      },
    });

    vi.mocked(roadmapActions.recordRoadmapNodeCompletionAction).mockResolvedValue({
      success: true,
      stars: 3,
      updatedNode: {
        nodeId: 'w1-n1',
        worldId: 'world-1',
        stars: 3,
        highScore: 100,
        attempts: 1,
        isCompleted: true,
      },
    });

    const { result } = renderHook(() => useStudentSession(), { wrapper });

    await act(async () => {
      result.current.joinClass({
        classCode: 'ROAD_2',
        studentName: 'Bé Nam',
      });
    });

    let completionResult: { success: boolean; stars: number } | undefined;
    await act(async () => {
      completionResult = await result.current.recordRoadmapCompletion('w1-n1', 'world-1', 10, 10);
    });

    expect(completionResult?.success).toBe(true);
    expect(completionResult?.stars).toBe(3);
    expect(result.current.roadmapState.totalStars).toBe(3);
    expect(result.current.roadmapState.completedNodeIds).toContain('w1-n1');
    expect(roadmapActions.recordRoadmapNodeCompletionAction).toHaveBeenCalledWith(
      'ROAD_2',
      'Bé Nam',
      {
        nodeId: 'w1-n1',
        worldId: 'world-1',
        score: 10,
        totalQuestions: 10,
      }
    );
  });

  it('records completion locally in anonymous mode without invoking server actions', async () => {
    const { result } = renderHook(() => useStudentSession(), { wrapper });

    act(() => {
      result.current.skip();
    });

    expect(result.current.isAnonymous).toBe(true);

    let completionResult: { success: boolean; stars: number } | undefined;
    await act(async () => {
      completionResult = await result.current.recordRoadmapCompletion('w1-n1', 'world-1', 10, 10);
    });

    expect(completionResult?.success).toBe(true);
    expect(completionResult?.stars).toBe(3);
    expect(result.current.roadmapState.totalStars).toBe(3);
    expect(result.current.roadmapState.completedNodeIds).toContain('w1-n1');

    // Verify no server actions called
    expect(roadmapActions.recordRoadmapNodeCompletionAction).not.toHaveBeenCalled();

    // Verify stored in localStorage
    const stored = getStoredRoadmapProgress();
    expect(stored.totalStars).toBe(3);
    expect(stored.completedNodeIds).toContain('w1-n1');
  });

  it('falls back to local storage when server action throws network error', async () => {
    vi.mocked(roadmapActions.getStudentRoadmapProgressAction).mockResolvedValue({
      success: true,
      data: {
        totalStars: 0,
        completedNodeIds: [],
        nodesProgress: {},
      },
    });

    vi.mocked(roadmapActions.recordRoadmapNodeCompletionAction).mockRejectedValue(
      new Error('Network error (offline)')
    );

    const { result } = renderHook(() => useStudentSession(), { wrapper });

    await act(async () => {
      result.current.joinClass({
        classCode: 'OFFLINE_CLASS',
        studentName: 'Bé Khoa',
      });
    });

    let completionResult: { success: boolean; stars: number } | undefined;
    await act(async () => {
      completionResult = await result.current.recordRoadmapCompletion('w1-n1', 'world-1', 8, 10);
    });

    // Still returns success and locally calculated stars
    expect(completionResult?.success).toBe(true);
    expect(completionResult?.stars).toBe(2);
    expect(result.current.roadmapState.totalStars).toBe(2);
    expect(result.current.roadmapState.completedNodeIds).toContain('w1-n1');

    const stored = getStoredRoadmapProgress();
    expect(stored.totalStars).toBe(2);
    expect(stored.completedNodeIds).toContain('w1-n1');
  });
});
