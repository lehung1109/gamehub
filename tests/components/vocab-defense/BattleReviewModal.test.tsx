import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BattleReviewModal } from "@/components/game/vocab-defense/BattleReviewModal";
import { MissedQuestionReview } from "@/types/vocab-defense";

describe("BattleReviewModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <BattleReviewModal
        isOpen={false}
        isVictory={true}
        score={850}
        stars={3}
        missedQuestions={[]}
        onPlayAgain={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders Victory header, score, XP, and Play Again button", () => {
    const onPlayAgain = vi.fn();
    render(
      <BattleReviewModal
        isOpen={true}
        isVictory={true}
        score={850}
        stars={3}
        missedQuestions={[]}
        onPlayAgain={onPlayAgain}
      />
    );

    expect(screen.getByText("VICTORY!")).toBeInTheDocument();
    expect(screen.getByText("850")).toBeInTheDocument();
    expect(screen.getByText("+170 XP")).toBeInTheDocument();
    expect(screen.getByText("Chúc mừng bạn đã bảo vệ vương quốc thành công!")).toBeInTheDocument();

    const playAgainBtn = screen.getByRole("button", { name: /Chơi Lại/i });
    expect(playAgainBtn).toBeInTheDocument();
    fireEvent.click(playAgainBtn);
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });

  it("renders Defeat header and defeat message when isVictory is false", () => {
    render(
      <BattleReviewModal
        isOpen={true}
        isVictory={false}
        score={200}
        stars={0}
        missedQuestions={[]}
        onPlayAgain={vi.fn()}
      />
    );

    expect(screen.getByText("DEFEAT")).toBeInTheDocument();
    expect(screen.getByText("Đừng nản lòng! Hãy ôn lại các câu hỏi và thử lại nhé!")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("+40 XP")).toBeInTheDocument();
  });

  it("renders missed questions list and triggers audio playback", () => {
    const mockCancel = vi.fn();
    const mockSpeak = vi.fn();
    const mockUtteranceConstructor = vi.fn();

    Object.defineProperty(window, "speechSynthesis", {
      value: {
        cancel: mockCancel,
        speak: mockSpeak,
      },
      writable: true,
      configurable: true,
    });
    (global as unknown as Record<string, unknown>).SpeechSynthesisUtterance = mockUtteranceConstructor;

    const mockMissed: MissedQuestionReview[] = [
      {
        question: {
          id: "q1",
          type: "ATTACK",
          prompt: "Meaning of Knight",
          targetWord: "Knight",
          options: ["Hiệp sĩ", "Rồng", "Phù thủy", "Lâu đài"],
          correctIndex: 0,
          explanation: "'Knight' có nghĩa là hiệp sĩ.",
        },
        selectedAnswer: "Rồng",
        correctAnswer: "Hiệp sĩ",
        timestamp: Date.now(),
      },
    ];

    render(
      <BattleReviewModal
        isOpen={true}
        isVictory={true}
        score={500}
        stars={2}
        missedQuestions={mockMissed}
        onPlayAgain={vi.fn()}
      />
    );

    expect(screen.getByText(/Ôn tập 1 câu đã sai:/i)).toBeInTheDocument();
    expect(screen.getByText("Knight")).toBeInTheDocument();
    expect(screen.getByText("'Knight' có nghĩa là hiệp sĩ.")).toBeInTheDocument();

    const audioButton = screen.getByRole("button", { name: "Phát âm Knight" });
    fireEvent.click(audioButton);

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
  });
});
