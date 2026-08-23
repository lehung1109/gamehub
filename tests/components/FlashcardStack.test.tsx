import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlashcardStack } from "@/components/game/FlashcardStack";
import { Word } from "@/types";

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

const mockWords: Word[] = [
  {
    id: "animal-cat",
    english: "Cat",
    phonetic: "/kæt/",
    vietnamese: "Con mèo",
    emoji: "🐱",
    topicId: "animals",
  },
  {
    id: "animal-dog",
    english: "Dog",
    phonetic: "/dɒɡ/",
    vietnamese: "Con chó",
    emoji: "🐶",
    topicId: "animals",
  },
  {
    id: "animal-pig",
    english: "Pig",
    phonetic: "/pɪɡ/",
    vietnamese: "Con heo",
    emoji: "🐷",
    topicId: "animals",
  },
];

describe("FlashcardStack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the first card showing front side with emoji and progress", () => {
    render(<FlashcardStack words={mockWords} topicTitle="Động vật" />);

    expect(screen.getByText("Động vật")).toBeInTheDocument();
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
    expect(screen.getAllByText("🐱").length).toBeGreaterThanOrEqual(1);
    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it("flips the card on click, reveals English word, and automatically speaks pronunciation", () => {
    render(<FlashcardStack words={mockWords} />);

    const card = screen.getByRole("button", { name: /lật thẻ/i });
    expect(card).toBeInTheDocument();

    // Click to flip to back
    fireEvent.click(card);

    expect(screen.getByText("Cat")).toBeInTheDocument();
    expect(screen.getByText("/kæt/")).toBeInTheDocument();
    expect(screen.getByText("Con mèo")).toBeInTheDocument();
    // Auto speech should have been triggered
    expect(mockSpeak).toHaveBeenCalledWith("Cat");

    // Flipping back to front cancels speech
    fireEvent.click(card);
    expect(mockCancel).toHaveBeenCalled();
  });

  it("does not flip the card when clicking or keying on the SpeakButton", () => {
    render(<FlashcardStack words={mockWords} />);

    // Flip to back first
    const card = screen.getByRole("button", { name: /lật thẻ/i });
    fireEvent.click(card);
    expect(screen.getByText("Cat")).toBeInTheDocument();
    mockSpeak.mockClear();

    const speakButton = screen.getByRole("button", { name: /phát âm/i });
    fireEvent.click(speakButton);
    // Should still remain on back face (showing Cat) and speak was called by button
    expect(screen.getByText("Cat")).toBeInTheDocument();
    expect(mockSpeak).toHaveBeenCalledWith("Cat", "en-US");

    fireEvent.keyDown(speakButton, { key: "Enter" });
    expect(screen.getByText("Cat")).toBeInTheDocument();
  });

  it("navigates to next card, resets flip state, and updates progress", () => {
    render(<FlashcardStack words={mockWords} />);

    const card = screen.getByRole("button", { name: /lật thẻ/i });
    fireEvent.click(card);
    expect(screen.getByText("Cat")).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: /tiếp/i });
    fireEvent.click(nextButton);

    // Should now show Dog
    expect(screen.getByText(/2 \/ 3/)).toBeInTheDocument();
    expect(screen.getAllByText("🐶").length).toBeGreaterThanOrEqual(1);

    // Previous button should now be enabled
    const prevButton = screen.getByRole("button", { name: /trước/i });
    expect(prevButton).not.toBeDisabled();

    // Click previous to go back to Cat
    fireEvent.click(prevButton);
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
    expect(screen.getAllByText("🐱").length).toBeGreaterThanOrEqual(1);
  });

  it("supports touch swipe gestures (left to next, right to prev)", () => {
    render(<FlashcardStack words={mockWords} />);

    const card = screen.getByRole("button", { name: /lật thẻ/i });

    // Swipe left (start at 200, end at 100) -> Next
    fireEvent.touchStart(card, {
      touches: [{ clientX: 200, clientY: 100 }],
    });
    fireEvent.touchEnd(card, {
      changedTouches: [{ clientX: 100, clientY: 100 }],
    });

    expect(screen.getByText(/2 \/ 3/)).toBeInTheDocument();
    expect(screen.getAllByText("🐶").length).toBeGreaterThanOrEqual(1);

    // Swipe right (start at 100, end at 200) -> Prev
    fireEvent.touchStart(card, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(card, {
      changedTouches: [{ clientX: 200, clientY: 100 }],
    });

    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
    expect(screen.getAllByText("🐱").length).toBeGreaterThanOrEqual(1);
  });

  it("handles keyboard navigation and ignores modifier keys", () => {
    render(<FlashcardStack words={mockWords} />);

    // Press Space or Enter on the card container
    const card = screen.getByRole("button", { name: /lật thẻ/i });
    fireEvent.keyDown(card, { key: " " });
    expect(screen.getByText("Cat")).toBeInTheDocument();

    // Alt + ArrowLeft should not trigger navigation
    fireEvent.keyDown(window, { key: "ArrowLeft", altKey: true });
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();

    // Navigate with ArrowRight
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText(/2 \/ 3/)).toBeInTheDocument();

    // Navigate with ArrowLeft
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
  });

  it("shows completion screen on completing the last card and allows restarting", () => {
    const onComplete = vi.fn();
    render(<FlashcardStack words={mockWords} onComplete={onComplete} />);

    const nextButton = () => screen.getByRole("button", { name: /tiếp/i });

    // 1 -> 2
    fireEvent.click(nextButton());
    // 2 -> 3
    fireEvent.click(nextButton());

    // On last card, button should indicate finish / complete
    const finishButton = screen.getByRole("button", { name: /hoàn thành/i });
    fireEvent.click(finishButton);

    expect(onComplete).toHaveBeenCalled();
    expect(screen.getByRole("heading", { level: 2, name: /xuất sắc/i })).toBeInTheDocument();

    // Restart button
    const restartButton = screen.getByRole("button", { name: /học lại/i });
    fireEvent.click(restartButton);

    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
    expect(screen.getAllByText("🐱").length).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state gracefully when words array is empty", () => {
    render(<FlashcardStack words={[]} />);
    expect(
      screen.getByText(/chưa có từ vựng nào/i)
    ).toBeInTheDocument();
  });

  it('submits game session with fixed score of 5 on completion', async () => {
    const gameTrackingHook = await import('@/hooks/use-game-tracking')
    const mockSubmitSession = vi.fn().mockResolvedValue(true)
    const mockRecordQuestion = vi.fn()
    const mockResetSession = vi.fn()

    vi.spyOn(gameTrackingHook, 'useGameTracking').mockReturnValue({
      isTracking: true,
      isAnonymous: false,
      session: { classCode: 'ABC123', studentName: 'Bé Linh' },
      details: [],
      recordQuestion: mockRecordQuestion,
      submitSession: mockSubmitSession,
      resetSession: mockResetSession,
    })

    render(<FlashcardStack words={mockWords} topicId="animals" topicTitle="Động vật" />)

    const nextButton = () => screen.getByRole('button', { name: /tiếp/i })
    fireEvent.click(nextButton())
    fireEvent.click(nextButton())

    const finishButton = screen.getByRole('button', { name: /hoàn thành/i })
    fireEvent.click(finishButton)

    expect(mockSubmitSession).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 5,
        totalQuestions: 3,
        topic: 'animals',
      })
    )
  })
});
