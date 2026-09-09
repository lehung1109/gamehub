import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WordRainSummaryModal } from "@/components/game/falling-words/WordRainSummaryModal";

const mockSpeak = vi.fn();
vi.mock("@/hooks/useSpeech", () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: vi.fn(),
    isSpeaking: false,
    isSupported: true,
  }),
}));

describe("WordRainSummaryModal Component", () => {
  const sampleWords = [
    { word: "ELEPHANT", clue: "Con voi", phonetic: "/ˈelɪfənt/", emoji: "🐘" },
    { word: "TIGER", clue: "Con hổ", phonetic: "/ˈtaɪɡər/", emoji: "🐯" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <WordRainSummaryModal
        isOpen={false}
        isVictory={true}
        score={1350}
        combo={12}
        lives={3}
        wordsPopped={sampleWords}
        onRestart={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog with 3 stars when score >= 1200 and 3 lives intact", () => {
    const { container } = render(
      <WordRainSummaryModal
        isOpen={true}
        isVictory={true}
        score={1350}
        combo={12}
        lives={3}
        wordsPopped={sampleWords}
        onRestart={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "summary-title");

    expect(screen.getByText(/hoàn thành thử thách/i)).toBeInTheDocument();
    expect(screen.getByText("1350")).toBeInTheDocument();
    expect(screen.getByText("12x")).toBeInTheDocument();
    expect(screen.getByText("ELEPHANT")).toBeInTheDocument();
    expect(screen.getByText("TIGER")).toBeInTheDocument();
    expect(screen.getByText("/ˈelɪfənt/")).toBeInTheDocument();
    expect(screen.getByText(/— Con voi/i)).toBeInTheDocument();

    // 3 stars filled: look for amber fill class
    const filledStars = container.querySelectorAll(".fill-amber-400");
    expect(filledStars.length).toBe(3);
  });

  it("renders dialog with 2 stars when score >= 700 and lives >= 1", () => {
    const { container } = render(
      <WordRainSummaryModal
        isOpen={true}
        isVictory={false}
        score={800}
        combo={5}
        lives={1}
        wordsPopped={sampleWords}
        onRestart={vi.fn()}
      />
    );

    expect(screen.getByText(/hết mạng/i)).toBeInTheDocument();
    const filledStars = container.querySelectorAll(".fill-amber-400");
    expect(filledStars.length).toBe(2);
  });

  it("renders dialog with 1 star when score > 0 but not meeting 2 stars", () => {
    const { container } = render(
      <WordRainSummaryModal
        isOpen={true}
        isVictory={false}
        score={500}
        combo={3}
        lives={0}
        wordsPopped={sampleWords}
        onRestart={vi.fn()}
      />
    );

    const filledStars = container.querySelectorAll(".fill-amber-400");
    expect(filledStars.length).toBe(1);
  });

  it("renders dialog with 0 stars when score is 0", () => {
    const { container } = render(
      <WordRainSummaryModal
        isOpen={true}
        isVictory={false}
        score={0}
        combo={0}
        lives={0}
        wordsPopped={[]}
        onRestart={vi.fn()}
      />
    );

    const filledStars = container.querySelectorAll(".fill-amber-400");
    expect(filledStars.length).toBe(0);
  });

  it("triggers onRestart when play again button is clicked", () => {
    const onRestart = vi.fn();
    render(
      <WordRainSummaryModal
        isOpen={true}
        isVictory={false}
        score={300}
        combo={2}
        lives={0}
        wordsPopped={[]}
        onRestart={onRestart}
      />
    );

    const restartBtn = screen.getByRole("button", { name: /chơi lại/i });
    expect(restartBtn).toHaveClass("min-h-[44px]");
    fireEvent.click(restartBtn);
    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it("plays pronunciation speech when clicking the speaker button for a word", () => {
    render(
      <WordRainSummaryModal
        isOpen={true}
        isVictory={true}
        score={1500}
        combo={15}
        lives={3}
        wordsPopped={sampleWords}
        onRestart={vi.fn()}
      />
    );

    const speakElephantBtn = screen.getByRole("button", { name: /phát âm elephant/i });
    expect(speakElephantBtn).toHaveClass("min-h-[44px]");
    expect(speakElephantBtn).toHaveClass("min-w-[44px]");
    fireEvent.click(speakElephantBtn);
    expect(mockSpeak).toHaveBeenCalledWith("ELEPHANT");

    const speakTigerBtn = screen.getByRole("button", { name: /phát âm tiger/i });
    fireEvent.click(speakTigerBtn);
    expect(mockSpeak).toHaveBeenCalledWith("TIGER");
  });

  it("complies with typography constraint (no sub-16px text classes)", () => {
    const { container } = render(
      <WordRainSummaryModal
        isOpen={true}
        isVictory={true}
        score={1350}
        combo={12}
        lives={3}
        wordsPopped={sampleWords}
        onRestart={vi.fn()}
      />
    );

    const allElements = container.querySelectorAll("*");
    allElements.forEach((el) => {
      const classList = Array.from(el.classList);
      for (const cls of classList) {
        expect(cls).not.toMatch(/^text-(xs|sm|\[1[0-4]px\])$/);
      }
    });
  });
});
