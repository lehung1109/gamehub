import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CluePanel } from "@/components/game/crossword/CluePanel";
import { HintBar } from "@/components/game/crossword/HintBar";
import { CrosswordWord } from "@/types/crossword";

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

const mockWords: CrosswordWord[] = [
  {
    id: "tiger",
    word: "TIGER",
    clue: "Con hổ dũng mãnh",
    direction: "across",
    startRow: 0,
    startCol: 0,
    number: 1,
    isSolved: false,
    isRevealed: false,
  },
  {
    id: "rabbit",
    word: "RABBIT",
    clue: "Con thỏ trắng",
    direction: "down",
    startRow: 0,
    startCol: 4,
    number: 2,
    isSolved: false,
    isRevealed: false,
  },
];

describe("CluePanel Component", () => {
  it("renders Across and Down clue sections", () => {
    render(
      <CluePanel
        words={mockWords}
        activeWordId="tiger"
        onSelectWord={vi.fn()}
      />
    );

    expect(screen.getByText(/Hàng ngang/i)).toBeInTheDocument();
    expect(screen.getByText(/Hàng dọc/i)).toBeInTheDocument();
    expect(screen.getByText("Con hổ dũng mãnh")).toBeInTheDocument();
    expect(screen.getByText("Con thỏ trắng")).toBeInTheDocument();
  });

  it("triggers onSelectWord when clicking a clue item", () => {
    const handleSelect = vi.fn();
    render(
      <CluePanel
        words={mockWords}
        activeWordId="tiger"
        onSelectWord={handleSelect}
      />
    );

    fireEvent.click(screen.getByText("Con thỏ trắng"));
    expect(handleSelect).toHaveBeenCalledWith("rabbit");
  });

  it("triggers pronunciation without selecting the clue item when speech button is clicked", () => {
    mockSpeak.mockClear();
    const handleSelect = vi.fn();
    render(
      <CluePanel
        words={mockWords}
        activeWordId="tiger"
        onSelectWord={handleSelect}
      />
    );

    const speechBtn = screen.getByRole("button", { name: "Phát âm từ số 1" });
    fireEvent.click(speechBtn);

    expect(mockSpeak).toHaveBeenCalledWith("TIGER");
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("highlights the active word clue item and sets aria-selected", () => {
    render(
      <CluePanel
        words={mockWords}
        activeWordId="tiger"
        onSelectWord={vi.fn()}
      />
    );

    const tigerItem = screen.getByText("Con hổ dũng mãnh").closest(".group");
    expect(tigerItem?.className).toContain("border-amber-500/50");

    const rabbitItem = screen.getByText("Con thỏ trắng").closest(".group");
    expect(rabbitItem?.className).not.toContain("border-amber-500/50");

    const tigerBtn = screen.getByRole("button", { name: /Từ 1: Con hổ/i });
    expect(tigerBtn).toHaveAttribute("aria-pressed", "true");

    const rabbitBtn = screen.getByRole("button", { name: /Từ 2: Con thỏ/i });
    expect(rabbitBtn).toHaveAttribute("aria-pressed", "false");
  });
});

describe("HintBar Component", () => {
  it("renders hint action buttons and triggers callbacks", () => {
    mockSpeak.mockClear();
    const handleRevealLetter = vi.fn();
    const handleRevealWord = vi.fn();

    render(
      <HintBar
        activeWord={{ word: "TIGER" }}
        onRevealLetter={handleRevealLetter}
        onRevealWord={handleRevealWord}
        disabled={false}
      />
    );

    const speakBtn = screen.getByRole("button", { name: /Nghe Từ/i });
    fireEvent.click(speakBtn);
    expect(mockSpeak).toHaveBeenCalledWith("TIGER");

    const letterBtn = screen.getByRole("button", { name: /Gợi ý 1 chữ/i });
    fireEvent.click(letterBtn);
    expect(handleRevealLetter).toHaveBeenCalledTimes(1);

    const wordBtn = screen.getByRole("button", { name: /Mở cả từ/i });
    fireEvent.click(wordBtn);
    expect(handleRevealWord).toHaveBeenCalledTimes(1);
  });

  it("disables buttons when disabled is true", () => {
    render(
      <HintBar
        activeWord={{ word: "TIGER" }}
        onRevealLetter={vi.fn()}
        onRevealWord={vi.fn()}
        disabled={true}
      />
    );

    expect(screen.getByRole("button", { name: /Nghe Từ/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Gợi ý 1 chữ/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Mở cả từ/i })).toBeDisabled();
  });

  it("disables speech and word reveal buttons when activeWord is null", () => {
    render(
      <HintBar
        activeWord={null}
        onRevealLetter={vi.fn()}
        onRevealWord={vi.fn()}
        disabled={false}
      />
    );

    expect(screen.getByRole("button", { name: /Nghe Từ/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Gợi ý 1 chữ/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /Mở cả từ/i })).toBeDisabled();
  });
});
