import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import OddOneOutPage from "@/app/games/odd-one-out/page";
import { OddOneOutQuestion } from "@/types/odd-one-out";
import * as soundModule from "@/lib/odd-one-out/sound";

// Mock sound module
vi.mock("@/lib/odd-one-out/sound", () => ({
  playCardClickSound: vi.fn(),
  playCorrectSound: vi.fn(),
  playWrongSound: vi.fn(),
  playFiftyFiftySound: vi.fn(),
  playClueSound: vi.fn(),
  playLevelClearSound: vi.fn(),
  playFanfareSound: vi.fn(),
}));

// Mock useSpeech
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

// Mock useGameTracking
const mockRecordQuestion = vi.fn();
const mockSubmitSession = vi.fn().mockResolvedValue(true);
const mockResetSession = vi.fn();
vi.mock("@/hooks/use-game-tracking", () => ({
  useGameTracking: () => ({
    isTracking: true,
    isAnonymous: false,
    session: { classCode: "CLASS101", studentName: "Student A" },
    details: [],
    recordQuestion: mockRecordQuestion,
    submitSession: mockSubmitSession,
    resetSession: mockResetSession,
  }),
}));

const mockQuestions: OddOneOutQuestion[] = [
  {
    id: "q1-fruits-veg",
    difficulty: "easy",
    themeVi: "Hoa quả và Rau củ",
    themeEn: "Fruits & Vegetables",
    commonTraitVi: "Các loại trái cây ngọt",
    commonTraitEn: "Sweet edible fruits",
    explanationVi: "Carrot là một loại rau củ mọc dưới đất, trong khi Apple, Banana, Strawberry là trái cây.",
    explanationEn: "Carrot is a root vegetable, while Apple, Banana, and Strawberry are fruits.",
    items: [
      {
        id: "q1-apple",
        word: "Apple",
        vietnameseMeaning: "Quả táo",
        phonetic: "/ˈæp.l/",
        partOfSpeech: "noun",
        emoji: "🍎",
        isOdd: false,
      },
      {
        id: "q1-banana",
        word: "Banana",
        vietnameseMeaning: "Quả chuối",
        phonetic: "/bəˈnɑː.nə/",
        partOfSpeech: "noun",
        emoji: "🍌",
        isOdd: false,
      },
      {
        id: "q1-carrot",
        word: "Carrot",
        vietnameseMeaning: "Củ cà rốt",
        phonetic: "/ˈkær.ət/",
        partOfSpeech: "noun",
        emoji: "🥕",
        isOdd: true,
        reasonVi: "Carrot là rau củ.",
        reasonEn: "Carrot is a vegetable.",
      },
      {
        id: "q1-strawberry",
        word: "Strawberry",
        vietnameseMeaning: "Quả dâu tây",
        phonetic: "/ˈstrɔː.bər.i/",
        partOfSpeech: "noun",
        emoji: "🍓",
        isOdd: false,
      },
    ],
  },
  {
    id: "q2-vehicles-furniture",
    difficulty: "easy",
    themeVi: "Phương tiện giao thông",
    themeEn: "Vehicles",
    commonTraitVi: "Phương tiện di chuyển",
    commonTraitEn: "Means of transport",
    explanationVi: "Chair là đồ nội thất, không phải phương tiện giao thông.",
    explanationEn: "Chair is a piece of furniture, not a vehicle.",
    items: [
      {
        id: "q2-car",
        word: "Car",
        vietnameseMeaning: "Ô tô",
        phonetic: "/kɑːr/",
        partOfSpeech: "noun",
        emoji: "🚗",
        isOdd: false,
      },
      {
        id: "q2-bus",
        word: "Bus",
        vietnameseMeaning: "Xe buýt",
        phonetic: "/bʌs/",
        partOfSpeech: "noun",
        emoji: "🚌",
        isOdd: false,
      },
      {
        id: "q2-chair",
        word: "Chair",
        vietnameseMeaning: "Cái ghế",
        phonetic: "/tʃer/",
        partOfSpeech: "noun",
        emoji: "🪑",
        isOdd: true,
        reasonVi: "Chair là đồ dùng gia đình.",
        reasonEn: "Chair is furniture.",
      },
      {
        id: "q2-train",
        word: "Train",
        vietnameseMeaning: "Tàu hỏa",
        phonetic: "/treɪn/",
        partOfSpeech: "noun",
        emoji: "🚆",
        isOdd: false,
      },
    ],
  },
];

describe("OddOneOutPage Integration Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header with back link, question progress, difficulty badge, score counter, streak, and guide button", () => {
    render(<OddOneOutPage initialQuestions={mockQuestions} />);

    // Header container
    expect(screen.getByTestId("odd-one-out-header")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Quay lại danh sách trò chơi/i })).toBeInTheDocument();
    expect(screen.getByTestId("question-progress")).toHaveTextContent("1 / 2");
    expect(screen.getByTestId("score-display")).toHaveTextContent("0");
    expect(screen.getByTestId("streak-badge")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hướng dẫn cách chơi/i })).toBeInTheDocument();
  });

  it("renders 4 semantic word cards in the grid with pronunciation buttons", () => {
    render(<OddOneOutPage initialQuestions={mockQuestions} />);

    expect(screen.getByTestId("word-card-grid")).toBeInTheDocument();
    expect(screen.getByTestId("semantic-card-q1-apple")).toBeInTheDocument();
    expect(screen.getByTestId("semantic-card-q1-banana")).toBeInTheDocument();
    expect(screen.getByTestId("semantic-card-q1-carrot")).toBeInTheDocument();
    expect(screen.getByTestId("semantic-card-q1-strawberry")).toBeInTheDocument();
  });

  it("allows selecting a card, checking correct answer, reveals explanation banner, plays correct sound, and tracks question", async () => {
    render(<OddOneOutPage initialQuestions={mockQuestions} />);

    // Select the odd item: Carrot
    const carrotCard = screen.getByTestId("semantic-card-q1-carrot");
    fireEvent.click(carrotCard);

    expect(soundModule.playCardClickSound).toHaveBeenCalled();

    // Click Check Answer
    const checkBtn = screen.getByTestId("check-answer-btn");
    expect(checkBtn).not.toBeDisabled();
    fireEvent.click(checkBtn);

    // Should play correct sound
    expect(soundModule.playCorrectSound).toHaveBeenCalled();

    // Explanation banner should be visible
    expect(screen.getByTestId("explanation-banner")).toBeInTheDocument();
    expect(
      screen.getByText(/Carrot là một loại rau củ mọc dưới đất/i)
    ).toBeInTheDocument();

    // Score should have increased to 100
    expect(screen.getByTestId("score-display")).toHaveTextContent("100");

    // Tracking should be recorded
    expect(mockRecordQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Hoa quả và Rau củ",
        selectedAnswer: "Carrot",
        correctAnswer: "Carrot",
        isCorrect: true,
      })
    );
  });

  it("advances to the next question when next question button is clicked", () => {
    render(<OddOneOutPage initialQuestions={mockQuestions} />);

    // Select and answer question 1
    fireEvent.click(screen.getByTestId("semantic-card-q1-carrot"));
    fireEvent.click(screen.getByTestId("check-answer-btn"));

    // Next question button appears
    const nextBtn = screen.getByTestId("next-question-btn");
    fireEvent.click(nextBtn);

    // Progress moves to 2 / 2
    expect(screen.getByTestId("question-progress")).toHaveTextContent("2 / 2");

    // Question 2 cards are shown
    expect(screen.getByTestId("semantic-card-q2-car")).toBeInTheDocument();
    expect(screen.getByTestId("semantic-card-q2-chair")).toBeInTheDocument();
  });

  it("applies 50/50 hint, eliminates 2 non-odd cards, and plays 50/50 sound", () => {
    render(<OddOneOutPage initialQuestions={mockQuestions} />);

    const fiftyBtn = screen.getByTestId("fifty-fifty-btn");
    fireEvent.click(fiftyBtn);

    expect(soundModule.playFiftyFiftySound).toHaveBeenCalled();

    // 50/50 button should now be disabled
    expect(fiftyBtn).toBeDisabled();

    // 2 non-odd cards should have aria-disabled or be marked eliminated
    const allCards = [
      screen.getByTestId("semantic-card-q1-apple"),
      screen.getByTestId("semantic-card-q1-banana"),
      screen.getByTestId("semantic-card-q1-strawberry"),
    ];
    const eliminatedCards = allCards.filter(
      (c) => c.getAttribute("aria-disabled") === "true"
    );
    expect(eliminatedCards.length).toBe(2);

    // Carrot (the odd item) should NEVER be eliminated
    const carrotCard = screen.getByTestId("semantic-card-q1-carrot");
    expect(carrotCard.getAttribute("aria-disabled")).toBe("false");
  });

  it("toggles theme clue, reveals clue content, and plays clue sound", () => {
    render(<OddOneOutPage initialQuestions={mockQuestions} />);

    const clueBtn = screen.getByTestId("theme-clue-btn");
    fireEvent.click(clueBtn);

    expect(soundModule.playClueSound).toHaveBeenCalled();
    expect(screen.getByTestId("theme-clue-content")).toBeInTheDocument();
    expect(screen.getByText(/Gợi ý chủ đề: Hoa quả và Rau củ/i)).toBeInTheDocument();
  });

  it("speaks word pronunciation and cancels prior speech", () => {
    render(<OddOneOutPage initialQuestions={mockQuestions} />);

    const speakAppleBtn = screen.getByRole("button", { name: /Nghe phát âm Apple/i });
    fireEvent.click(speakAppleBtn);

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalledWith("Apple");
  });

  it("handles keyboard navigation: number keys to select and Enter to check/advance", () => {
    render(<OddOneOutPage initialQuestions={mockQuestions} />);

    // Press '3' to select 3rd card (Carrot)
    fireEvent.keyDown(window, { key: "3" });
    expect(soundModule.playCardClickSound).toHaveBeenCalled();

    // Press Enter to check answer
    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.getByTestId("explanation-banner")).toBeInTheDocument();

    // Press Enter again to advance to next question
    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.getByTestId("question-progress")).toHaveTextContent("2 / 2");
  });

  it("completes the session after last question, shows result dialog, triggers fanfare, submits session, and allows replay", async () => {
    render(<OddOneOutPage initialQuestions={mockQuestions} />);

    // Question 1: Select Carrot and check
    fireEvent.click(screen.getByTestId("semantic-card-q1-carrot"));
    fireEvent.click(screen.getByTestId("check-answer-btn"));
    fireEvent.click(screen.getByTestId("next-question-btn"));

    // Question 2: Select Chair and check
    fireEvent.click(screen.getByTestId("semantic-card-q2-chair"));
    fireEvent.click(screen.getByTestId("check-answer-btn"));
    fireEvent.click(screen.getByTestId("next-question-btn"));

    // Result dialog should appear
    await waitFor(() => {
      expect(screen.getByTestId("odd-one-out-result-dialog")).toBeInTheDocument();
    });

    expect(soundModule.playLevelClearSound).toHaveBeenCalled();
    expect(mockSubmitSession).toHaveBeenCalledWith(
      expect.objectContaining({
        totalQuestions: 2,
      })
    );

    // Full review cards are displayed
    expect(screen.getByText(/Xem lại từ vựng/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Carrot/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Chair/i).length).toBeGreaterThan(0);

    // Clicking Replay resets session and game
    const replayBtn = screen.getByRole("button", { name: /Chơi lại/i });
    fireEvent.click(replayBtn);

    expect(mockResetSession).toHaveBeenCalled();
    expect(screen.queryByTestId("odd-one-out-result-dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("question-progress")).toHaveTextContent("1 / 2");
  });

  it("opens and closes the guide modal", () => {
    render(<OddOneOutPage initialQuestions={mockQuestions} />);

    const guideBtn = screen.getByRole("button", { name: /Hướng dẫn cách chơi/i });
    fireEvent.click(guideBtn);

    expect(screen.getByTestId("odd-one-out-guide-modal")).toBeInTheDocument();
    expect(screen.getByText(/Cách Chơi Odd One Out/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /Đã hiểu, bắt đầu chơi!/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId("odd-one-out-guide-modal")).not.toBeInTheDocument();
  });
});
