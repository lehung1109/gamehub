import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import WordConnectPage from "@/app/games/word-connect/page";

// Mock useSpeech
const mockSpeak = vi.fn();
vi.mock("@/hooks/useSpeech", () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: vi.fn(),
    isSpeaking: false,
    isSupported: true,
  }),
}));

// Mock useGameTracking
const mockRecordQuestion = vi.fn();
const mockSubmitSession = vi.fn().mockResolvedValue(true);
const mockResetSession = vi.fn();
vi.mock("@/hooks/use-game-tracking", () => ({
  useGameTracking: () => ({
    isTracking: true,
    isAnonymous: false,
    session: { classCode: "TEST", studentName: "Student" },
    details: [],
    recordQuestion: mockRecordQuestion,
    submitSession: mockSubmitSession,
    resetSession: mockResetSession,
  }),
}));

describe("WordConnectPage Integration Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header with back link, level counter, difficulty badge, score, level select, and guide button", () => {
    render(<WordConnectPage />);

    // Header elements
    expect(screen.getByRole("link", { name: /Quay lại/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Chọn màn chơi/i })).toHaveValue("0");
    expect(screen.getByText(/Dễ/i)).toBeInTheDocument();
    expect(screen.getByTestId("score-display")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hướng dẫn cách chơi/i })).toBeInTheDocument();
  });

  it("renders slots board, current input display, controls, and letter wheel", () => {
    render(<WordConnectPage />);

    expect(screen.getByTestId("word-slots-board")).toBeInTheDocument();
    expect(screen.getByTestId("current-input-display")).toBeInTheDocument();
    expect(screen.getByTestId("word-connect-controls")).toBeInTheDocument();
    expect(screen.getByTestId("letter-wheel")).toBeInTheDocument();

    // Level 1 has letters C, A, T
    expect(screen.getByRole("button", { name: /Chữ cái C/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chữ cái A/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chữ cái T/i })).toBeInTheDocument();
  });

  it("allows selecting letters by clicking wheel nodes and submitting a target word", async () => {
    render(<WordConnectPage />);

    // Click C, A, T in sequence
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái C/i }));
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái A/i }));
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái T/i }));

    // Current input display should show "CAT"
    expect(screen.getByTestId("current-input-display")).toHaveTextContent("CAT");

    // Click submit
    const submitBtn = screen.getByRole("button", { name: /Gửi từ/i });
    fireEvent.click(submitBtn);

    // After submitting CAT:
    // Status message should indicate CAT found
    expect(screen.getByText(/Đã tìm thấy: CAT/i)).toBeInTheDocument();

    // WordSlotRow for CAT should now be solved and have letters visible
    const catRow = screen.getByTestId("word-slot-row-CAT");
    expect(catRow).toHaveTextContent("C");
    expect(catRow).toHaveTextContent("A");
    expect(catRow).toHaveTextContent("T");

    // Score should be incremented (CAT is 3 letters = 30 pts)
    expect(screen.getByTestId("score-display")).toHaveTextContent("30");

    // useGameTracking recordQuestion should be called
    expect(mockRecordQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "CAT",
        selectedAnswer: "CAT",
        correctAnswer: "CAT",
        isCorrect: true,
      })
    );
  });

  it("supports backspace and clear controls during letter selection", () => {
    render(<WordConnectPage />);

    fireEvent.click(screen.getByRole("button", { name: /Chữ cái C/i }));
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái A/i }));
    expect(screen.getByTestId("current-input-display")).toHaveTextContent("CA");

    // Backspace button
    const backspaceBtn = screen.getByRole("button", { name: /Xóa chữ cái vừa chọn/i });
    fireEvent.click(backspaceBtn);
    expect(screen.getByTestId("current-input-display")).toHaveTextContent("C");

    // Add another letter and clear all
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái T/i }));
    expect(screen.getByTestId("current-input-display")).toHaveTextContent("CT");

    const clearBtn = screen.getByRole("button", { name: /Xóa toàn bộ chữ đã chọn/i });
    fireEvent.click(clearBtn);
    expect(screen.getByTestId("current-input-display")).toHaveTextContent("•••");
  });

  it("opens and closes the Guide Modal when clicking the guide button", () => {
    render(<WordConnectPage />);

    const guideBtn = screen.getByRole("button", { name: /Hướng dẫn cách chơi/i });
    fireEvent.click(guideBtn);

    expect(screen.getByTestId("word-connect-guide-modal")).toBeInTheDocument();
    expect(screen.getByText(/Cách Chơi Word Connect/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /Đã hiểu, bắt đầu chơi!/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId("word-connect-guide-modal")).not.toBeInTheDocument();
  });

  it("opens Bonus Words Modal when clicking bonus jar button and shows empty state", () => {
    render(<WordConnectPage />);

    const bonusJarBtn = screen.getByRole("button", { name: /Hũ từ thưởng/i });
    fireEvent.click(bonusJarBtn);

    expect(screen.getByTestId("bonus-words-modal")).toBeInTheDocument();
    expect(screen.getByText(/Hũ từ thưởng đang trống/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /Đóng/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId("bonus-words-modal")).not.toBeInTheDocument();
  });

  it("applies hints when hint button is clicked", () => {
    render(<WordConnectPage />);

    const hintBtn = screen.getByRole("button", { name: /Gợi ý chữ cái/i });
    fireEvent.click(hintBtn);

    // At least one tile in the board should now display a revealed hint letter
    const revealedLetters = screen.getAllByTestId(/^slot-tile-/).filter((tile) => tile.textContent?.trim() !== "");
    expect(revealedLetters.length).toBeGreaterThanOrEqual(1);
  });

  it("allows switching levels using the level dropdown selector", () => {
    render(<WordConnectPage />);

    const select = screen.getByRole("combobox", { name: /Chọn màn chơi/i });
    fireEvent.change(select, { target: { value: "1" } }); // Switch to Level 2 (0-indexed 1: DOG, GOD)

    expect(select).toHaveValue("1");
    expect(screen.getByRole("button", { name: /Chữ cái D/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chữ cái O/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chữ cái G/i })).toBeInTheDocument();
  });

  it("completes level when all target words are solved, showing Result Dialog and allowing next level", async () => {
    render(<WordConnectPage />);

    // Solve CAT
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái C/i }));
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái A/i }));
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái T/i }));
    fireEvent.click(screen.getByRole("button", { name: /Gửi từ/i }));

    // Solve ACT
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái A/i }));
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái C/i }));
    fireEvent.click(screen.getByRole("button", { name: /Chữ cái T/i }));
    fireEvent.click(screen.getByRole("button", { name: /Gửi từ/i }));

    // Result dialog should appear
    await waitFor(() => {
      expect(screen.getByTestId("word-connect-result-dialog")).toBeInTheDocument();
    });

    expect(screen.getByText(/HOÀN THÀNH MÀN CHƠI!/i)).toBeInTheDocument();
    // Full vocabulary card list should show words and meanings
    expect(screen.getByText(/Con mèo/i)).toBeInTheDocument();
    expect(screen.getByText(/Hành động \/ diễn xuất/i)).toBeInTheDocument();

    // Tracking session should have been submitted
    expect(mockSubmitSession).toHaveBeenCalled();

    // Click Next Level
    const nextLevelBtn = screen.getByRole("button", { name: /Màn tiếp theo/i });
    fireEvent.click(nextLevelBtn);

    // Should now be on Level 2
    expect(screen.getByRole("combobox", { name: /Chọn màn chơi/i })).toHaveValue("1");
  });

  it("handles physical keyboard inputs for typing and submitting", () => {
    render(<WordConnectPage />);

    // Type c, a, t using keyboard events
    fireEvent.keyDown(window, { key: "c" });
    fireEvent.keyDown(window, { key: "a" });
    fireEvent.keyDown(window, { key: "t" });
    expect(screen.getByTestId("current-input-display")).toHaveTextContent("CAT");

    // Press Backspace
    fireEvent.keyDown(window, { key: "Backspace" });
    expect(screen.getByTestId("current-input-display")).toHaveTextContent("CA");

    // Press 't' again and Enter
    fireEvent.keyDown(window, { key: "t" });
    fireEvent.keyDown(window, { key: "Enter" });

    // CAT should be submitted
    expect(screen.getByText(/Đã tìm thấy: CAT/i)).toBeInTheDocument();
  });
});
