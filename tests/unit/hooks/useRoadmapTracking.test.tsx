import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoadmapTracking } from '@/hooks/useRoadmapTracking';
import type { RoadmapNode } from '@/types/roadmap';

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

// Mock useStudentSession
const mockRecordRoadmapCompletion = vi.fn();
let mockRoadmapState = {
  totalStars: 0,
  completedNodeIds: [] as string[],
  nodesProgress: {} as Record<string, {
    nodeId: string;
    worldId: string;
    stars: number;
    highScore: number;
    attempts: number;
    isCompleted: boolean;
  }>,
};

vi.mock('@/contexts/StudentSessionContext', () => ({
  useStudentSession: () => ({
    roadmapState: mockRoadmapState,
    recordRoadmapCompletion: mockRecordRoadmapCompletion,
  }),
}));

interface StageCompletionResponse {
  stars: number;
  isNewUnlock: boolean;
  nextNode?: RoadmapNode | null;
}

describe('useRoadmapTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('roadmapNode');
    mockRoadmapState = {
      totalStars: 0,
      completedNodeIds: [],
      nodesProgress: {},
    };
    mockRecordRoadmapCompletion.mockResolvedValue({ success: true, stars: 3 });
  });

  it('returns isRoadmapStage = false when no roadmapNode query param is present', () => {
    const { result } = renderHook(() => useRoadmapTracking());
    expect(result.current.isRoadmapStage).toBe(false);
    expect(result.current.node).toBeNull();
    expect(result.current.status).toBe('idle');
    expect(result.current.result).toBeNull();
  });

  it('identifies valid node w1-n1 when roadmapNode query param is set', () => {
    mockSearchParams.set('roadmapNode', 'w1-n1');
    const { result } = renderHook(() => useRoadmapTracking());

    expect(result.current.isRoadmapStage).toBe(true);
    expect(result.current.node).not.toBeNull();
    expect(result.current.node?.id).toBe('w1-n1');
    expect(result.current.node?.titleVi).toBe('Chữ cái & Phonics');
  });

  it('records stage completion and detects new unlock when passed for the first time', async () => {
    mockSearchParams.set('roadmapNode', 'w1-n1');
    const { result } = renderHook(() => useRoadmapTracking());

    let recordResult: StageCompletionResponse | undefined;
    await act(async () => {
      recordResult = await result.current.recordStageCompletion(10, 10);
    });

    expect(mockRecordRoadmapCompletion).toHaveBeenCalledWith('w1-n1', 'world-1', 10, 10);
    expect(recordResult?.stars).toBe(3);
    expect(recordResult?.isNewUnlock).toBe(true);
    expect(recordResult?.nextNode).toBeDefined();
    expect(recordResult?.nextNode?.id).toBe('w1-n2');
    expect(recordResult?.nextNode?.titleVi).toBe('Số & Màu sắc');

    expect(result.current.status).toBe('completed');
    expect(result.current.result).toEqual({
      stars: 3,
      isNewUnlock: true,
      nextNodeTitle: 'Số & Màu sắc',
    });
  });

  it('marks isNewUnlock = false if the node was already completed previously', async () => {
    mockSearchParams.set('roadmapNode', 'w1-n1');
    mockRoadmapState = {
      totalStars: 3,
      completedNodeIds: ['w1-n1'],
      nodesProgress: {
        'w1-n1': {
          nodeId: 'w1-n1',
          worldId: 'world-1',
          stars: 2,
          highScore: 80,
          attempts: 1,
          isCompleted: true,
        },
      },
    };

    const { result } = renderHook(() => useRoadmapTracking());

    let recordResult: StageCompletionResponse | undefined;
    await act(async () => {
      recordResult = await result.current.recordStageCompletion(10, 10);
    });

    expect(recordResult?.stars).toBe(3);
    expect(recordResult?.isNewUnlock).toBe(false);
    expect(result.current.result?.isNewUnlock).toBe(false);
  });

  it('marks isNewUnlock = false and stars = 0 when score is below 60%', async () => {
    mockSearchParams.set('roadmapNode', 'w1-n1');
    const { result } = renderHook(() => useRoadmapTracking());

    let recordResult: StageCompletionResponse | undefined;
    await act(async () => {
      recordResult = await result.current.recordStageCompletion(3, 10);
    });

    expect(recordResult?.stars).toBe(0);
    expect(recordResult?.isNewUnlock).toBe(false);
    expect(result.current.result?.stars).toBe(0);
    expect(result.current.result?.isNewUnlock).toBe(false);
  });
});
