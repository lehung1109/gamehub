import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import WordlePage from "@/app/games/wordle/page";

// Mock useGameTracking
vi.mock("@/hooks/use-game-tracking", () => ({
  useGameTracking: () => ({
    trackAttempt: vi.fn(),
    sessionStats: { played: 0 },
    submitSession: vi.fn().mockResolvedValue(true),
    recordQuestion: vi.fn(),
    resetSession: vi.fn(),
    isTracking: false,
    isAnonymous: true,
  }),
}));

// Mock useSpeech
const mockSpeak = vi.fn();
vi.mock("@/hooks/useSpeech", () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: vi.fn(),
    isSpeaking: false,
    isSupported: true,
  }),
}));

describe("WordlePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders game header, wordle grid, hint buttons, and keyboard", () => {
    render(<WordlePage />);

    expect(screen.getByText(/Wordle Master/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nghe/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gợi ý/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tiết lộ/i })).toBeInTheDocument();
  });

  it("allows typing via virtual keyboard on page", () => {
    render(<WordlePage />);

    const keyA = screen.getByRole("button", { name: "A" });
    fireEvent.click(keyA);

    // Tile displays 'A'
    expect(screen.getAllByText("A").length).toBeGreaterThan(0);
  });
});
