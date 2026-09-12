import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RoadmapPage from '@/app/roadmap/page';

// Mock student session hook
vi.mock('@/contexts/StudentSessionContext', () => ({
  useStudentSession: () => ({
    session: null,
    isAnonymous: true,
    isLoaded: true,
    isOpen: false,
    setOpen: vi.fn(),
    joinClass: vi.fn(),
    skip: vi.fn(),
    clearSession: vi.fn(),
    totalStars: 15,
    levelInfo: {
      currentLevel: { level: 1, title: 'Tập sự', minStars: 0, badge: '🌱' },
      nextLevel: null,
      progressToNext: 0,
      starsToNext: 0,
    },
    isLoadingStars: false,
    refreshProgress: vi.fn(),
    celebration: { show: false, level: null },
    dismissCelebration: vi.fn(),
    streakState: { streakCount: 0, lastPlayedDate: null, freezeCount: 0 },
    inventory: { ownedItemIds: [], equippedFrameId: null, equippedTitleId: null },
    quests: [],
    refreshGamification: vi.fn(),
    syncGamification: vi.fn(),
    buyShopItem: vi.fn(),
    toggleEquipItem: vi.fn(),
    claimQuest: vi.fn(),
    roadmapState: {
      totalStars: 15,
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
    },
    refreshRoadmapProgress: vi.fn(),
    recordRoadmapCompletion: vi.fn(),
    recordNodeCompletion: vi.fn(),
  }),
}));

describe('RoadmapPage', () => {
  it('renders top HUD, world selector, world details, and opens modal on node click', () => {
    render(<RoadmapPage />);

    // Top HUD
    expect(screen.getByText('Lộ Trình Học Tập')).toBeDefined();
    expect(screen.getByTestId('roadmap-hud-stars')).toBeDefined();
    expect(screen.getByText('15')).toBeDefined();

    // World Selector & Header
    const worldTitles = screen.getAllByText('Đảo Thám Hiểm');
    expect(worldTitles.length).toBeGreaterThanOrEqual(2);

    // Node click opens modal
    const node1 = screen.getByTestId('roadmap-node-w1-n1');
    expect(node1).toBeDefined();

    fireEvent.click(node1);
    expect(screen.getByTestId('roadmap-node-modal')).toBeDefined();
    expect(screen.getByRole('link', { name: /Chơi lại/i })).toBeDefined();
  });

  it('locks nodes and disables CTA when selecting a locked world', () => {
    render(<RoadmapPage />);

    // Click World 2 (Vương Quốc Ghép Từ) which requires 12 stars + World 1 Boss completion
    const world2Tab = screen.getByText('Vương Quốc Ghép Từ');
    fireEvent.click(world2Tab);

    // Nodes in World 2 should be rendered and locked
    const nodeW2N1 = screen.getByTestId('roadmap-node-w2-n1');
    expect(nodeW2N1).toBeDefined();

    // Clicking node in locked world opens modal with locked state
    fireEvent.click(nodeW2N1);
    expect(screen.getByTestId('roadmap-node-modal')).toBeDefined();
    expect(screen.getByText(/Thế giới này chưa được mở khóa/i)).toBeDefined();
    expect(screen.queryByRole('link', { name: /Chơi ngay/i })).toBeNull();
  });
});
