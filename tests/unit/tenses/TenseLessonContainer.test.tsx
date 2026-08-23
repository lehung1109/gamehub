import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TenseLessonContainer } from "@/components/tenses/TenseLessonContainer";
import presentSimpleData from "@/data/tenses/present-simple.json";
import { TenseModuleData } from "@/types/tenses";

const mockLessonData = presentSimpleData as unknown as TenseModuleData;

describe("TenseLessonContainer component", () => {
  it("renders LessonHeader, tab triggers, and initial view", () => {
    render(<TenseLessonContainer lessonData={mockLessonData} />);

    // Header elements
    expect(screen.getByRole("heading", { level: 1, name: /thì hiện tại đơn/i })).toBeInTheDocument();
    
    // Tab triggers
    const rulesTab = screen.getByRole("tab", { name: /quy tắc cốt lõi/i });
    const practiceTab = screen.getByRole("tab", { name: /luyện tập 3 chặng/i });
    expect(rulesTab).toBeInTheDocument();
    expect(practiceTab).toBeInTheDocument();
  });

  it("switches tabs between Quick Rules and Practice Challenges via click and keyboard", () => {
    render(<TenseLessonContainer lessonData={mockLessonData} />);

    const rulesTab = screen.getByRole("tab", { name: /quy tắc cốt lõi/i });
    const practiceTab = screen.getByRole("tab", { name: /luyện tập 3 chặng/i });

    // Click Practice Tab
    fireEvent.click(practiceTab);
    expect(practiceTab).toHaveAttribute("aria-selected", "true");

    // Keyboard navigation with ArrowLeft
    fireEvent.keyDown(practiceTab, { key: "ArrowLeft" });
    expect(rulesTab).toHaveAttribute("aria-selected", "true");

    // Keyboard navigation with ArrowRight
    fireEvent.keyDown(rulesTab, { key: "ArrowRight" });
    expect(practiceTab).toHaveAttribute("aria-selected", "true");
  });

  it("allows entering a stage and returning back to stage list", () => {
    render(<TenseLessonContainer lessonData={mockLessonData} />);

    const practiceTab = screen.getByRole("tab", { name: /luyện tập 3 chặng/i });
    fireEvent.click(practiceTab);

    // Click "Vào Chặng 1"
    const enterStage1Btn = screen.getByRole("button", { name: /vào chặng 1/i });
    fireEvent.click(enterStage1Btn);

    expect(screen.getByRole("button", { name: /quay lại danh sách chặng/i })).toBeInTheDocument();
    expect(screen.getByText(/8 câu hỏi thực chiến/i)).toBeInTheDocument();

    // Click return
    const returnBtn = screen.getByRole("button", { name: /quay lại danh sách chặng/i });
    fireEvent.click(returnBtn);

    expect(screen.getByRole("button", { name: /vào chặng 1/i })).toBeInTheDocument();
  });
});
