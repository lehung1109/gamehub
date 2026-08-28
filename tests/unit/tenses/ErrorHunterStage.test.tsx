import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrorHunterStage } from "@/components/tenses/stages/ErrorHunterStage";
import { ErrorHunterItem } from "@/types/tenses";
import presentSimpleData from "@/data/tenses/present-simple.json";

const mockItems: ErrorHunterItem[] = presentSimpleData.challenges.errorHunting as ErrorHunterItem[];

vi.mock("@/hooks/useSessionQuestions", () => ({
  useSessionQuestions: (items: unknown[], count: number) => items.slice(0, count),
}));

describe("ErrorHunterStage (Stage 2)", () => {
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();

    class MockSpeechSynthesisUtterance {
      text: string;
      lang = "en-US";
      rate = 1;
      pitch = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor(text: string) {
        this.text = text;
      }
    }

    Object.defineProperty(window, "speechSynthesis", {
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        speaking: false,
      },
      configurable: true,
      writable: true,
    });

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: MockSpeechSynthesisUtterance,
      configurable: true,
      writable: true,
    });
  });

  it("renders the first question with scenario, token chips, and vietnamese meaning", () => {
    render(<ErrorHunterStage items={mockItems} onStageComplete={vi.fn()} />);

    // Header & Question counter
    expect(screen.getByText(/chặng 2 • săn lỗi sai văn phòng/i)).toBeInTheDocument();
    expect(screen.getByText(/câu 1 \/ (6|10)/i)).toBeInTheDocument();
    expect(screen.getByText(mockItems[0].scenarioVi)).toBeInTheDocument();

    // Vietnamese Meaning
    expect(screen.getByText(new RegExp(mockItems[0].vietnameseMeaning, "i"))).toBeInTheDocument();

    // Tokens rendered as buttons/chips
    // Tokens: ["She", "don't", "agree", "with", "the", "client's", "new", "proposal."]
    expect(screen.getByRole("button", { name: "She" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "don't" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "agree" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "proposal." })).toBeInTheDocument();
  });

  it("displays helpful feedback when user clicks a correct token (non-error token)", () => {
    render(<ErrorHunterStage items={mockItems} onStageComplete={vi.fn()} />);

    // Click "She" (index 0 - not the error token)
    const tokenShe = screen.getByRole("button", { name: "She" });
    fireEvent.click(tokenShe);

    // Should indicate that "She" is correct and suggest looking elsewhere
    expect(
      screen.getByText(/từ này đã đúng ngữ pháp|vị trí này không có lỗi/i)
    ).toBeInTheDocument();

    // Replacement options should not appear yet
    expect(screen.queryByText(/chọn phương án sửa đúng/i)).not.toBeInTheDocument();
  });

  it("opens correction options when clicking the error token", () => {
    render(<ErrorHunterStage items={mockItems} onStageComplete={vi.fn()} />);

    // Click "don't" (index 1 - error token)
    const tokenDont = screen.getByRole("button", { name: "don't" });
    fireEvent.click(tokenDont);

    // Replacement options should now be visible
    expect(screen.getByText(/chọn phương án sửa đúng/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "doesn't" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "isn't" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "not" })).toBeInTheDocument();
  });

  it("disables Submit button until a replacement option is selected", () => {
    render(<ErrorHunterStage items={mockItems} onStageComplete={vi.fn()} />);

    // Click error token
    fireEvent.click(screen.getByRole("button", { name: "don't" }));

    const submitBtn = screen.getByRole("button", { name: /kiểm tra|xác nhận sửa/i });
    expect(submitBtn).toBeDisabled();

    // Select replacement "doesn't"
    const optionDoesnt = screen.getByRole("button", { name: "doesn't" });
    fireEvent.click(optionDoesnt);

    expect(submitBtn).not.toBeDisabled();
  });

  it("evaluates correct token selection and correct replacement, awards points, and displays explanations", () => {
    render(<ErrorHunterStage items={mockItems} onStageComplete={vi.fn()} />);

    // Select error token "don't"
    fireEvent.click(screen.getByRole("button", { name: "don't" }));

    // Select correct replacement "doesn't"
    fireEvent.click(screen.getByRole("button", { name: "doesn't" }));

    // Submit
    const submitBtn = screen.getByRole("button", { name: /kiểm tra|xác nhận sửa/i });
    fireEvent.click(submitBtn);

    // Feedback
    expect(screen.getByText(/chính xác! \(\+10 điểm\)/i)).toBeInTheDocument();

    // Explanations: whyWrongVi and workplaceImpactVi
    expect(screen.getByText(new RegExp(mockItems[0].explanation.whyWrongVi, "i"))).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(mockItems[0].explanation.workplaceImpactVi, "i"))
    ).toBeInTheDocument();

    // Full corrected sentence is displayed
    expect(screen.getByText(mockItems[0].fullCorrectSentence)).toBeInTheDocument();

    // Next button appears
    expect(screen.getByRole("button", { name: /câu tiếp theo/i })).toBeInTheDocument();
  });

  it("evaluates incorrect replacement choice, shows correct token and explanations without awarding points", () => {
    render(<ErrorHunterStage items={mockItems} onStageComplete={vi.fn()} />);

    // Select error token "don't"
    fireEvent.click(screen.getByRole("button", { name: "don't" }));

    // Select wrong replacement "isn't"
    fireEvent.click(screen.getByRole("button", { name: "isn't" }));

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra|xác nhận sửa/i }));

    // Feedback
    expect(screen.getByText(/chưa chính xác/i)).toBeInTheDocument();
    expect(screen.getByText(/sửa đúng là:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/doesn't/i).length).toBeGreaterThan(0);

    // Explanations still shown for learning
    expect(screen.getByText(new RegExp(mockItems[0].explanation.whyWrongVi, "i"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /câu tiếp theo/i })).toBeInTheDocument();
  });

  it("advances to the next question when clicking 'Câu tiếp theo'", () => {
    render(<ErrorHunterStage items={mockItems} onStageComplete={vi.fn()} />);

    // Solve Q1
    fireEvent.click(screen.getByRole("button", { name: "don't" }));
    fireEvent.click(screen.getByRole("button", { name: "doesn't" }));
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra|xác nhận sửa/i }));

    // Click Next
    fireEvent.click(screen.getByRole("button", { name: /câu tiếp theo/i }));

    // Should be on Q2
    expect(screen.getByText(/câu 2 \/ (6|10)/i)).toBeInTheDocument();
    expect(screen.getByText(mockItems[1].scenarioVi)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "attend" })).toBeInTheDocument();
  });

  it("calls onStageComplete with final score and total upon completing the final question", () => {
    const handleStageComplete = vi.fn();
    const shortItems = mockItems.slice(0, 2);

    render(<ErrorHunterStage items={shortItems} onStageComplete={handleStageComplete} />);

    // Q1: Correct
    fireEvent.click(screen.getByRole("button", { name: "don't" }));
    fireEvent.click(screen.getByRole("button", { name: "doesn't" }));
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra|xác nhận sửa/i }));
    fireEvent.click(screen.getByRole("button", { name: /câu tiếp theo/i }));

    // Q2: Incorrect (select wrong replacement "is attending" for "attend")
    fireEvent.click(screen.getByRole("button", { name: "attend" }));
    fireEvent.click(screen.getByRole("button", { name: "is attending" }));
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra|xác nhận sửa/i }));

    // Finish button on last question
    const finishBtn = screen.getByRole("button", { name: /xem kết quả chặng 2|hoàn thành/i });
    fireEvent.click(finishBtn);

    // Score is 1 correct out of 2
    expect(handleStageComplete).toHaveBeenCalledWith(1, 2, expect.any(Array));
  });

  it("plays pronunciation of full corrected sentence using Web Speech API", () => {
    render(<ErrorHunterStage items={mockItems} onStageComplete={vi.fn()} />);

    // Solve Q1
    fireEvent.click(screen.getByRole("button", { name: "don't" }));
    fireEvent.click(screen.getByRole("button", { name: "doesn't" }));
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra|xác nhận sửa/i }));

    const speakBtn = screen.getByRole("button", { name: /nghe phát âm câu chuẩn/i });
    fireEvent.click(speakBtn);

    expect(mockSpeak).toHaveBeenCalled();
  });

  it("calls onBack when clicking back button", () => {
    const handleBack = vi.fn();
    render(<ErrorHunterStage items={mockItems} onStageComplete={vi.fn()} onBack={handleBack} />);

    const backBtn = screen.getByRole("button", { name: /quay lại/i });
    fireEvent.click(backBtn);

    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("renders graceful empty state when items list is empty", () => {
    render(<ErrorHunterStage items={[]} onStageComplete={vi.fn()} />);

    expect(screen.getByText(/không có câu hỏi bài tập/i)).toBeInTheDocument();
  });
});
