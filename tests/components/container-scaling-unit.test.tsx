import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LetterGrid } from '@/components/game/LetterGrid';
import { FlashcardStack } from '@/components/game/FlashcardStack';
import { DragDropBoard } from '@/components/game/DragDropBoard';
import { QuizEngine } from '@/components/game/QuizEngine';
import { TenseLessonContainer } from '@/components/tenses/TenseLessonContainer';
import presentSimpleData from '@/data/tenses/present-simple.json';
import type { TenseModuleData } from '@/types/tenses';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/tenses/present-simple'),
}));

describe('Container and Grid Scaling on Desktop (US3)', () => {
  it('LetterGrid applies xl:grid-cols-11 2xl:grid-cols-13', () => {
    render(
      <LetterGrid
        letters={[{ letter: 'A', phonetic: '/eɪ/', exampleWord: 'Apple', exampleEmoji: '🍎' }]}
        selectedLetter={null}
        onSelectLetter={vi.fn()}
        correctLetter={null}
        wrongLetter={null}
      />
    );

    const grid = screen.getByRole('region', { name: /Bảng chữ cái A-Z/i });
    expect(grid).toHaveClass('xl:grid-cols-11');
    expect(grid).toHaveClass('2xl:grid-cols-13');
  });

  it('FlashcardStack applies max-w-xl xl:max-w-2xl', () => {
    const { container } = render(
      <FlashcardStack
        words={[{ id: '1', english: 'cat', vietnamese: 'con mèo', phonetic: '/kæt/', emoji: '🐱', topicId: 'animals' }]}
      />
    );

    const stackContainer = container.querySelector('.max-w-xl');
    expect(stackContainer).toBeInTheDocument();
    expect(stackContainer).toHaveClass('xl:max-w-2xl');
  });

  it('DragDropBoard applies max-w-2xl xl:max-w-4xl', () => {
    const { container } = render(
      <DragDropBoard
        targetItems={['D', 'O', 'G']}
        bankItems={[{ id: 'd1', label: 'D' }]}
        onComplete={vi.fn()}
      />
    );

    const board = container.querySelector('.max-w-2xl');
    expect(board).toBeInTheDocument();
    expect(board).toHaveClass('xl:max-w-4xl');
  });

  it('QuizEngine applies max-w-2xl xl:max-w-3xl', () => {
    const { container } = render(
      <QuizEngine
        questions={[
          {
            prompt: { word: 'Cat', emoji: '🐱' },
            options: [{ word: 'Cat', emoji: '🐱' }, { word: 'Dog', emoji: '🐶' }],
            correctIndex: 0,
          },
        ]}
        renderPrompt={(p) => <div>{p.word}</div>}
        renderOption={(o) => <div>{o.word}</div>}
        onComplete={vi.fn()}
      />
    );

    const engine = container.querySelector('.max-w-2xl');
    expect(engine).toBeInTheDocument();
    expect(engine).toHaveClass('xl:max-w-3xl');
  });

  it('TenseLessonContainer applies max-w-5xl xl:max-w-6xl', () => {
    const { container } = render(
      <TenseLessonContainer lessonData={presentSimpleData as unknown as TenseModuleData} />
    );

    const lessonContainer = container.querySelector('.max-w-5xl');
    expect(lessonContainer).toBeInTheDocument();
    expect(lessonContainer).toHaveClass('xl:max-w-6xl');
  });
});
