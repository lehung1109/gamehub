import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useSpeechRecognition,
  SpeechRecognitionInstance,
  WindowWithSpeechRecognition,
  SpeechRecognitionEventLike,
  SpeechRecognitionConstructor,
} from '@/hooks/useSpeechRecognition';

interface MockSpeechRecognitionInstance extends Omit<SpeechRecognitionInstance, 'start' | 'stop' | 'abort'> {
  start: Mock<() => void>;
  stop: Mock<() => void>;
  abort: Mock<() => void>;
}

const getTestWindow = (): WindowWithSpeechRecognition => window as unknown as WindowWithSpeechRecognition;

describe('useSpeechRecognition', () => {
  let mockRecognitionInstance: MockSpeechRecognitionInstance;

  beforeEach(() => {
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

  it('detects browser support when webkitSpeechRecognition is available', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isListening).toBe(false);
  });

  it('starts listening and updates state when startListening is invoked', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
    });
    expect(mockRecognitionInstance.start).toHaveBeenCalled();

    // Trigger onstart
    act(() => {
      mockRecognitionInstance.onstart?.();
    });
    expect(result.current.isListening).toBe(true);
  });

  it('aborts and cleans up previous instance when startListening is called again', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
    });
    const firstAbort = mockRecognitionInstance.abort;

    act(() => {
      result.current.startListening();
    });
    expect(firstAbort).toHaveBeenCalled();
  });

  it('captures transcript from recognition result event', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
      const event: SpeechRecognitionEventLike = {
        resultIndex: 0,
        results: [
          [{ transcript: 'schedule' }],
        ],
      };
      mockRecognitionInstance.onresult?.(event);
    });
    expect(result.current.transcript).toBe('schedule');
  });

  it('handles permission denied error', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
      mockRecognitionInstance.onerror?.({ error: 'not-allowed' });
    });
    expect(result.current.error).toBe('not-allowed');
    expect(result.current.isListening).toBe(false);
  });

  it('handles no-speech and other errors', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
      mockRecognitionInstance.onerror?.({ error: 'no-speech' });
    });
    expect(result.current.error).toBe('no-speech');

    act(() => {
      mockRecognitionInstance.onerror?.({ error: 'network' });
    });
    expect(result.current.error).toBe('network');
  });

  it('captures interim transcript correctly', () => {
    const { result } = renderHook(() => useSpeechRecognition({ interimResults: true }));
    act(() => {
      result.current.startListening();
      const event: SpeechRecognitionEventLike = {
        resultIndex: 0,
        results: [
          Object.assign([{ transcript: 'sched' }], { isFinal: false }),
        ],
      };
      mockRecognitionInstance.onresult?.(event);
    });
    expect(result.current.transcript).toBe('');
    expect(result.current.interimTranscript).toBe('sched');
  });

  it('resets transcript and interim transcript', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
      const event: SpeechRecognitionEventLike = {
        resultIndex: 0,
        results: [
          [{ transcript: 'hello' }],
        ],
      };
      mockRecognitionInstance.onresult?.(event);
    });
    expect(result.current.transcript).toBe('hello');

    act(() => {
      result.current.resetTranscript();
    });
    expect(result.current.transcript).toBe('');
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('stops listening when stopListening is called or onend fires', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
      mockRecognitionInstance.onstart?.();
    });
    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.stopListening();
    });
    expect(mockRecognitionInstance.stop).toHaveBeenCalled();
    expect(result.current.isListening).toBe(false);

    act(() => {
      mockRecognitionInstance.onend?.();
    });
    expect(result.current.isListening).toBe(false);
  });

  it('handles unsupported browser environment', () => {
    const win = getTestWindow();
    const originalWebkit = win.webkitSpeechRecognition;
    delete win.webkitSpeechRecognition;
    delete win.SpeechRecognition;

    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(false);

    act(() => {
      result.current.startListening();
    });
    expect(result.current.error).toBe('unsupported');

    win.webkitSpeechRecognition = originalWebkit;
  });

  it('aborts recognition and clears event handlers on unmount', () => {
    const { result, unmount } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
    });
    unmount();
    expect(mockRecognitionInstance.abort).toHaveBeenCalled();
    expect(mockRecognitionInstance.onstart).toBeNull();
    expect(mockRecognitionInstance.onresult).toBeNull();
    expect(mockRecognitionInstance.onerror).toBeNull();
    expect(mockRecognitionInstance.onend).toBeNull();
  });
});
