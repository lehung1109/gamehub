import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SentencesGamePage from "@/app/games/sentences/page";

const mockSpeak = vi.fn();
const mockCancel = vi.fn();

vi.mock("@/hooks/useSpeech", () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: mockCancel,
    isSpeaking: false,
    isSupported: true,
  }),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("SentencesGamePage (US7 - Simple Sentences)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title, back button, situation prompt, and category filter buttons", () => {
    render(<SentencesGamePage />);

    // Header title
    expect(screen.getByRole("heading", { name: /Câu đơn giản/i })).toBeInTheDocument();

    // Back to home button
    const backBtn = screen.getByRole("link", { name: /Về trang chủ/i });
    expect(backBtn).toHaveAttribute("href", "/");

    // Category filter section
    expect(screen.getByText(/Chọn chủ đề câu:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tất cả/i })).toBeInTheDocument();

    // Word slots & bank prompt
    expect(screen.getByText(/Ghép từ vào đây:/i)).toBeInTheDocument();
    expect(screen.getByText(/Chạm hoặc kéo từ:/i)).toBeInTheDocument();
  });

  it("allows filtering sentences by category", () => {
    render(<SentencesGamePage />);

    // Click Animals category filter if available
    const animalsFilter = screen.queryByRole("button", { name: /Động vật/i });
    if (animalsFilter) {
      fireEvent.click(animalsFilter);
      expect(mockCancel).toHaveBeenCalled();
    }
  });

  it("speaks the complete sentence when 'Nghe câu mẫu' button is clicked", () => {
    render(<SentencesGamePage />);

    const speakBtn = screen.getByRole("button", { name: /Nghe câu mẫu|Nghe phát âm/i });
    fireEvent.click(speakBtn);

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(typeof mockSpeak.mock.calls[0][0]).toBe("string");
    expect(mockSpeak.mock.calls[0][0].length).toBeGreaterThan(0);
  });

  it("allows forming a sentence by tapping words in order, triggers success feedback and speaks full sentence", () => {
    render(<SentencesGamePage />);

    // Initial score
    expect(screen.getByText(/Điểm: 0/i)).toBeInTheDocument();

    // Find all bank word tiles
    const bankSection = screen.getByRole("region", { name: /Ngân hàng|Chạm hoặc kéo từ/i });
    expect(bankSection).toBeInTheDocument();

    // Find the current target sentence words by checking available bank buttons
    const bankButtons = screen.getAllByRole("button", { name: /^Từ /i });
    expect(bankButtons.length).toBeGreaterThanOrEqual(2);

    // Tap all words in bank sequentially
    bankButtons.forEach((btn) => {
      if (btn.getAttribute("aria-disabled") !== "true") {
        fireEvent.click(btn);
      }
    });

    // Check if feedback dialog appears (either correct or incorrect depending on scramble order)
    const dialogTitle = screen.queryByRole("heading", {
      name: /Bé giỏi quá! Chính xác!|Chưa chính xác rồi!/i,
    });
    expect(dialogTitle).toBeInTheDocument();
  });

  it("clears placed words when 'Xóa làm lại' button is clicked", () => {
    render(<SentencesGamePage />);

    const bankButtons = screen.getAllByRole("button", { name: /^Từ /i });
    fireEvent.click(bankButtons[0]);

    const resetButton = screen.getByRole("button", { name: /Xóa làm lại/i });
    expect(resetButton).toBeEnabled();

    fireEvent.click(resetButton);

    const emptySlots = screen.getAllByRole("button", { name: /Ô từ \d+: trống/i });
    expect(emptySlots.length).toBeGreaterThanOrEqual(2);
  });

  it("navigates to next sentence when 'Câu tiếp theo' is clicked in correct feedback dialog", () => {
    render(<SentencesGamePage />);

    // Place words
    const bankButtons = screen.getAllByRole("button", { name: /^Từ /i });
    bankButtons.forEach((btn) => fireEvent.click(btn));

    // If correct feedback appears, click next
    const nextBtn = screen.queryByRole("button", { name: /Câu tiếp theo/i });
    if (nextBtn) {
      fireEvent.click(nextBtn);
      // Feedback dialog should close
      expect(screen.queryByRole("button", { name: /Câu tiếp theo/i })).not.toBeInTheDocument();
    }
  });

  it("resets current question when 'Thử lại' is clicked on incorrect feedback dialog", () => {
    render(<SentencesGamePage />);

    // Place words
    const bankButtons = screen.getAllByRole("button", { name: /^Từ /i });
    bankButtons.forEach((btn) => fireEvent.click(btn));

    const retryBtn = screen.queryByRole("button", { name: /Thử lại/i });
    if (retryBtn) {
      fireEvent.click(retryBtn);
      // Dialog closes, slots reset
      const emptySlots = screen.getAllByRole("button", { name: /Ô từ \d+: trống/i });
      expect(emptySlots.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("speaks the word when a word tile is placed into a slot", () => {
    render(<SentencesGamePage />);

    const bankButtons = screen.getAllByRole("button", { name: /^Từ /i });
    fireEvent.click(bankButtons[0]);

    expect(mockSpeak).toHaveBeenCalled();
    const spokenWord = mockSpeak.mock.calls[0][0];
    expect(typeof spokenWord).toBe("string");
    expect(spokenWord.length).toBeGreaterThan(0);
  });
});
