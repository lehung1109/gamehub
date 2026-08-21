import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSpeech } from "@/hooks/useSpeech";

interface MockUtterance {
  text: string;
  lang: string;
  rate: number;
  pitch: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

describe("useSpeech hook", () => {
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;
  let lastCreatedUtterance: MockUtterance | null = null;

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    lastCreatedUtterance = null;

    class MockSpeechSynthesisUtterance {
      text: string;
      lang = "en-US";
      rate = 1;
      pitch = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor(text: string) {
        this.text = text;
        // Store reference in test fixture
        lastCreatedUtterance = this as unknown as MockUtterance;
      }
    }

    Object.defineProperty(window, "speechSynthesis", {
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        speaking: false,
      },
      configurable: true,
      writable: true,
    });

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: MockSpeechSynthesisUtterance,
      configurable: true,
      writable: true,
    });
  });

  it("identifies when speech is supported", () => {
    const { result } = renderHook(() => useSpeech());
    expect(result.current.isSupported).toBe(true);
  });

  it("calls cancel and speaks with rate 0.8 and en-US default lang", () => {
    const { result } = renderHook(() => useSpeech());

    act(() => {
      result.current.speak("Hello");
    });

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
    expect(lastCreatedUtterance).not.toBeNull();
    expect(lastCreatedUtterance?.text).toBe("Hello");
    expect(lastCreatedUtterance?.rate).toBe(0.8);
    expect(lastCreatedUtterance?.lang).toBe("en-US");
  });

  it("updates isSpeaking state during speech lifecycle", () => {
    const { result } = renderHook(() => useSpeech());
    expect(result.current.isSpeaking).toBe(false);

    act(() => {
      result.current.speak("Test");
    });

    // Trigger onstart
    act(() => {
      if (lastCreatedUtterance?.onstart) {
        lastCreatedUtterance.onstart();
      }
    });
    expect(result.current.isSpeaking).toBe(true);

    // Trigger onend
    act(() => {
      if (lastCreatedUtterance?.onend) {
        lastCreatedUtterance.onend();
      }
    });
    expect(result.current.isSpeaking).toBe(false);
  });

  it("resets isSpeaking on error", () => {
    const { result } = renderHook(() => useSpeech());

    act(() => {
      result.current.speak("Test");
      if (lastCreatedUtterance?.onstart) {
        lastCreatedUtterance.onstart();
      }
    });
    expect(result.current.isSpeaking).toBe(true);

    act(() => {
      if (lastCreatedUtterance?.onerror) {
        lastCreatedUtterance.onerror();
      }
    });
    expect(result.current.isSpeaking).toBe(false);
  });

  it("allows cancelling speech manually", () => {
    const { result } = renderHook(() => useSpeech());

    act(() => {
      result.current.cancel();
    });

    expect(mockCancel).toHaveBeenCalled();
    expect(result.current.isSpeaking).toBe(false);
  });

  it("cancels speech and cleans up on unmount", () => {
    const { result, unmount } = renderHook(() => useSpeech());

    act(() => {
      result.current.speak("Test");
    });

    unmount();
    expect(mockCancel).toHaveBeenCalled();
  });
});
