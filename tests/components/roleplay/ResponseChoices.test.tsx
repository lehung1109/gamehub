import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { ResponseChoices } from '@/components/roleplay/ResponseChoices';
import { LearnerResponse } from '@/types/roleplay';
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

describe('ResponseChoices Component', () => {
  let mockRecognitionInstance: MockSpeechRecognitionInstance;

  const mockOptions: LearnerResponse[] = [
    { id: 'opt-1', text: 'I would like a burger and fries, please.', isCorrect: true },
    { id: 'opt-2', text: 'Give me food now.', isCorrect: false },
  ];

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

  it('renders all response options and triggers onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<ResponseChoices options={mockOptions} onSelect={onSelect} />);

    expect(screen.getByText('I would like a burger and fries, please.')).toBeInTheDocument();
    expect(screen.getByText('Give me food now.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('I would like a burger and fries, please.'));
    expect(onSelect).toHaveBeenCalledWith(mockOptions[0]);
  });

  it('renders voice speak button and starts listening when clicked', () => {
    const onSelect = vi.fn();
    render(<ResponseChoices options={mockOptions} onSelect={onSelect} />);

    const voiceBtn = screen.getByRole('button', { name: /nói câu trả lời/i });
    expect(voiceBtn).toBeInTheDocument();

    fireEvent.click(voiceBtn);
    expect(mockRecognitionInstance.start).toHaveBeenCalled();
  });

  it('matches spoken transcript with option and triggers onSelect automatically', () => {
    const onSelect = vi.fn();
    render(<ResponseChoices options={mockOptions} onSelect={onSelect} />);

    const voiceBtn = screen.getByRole('button', { name: /nói câu trả lời/i });
    fireEvent.click(voiceBtn);

    // Simulate speech recognition result matching option 1
    const mockItem = [{ transcript: 'I would like a burger and fries please' }] as unknown as SpeechRecognitionResultItemLike;
    const mockResults = [mockItem] as unknown as SpeechRecognitionResultListLike;
    const speechEvent: SpeechRecognitionEventLike = {
      resultIndex: 0,
      results: mockResults,
    };

    act(() => {
      mockRecognitionInstance.onresult?.(speechEvent);
      mockRecognitionInstance.onend?.();
    });

    expect(onSelect).toHaveBeenCalledWith(mockOptions[0]);
  });
});
