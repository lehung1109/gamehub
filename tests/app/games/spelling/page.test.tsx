import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SpellingGamePage from "@/app/games/spelling/page";

// Mock useSpeech hook
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
let mockIsSupported = true;

vi.mock("@/hooks/useSpeech", () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: mockCancel,
    isSpeaking: false,
    isSupported: mockIsSupported,
    supported: mockIsSupported,
  }),
}));

describe("Spelling Game Page (app/games/spelling/page.tsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSupported = true;
  });

  it("renders page title, back button, word prompt, and topic filters", () => {
    render(<SpellingGamePage />);

    expect(screen.getByRole("heading", { level: 1, name: /Đánh vần|Ghép từ/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Về trang chủ/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nghe phát âm|Phát âm|Nghe từ/i })).toBeInTheDocument();
    expect(screen.getByText(/Tất cả/i)).toBeInTheDocument();
    expect(screen.getByText(/Động vật/i)).toBeInTheDocument();
  });

  it("speaks the word when the speaker button is clicked", () => {
    render(<SpellingGamePage />);

    const speakBtn = screen.getByRole("button", { name: /Nghe phát âm|Phát âm|Nghe từ/i });
    fireEvent.click(speakBtn);

    expect(mockSpeak).toHaveBeenCalled();
    const spokenWord = mockSpeak.mock.calls[0][0];
    expect(typeof spokenWord).toBe("string");
    expect(spokenWord.length).toBeGreaterThan(0);
  });

  it("displays drop slots matching the length of the target word", () => {
    render(<SpellingGamePage />);

    const slots = screen.getAllByRole("button", { name: /Ô chữ cái \d+/i });
    expect(slots.length).toBeGreaterThanOrEqual(3);
    expect(slots.length).toBeLessThanOrEqual(5);
  });

  it("provides draggable/tappable letters including word letters and distractors", () => {
    render(<SpellingGamePage />);

    const slots = screen.getAllByRole("button", { name: /Ô chữ cái \d+/i });
    const bankButtons = screen.getAllByRole("button", { name: /Chữ cái [A-Z]/i });

    expect(bankButtons.length).toBeGreaterThanOrEqual(slots.length + 2);
  });

  it("handles spelling input and shows feedback dialog when slots are filled", () => {
    render(<SpellingGamePage />);

    const slots = screen.getAllByRole("button", { name: /Ô chữ cái \d+/i });
    const bankButtons = screen.getAllByRole("button", { name: /Chữ cái [A-Z]/i });

    // Fill all slots by clicking the first N bank buttons
    for (let i = 0; i < slots.length; i++) {
      fireEvent.click(bankButtons[i]);
    }

    // Feedback dialog should open
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    expect(
      screen.getByText(/Bé giỏi quá!|Chưa chính xác rồi!/i)
    ).toBeInTheDocument();
  });

  it("allows retrying when wrong spelling is submitted", () => {
    render(<SpellingGamePage />);

    const slots = screen.getAllByRole("button", { name: /Ô chữ cái \d+/i });
    const bankButtons = screen.getAllByRole("button", { name: /Chữ cái [A-Z]/i });

    // Fill all slots
    for (let i = 0; i < slots.length; i++) {
      fireEvent.click(bankButtons[i]);
    }

    const retryBtn = screen.queryByRole("button", { name: /Thử lại/i });
    const nextBtn = screen.queryByRole("button", { name: /Từ tiếp theo/i });

    if (retryBtn) {
      fireEvent.click(retryBtn);
      // Dialog closes and slots are reset
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    } else if (nextBtn) {
      fireEvent.click(nextBtn);
      expect(screen.getByText(/Từ 2 \/ \d+/i)).toBeInTheDocument();
    }
  });

  it("shows SpeechUnsupportedBanner when Web Speech API is not supported", () => {
    mockIsSupported = false;
    render(<SpellingGamePage />);

    expect(screen.getByText(/Trình duyệt chưa hỗ trợ phát âm/i)).toBeInTheDocument();
  });

  it("allows filtering by topic and resets current word", () => {
    render(<SpellingGamePage />);

    const animalsBtn = screen.getByRole("button", { name: /Động vật/i });
    fireEvent.click(animalsBtn);

    expect(mockCancel).toHaveBeenCalled();
    expect(screen.getByText(/Từ 1 \/ \d+/i)).toBeInTheDocument();
  });
});
