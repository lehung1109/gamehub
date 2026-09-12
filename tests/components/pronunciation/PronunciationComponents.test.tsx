import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhoneticWordCard } from '@/components/game/pronunciation/PhoneticWordCard';
import { MicrophoneRecorder } from '@/components/game/pronunciation/MicrophoneRecorder';
import { PronunciationResultCard } from '@/components/game/pronunciation/PronunciationResultCard';
import { PronunciationScoreModal } from '@/components/game/pronunciation/PronunciationScoreModal';
import { PronunciationResult } from '@/types/pronunciation';

describe('Pronunciation Components', () => {
  describe('PhoneticWordCard', () => {
    it('renders target text, phonetic IPA and translation in PhoneticWordCard', () => {
      const onPlayAudio = vi.fn();
      render(
        <PhoneticWordCard
          targetText="schedule"
          phonetic="/ˈʃedʒuːl/"
          vietnameseMeaning="lịch trình"
          focusSound="Trọng âm 1"
          onPlayAudio={onPlayAudio}
        />
      );

      expect(screen.getByText('schedule')).toBeInTheDocument();
      expect(screen.getByText('/ˈʃedʒuːl/')).toBeInTheDocument();
      expect(screen.getByText('lịch trình')).toBeInTheDocument();
      expect(screen.getByText('Trọng âm 1')).toBeInTheDocument();

      const listenBtn = screen.getByRole('button', { name: /nghe phát âm mẫu/i });
      fireEvent.click(listenBtn);
      expect(onPlayAudio).toHaveBeenCalledWith('schedule');
    });

    it('renders without focusSound badge if not provided', () => {
      const onPlayAudio = vi.fn();
      render(
        <PhoneticWordCard
          targetText="hello"
          phonetic="/həˈləʊ/"
          vietnameseMeaning="xin chào"
          onPlayAudio={onPlayAudio}
        />
      );

      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.queryByText('Trọng âm 1')).not.toBeInTheDocument();
    });
  });

  describe('MicrophoneRecorder', () => {
    it('renders listening animation and action button in MicrophoneRecorder', () => {
      const onToggle = vi.fn();
      render(
        <MicrophoneRecorder
          isListening={true}
          interimTranscript="sched..."
          isSupported={true}
          error={null}
          onToggleListening={onToggle}
        />
      );

      expect(screen.getByText(/đang nghe/i)).toBeInTheDocument();
      expect(screen.getByText('sched...')).toBeInTheDocument();
      const micBtn = screen.getByTestId('mic-toggle-button');
      fireEvent.click(micBtn);
      expect(onToggle).toHaveBeenCalled();
    });

    it('renders idle prompt when not listening', () => {
      const onToggle = vi.fn();
      render(
        <MicrophoneRecorder
          isListening={false}
          interimTranscript=""
          isSupported={true}
          error={null}
          onToggleListening={onToggle}
        />
      );

      expect(screen.getByText(/nhấn biểu tượng microphone để bắt đầu đọc/i)).toBeInTheDocument();
    });

    it('renders unsupported browser warning when isSupported is false', () => {
      render(
        <MicrophoneRecorder
          isListening={false}
          interimTranscript=""
          isSupported={false}
          error="unsupported"
          onToggleListening={vi.fn()}
        />
      );

      expect(screen.getByText(/trình duyệt của bạn chưa hỗ trợ/i)).toBeInTheDocument();
    });

    it('renders permission error when error is not-allowed', () => {
      render(
        <MicrophoneRecorder
          isListening={false}
          interimTranscript=""
          isSupported={true}
          error="not-allowed"
          onToggleListening={vi.fn()}
        />
      );

      expect(screen.getByText(/vui lòng cấp quyền truy cập microphone/i)).toBeInTheDocument();
    });
  });

  describe('PronunciationResultCard', () => {
    const mockResult: PronunciationResult = {
      accuracy: 85,
      stars: 3,
      feedbackVi: 'Phát âm rất tốt! Bạn đã nói đúng hầu hết các từ.',
      wordDetails: [
        { word: 'standup', isMatch: true, score: 95 },
        { word: 'meeting', isMatch: true, score: 80 },
      ],
      isPassed: true,
    };

    it('renders accuracy, stars, word tokens, and feedback message', () => {
      const onRetry = vi.fn();
      const onNext = vi.fn();

      render(
        <PronunciationResultCard
          result={mockResult}
          onRetry={onRetry}
          onNext={onNext}
          isLastQuestion={false}
        />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('standup')).toBeInTheDocument();
      expect(screen.getByText('meeting')).toBeInTheDocument();
      expect(screen.getByText(mockResult.feedbackVi)).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /thử lại/i });
      fireEvent.click(retryBtn);
      expect(onRetry).toHaveBeenCalled();

      const nextBtn = screen.getByRole('button', { name: /tiếp tục/i });
      fireEvent.click(nextBtn);
      expect(onNext).toHaveBeenCalled();
    });

    it('renders complete button when isLastQuestion is true', () => {
      const onNext = vi.fn();

      render(
        <PronunciationResultCard
          result={mockResult}
          onRetry={vi.fn()}
          onNext={onNext}
          isLastQuestion={true}
        />
      );

      const completeBtn = screen.getByRole('button', { name: /hoàn thành/i });
      expect(completeBtn).toBeInTheDocument();
      fireEvent.click(completeBtn);
      expect(onNext).toHaveBeenCalled();
    });
  });

  describe('PronunciationScoreModal', () => {
    it('renders completion modal with score, percentage and actions', () => {
      const onRestart = vi.fn();

      render(
        <PronunciationScoreModal
          isOpen={true}
          score={270}
          totalQuestions={3}
          onRestart={onRestart}
        />
      );

      expect(screen.getByText(/hoàn thành bài luyện nói!/i)).toBeInTheDocument();
      expect(screen.getByText('90%')).toBeInTheDocument();
      expect(screen.getByText(/bạn đã hoàn thành 3 mục phát âm và đạt tổng điểm 270!/i)).toBeInTheDocument();

      const restartBtn = screen.getByRole('button', { name: /luyện lại/i });
      fireEvent.click(restartBtn);
      expect(onRestart).toHaveBeenCalled();

      const homeLink = screen.getByRole('link', { name: /về trang chủ/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });
});
