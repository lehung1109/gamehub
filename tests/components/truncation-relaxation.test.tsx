import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudentProfileBadge } from '@/components/StudentProfileBadge';
import { StudentBadge } from '@/components/student/StudentBadge';
import { GameCard } from '@/components/custom/GameCard';
import { TenseCard } from '@/components/tenses/TenseCard';
import { ConjugationStage } from '@/components/tenses/stages/ConjugationStage';
import { ErrorHunterStage } from '@/components/tenses/stages/ErrorHunterStage';
import { SentenceBuilderStage } from '@/components/tenses/stages/SentenceBuilderStage';
import { StudentSessionProvider } from '@/contexts/StudentSessionContext';
import presentSimpleData from '@/data/tenses/present-simple.json';
import type { ConjugationItem, ErrorHunterItem, SentenceBuilderItem } from '@/types/tenses';

vi.mock("@/hooks/useSessionQuestions", () => ({
  useSessionQuestions: vi.fn((items, count) => items.slice(0, count)),
}));

vi.mock('@/app/actions/student-progress', () => ({
  getStudentProgress: vi.fn().mockResolvedValue({
    success: true,
    totalStars: 60,
  }),
}));

describe('Truncation Relaxation on Desktop (US2)', () => {
  it('StudentProfileBadge applies xl:max-w-[200px] on level title', async () => {
    sessionStorage.setItem(
      'gamehub_student_session',
      JSON.stringify({ classCode: 'ABC123', studentName: 'Bé An', isAnonymous: false })
    );

    render(
      <StudentSessionProvider>
        <StudentProfileBadge />
      </StudentSessionProvider>
    );

    const titleEl = await screen.findByText('Khám phá');
    expect(titleEl).toHaveClass('xl:max-w-[200px]');
  });

  it('StudentBadge applies xl:max-w-none xl:truncate-none on student name and class', async () => {
    sessionStorage.setItem(
      'gamehub_student_session',
      JSON.stringify({ classCode: 'ABC123', studentName: 'Bé Nguyễn Văn A Rất Dài', className: 'Lớp 1A Siêu Cấp', isAnonymous: false })
    );

    render(
      <StudentSessionProvider>
        <StudentBadge />
      </StudentSessionProvider>
    );

    const nameEl = await screen.findByText('Bé Nguyễn Văn A Rất Dài');
    expect(nameEl).toHaveClass('xl:max-w-none');
    expect(nameEl).toHaveClass('xl:truncate-none');

    const classEl = screen.getByText('Lớp 1A Siêu Cấp');
    expect(classEl).toHaveClass('xl:max-w-none');
    expect(classEl).toHaveClass('xl:truncate-none');
  });

  it('GameCard applies xl:line-clamp-none on description', () => {
    const mockGame = {
      id: 'test-game',
      slug: 'test-game',
      route: '/games/test',
      emoji: '🎮',
      titleVi: 'Trò chơi thử nghiệm',
      titleEn: 'Test Game',
      description: 'Mô tả rất dài cho trò chơi để kiểm tra text truncation trên màn hình lớn',
      color: 'from-blue-500 to-indigo-500',
      priority: 1,
    };

    render(<GameCard game={mockGame} />);
    const descEl = screen.getByText(mockGame.description);
    expect(descEl).toHaveClass('line-clamp-2');
    expect(descEl).toHaveClass('xl:line-clamp-none');
  });

  it('TenseCard applies xl:line-clamp-3 on description', () => {
    const mockTense = {
      id: 'present-simple',
      slug: 'present-simple',
      name: 'Present Simple',
      vietnameseName: 'Hiện tại đơn',
      group: 'present' as const,
      level: 'A1-A2 (Beginner)' as const,
      badge: 'Cơ bản',
      description: 'Mô tả thì hiện tại đơn rất chi tiết và dài để kiểm tra độ giãn dòng trên desktop viewports',
      estimatedMinutes: 15,
      challengeCount: 30,
      status: 'active' as const,
      colorTheme: 'indigo',
    };

    render(<TenseCard tense={mockTense} />);
    const descEl = screen.getByText(mockTense.description);
    expect(descEl).toHaveClass('line-clamp-2');
    expect(descEl).toHaveClass('xl:line-clamp-3');
  });

  it('Tense stages apply xl:line-clamp-2 on scenario text', () => {
    const conjugationItems = presentSimpleData.challenges.conjugation as unknown as ConjugationItem[];
    const { unmount: unmount1 } = render(
      <ConjugationStage
        items={conjugationItems}
        questionCount={10}
        sessionStorageKey="test-key"
        onStageComplete={vi.fn()}
      />
    );

    const scenario1 = screen.getByText(conjugationItems[0].scenarioVi);
    expect(scenario1).toHaveClass('line-clamp-1');
    expect(scenario1).toHaveClass('xl:line-clamp-2');
    unmount1();

    const hunterItems = presentSimpleData.challenges.errorHunting as unknown as ErrorHunterItem[];
    const { unmount: unmount2 } = render(
      <ErrorHunterStage
        items={hunterItems}
        questionCount={10}
        sessionStorageKey="test-key"
        onStageComplete={vi.fn()}
      />
    );
    const scenario2 = screen.getByText(hunterItems[0].scenarioVi);
    expect(scenario2).toHaveClass('line-clamp-1');
    expect(scenario2).toHaveClass('xl:line-clamp-2');
    unmount2();

    const sentenceItems = presentSimpleData.challenges.sentenceBuilding as unknown as SentenceBuilderItem[];
    render(
      <SentenceBuilderStage
        items={sentenceItems}
        questionCount={10}
        sessionStorageKey="test-key"
        onStageComplete={vi.fn()}
      />
    );
    const scenario3 = screen.getByText(sentenceItems[0].scenarioVi);
    expect(scenario3).toHaveClass('line-clamp-1');
    expect(scenario3).toHaveClass('xl:line-clamp-2');
  });
});
