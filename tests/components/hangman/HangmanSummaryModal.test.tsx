import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HangmanSummaryModal } from "@/components/game/hangman/HangmanSummaryModal";
import { HangmanRoundHistory } from "@/types/hangman";

const mockSpeak = vi.fn();
vi.mock("@/hooks/useSpeech", () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: vi.fn(),
    isSpeaking: false,
    isSupported: true,
  }),
}));

describe("HangmanSummaryModal Component", () => {
  const sampleHistory: HangmanRoundHistory[] = [
    {
      word: { id: "cat", word: "CAT", clue: "Con mèo", phonetic: "/kæt/", emoji: "🐱" },
      solved: true,
      mistakes: 0,
      score: 380,
    },
    {
      word: { id: "dog", word: "DOG", clue: "Con chó", phonetic: "/dɒɡ/", emoji: "🐶" },
      solved: true,
      mistakes: 1,
      score: 330,
    },
    {
      word: { id: "pig", word: "PIG", clue: "Con heo", phonetic: "/pɪɡ/", emoji: "🐷" },
      solved: true,
      mistakes: 0,
      score: 380,
    },
    {
      word: { id: "duck", word: "DUCK", clue: "Con vịt", phonetic: "/dʌk/", emoji: "🦆" },
      solved: true,
      mistakes: 0,
      score: 380,
    },
    {
      word: { id: "fish", word: "FISH", clue: "Con cá", phonetic: "/fɪʃ/", emoji: "🐟" },
      solved: true,
      mistakes: 0,
      score: 380,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <HangmanSummaryModal
        isOpen={false}
        score={1850}
        history={sampleHistory}
        onRestart={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog with ARIA attributes when isOpen is true", () => {
    render(
      <HangmanSummaryModal
        isOpen={true}
        score={1850}
        history={sampleHistory}
        onRestart={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "summary-title");
    expect(screen.getByText(/giải cứu thành công/i)).toBeInTheDocument();
  });

  it("renders 3 stars for score >= 1200 and 5/5 solved with perfect round subtitle", () => {
    const { container } = render(
      <HangmanSummaryModal
        isOpen={true}
        score={1850}
        history={sampleHistory}
        onRestart={vi.fn()}
      />
    );

    expect(screen.getByText("1850")).toBeInTheDocument();
    expect(screen.getByText("5/5")).toBeInTheDocument();
    expect(
      screen.getByText("Xuất sắc! Bạn đã giải cứu nhà thám hiểm qua toàn bộ 5 từ vựng!")
    ).toBeInTheDocument();

    const filledStars = container.querySelectorAll(".fill-amber-400");
    expect(filledStars.length).toBe(3);
  });

  it("renders 2 stars for score >= 700 and at least 3 solved", () => {
    const history3Solved: HangmanRoundHistory[] = [
      { ...sampleHistory[0], solved: true, score: 380 },
      { ...sampleHistory[1], solved: true, score: 330 },
      { ...sampleHistory[2], solved: true, score: 200 },
      { ...sampleHistory[3], solved: false, mistakes: 6, score: 0 },
      { ...sampleHistory[4], solved: false, mistakes: 6, score: 0 },
    ];

    const { container } = render(
      <HangmanSummaryModal
        isOpen={true}
        score={910}
        history={history3Solved}
        onRestart={vi.fn()}
      />
    );

    expect(screen.getByText("🎉 Giải Cứu Thành Công!")).toBeInTheDocument();
    expect(screen.getByText("910")).toBeInTheDocument();
    expect(screen.getByText("3/5")).toBeInTheDocument();
    expect(
      screen.getByText("Bạn đã đoán đúng 3/5 từ. Cố gắng bảo toàn nhiều bóng bay hơn nhé!")
    ).toBeInTheDocument();

    const filledStars = container.querySelectorAll(".fill-amber-400");
    expect(filledStars.length).toBe(2);
  });

  it("renders 1 star for score > 0 but fewer than 3 solved", () => {
    const history1Solved: HangmanRoundHistory[] = [
      { ...sampleHistory[0], solved: true, score: 300 },
      { ...sampleHistory[1], solved: false, mistakes: 6, score: 0 },
      { ...sampleHistory[2], solved: false, mistakes: 6, score: 0 },
      { ...sampleHistory[3], solved: false, mistakes: 6, score: 0 },
      { ...sampleHistory[4], solved: false, mistakes: 6, score: 0 },
    ];

    const { container } = render(
      <HangmanSummaryModal
        isOpen={true}
        score={300}
        history={history1Solved}
        onRestart={vi.fn()}
      />
    );

    expect(screen.getByText("🪂 Hoàn Thành Thử Thách!")).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument();
    expect(screen.getByText("1/5")).toBeInTheDocument();
    expect(
      screen.getByText("Bạn đã đoán đúng 1/5 từ. Cố gắng bảo toàn nhiều bóng bay hơn nhé!")
    ).toBeInTheDocument();

    const filledStars = container.querySelectorAll(".fill-amber-400");
    expect(filledStars.length).toBe(1);
  });

  it("renders 0 stars when score is 0 and 0 solved", () => {
    const history0Solved: HangmanRoundHistory[] = [
      { ...sampleHistory[0], solved: false, mistakes: 6, score: 0 },
      { ...sampleHistory[1], solved: false, mistakes: 6, score: 0 },
      { ...sampleHistory[2], solved: false, mistakes: 6, score: 0 },
      { ...sampleHistory[3], solved: false, mistakes: 6, score: 0 },
      { ...sampleHistory[4], solved: false, mistakes: 6, score: 0 },
    ];

    const { container } = render(
      <HangmanSummaryModal
        isOpen={true}
        score={0}
        history={history0Solved}
        onRestart={vi.fn()}
      />
    );

    expect(screen.getByText("🪂 Hoàn Thành Thử Thách!")).toBeInTheDocument();
    expect(screen.getByText("0/5")).toBeInTheDocument();

    const filledStars = container.querySelectorAll(".fill-amber-400");
    expect(filledStars.length).toBe(0);
  });

  it("renders word review list with emoji, word, phonetic, clue and handles pronunciation replay", () => {
    render(
      <HangmanSummaryModal
        isOpen={true}
        score={1850}
        history={sampleHistory}
        onRestart={vi.fn()}
      />
    );

    expect(screen.getByText("📖 Ôn tập từ vựng (5 từ)")).toBeInTheDocument();
    expect(screen.getByText("CAT")).toBeInTheDocument();
    expect(screen.getByText("/kæt/")).toBeInTheDocument();
    expect(screen.getByText("— Con mèo")).toBeInTheDocument();
    expect(screen.getByText("🐱")).toBeInTheDocument();

    const speakCatBtn = screen.getByRole("button", { name: /phát âm cat/i });
    expect(speakCatBtn).toHaveClass("min-h-[44px]");
    expect(speakCatBtn).toHaveClass("min-w-[44px]");
    fireEvent.click(speakCatBtn);
    expect(mockSpeak).toHaveBeenCalledWith("CAT");

    const speakDogBtn = screen.getByRole("button", { name: /phát âm dog/i });
    fireEvent.click(speakDogBtn);
    expect(mockSpeak).toHaveBeenCalledWith("DOG");
  });

  it("triggers onRestart when play again button is clicked and has min 44px height", () => {
    const onRestart = vi.fn();
    render(
      <HangmanSummaryModal
        isOpen={true}
        score={500}
        history={sampleHistory.slice(0, 2)}
        onRestart={onRestart}
      />
    );

    const replayBtn = screen.getByRole("button", { name: /thử thách vòng mới/i });
    expect(replayBtn).toBeInTheDocument();
    expect(replayBtn).toHaveClass("min-h-[44px]");
    fireEvent.click(replayBtn);
    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it("complies with typography constraint (no sub-16px text classes)", () => {
    const { container } = render(
      <HangmanSummaryModal
        isOpen={true}
        score={1850}
        history={sampleHistory}
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
