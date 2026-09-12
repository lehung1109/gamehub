import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

describe('useSpeechRecognition', () => {
  let mockRecognitionInstance: any;

  beforeEach(() => {
    mockRecognitionInstance = {
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      onstart: null,
      onend: null,
      onerror: null,
      onresult: null,
    };

    (window as any).webkitSpeechRecognition = vi.fn(function (this: any) {
      return mockRecognitionInstance;
    });
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
      mockRecognitionInstance.onstart();
    });
    expect(result.current.isListening).toBe(true);
  });

  it('captures transcript from recognition result event', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
      mockRecognitionInstance.onresult({
        resultIndex: 0,
        results: [
          [{ transcript: 'schedule' }],
        ],
      });
    });
    expect(result.current.transcript).toBe('schedule');
  });

  it('handles permission denied error', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
      mockRecognitionInstance.onerror({ error: 'not-allowed' });
    });
    expect(result.current.error).toBe('not-allowed');
    expect(result.current.isListening).toBe(false);
  });

  it('handles no-speech and other errors', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
      mockRecognitionInstance.onerror({ error: 'no-speech' });
    });
    expect(result.current.error).toBe('no-speech');

    act(() => {
      mockRecognitionInstance.onerror({ error: 'network' });
    });
    expect(result.current.error).toBe('network');
  });

  it('captures interim transcript correctly', () => {
    const { result } = renderHook(() => useSpeechRecognition({ interimResults: true }));
    act(() => {
      result.current.startListening();
      mockRecognitionInstance.onresult({
        resultIndex: 0,
        results: [
          Object.assign([{ transcript: 'sched' }], { isFinal: false }),
        ],
      });
    });
    expect(result.current.transcript).toBe('');
    expect(result.current.interimTranscript).toBe('sched');
  });

  it('resets transcript and interim transcript', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
      mockRecognitionInstance.onresult({
        resultIndex: 0,
        results: [
          [{ transcript: 'hello' }],
        ],
      });
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
      mockRecognitionInstance.onstart();
    });
    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.stopListening();
    });
    expect(mockRecognitionInstance.stop).toHaveBeenCalled();
    expect(result.current.isListening).toBe(false);

    act(() => {
      mockRecognitionInstance.onend();
    });
    expect(result.current.isListening).toBe(false);
  });

  it('handles unsupported browser environment', () => {
    const originalWebkit = (window as any).webkitSpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    delete (window as any).SpeechRecognition;

    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(false);

    act(() => {
      result.current.startListening();
    });
    expect(result.current.error).toBe('unsupported');

    (window as any).webkitSpeechRecognition = originalWebkit;
  });

  it('aborts recognition on unmount', () => {
    const { result, unmount } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
    });
    unmount();
    expect(mockRecognitionInstance.abort).toHaveBeenCalled();
  });
});
