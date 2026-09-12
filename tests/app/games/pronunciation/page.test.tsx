import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import PronunciationPage from '@/app/games/pronunciation/page';
import {
  SpeechRecognitionInstance,
  WindowWithSpeechRecognition,
  SpeechRecognitionConstructor,
  SpeechRecognitionEventLike,
  SpeechRecognitionResultListLike,
  SpeechRecognitionResultItemLike,
} from '@/hooks/useSpeechRecognition';

interface MockSpeechRecognitionInstance extends Omit<SpeechRecognitionInstance, 'start' | 'stop' | 'abort'> {
  start: Mock<() => void>;
  stop: Mock<() => void>;
  abort: Mock<() => void>;
}

const getTestWindow = (): WindowWithSpeechRecognition => window as unknown as WindowWithSpeechRecognition;

const mockSpeak = vi.fn();
const mockCancel = vi.fn();

class MockSpeechSynthesisUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    speaking: false,
  },
  configurable: true,
  writable: true,
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  value: MockSpeechSynthesisUtterance,
  configurable: true,
  writable: true,
});

describe('PronunciationPage', () => {
  let mockRecognitionInstance: MockSpeechRecognitionInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRecognitionInstance = {
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      onstart: null,
      onend: null,
      onerror: null,
      onresult: null,
      lang: '',
      continuous: false,
      interimResults: false,
    };

    const win = getTestWindow();
    win.webkitSpeechRecognition = vi.fn(function () {
      return mockRecognitionInstance;
    }) as unknown as SpeechRecognitionConstructor;
  });

  it('renders topic switcher and initial question correctly', () => {
    render(<PronunciationPage />);
    expect(screen.getByText(/phòng luyện phát âm/i)).toBeInTheDocument();
    expect(screen.getByText(/cặp âm dễ nhầm lẫn/i)).toBeInTheDocument();
    expect(screen.getByText(/từ vựng công sở/i)).toBeInTheDocument();
    expect(screen.getByText(/câu giao tiếp standup/i)).toBeInTheDocument();
    expect(screen.getByText('ship')).toBeInTheDocument();
    expect(screen.getByText('/ʃɪp/')).toBeInTheDocument();
    expect(screen.getByText(/câu 1 \//i)).toBeInTheDocument();
  });

  it('allows switching topics and updates the displayed items', () => {
    render(<PronunciationPage />);

    // Click on Workplace Words
    const workplaceBtn = screen.getByText(/từ vựng công sở/i);
    fireEvent.click(workplaceBtn);
    expect(screen.getByText('schedule')).toBeInTheDocument();
    expect(screen.getByText('/ˈʃedʒuːl/')).toBeInTheDocument();

    // Click on Standup Phrases
    const standupBtn = screen.getByText(/câu giao tiếp standup/i);
    fireEvent.click(standupBtn);
    expect(screen.getByText(/can you hear me clearly\?/i)).toBeInTheDocument();
  });

  it('renders back link to home page', () => {
    render(<PronunciationPage />);
    const backLink = screen.getByRole('link', { name: /quay lại/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('calls speechSynthesis.speak when play audio button is clicked', () => {
    render(<PronunciationPage />);
    const audioBtn = screen.getByRole('button', { name: /nghe phát âm mẫu/i });
    fireEvent.click(audioBtn);
    expect(mockSpeak).toHaveBeenCalled();
  });

  it('handles speech recognition recording, evaluation, and moving to next question', async () => {
    render(<PronunciationPage />);

    // Click microphone button to start listening
    const micBtn = screen.getByTestId('mic-toggle-button');
    fireEvent.click(micBtn);
    expect(mockRecognitionInstance.start).toHaveBeenCalled();

    // Simulate speech recognition result and stop
    const mockItem = [{ transcript: 'ship' }] as unknown as SpeechRecognitionResultItemLike;
    const mockResults = [mockItem] as unknown as SpeechRecognitionResultListLike;
    const speechEvent: SpeechRecognitionEventLike = {
      resultIndex: 0,
      results: mockResults,
    };

    act(() => {
      mockRecognitionInstance.onresult?.(speechEvent);
      mockRecognitionInstance.onend?.();
    });

    // Evaluation result card should now be shown
    expect(screen.getByText(/100%/)).toBeInTheDocument();
    expect(screen.getByText(/thử lại/i)).toBeInTheDocument();
    expect(screen.getByText(/tiếp tục/i)).toBeInTheDocument();

    // Click Tiếp tục to advance to next question (sheep)
    const nextBtn = screen.getByText(/tiếp tục/i);
    await act(async () => {
      fireEvent.click(nextBtn);
    });

    // Question 2 should now be displayed
    expect(screen.getByText(/câu 2 \//i)).toBeInTheDocument();
    expect(screen.getByText('sheep')).toBeInTheDocument();
    expect(screen.getByText('Điểm: 100')).toBeInTheDocument();
  });
});
