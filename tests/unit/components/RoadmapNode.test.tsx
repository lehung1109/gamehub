import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RoadmapNodeComponent } from '@/components/roadmap/RoadmapNode';
import { RoadmapNodeModal } from '@/components/roadmap/RoadmapNodeModal';
import { WorldSelector } from '@/components/roadmap/WorldSelector';
import { RoadmapMap } from '@/components/roadmap/RoadmapMap';
import type {
  RoadmapNode,
  RoadmapWorld,
  StudentNodeProgress,
  RoadmapProgressState,
} from '@/types/roadmap';

describe('RoadmapNodeComponent', () => {
  const mockNode: RoadmapNode = {
    id: 'w1-n1',
    worldId: 'world-1',
    order: 1,
    titleVi: 'Bảng chữ cái',
    titleEn: 'Alphabet',
    descriptionVi: 'Học 26 chữ cái',
    descriptionEn: '',
    gameType: 'alphabet',
    gameRoute: '/games/alphabet',
    gameParams: {},
    targetScore: 60,
    xpReward: 50,
    bonusStars: 5,
    isBossCheckpoint: false,
    prerequisites: [],
  };

  const mockBossNode: RoadmapNode = {
    id: 'w1-n5',
    worldId: 'world-1',
    order: 5,
    titleVi: 'Thử thách Trùm Đảo Thám Hiểm',
    titleEn: 'Explorer Boss Challenge',
    descriptionVi: 'Tổng hợp kỹ năng',
    descriptionEn: '',
    gameType: 'sentences',
    gameRoute: '/games/sentences',
    gameParams: {},
    targetScore: 80,
    xpReward: 150,
    bonusStars: 10,
    isBossCheckpoint: true,
    prerequisites: ['w1-n4'],
  };

  it('renders completed node with 3 golden stars', () => {
    const progress: StudentNodeProgress = {
      nodeId: 'w1-n1',
      worldId: 'world-1',
      stars: 3,
      highScore: 100,
      attempts: 1,
      isCompleted: true,
    };
    render(
      <RoadmapNodeComponent
        node={mockNode}
        progress={progress}
        isUnlocked={true}
        isCurrent={false}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText('Bảng chữ cái')).toBeDefined();
    expect(screen.getByTestId('node-stars-3')).toBeDefined();
    expect(screen.getByTestId('roadmap-node-w1-n1')).toBeDefined();
  });

  it('renders locked state with lock icon when isUnlocked is false', () => {
    render(
      <RoadmapNodeComponent
        node={mockNode}
        progress={undefined}
        isUnlocked={false}
        isCurrent={false}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByTestId('node-locked-icon')).toBeDefined();
    expect(screen.getByTestId('roadmap-node-w1-n1')).toBeDefined();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(
      <RoadmapNodeComponent
        node={mockNode}
        progress={undefined}
        isUnlocked={true}
        isCurrent={true}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByTestId('roadmap-node-w1-n1'));
    expect(onSelect).toHaveBeenCalledWith(mockNode);
  });

  it('renders crown icon for boss checkpoint node', () => {
    render(
      <RoadmapNodeComponent
        node={mockBossNode}
        progress={undefined}
        isUnlocked={true}
        isCurrent={false}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByTestId('node-boss-crown')).toBeDefined();
  });
});

describe('RoadmapNodeModal', () => {
  const mockNode: RoadmapNode = {
    id: 'w1-n1',
    worldId: 'world-1',
    order: 1,
    titleVi: 'Chữ cái & Phonics',
    titleEn: 'Alphabet & Phonics',
    descriptionVi: 'Làm quen với 26 chữ cái',
    descriptionEn: 'Learn 26 English letters',
    gameType: 'alphabet',
    gameRoute: '/games/alphabet',
    gameParams: {},
    targetScore: 60,
    xpReward: 50,
    bonusStars: 5,
    isBossCheckpoint: false,
    prerequisites: [],
  };

  it('renders node details and CTA button when open and unlocked', () => {
    const onClose = vi.fn();
    const progress: StudentNodeProgress = {
      nodeId: 'w1-n1',
      worldId: 'world-1',
      stars: 2,
      highScore: 85,
      attempts: 2,
      isCompleted: true,
    };

    render(
      <RoadmapNodeModal
        node={mockNode}
        progress={progress}
        isUnlocked={true}
        isOpen={true}
        onClose={onClose}
      />
    );

    expect(screen.getByTestId('roadmap-node-modal')).toBeDefined();
    expect(screen.getByText('Chữ cái & Phonics')).toBeDefined();
    expect(screen.getByText('Alphabet & Phonics')).toBeDefined();
    expect(screen.getByText('Làm quen với 26 chữ cái')).toBeDefined();
    expect(screen.getByText('85%')).toBeDefined();
    expect(screen.getByText('+50 XP')).toBeDefined();
    expect(screen.getByText('+5 Sao')).toBeDefined();

    // Check link routing
    const playLink = screen.getByRole('link', { name: /Chơi lại/i });
    expect(playLink.getAttribute('href')).toBe('/games/alphabet?roadmapNode=w1-n1');

    // Close button
    fireEvent.click(screen.getByLabelText('Đóng chi tiết chặng'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders locked CTA state when isUnlocked is false', () => {
    render(
      <RoadmapNodeModal
        node={mockNode}
        progress={undefined}
        isUnlocked={false}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Chưa mở khóa/i)).toBeDefined();
    expect(screen.queryByRole('link', { name: /Chơi ngay/i })).toBeNull();
  });

  it('renders locked world notice when isWorldUnlocked is false', () => {
    render(
      <RoadmapNodeModal
        node={mockNode}
        progress={undefined}
        isUnlocked={false}
        isWorldUnlocked={false}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Thế giới này chưa được mở khóa/i)).toBeDefined();
    expect(screen.getByText(/Chưa mở khóa/i)).toBeDefined();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <RoadmapNodeModal
        node={mockNode}
        progress={undefined}
        isUnlocked={true}
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('WorldSelector', () => {
  const mockWorlds: RoadmapWorld[] = [
    {
      id: 'world-1',
      order: 1,
      titleVi: 'Đảo Thám Hiểm',
      titleEn: 'Explorer Island',
      levelBadge: 'Pre-A1',
      description: 'World 1 desc',
      themeColor: 'emerald',
      icon: 'Compass',
      minStarsToUnlock: 0,
      nodes: [],
    },
    {
      id: 'world-2',
      order: 2,
      titleVi: 'Vùng Đất Xây Từ',
      titleEn: 'Word Builder',
      levelBadge: 'A1',
      description: 'World 2 desc',
      themeColor: 'sky',
      icon: 'BookOpen',
      minStarsToUnlock: 12,
      nodes: [],
    },
  ];

  const mockProgressState: RoadmapProgressState = {
    totalStars: 5,
    completedNodeIds: [],
    nodesProgress: {},
  };

  it('renders all worlds with title and level badges', () => {
    const onSelectWorld = vi.fn();
    render(
      <WorldSelector
        worlds={mockWorlds}
        selectedWorldId="world-1"
        onSelectWorld={onSelectWorld}
        progressState={mockProgressState}
      />
    );

    expect(screen.getByText('Đảo Thám Hiểm')).toBeDefined();
    expect(screen.getByText('Vùng Đất Xây Từ')).toBeDefined();
    expect(screen.getByText('Pre-A1')).toBeDefined();
    expect(screen.getByText('A1')).toBeDefined();
    expect(screen.getByText(/Cần 12 sao/i)).toBeDefined();

    // Click world 2 tab
    fireEvent.click(screen.getByText('Vùng Đất Xây Từ'));
    expect(onSelectWorld).toHaveBeenCalledWith('world-2');
  });
});

describe('RoadmapMap', () => {
  const mockWorld: RoadmapWorld = {
    id: 'world-1',
    order: 1,
    titleVi: 'Đảo Thám Hiểm',
    titleEn: 'Explorer Island',
    levelBadge: 'Pre-A1',
    description: 'World 1 desc',
    themeColor: 'emerald',
    icon: 'Compass',
    minStarsToUnlock: 0,
    nodes: [
      {
        id: 'w1-n1',
        worldId: 'world-1',
        order: 1,
        titleVi: 'Bảng chữ cái',
        titleEn: 'Alphabet',
        descriptionVi: '',
        descriptionEn: '',
        gameType: 'alphabet',
        gameRoute: '/games/alphabet',
        gameParams: {},
        targetScore: 60,
        xpReward: 50,
        bonusStars: 5,
        isBossCheckpoint: false,
        prerequisites: [],
      },
      {
        id: 'w1-n2',
        worldId: 'world-1',
        order: 2,
        titleVi: 'Số đếm',
        titleEn: 'Numbers',
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
      },
    ],
  };

  const mockProgressState: RoadmapProgressState = {
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

  it('renders all nodes in the world and allows selecting them', () => {
    const onSelectNode = vi.fn();
    render(
      <RoadmapMap
        world={mockWorld}
        progressState={mockProgressState}
        onSelectNode={onSelectNode}
      />
    );

    expect(screen.getByTestId('roadmap-node-w1-n1')).toBeDefined();
    expect(screen.getByTestId('roadmap-node-w1-n2')).toBeDefined();

    fireEvent.click(screen.getByTestId('roadmap-node-w1-n2'));
    expect(onSelectNode).toHaveBeenCalledWith(mockWorld.nodes[1]);
  });

  it('locks all nodes when isWorldUnlocked is false', () => {
    render(
      <RoadmapMap
        world={mockWorld}
        progressState={mockProgressState}
        isWorldUnlocked={false}
        onSelectNode={vi.fn()}
      />
    );

    const lockedIcons = screen.getAllByTestId('node-locked-icon');
    expect(lockedIcons.length).toBe(2);
  });
});
