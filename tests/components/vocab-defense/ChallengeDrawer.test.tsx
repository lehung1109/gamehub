import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChallengeDrawer } from "@/components/game/vocab-defense/ChallengeDrawer";
import { ActionDock } from "@/components/game/vocab-defense/ActionDock";
import { FeedbackOverlay } from "@/components/game/vocab-defense/FeedbackOverlay";
import { ChallengeQuestion } from "@/types/vocab-defense";

const mockAttackQuestion: ChallengeQuestion = {
  id: "test-1",
  type: "ATTACK",
  prompt: "What is the meaning of 'Adventure'?",
  targetWord: "Adventure",
  options: ["Thám hiểm", "Nghỉ ngơi", "Nấu ăn", "Ngủ"],
  correctIndex: 0,
  explanation: "'Adventure' có nghĩa là thám hiểm, phiêu lưu.",
};

const mockShieldQuestion: ChallengeQuestion = {
  id: "test-2",
  type: "SHIELD",
  prompt: "Nghe và chọn từ đúng:",
  targetWord: "Castle",
  options: ["Castle", "Cattle", "Bottle", "Battle"],
  correctIndex: 0,
  explanation: "'Castle' có nghĩa là lâu đài.",
};

const mockUltimateQuestion: ChallengeQuestion = {
  id: "test-3",
  type: "ULTIMATE",
  prompt: "Điền từ vào chỗ trống: She ___ to school yesterday.",
  targetWord: "went",
  options: ["go", "went", "gone", "going"],
  correctIndex: 1,
  explanation: "Thì quá khứ đơn của go là went.",
};

describe("ChallengeDrawer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders prompt and 4 options", () => {
    render(
      <ChallengeDrawer
        question={mockAttackQuestion}
        onSelectAnswer={vi.fn()}
        disabled={false}
      />
    );

    expect(screen.getByText("What is the meaning of 'Adventure'?")).toBeInTheDocument();
    expect(screen.getByText("Thám hiểm")).toBeInTheDocument();
    expect(screen.getByText("Nghỉ ngơi")).toBeInTheDocument();
    expect(screen.getByText("Nấu ăn")).toBeInTheDocument();
    expect(screen.getByText("Ngủ")).toBeInTheDocument();
    expect(screen.getByText(/Thử thách Từ vựng/i)).toBeInTheDocument();
  });

  it("calls onSelectAnswer with option index when clicked", () => {
    const handleSelect = vi.fn();
    render(
      <ChallengeDrawer
        question={mockAttackQuestion}
        onSelectAnswer={handleSelect}
        disabled={false}
      />
    );

    fireEvent.click(screen.getByText("Thám hiểm"));
    expect(handleSelect).toHaveBeenCalledWith(0);
  });

  it("disables option buttons when disabled is true", () => {
    const handleSelect = vi.fn();
    render(
      <ChallengeDrawer
        question={mockAttackQuestion}
        onSelectAnswer={handleSelect}
        disabled={true}
      />
    );

    const btn = screen.getByRole("button", { name: /Thám hiểm/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("triggers speech synthesis when question is SHIELD type and on replay click", () => {
    const mockCancel = vi.fn();
    const mockSpeak = vi.fn();
    const mockUtteranceConstructor = vi.fn();

    // Mock SpeechSynthesis in window
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        cancel: mockCancel,
        speak: mockSpeak,
      },
      writable: true,
      configurable: true,
    });
    (global as unknown as Record<string, unknown>).SpeechSynthesisUtterance = mockUtteranceConstructor;

    render(
      <ChallengeDrawer
        question={mockShieldQuestion}
        onSelectAnswer={vi.fn()}
        disabled={false}
      />
    );

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();

    const replayBtn = screen.getByRole("button", { name: /Nghe lại âm thanh/i });
    fireEvent.click(replayBtn);
    expect(mockSpeak).toHaveBeenCalledTimes(2);
  });

  it("renders ULTIMATE challenge header appropriately", () => {
    render(
      <ChallengeDrawer
        question={mockUltimateQuestion}
        onSelectAnswer={vi.fn()}
        disabled={false}
      />
    );

    expect(screen.getByText(/Thử thách Ngữ pháp/i)).toBeInTheDocument();
  });
});

describe("ActionDock Component", () => {
  it("renders 3 skill options with their details", () => {
    render(
      <ActionDock
        heroEnergy={50}
        onSelectSkill={vi.fn()}
        disabled={false}
      />
    );

    expect(screen.getByText(/Tấn Công Thường/i)).toBeInTheDocument();
    expect(screen.getByText(/Thủ Hộ & Hồi Máu/i)).toBeInTheDocument();
    expect(screen.getByText(/Tuyệt Chiêu Rồng/i)).toBeInTheDocument();
    expect(screen.getByText("Cần 100 Nộ (50/100)")).toBeInTheDocument();
  });

  it("calls onSelectSkill when clicked", () => {
    const handleSelectSkill = vi.fn();
    render(
      <ActionDock
        heroEnergy={100}
        onSelectSkill={handleSelectSkill}
        disabled={false}
      />
    );

    fireEvent.click(screen.getByText(/Tấn Công Thường/i));
    expect(handleSelectSkill).toHaveBeenCalledWith("ATTACK");

    fireEvent.click(screen.getByText(/Thủ Hộ & Hồi Máu/i));
    expect(handleSelectSkill).toHaveBeenCalledWith("SHIELD");

    fireEvent.click(screen.getByText(/Tuyệt Chiêu Rồng/i));
    expect(handleSelectSkill).toHaveBeenCalledWith("ULTIMATE");
  });

  it("handles keyboard shortcuts 1, 2, 3", () => {
    const handleSelectSkill = vi.fn();
    render(
      <ActionDock
        heroEnergy={100}
        onSelectSkill={handleSelectSkill}
        disabled={false}
      />
    );

    fireEvent.keyDown(window, { key: "1" });
    expect(handleSelectSkill).toHaveBeenCalledWith("ATTACK");

    fireEvent.keyDown(window, { key: "2" });
    expect(handleSelectSkill).toHaveBeenCalledWith("SHIELD");

    fireEvent.keyDown(window, { key: "3" });
    expect(handleSelectSkill).toHaveBeenCalledWith("ULTIMATE");
  });

  it("locks ultimate if heroEnergy < 100", () => {
    const handleSelectSkill = vi.fn();
    render(
      <ActionDock
        heroEnergy={80}
        onSelectSkill={handleSelectSkill}
        disabled={false}
      />
    );

    const ultBtn = screen.getByRole("button", { name: /Tuyệt Chiêu Rồng/i });
    expect(ultBtn).toBeDisabled();

    fireEvent.click(ultBtn);
    expect(handleSelectSkill).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "3" });
    expect(handleSelectSkill).not.toHaveBeenCalled();
  });

  it("disables all skills when disabled prop is true", () => {
    const handleSelectSkill = vi.fn();
    render(
      <ActionDock
        heroEnergy={100}
        onSelectSkill={handleSelectSkill}
        disabled={true}
      />
    );

    fireEvent.keyDown(window, { key: "1" });
    expect(handleSelectSkill).not.toHaveBeenCalled();
  });
});

describe("FeedbackOverlay Component", () => {
  it("renders success feedback correctly", () => {
    render(
      <FeedbackOverlay
        isCorrect={true}
        explanation="'Adventure' có nghĩa là phiêu lưu."
      />
    );

    expect(screen.getByText(/Chính xác! Đòn đánh thành công!/i)).toBeInTheDocument();
    expect(screen.getByText("'Adventure' có nghĩa là phiêu lưu.")).toBeInTheDocument();
  });

  it("renders defeat / incorrect feedback correctly", () => {
    render(
      <FeedbackOverlay
        isCorrect={false}
      />
    );

    expect(screen.getByText(/Chưa chính xác! Quái vật phản công!/i)).toBeInTheDocument();
  });
});
