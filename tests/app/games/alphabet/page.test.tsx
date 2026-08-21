import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AlphabetGamePage from "@/app/games/alphabet/page";

// Mock useSpeech
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
vi.mock("@/hooks/useSpeech", () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: mockCancel,
    isSpeaking: false,
    isSupported: true,
    supported: true,
  }),
}));

describe("Alphabet Game Page (app/games/alphabet/page.tsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title, back button, and mode selector", () => {
    render(<AlphabetGamePage />);

    expect(screen.getByRole("heading", { level: 1, name: /Chữ cái & Phonics/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Về trang chủ/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Học chữ cái/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Luyện tập \(Quiz\)/i })).toBeInTheDocument();
  });

  it("in Learn mode, displays letter cards and updates details card when letter is clicked", () => {
    render(<AlphabetGamePage />);

    // Default mode is Learn mode
    // Should have letter button for B
    const letterB = screen.getByRole("button", { name: /^Chữ B\b/i });
    expect(letterB).toBeInTheDocument();

    fireEvent.click(letterB);

    // Speak should be called for letter B
    expect(mockSpeak).toHaveBeenCalledWith("B");
    // Detail display should show B's example word Ball
    expect(screen.getByLabelText(/Từ ví dụ: Ball/i)).toBeInTheDocument();
  });

  it("allows switching to Quiz mode and presenting letter recognition questions", () => {
    render(<AlphabetGamePage />);

    const quizTab = screen.getByRole("tab", { name: /Luyện tập \(Quiz\)/i });
    fireEvent.click(quizTab);

    // Cancel should have been called on tab switch
    expect(mockCancel).toHaveBeenCalled();

    // Should render quiz question counter
    expect(screen.getByText(/Câu 1 \/ 10/i)).toBeInTheDocument();
    expect(screen.getByText(/Bé hãy nghe và chọn chữ cái đúng nhé!/i)).toBeInTheDocument();
  });

  it("navigates letters sequentially via Next and Prev buttons in Learn mode", () => {
    render(<AlphabetGamePage />);

    const prevBtn = screen.getByRole("button", { name: /Chữ trước/i });
    const nextBtn = screen.getByRole("button", { name: /Chữ tiếp theo/i });

    // On letter A (index 0), prev is disabled
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();
    expect(screen.getByLabelText(/Từ ví dụ: Apple/i)).toBeInTheDocument();

    // Click next -> advances to B
    fireEvent.click(nextBtn);
    expect(mockSpeak).toHaveBeenCalledWith("B");
    expect(screen.getByLabelText(/Từ ví dụ: Ball/i)).toBeInTheDocument();
    expect(prevBtn).toBeEnabled();

    // Click prev -> goes back to A
    fireEvent.click(prevBtn);
    expect(mockSpeak).toHaveBeenCalledWith("A");
    expect(screen.getByLabelText(/Từ ví dụ: Apple/i)).toBeInTheDocument();
    expect(prevBtn).toBeDisabled();
  });

  it("speaks letter and example word when detail card SpeakButton is clicked", () => {
    render(<AlphabetGamePage />);

    const speakBtn = screen.getByRole("button", { name: /Phát âm \/ Speak/i });
    fireEvent.click(speakBtn);

    expect(mockSpeak).toHaveBeenCalledWith("A. Apple", "en-US");
  });

  it("supports keyboard navigation (ArrowRight, ArrowLeft) in Learn mode", () => {
    render(<AlphabetGamePage />);

    // ArrowRight advances to letter B
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(mockSpeak).toHaveBeenCalledWith("B");
    expect(screen.getByLabelText(/Từ ví dụ: Ball/i)).toBeInTheDocument();

    // ArrowLeft goes back to letter A
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(mockSpeak).toHaveBeenCalledWith("A");
    expect(screen.getByLabelText(/Từ ví dụ: Apple/i)).toBeInTheDocument();
  });
});
