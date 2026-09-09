import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { playWordSolvedSound } from "@/lib/crossword/sound";

interface MockOscillator {
  type: string;
  frequency: { setValueAtTime: ReturnType<typeof vi.fn> };
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

interface MockGain {
  gain: {
    setValueAtTime: ReturnType<typeof vi.fn>;
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
  };
  connect: ReturnType<typeof vi.fn>;
}

interface MockAudioContextInstance {
  currentTime: number;
  destination: object;
  createOscillator: () => MockOscillator;
  createGain: () => MockGain;
}

describe("playWordSolvedSound", () => {
  let mockOscillator: MockOscillator;
  let mockGain: MockGain;
  let mockAudioContext: ReturnType<typeof vi.fn>;
  const customWindow = window as unknown as {
    AudioContext?: unknown;
    webkitAudioContext?: unknown;
  };

  beforeEach(() => {
    mockOscillator = {
      type: "sine",
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    mockAudioContext = vi.fn().mockImplementation(function (this: MockAudioContextInstance) {
      this.currentTime = 0;
      this.destination = {};
      this.createOscillator = vi.fn().mockReturnValue(mockOscillator);
      this.createGain = vi.fn().mockReturnValue(mockGain);
    });

    customWindow.AudioContext = mockAudioContext;
  });

  afterEach(() => {
    delete customWindow.AudioContext;
  });

  it("creates an audio context and plays notes when called", () => {
    expect(() => playWordSolvedSound()).not.toThrow();
    expect(mockAudioContext).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it("handles absence of AudioContext gracefully without throwing", () => {
    delete customWindow.AudioContext;
    delete customWindow.webkitAudioContext;

    expect(() => playWordSolvedSound()).not.toThrow();
  });
});
