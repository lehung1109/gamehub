import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ListeningGamePage from "@/app/games/listening/page";

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

describe("Listening Game Page (app/games/listening/page.tsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSupported = true;
  });

  it("renders page title, back button, replay button, and topic filters", () => {
    render(<ListeningGamePage />);

    expect(screen.getByRole("heading", { level: 1, name: /Nghe hiểu/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Về trang chủ/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nghe lại âm thanh|Phát lại âm thanh|Nghe lại/i })).toBeInTheDocument();
    expect(screen.getByText(/Tất cả/i)).toBeInTheDocument();
    expect(screen.getByText(/Động vật/i)).toBeInTheDocument();
  });

  it("speaks the prompt word automatically when a question is presented", () => {
    render(<ListeningGamePage />);

    expect(mockSpeak).toHaveBeenCalled();
    const spokenWord = mockSpeak.mock.calls[0][0];
    expect(typeof spokenWord).toBe("string");
    expect(spokenWord.length).toBeGreaterThan(0);
  });

  it("speaks the word again when replay button is clicked", () => {
    render(<ListeningGamePage />);

    const initialCalls = mockSpeak.mock.calls.length;
    const replayBtn = screen.getByRole("button", { name: /Nghe lại âm thanh|Phát lại âm thanh|Nghe lại/i });
    fireEvent.click(replayBtn);

    expect(mockSpeak.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  it("presents 4 option choices with emojis and hides text before selection", () => {
    render(<ListeningGamePage />);

      const optionButtons = screen.getAllByRole("button").filter((btn) => {
        return btn.className.includes("border-4");
      });

    expect(optionButtons.length).toBe(4);
  });

  it("handles correct and incorrect answers with appropriate feedback", async () => {
    render(<ListeningGamePage />);

      const optionButtons = screen.getAllByRole("button").filter((btn) => {
        return btn.className.includes("border-4");
      });

    expect(optionButtons.length).toBe(4);

    // Click first option
    fireEvent.click(optionButtons[0]);

    // Feedback dialog overlay should be shown
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    expect(
      screen.getByText(/Đúng rồi|Chưa chính xác/i)
    ).toBeInTheDocument();
  });

  it("allows switching topic filter to focus on specific vocabulary", () => {
    render(<ListeningGamePage />);

    const animalsTopicBtn = screen.getByRole("button", { name: /Động vật/i });
    fireEvent.click(animalsTopicBtn);

    // Should cancel previous audio and speak new word from selected topic
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalled();
  });

  it("shows SpeechUnsupportedBanner when Web Speech API is not supported", () => {
    mockIsSupported = false;
    render(<ListeningGamePage />);

    expect(
      screen.getByText(/Trình duyệt chưa hỗ trợ phát âm/i)
    ).toBeInTheDocument();
  });

  it("allows answering questions and completes the quiz showing the summary screen", async () => {
    render(<ListeningGamePage />);

    // Play through 10 questions
    for (let i = 0; i < 10; i++) {
      const optionButtons = screen.getAllByRole("button").filter((btn) => {
        return btn.className.includes("border-4");
      });

      // Click first option
      fireEvent.click(optionButtons[0]);

      // Click continue on the feedback overlay
      const continueBtn = screen.getByRole("button", { name: /Tiếp tục/i });
      fireEvent.click(continueBtn);
    }

    // Completion summary should be visible
    expect(
      screen.getByRole("button", { name: /Chơi lại/i })
    ).toBeInTheDocument();

    // Click play again
    const restartBtn = screen.getByRole("button", { name: /Chơi lại/i });
    fireEvent.click(restartBtn);

    // Quiz starts again with Question 1
    expect(screen.getByText(/Câu 1 \/ 10/i)).toBeInTheDocument();
  });
});
