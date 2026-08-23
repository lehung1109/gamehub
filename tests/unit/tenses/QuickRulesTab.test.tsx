import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QuickRulesTab } from "@/components/tenses/QuickRulesTab";
import { GrammarRuleCard } from "@/types/tenses";
import presentSimpleData from "@/data/tenses/present-simple.json";

const mockRules: GrammarRuleCard[] = presentSimpleData.quickRules as GrammarRuleCard[];

describe("QuickRulesTab component", () => {
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

  it("renders all grammar rule cards by default", () => {
    render(<QuickRulesTab rules={mockRules} />);

    // Check headings for key cards
    expect(screen.getByText("Động Từ To Be (Am / Is / Are)")).toBeInTheDocument();
    expect(screen.getByText("Động Từ Thường (Action Verbs)")).toBeInTheDocument();
    expect(screen.getByText("Quy Tắc Thêm Đuôi -s / -es")).toBeInTheDocument();
    expect(screen.getByText("Trạng Từ Chỉ Tần Suất & Vị Trí Trong Câu")).toBeInTheDocument();
    expect(screen.getByText("4 Tình Huống Công Sở Điển Hình")).toBeInTheDocument();
  });

  it("renders formulas with labels, structures, examples and translations", () => {
    render(<QuickRulesTab rules={mockRules} />);

    // To Be & Action Verbs formula checks
    const affirmativeLabels = screen.getAllByText("Khẳng định (+)");
    expect(affirmativeLabels.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("S + am / is / are + Noun / Adj")).toBeInTheDocument();
    expect(screen.getByText(/She is the lead product manager/i)).toBeInTheDocument();
    expect(screen.getByText(/Cô ấy là trưởng nhóm quản lý sản phẩm/i)).toBeInTheDocument();
  });

  it("renders spelling rules and condition details", () => {
    render(<QuickRulesTab rules={mockRules} />);

    expect(screen.getByText(/Động từ tận cùng bằng -o, -s, -ch, -x, -sh, -z/i)).toBeInTheDocument();
    expect(screen.getByText(/Thêm đuôi '-es'/i)).toBeInTheDocument();
    expect(screen.getByText(/pass -> passes/i)).toBeInTheDocument();
  });

  it("renders workplace tips callout cards", () => {
    render(<QuickRulesTab rules={mockRules} />);

    expect(
      screen.getByText(/Dùng 'I am responsible for\.\.\.' để giới thiệu vai trò công việc/i)
    ).toBeInTheDocument();
  });

  it("filters cards when category filter is clicked", () => {
    render(<QuickRulesTab rules={mockRules} />);

    // Click on "To Be" filter button
    const toBeFilterBtn = screen.getByRole("button", { name: /động từ to be|to be/i });
    fireEvent.click(toBeFilterBtn);

    // To Be card should be visible
    expect(screen.getByText("Động Từ To Be (Am / Is / Are)")).toBeInTheDocument();

    // Other cards should not be visible
    expect(screen.queryByText("Quy Tắc Thêm Đuôi -s / -es")).not.toBeInTheDocument();
    expect(screen.queryByText("4 Tình Huống Công Sở Điển Hình")).not.toBeInTheDocument();

    // Click "Tất cả" filter button to restore
    const allFilterBtn = screen.getByRole("button", { name: /tất cả/i });
    fireEvent.click(allFilterBtn);

    expect(screen.getByText("Quy Tắc Thêm Đuôi -s / -es")).toBeInTheDocument();
    expect(screen.getByText("4 Tình Huống Công Sở Điển Hình")).toBeInTheDocument();
  });

  it("triggers speech synthesis when speaker button is clicked for an example sentence", () => {
    render(<QuickRulesTab rules={mockRules} />);

    const speakButtons = screen.getAllByRole("button", { name: /phát âm/i });
    expect(speakButtons.length).toBeGreaterThan(0);

    // Click the first audio speak button
    fireEvent.click(speakButtons[0]);

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
  });

  it("triggers onStartPractice callback when CTA button is clicked", () => {
    const handleStartPractice = vi.fn();
    render(<QuickRulesTab rules={mockRules} onStartPractice={handleStartPractice} />);

    const ctaButton = screen.getByRole("button", { name: /bắt đầu luyện tập 3 chặng/i });
    expect(ctaButton).toBeInTheDocument();

    fireEvent.click(ctaButton);
    expect(handleStartPractice).toHaveBeenCalledTimes(1);
  });

  it("renders empty state or fallback if rules array is empty or undefined", () => {
    const { rerender } = render(<QuickRulesTab rules={[]} />);
    expect(screen.getByText(/không có dữ liệu quy tắc/i)).toBeInTheDocument();

    // Test with undefined safely
    rerender(<QuickRulesTab rules={undefined as unknown as GrammarRuleCard[]} />);
    expect(screen.getByText(/không có dữ liệu quy tắc/i)).toBeInTheDocument();
  });

  it("renders minimal rule card schema without crashing", () => {
    const minimalRule: GrammarRuleCard = {
      id: "minimal-rule",
      category: "to-be",
      titleVi: "Quy tắc cơ bản",
      titleEn: "Basic Rule",
      summaryVi: "Tóm tắt cơ bản",
    };
    render(<QuickRulesTab rules={[minimalRule]} />);
    expect(screen.getByText("Quy tắc cơ bản")).toBeInTheDocument();
    expect(screen.getByText("Basic Rule")).toBeInTheDocument();
    expect(screen.getByText("Tóm tắt cơ bản")).toBeInTheDocument();
  });

  it("disables audio buttons when Web Speech API is unsupported", () => {
    Object.defineProperty(window, "speechSynthesis", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    render(<QuickRulesTab rules={mockRules} />);
    const buttons = screen.getAllByRole("button", { name: /phát âm/i });
    expect(buttons[0]).toBeDisabled();
    expect(buttons[0]).toHaveAttribute("title", "Trình duyệt không hỗ trợ phát âm");
  });
});
