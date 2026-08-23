import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CompletionDashboard } from "@/components/tenses/CompletionDashboard";
import { TenseMetadata, TenseUserProgressRecord } from "@/types/tenses";
import presentSimpleData from "@/data/tenses/present-simple.json";

const mockMetadata: TenseMetadata = presentSimpleData.metadata as TenseMetadata;

const mockProgress: TenseUserProgressRecord = {
  tenseId: "present-simple",
  completed: true,
  stageScores: {
    conjugation: { score: 8, total: 8, passed: true, completedAt: new Date().toISOString() },
    errorHunting: { score: 5, total: 6, passed: true, completedAt: new Date().toISOString() },
    sentenceBuilding: { score: 6, total: 6, passed: true, completedAt: new Date().toISOString() },
  },
  totalScore: 19,
  maxPossibleScore: 20,
  accuracyPercentage: 95,
  lastStudiedAt: new Date().toISOString(),
};

describe("CompletionDashboard component", () => {
  it("renders congratulatory header, tense names, and overall score badges", () => {
    render(
      <CompletionDashboard
        tenseMetadata={mockMetadata}
        progress={mockProgress}
        onReplayStage={vi.fn()}
      />
    );

    // Congratulatory heading
    expect(
      screen.getByRole("heading", { name: /chúc mừng bạn đã hoàn thành/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(mockMetadata.vietnameseName, "i")).length).toBeGreaterThan(0);

    // Accuracy Percentage
    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByText(/19/i)).toBeInTheDocument();
  });

  it("renders stage-by-stage score breakdown with replay buttons for each stage", () => {
    const handleReplayStage = vi.fn();

    render(
      <CompletionDashboard
        tenseMetadata={mockMetadata}
        progress={mockProgress}
        onReplayStage={handleReplayStage}
      />
    );

    // Chặng 1, 2, 3 breakdown
    expect(screen.getAllByText(/chặng 1/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/\/ 8 câu đúng/i)).toBeInTheDocument();

    expect(screen.getAllByText(/chặng 2/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\/ 6 câu đúng/i).length).toBe(2);

    expect(screen.getAllByText(/chặng 3/i).length).toBeGreaterThan(0);

    // Replay buttons
    const replayStage1Btn = screen.getByRole("button", { name: /luyện lại chặng 1/i });
    fireEvent.click(replayStage1Btn);
    expect(handleReplayStage).toHaveBeenCalledWith("conjugation");

    const replayStage2Btn = screen.getByRole("button", { name: /luyện lại chặng 2/i });
    fireEvent.click(replayStage2Btn);
    expect(handleReplayStage).toHaveBeenCalledWith("errorHunting");

    const replayStage3Btn = screen.getByRole("button", { name: /luyện lại chặng 3/i });
    fireEvent.click(replayStage3Btn);
    expect(handleReplayStage).toHaveBeenCalledWith("sentenceBuilding");
  });

  it("renders reset all and return to hub action buttons", () => {
    const handleResetAll = vi.fn();
    const handleReturnToHub = vi.fn();

    render(
      <CompletionDashboard
        tenseMetadata={mockMetadata}
        progress={mockProgress}
        onReplayStage={vi.fn()}
        onResetAll={handleResetAll}
        onReturnToHub={handleReturnToHub}
      />
    );

    const resetAllBtn = screen.getByRole("button", { name: /luyện tập lại từ đầu|làm lại tất cả/i });
    fireEvent.click(resetAllBtn);
    expect(handleResetAll).toHaveBeenCalledTimes(1);

    const returnBtn = screen.getByRole("button", { name: /quay về hub 12 thì|về danh sách/i });
    fireEvent.click(returnBtn);
    expect(handleReturnToHub).toHaveBeenCalledTimes(1);
  });

  it("displays workplace takeaways and recommendations", () => {
    render(
      <CompletionDashboard
        tenseMetadata={mockMetadata}
        progress={mockProgress}
        onReplayStage={vi.fn()}
      />
    );

    expect(screen.getByText(/ghi nhớ cốt lõi/i)).toBeInTheDocument();
  });
});
