import { describe, it, expect, afterEach } from "vitest";
import { isSpeechSupported } from "@/lib/speech-check";

describe("speech-check utility", () => {
  const originalSpeechSynthesis = window.speechSynthesis;
  const originalUtterance = window.SpeechSynthesisUtterance;

  afterEach(() => {
    Object.defineProperty(window, "speechSynthesis", {
      value: originalSpeechSynthesis,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: originalUtterance,
      configurable: true,
      writable: true,
    });
  });

  it("returns true when speechSynthesis and SpeechSynthesisUtterance are supported", () => {
    Object.defineProperty(window, "speechSynthesis", {
      value: {},
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: function () {},
      configurable: true,
      writable: true,
    });

    expect(isSpeechSupported()).toBe(true);
  });

  it("returns false when speechSynthesis is not available", () => {
    Object.defineProperty(window, "speechSynthesis", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(isSpeechSupported()).toBe(false);
  });
});
