import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConjugationStage } from "@/components/tenses/stages/ConjugationStage";
import { ConjugationItem } from "@/types/tenses";
import presentSimpleData from "@/data/tenses/present-simple.json";

vi.mock("@/hooks/useSessionQuestions", () => ({
  useSessionQuestions: vi.fn((items, count) => items.slice(0, count)),
}));

const mockItems: ConjugationItem[] = presentSimpleData.challenges.conjugation as ConjugationItem[];

describe("ConjugationStage (Stage 1)", () => {
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

  it("renders the first question with workplace context, scenario, and base verb", () => {
    render(<ConjugationStage items={mockItems} onStageComplete={vi.fn()} />);

    // Question counter
    expect(screen.getByText(/câu 1 \/ (8|10)/i)).toBeInTheDocument();

    // Context metadata
    expect(screen.getByText(mockItems[0].scenarioVi)).toBeInTheDocument();
    expect(screen.getByText(/Weekly Sprint Planning Meeting/i)).toBeInTheDocument();
    expect(screen.getByText(/Minh Le/i)).toBeInTheDocument();

    // Sentence fragments & base verb
    expect(screen.getByText(/Our team/i)).toBeInTheDocument();
    expect(screen.getByText(/every Monday morning/i)).toBeInTheDocument();
    expect(screen.getByText(/Động từ nguyên thể:/i)).toBeInTheDocument();

    // Multiple-choice options
    expect(screen.getByRole("button", { name: "meets" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "meet" })).toBeInTheDocument();
  });

  it("disables Submit button when no answer is provided", () => {
    render(<ConjugationStage items={mockItems} onStageComplete={vi.fn()} />);

    const submitBtn = screen.getByRole("button", { name: /kiểm tra/i });
    expect(submitBtn).toBeDisabled();
  });

  it("enables Submit button when selecting a multiple-choice option", () => {
    render(<ConjugationStage items={mockItems} onStageComplete={vi.fn()} />);

    const optionMeets = screen.getByRole("button", { name: "meets" });
    fireEvent.click(optionMeets);

    const submitBtn = screen.getByRole("button", { name: /kiểm tra/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it("evaluates a correct answer, awards points, and displays positive feedback and explanation", () => {
    render(<ConjugationStage items={mockItems} onStageComplete={vi.fn()} />);

    // Select correct option "meets"
    const optionMeets = screen.getByRole("button", { name: "meets" });
    fireEvent.click(optionMeets);

    const submitBtn = screen.getByRole("button", { name: /kiểm tra/i });
    fireEvent.click(submitBtn);

    // Feedback alert
    expect(screen.getByText(/chính xác/i)).toBeInTheDocument();
    expect(screen.getByText(/\+10 điểm/i)).toBeInTheDocument();

    // Grammar explanation
    expect(screen.getByText(mockItems[0].explanation.ruleVi)).toBeInTheDocument();
    expect(screen.getByText(mockItems[0].explanation.detailedAnalysisVi)).toBeInTheDocument();

    // Next button appears
    expect(screen.getByRole("button", { name: /câu tiếp theo/i })).toBeInTheDocument();
  });

  it("evaluates an incorrect answer, shows correct answer and explanation without points", () => {
    render(<ConjugationStage items={mockItems} onStageComplete={vi.fn()} />);

    // Select incorrect option "meet"
    const optionMeet = screen.getByRole("button", { name: "meet" });
    fireEvent.click(optionMeet);

    const submitBtn = screen.getByRole("button", { name: /kiểm tra/i });
    fireEvent.click(submitBtn);

    // Incorrect feedback
    expect(screen.getByText(/chưa chính xác/i)).toBeInTheDocument();
    expect(screen.getByText(/đáp án đúng:/i)).toBeInTheDocument();

    // Grammar explanation still shown for learning
    expect(screen.getByText(mockItems[0].explanation.ruleVi)).toBeInTheDocument();

    // Next button appears
    expect(screen.getByRole("button", { name: /câu tiếp theo/i })).toBeInTheDocument();
  });

  it("allows direct text input typing and submitting via Enter key", () => {
    render(<ConjugationStage items={mockItems} onStageComplete={vi.fn()} />);

    const input = screen.getByPlaceholderText(/nhập dạng đúng của động từ/i);
    fireEvent.change(input, { target: { value: "meets" } });

    // Submit with Enter key
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByText(/chính xác/i)).toBeInTheDocument();
  });

  it("accepts acceptable alternative spellings and trims spaces/quotes", () => {
    render(<ConjugationStage items={mockItems} onStageComplete={vi.fn()} />);

    const input = screen.getByPlaceholderText(/nhập dạng đúng của động từ/i);
    // Upper case with trailing spaces
    fireEvent.change(input, { target: { value: "  MEETS.  " } });

    const submitBtn = screen.getByRole("button", { name: /kiểm tra/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/chính xác/i)).toBeInTheDocument();
  });

  it("advances to the next question when clicking 'Câu tiếp theo'", () => {
    render(<ConjugationStage items={mockItems} onStageComplete={vi.fn()} />);

    // Answer Q1
    fireEvent.click(screen.getByRole("button", { name: "meets" }));
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra/i }));

    // Click Next
    fireEvent.click(screen.getByRole("button", { name: /câu tiếp theo/i }));

    // Should now be on Q2
    expect(screen.getByText(/câu 2 \/ (8|10)/i)).toBeInTheDocument();
    expect(screen.getByText(mockItems[1].scenarioVi)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "manages" })).toBeInTheDocument();
  });

  it("calls onStageComplete with final score and total when completing the last question", () => {
    const handleStageComplete = vi.fn();
    const shortItems = mockItems.slice(0, 2); // 2 questions

    render(<ConjugationStage items={shortItems} onStageComplete={handleStageComplete} />);

    // Q1: Answer correctly
    fireEvent.click(screen.getByRole("button", { name: "meets" }));
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra/i }));
    fireEvent.click(screen.getByRole("button", { name: /câu tiếp theo/i }));

    // Q2: Answer incorrectly
    fireEvent.click(screen.getByRole("button", { name: "manage" }));
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra/i }));

    // Last question shows complete button
    const finishBtn = screen.getByRole("button", { name: /xem kết quả|hoàn thành/i });
    fireEvent.click(finishBtn);

    // Score is 1 correct out of 2
    expect(handleStageComplete).toHaveBeenCalledWith(1, 2, expect.any(Array));
  });

  it("triggers audio pronunciation when clicking speech button", () => {
    render(<ConjugationStage items={mockItems} onStageComplete={vi.fn()} />);

    // Answer Q1
    fireEvent.click(screen.getByRole("button", { name: "meets" }));
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra/i }));

    const speakBtn = screen.getByRole("button", { name: /nghe phát âm/i });
    fireEvent.click(speakBtn);

    expect(mockSpeak).toHaveBeenCalled();
  });

  it("handles unsupported speech synthesis gracefully without crashing", () => {
    Object.defineProperty(window, "speechSynthesis", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    render(<ConjugationStage items={mockItems} onStageComplete={vi.fn()} />);

    // Answer Q1
    fireEvent.click(screen.getByRole("button", { name: "meets" }));
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra/i }));

    // Audio button should not be present or crash
    expect(screen.queryByRole("button", { name: /nghe phát âm/i })).not.toBeInTheDocument();
  });

  it("automatically focuses the Next button after submission for seamless Enter key progression", () => {
    render(<ConjugationStage items={mockItems} onStageComplete={vi.fn()} />);

    // Select and submit
    fireEvent.click(screen.getByRole("button", { name: "meets" }));
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra/i }));

    const nextBtn = screen.getByRole("button", { name: /câu tiếp theo/i });
    expect(document.activeElement).toBe(nextBtn);
  });

  it("calls onBack when back button is clicked", () => {
    const handleBack = vi.fn();
    render(<ConjugationStage items={mockItems} onStageComplete={vi.fn()} onBack={handleBack} />);

    const backBtn = screen.getByRole("button", { name: /quay lại/i });
    fireEvent.click(backBtn);

    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("renders graceful empty state when items list is empty", () => {
    render(<ConjugationStage items={[]} onStageComplete={vi.fn()} />);

    expect(screen.getByText(/không có câu hỏi bài tập/i)).toBeInTheDocument();
  });
});
