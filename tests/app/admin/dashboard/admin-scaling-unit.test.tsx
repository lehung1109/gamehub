import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ConfigList } from '@/components/admin/ConfigList';
import { ClassList } from '@/components/class/ClassList';

import type { GameConfig } from '@/types/config';
import type { ClassroomWithCount } from '@/app/actions/classes';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/app/actions/configs', () => ({
  deleteConfig: vi.fn(),
}));

vi.mock('@/app/actions/classes', () => ({
  updateClassAction: vi.fn(),
  deactivateClassAction: vi.fn(),
  activateClassAction: vi.fn(),
}));

describe('Admin Desktop Scaling (US4)', () => {
  it('ConfigList grid applies xl:grid-cols-4', () => {
    const mockGame = {
      id: 'flashcard',
      titleVi: 'Thẻ Từ Vựng',
      titleEn: 'Flashcards',
      slug: 'flashcards',
      route: '/games/flashcard',
      emoji: '🎴',
      description: 'Mô tả',
      priority: 1,
    };

    const mockConfigs = [
      {
        id: 'cfg-1',
        user_id: 'user-1',
        game_id: 'flashcard',
        name: 'Cấu hình 1',
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const { container } = render(<ConfigList game={mockGame} configs={mockConfigs as unknown as GameConfig[]} />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('xl:grid-cols-4');
  });

  it('ClassList grid applies 2xl:grid-cols-4', () => {
    const mockClasses = [
      {
        id: 'cls-1',
        teacher_id: 't-1',
        name: 'Lớp 1A',
        code: 'ABC123',
        is_active: true,
        created_at: new Date().toISOString(),
        student_count: 5,
      },
    ];

    const { container } = render(<ClassList classes={mockClasses as unknown as ClassroomWithCount[]} />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('2xl:grid-cols-4');
  });
});
