// tests/components/game/grammar-detective.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CaseColdModal } from '@/components/game/grammar-detective/CaseColdModal';
import { DossierSelector } from '@/components/game/grammar-detective/DossierSelector';
import { DetectiveDesk } from '@/components/game/grammar-detective/DetectiveDesk';
import { DeductionCard } from '@/components/game/grammar-detective/DeductionCard';
import type { CaseFile } from '@/types/grammar-detective';

const sampleCase: CaseFile = {
  id: 'case-test-1',
  title: 'Test Case Title',
  titleVi: 'Tiêu đề vụ án',
  category: 'email',
  rankTier: 'intern',
  sender: 'a@test.com',
  recipient: 'b@test.com',
  subject: 'Test Subject',
  documentText: 'We has problem.',
  errors: [
    {
      id: 'err-1',
      targetWord: 'has',
      tokenIndex: 1,
      errorType: 'tense',
      options: [{ id: 'o1', text: 'have', isCorrect: true, feedbackEn: 'ok', feedbackVi: 'dung' }],
      explanationEn: 'Plural subject requires have.',
      explanationVi: 'Chủ ngữ số nhiều dùng have.',
    },
  ],
};

describe('CaseColdModal component', () => {
  it('renders Case Cold modal and displays undiscovered clues recap', () => {
    render(
      <CaseColdModal
        isOpen={true}
        caseFile={sampleCase}
        mistakes={3}
        solvedCount={0}
        unsolvedErrors={sampleCase.errors}
        onRetry={vi.fn()}
        onReturnToDossier={vi.fn()}
      />
    );

    expect(screen.getByText(/Vụ án bị đình chỉ/i)).toBeInTheDocument();
    expect(screen.getByText(/Các manh mối chưa tìm ra/i)).toBeInTheDocument();
    expect(screen.getByText('has')).toBeInTheDocument();
    expect(screen.getByText('have')).toBeInTheDocument();
    expect(screen.getByText(/Chủ ngữ số nhiều dùng have/i)).toBeInTheDocument();
  });
});

describe('DossierSelector component', () => {
  it('shows empty state when category filter matches no cases and allows reset', () => {
    const onSelect = vi.fn();
    render(
      <DossierSelector
        cases={[sampleCase]}
        completedCaseIds={[]}
        userRank="intern"
        onSelectCase={onSelect}
      />
    );

    expect(screen.getByText('Test Case Title')).toBeInTheDocument();

    const incidentFilter = screen.getByRole('button', { name: /Sự cố/i });
    fireEvent.click(incidentFilter);

    expect(screen.getByText(/Không có vụ án nào phù hợp với bộ lọc/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Xem tất cả vụ án/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('Test Case Title')).toBeInTheDocument();
  });
});

describe('DetectiveDesk component', () => {
  it('calls onSpeak with corrected document text instead of raw text', () => {
    const onSpeak = vi.fn();
    const onTokenTap = vi.fn();
    const tokens = [
      { id: 't-0', text: 'We ', isWord: true, errorId: null, isCorrected: false },
      { id: 't-1', text: 'have', isWord: true, errorId: 'err-1', isCorrected: true },
      { id: 't-2', text: ' problem.', isWord: false, errorId: null, isCorrected: false },
    ];

    render(
      <DetectiveDesk
        caseFile={sampleCase}
        tokens={tokens}
        highlighterActive={true}
        onTokenTap={onTokenTap}
        onSpeak={onSpeak}
      />
    );

    const speakBtn = screen.getByRole('button', { name: /Nghe đọc toàn bộ văn bản/i });
    fireEvent.click(speakBtn);

    expect(onSpeak).toHaveBeenCalledWith('We have problem.');
  });

  it('calls onTokenTap when a word token is tapped', () => {
    const onSpeak = vi.fn();
    const onTokenTap = vi.fn();
    const tokens = [
      { id: 't-0', text: 'We', isWord: true, errorId: null, isCorrected: false },
      { id: 't-1', text: 'has', isWord: true, errorId: 'err-1', isCorrected: false },
    ];

    render(
      <DetectiveDesk
        caseFile={sampleCase}
        tokens={tokens}
        highlighterActive={true}
        onTokenTap={onTokenTap}
        onSpeak={onSpeak}
      />
    );

    const tokenBtn = screen.getByRole('button', { name: 'has' });
    fireEvent.click(tokenBtn);

    expect(onTokenTap).toHaveBeenCalledWith('t-1');
  });
});

describe('CaseColdModal in Endless Mode', () => {
  it('renders streak recap and tailored endless replay button', () => {
    render(
      <CaseColdModal
        isOpen={true}
        caseFile={sampleCase}
        mistakes={3}
        solvedCount={0}
        unsolvedErrors={sampleCase.errors}
        mode="endless"
        streak={5}
        highestStreak={7}
        onRetry={vi.fn()}
        onReturnToDossier={vi.fn()}
      />
    );

    expect(screen.getByText(/Chuỗi vô tận:/i)).toBeInTheDocument();
    expect(screen.getByText(/5 vụ/i)).toBeInTheDocument();
    expect(screen.getByText(/Kỷ lục:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chơi lại vòng vô tận/i })).toBeInTheDocument();
  });
});

describe('DeductionCard component', () => {
  it('disables previously attempted wrong options and prevents duplicate penalties', () => {
    const onSelectOption = vi.fn();
    const errorWithTwoOptions = {
      ...sampleCase.errors[0],
      options: [
        { id: 'o1', text: 'have', isCorrect: true, feedbackEn: '', feedbackVi: '' },
        { id: 'o2', text: 'had', isCorrect: false, feedbackEn: '', feedbackVi: '' },
      ],
    };

    render(
      <DeductionCard
        activeError={errorWithTwoOptions}
        isOpen={true}
        attemptedOptionIds={['o2']}
        onSelectOption={onSelectOption}
        onClose={vi.fn()}
        onSpeak={vi.fn()}
      />
    );

    const wrongBtn = screen.getByRole('button', { name: /had/i });
    expect(wrongBtn).toBeDisabled();

    fireEvent.click(wrongBtn);
    expect(onSelectOption).not.toHaveBeenCalled();

    const correctBtn = screen.getByRole('button', { name: /have/i });
    expect(correctBtn).not.toBeDisabled();
    fireEvent.click(correctBtn);
    expect(onSelectOption).toHaveBeenCalledWith('o1');
  });
});

