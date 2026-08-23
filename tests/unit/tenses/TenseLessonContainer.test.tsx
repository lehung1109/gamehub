import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TenseLessonContainer } from "@/components/tenses/TenseLessonContainer";
import presentSimpleData from "@/data/tenses/present-simple.json";
import { TenseModuleData } from "@/types/tenses";
import * as storageHelper from "@/lib/tenses/storage";

const mockLessonData = presentSimpleData as unknown as TenseModuleData;

describe("TenseLessonContainer component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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

    // Keyboard navigation with Home key (goes to first tab: rules)
    fireEvent.keyDown(practiceTab, { key: "Home" });
    expect(rulesTab).toHaveAttribute("aria-selected", "true");

    // Keyboard navigation with End key (goes to last tab: practice)
    fireEvent.keyDown(rulesTab, { key: "End" });
    expect(practiceTab).toHaveAttribute("aria-selected", "true");
  });

  it("allows entering Stage 1 (ConjugationStage) and returning back to stage list", () => {
    render(<TenseLessonContainer lessonData={mockLessonData} />);

    const practiceTab = screen.getByRole("tab", { name: /luyện tập 3 chặng/i });
    fireEvent.click(practiceTab);

    // Click "Vào Chặng 1"
    const enterStage1Btn = screen.getByRole("button", { name: /vào chặng 1/i });
    fireEvent.click(enterStage1Btn);

    // Conjugation stage is active
    expect(screen.getByText(/chặng 1 • chia động từ/i)).toBeInTheDocument();
    expect(screen.getByText(/câu 1 \/ 8/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /quay lại/i })).toBeInTheDocument();

    // Click return
    const returnBtn = screen.getByRole("button", { name: /quay lại/i });
    fireEvent.click(returnBtn);

    expect(screen.getByRole("button", { name: /vào chặng 1/i })).toBeInTheDocument();
  });

  it("completes Stage 1 and persists stage progress into storage", () => {
    const saveSpy = vi.spyOn(storageHelper, "saveStageProgress");

    // Create a lesson data with 1 question to easily complete the stage
    const singleItemData: TenseModuleData = {
      ...mockLessonData,
      challenges: {
        ...mockLessonData.challenges,
        conjugation: [mockLessonData.challenges.conjugation[0]],
      },
    };

    render(<TenseLessonContainer lessonData={singleItemData} />);

    // Switch to practice tab
    fireEvent.click(screen.getByRole("tab", { name: /luyện tập 3 chặng/i }));

    // Enter Stage 1
    fireEvent.click(screen.getByRole("button", { name: /vào chặng 1/i }));

    // Answer Q1 correctly
    fireEvent.click(screen.getByRole("button", { name: "meets" }));
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra/i }));

    // Finish Stage 1
    const finishBtn = screen.getByRole("button", { name: /xem kết quả|hoàn thành/i });
    fireEvent.click(finishBtn);

    // Storage is updated
    expect(saveSpy).toHaveBeenCalledWith("present-simple", "conjugation", 1, 1);

    // Returned to stage overview
    expect(screen.getByRole("button", { name: /vào chặng 1/i })).toBeInTheDocument();
  });

  it("navigates from QuickRulesTab CTA into Stage 1 directly", () => {
    render(<TenseLessonContainer lessonData={mockLessonData} />);

    // On Quick Rules tab, click "Bắt đầu luyện tập 3 chặng"
    const startPracticeBtn = screen.getByRole("button", { name: /bắt đầu luyện tập 3 chặng/i });
    fireEvent.click(startPracticeBtn);

    // Directly in Stage 1
    expect(screen.getByText(/chặng 1 • chia động từ/i)).toBeInTheDocument();
    expect(screen.getByText(/câu 1 \/ 8/i)).toBeInTheDocument();
  });

  it("allows entering Stage 2 (ErrorHunterStage) and persisting progress", () => {
    const saveSpy = vi.spyOn(storageHelper, "saveStageProgress");

    const singleItemData: TenseModuleData = {
      ...mockLessonData,
      challenges: {
        ...mockLessonData.challenges,
        errorHunting: [mockLessonData.challenges.errorHunting[0]],
      },
    };

    render(<TenseLessonContainer lessonData={singleItemData} />);

    fireEvent.click(screen.getByRole("tab", { name: /luyện tập 3 chặng/i }));

    // Click "Vào Chặng 2"
    fireEvent.click(screen.getByRole("button", { name: /vào chặng 2/i }));

    // ErrorHunter stage is active
    expect(screen.getByText(/chặng 2 • săn lỗi sai văn phòng/i)).toBeInTheDocument();
    expect(screen.getByText(/câu 1 \/ 1/i)).toBeInTheDocument();

    // Select error token and replacement
    fireEvent.click(screen.getByRole("button", { name: "don't" }));
    fireEvent.click(screen.getByRole("button", { name: "doesn't" }));
    fireEvent.click(screen.getByRole("button", { name: /xác nhận sửa lỗi|kiểm tra/i }));

    // Complete stage
    const finishBtn = screen.getByRole("button", { name: /xem kết quả|hoàn thành/i });
    fireEvent.click(finishBtn);

    expect(saveSpy).toHaveBeenCalledWith("present-simple", "errorHunting", 1, 1);
    expect(screen.getByRole("button", { name: /vào chặng 2/i })).toBeInTheDocument();
  });

  it("allows entering Stage 3 (SentenceBuilderStage) and persisting progress", () => {
    const saveSpy = vi.spyOn(storageHelper, "saveStageProgress");

    const singleItemData: TenseModuleData = {
      ...mockLessonData,
      challenges: {
        ...mockLessonData.challenges,
        sentenceBuilding: [mockLessonData.challenges.sentenceBuilding[0]],
      },
    };

    render(<TenseLessonContainer lessonData={singleItemData} />);

    fireEvent.click(screen.getByRole("tab", { name: /luyện tập 3 chặng/i }));

    // Click "Vào Chặng 3"
    fireEvent.click(screen.getByRole("button", { name: /vào chặng 3/i }));

    // SentenceBuilder stage is active
    expect(screen.getByText(/chặng 3 • ghép câu/i)).toBeInTheDocument();
    expect(screen.getByText(/câu 1 \/ 1/i)).toBeInTheDocument();

    // Place tokens
    singleItemData.challenges.sentenceBuilding[0].correctTokenOrder.forEach((tokText) => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`thêm "${tokText}"`, "i") }));
    });
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra câu|xác nhận/i }));

    // Complete stage
    const finishBtn = screen.getByRole("button", { name: /xem kết quả chặng 3|hoàn thành/i });
    fireEvent.click(finishBtn);

    expect(saveSpy).toHaveBeenCalledWith("present-simple", "sentenceBuilding", 1, 1);
    expect(screen.getByRole("button", { name: /vào chặng 3/i })).toBeInTheDocument();
  });
});
