import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SentenceBuilderStage } from "@/components/tenses/stages/SentenceBuilderStage";
import { SentenceBuilderItem } from "@/types/tenses";
import presentSimpleData from "@/data/tenses/mock-present-simple.json";

vi.mock("@/hooks/useSessionQuestions", () => ({
  useSessionQuestions: vi.fn((items, count) => items.slice(0, count))
}));

const mockItems: SentenceBuilderItem[] = presentSimpleData.challenges.sentenceBuilding as SentenceBuilderItem[];

describe("SentenceBuilderStage (Stage 3)", () => {
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

  it("renders the first question with scenario, Vietnamese meaning, and scrambled tokens in the bank", () => {
    render(<SentenceBuilderStage questionCount={10} sessionStorageKey="test-key" items={mockItems} onStageComplete={vi.fn()} />);

    // Header & Question counter
    expect(screen.getByText(/chặng 3 • ghép câu/i)).toBeInTheDocument();
    expect(screen.getByText(/câu 1 \/ (6|10)/i)).toBeInTheDocument();
    expect(screen.getByText(mockItems[0].scenarioVi)).toBeInTheDocument();

    // Vietnamese Meaning
    expect(screen.getByText(new RegExp(mockItems[0].vietnameseMeaning, "i"))).toBeInTheDocument();

    // Scrambled Tokens in bank
    mockItems[0].scrambledTokens.forEach((tok) => {
      expect(screen.getByRole("button", { name: new RegExp(tok.text, "i") })).toBeInTheDocument();
    });

    // Check sentence dropzone placeholder
    expect(screen.getByText(/chạm hoặc kéo thả các từ bên dưới/i)).toBeInTheDocument();
  });

  it("moves a token from the bank to the placed sentence area when tapped", () => {
    render(<SentenceBuilderStage questionCount={10} sessionStorageKey="test-key" items={mockItems} onStageComplete={vi.fn()} />);

    // Click first token "Our company"
    const tok1 = screen.getByRole("button", { name: /thêm "our company"/i });
    fireEvent.click(tok1);

    // Should now appear in placed area with remove label
    const placedTok = screen.getByRole("button", { name: /xóa "our company"/i });
    expect(placedTok).toBeInTheDocument();

    // Placeholder text should disappear once tokens are placed
    expect(screen.queryByText(/chạm hoặc kéo thả các từ bên dưới/i)).not.toBeInTheDocument();
  });

  it("returns a placed token back to the bank when clicked in the placed area", () => {
    render(<SentenceBuilderStage questionCount={10} sessionStorageKey="test-key" items={mockItems} onStageComplete={vi.fn()} />);

    // Place "Our company" and "always"
    fireEvent.click(screen.getByRole("button", { name: /thêm "our company"/i }));
    fireEvent.click(screen.getByRole("button", { name: /thêm "always"/i }));

    // Click "Our company" in placed area
    const placedTok = screen.getByRole("button", { name: /xóa "our company"/i });
    fireEvent.click(placedTok);

    // "Our company" should be back in the bank with "Thêm" label
    expect(screen.getByRole("button", { name: /thêm "our company"/i })).toBeInTheDocument();
  });

  it("resets all placed tokens back to the bank when clicking 'Đặt lại câu'", () => {
    render(<SentenceBuilderStage questionCount={10} sessionStorageKey="test-key" items={mockItems} onStageComplete={vi.fn()} />);

    // Place 2 tokens
    fireEvent.click(screen.getByRole("button", { name: /thêm "our company"/i }));
    fireEvent.click(screen.getByRole("button", { name: /thêm "always"/i }));

    const resetBtn = screen.getByRole("button", { name: /đặt lại|xóa câu/i });
    fireEvent.click(resetBtn);

    // Placeholder restored
    expect(screen.getByText(/chạm hoặc kéo thả các từ bên dưới/i)).toBeInTheDocument();
  });

  it("disables Submit button until at least one token is placed", () => {
    render(<SentenceBuilderStage questionCount={10} sessionStorageKey="test-key" items={mockItems} onStageComplete={vi.fn()} />);

    const submitBtn = screen.getByRole("button", { name: /kiểm tra câu|xác nhận/i });
    expect(submitBtn).toBeDisabled();

    // Place a token
    fireEvent.click(screen.getByRole("button", { name: /thêm "our company"/i }));
    expect(submitBtn).not.toBeDisabled();
  });

  it("evaluates a correctly built sentence, awards points, speaks audio, and displays grammar tips", () => {
    render(<SentenceBuilderStage questionCount={10} sessionStorageKey="test-key" items={mockItems} onStageComplete={vi.fn()} />);

    // Correct order for Q1: ["Our company", "always", "holds", "an all-hands meeting", "on Monday morning."]
    mockItems[0].correctTokenOrder.forEach((tokText) => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`thêm "${tokText}"`, "i") }));
    });

    // Submit
    const submitBtn = screen.getByRole("button", { name: /kiểm tra câu|xác nhận/i });
    fireEvent.click(submitBtn);

    // Feedback
    expect(screen.getByText(/chính xác! \(\+10 điểm\)/i)).toBeInTheDocument();

    // Full sentence
    expect(screen.getByText(mockItems[0].fullSentenceEn)).toBeInTheDocument();

    // Audio should have been spoken
    expect(mockSpeak).toHaveBeenCalled();

    // Grammar tip
    expect(screen.getByText(new RegExp(mockItems[0].grammarTip.titleVi, "i"))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockItems[0].grammarTip.tipVi, "i"))).toBeInTheDocument();

    // Next question button
    expect(screen.getByRole("button", { name: /câu tiếp theo/i })).toBeInTheDocument();
  });

  it("evaluates an incorrectly ordered sentence, shows correct answer and grammar tips without awarding points", () => {
    render(<SentenceBuilderStage questionCount={10} sessionStorageKey="test-key" items={mockItems} onStageComplete={vi.fn()} />);

    // Wrong order: place tokens in scrambled reverse
    const reversed = [...mockItems[0].scrambledTokens].reverse();
    reversed.forEach((tok) => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`thêm "${tok.text}"`, "i") }));
    });

    // Submit
    const submitBtn = screen.getByRole("button", { name: /kiểm tra câu|xác nhận/i });
    fireEvent.click(submitBtn);

    // Feedback
    expect(screen.getByText(/chưa chính xác/i)).toBeInTheDocument();
    expect(screen.getByText(/câu chuẩn xác là:/i)).toBeInTheDocument();
    expect(screen.getByText(mockItems[0].fullSentenceEn)).toBeInTheDocument();

    // Grammar tip still shown
    expect(screen.getByText(new RegExp(mockItems[0].grammarTip.titleVi, "i"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /câu tiếp theo/i })).toBeInTheDocument();
  });

  it("advances to the next question when clicking 'Câu tiếp theo'", () => {
    render(<SentenceBuilderStage questionCount={10} sessionStorageKey="test-key" items={mockItems} onStageComplete={vi.fn()} />);

    // Solve Q1
    mockItems[0].correctTokenOrder.forEach((tokText) => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`thêm "${tokText}"`, "i") }));
    });
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra câu|xác nhận/i }));

    // Click Next
    fireEvent.click(screen.getByRole("button", { name: /câu tiếp theo/i }));

    // Should be on Q2
    expect(screen.getByText(/câu 2 \/ (6|10)/i)).toBeInTheDocument();
    expect(screen.getByText(mockItems[1].scenarioVi)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /the hr manager/i })).toBeInTheDocument();
  });

  it("calls onStageComplete with final score and total upon finishing the last question", () => {
    const handleStageComplete = vi.fn();
    const shortItems = mockItems.slice(0, 2);

    render(<SentenceBuilderStage questionCount={10} sessionStorageKey="test-key" items={shortItems} onStageComplete={handleStageComplete} />);

    // Q1: Correct
    shortItems[0].correctTokenOrder.forEach((tokText) => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`thêm "${tokText}"`, "i") }));
    });
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra câu|xác nhận/i }));
    fireEvent.click(screen.getByRole("button", { name: /câu tiếp theo/i }));

    // Q2: Wrong
    fireEvent.click(screen.getByRole("button", { name: /thêm "candidate resumes"/i }));
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra câu|xác nhận/i }));

    // Finish button
    const finishBtn = screen.getByRole("button", { name: /xem kết quả chặng 3|hoàn thành/i });
    fireEvent.click(finishBtn);

    expect(handleStageComplete).toHaveBeenCalledWith(1, 2, expect.any(Array));
  });

  it("allows re-listening to the audio of the sentence after completion", () => {
    render(<SentenceBuilderStage questionCount={10} sessionStorageKey="test-key" items={mockItems} onStageComplete={vi.fn()} />);

    // Solve Q1
    mockItems[0].correctTokenOrder.forEach((tokText) => {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`thêm "${tokText}"`, "i") }));
    });
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra câu|xác nhận/i }));

    const speakBtn = screen.getByRole("button", { name: /nghe phát âm câu chuẩn/i });
    fireEvent.click(speakBtn);

    expect(mockSpeak).toHaveBeenCalledTimes(2); // 1 on correct submit + 1 on click replay
  });

  it("calls onBack when clicking the back button", () => {
    const handleBack = vi.fn();
    render(<SentenceBuilderStage questionCount={10} sessionStorageKey="test-key" items={mockItems} onStageComplete={vi.fn()} onBack={handleBack} />);

    const backBtn = screen.getByRole("button", { name: /quay lại/i });
    fireEvent.click(backBtn);

    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("renders graceful empty state when items array is empty", () => {
    render(<SentenceBuilderStage questionCount={10} sessionStorageKey="test-key" items={[]} onStageComplete={vi.fn()} />);

    expect(screen.getByText(/không có câu hỏi bài tập/i)).toBeInTheDocument();
  });
});
