import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WordSlotRow } from "@/app/games/word-connect/components/WordSlotRow";
import { WordSlotsBoard } from "@/app/games/word-connect/components/WordSlotsBoard";
import { LetterWheel } from "@/app/games/word-connect/components/LetterWheel";
import { WordConnectControls } from "@/app/games/word-connect/components/WordConnectControls";
import { WordConnectWordInfo } from "@/types/word-connect";

const MOCK_WORD_CAT: WordConnectWordInfo = {
  word: "CAT",
  vietnameseMeaning: "Con mèo",
  phonetic: "/kæt/",
  partOfSpeech: "noun",
  exampleSentence: "A cute cat.",
};

const MOCK_WORD_ACT: WordConnectWordInfo = {
  word: "ACT",
  vietnameseMeaning: "Hành động",
  phonetic: "/ækt/",
  partOfSpeech: "verb",
  exampleSentence: "Act fast.",
};

const MOCK_WORD_CATS: WordConnectWordInfo = {
  word: "CATS",
  vietnameseMeaning: "Những con mèo",
  phonetic: "/kæts/",
  partOfSpeech: "noun",
  exampleSentence: "Two cats.",
};

describe("WordSlotRow Component", () => {
  it("renders empty dashed tiles when unsolved and no revealed letters", () => {
    render(
      <WordSlotRow
        targetWord={MOCK_WORD_CAT}
        isSolved={false}
      />
    );

    const row = screen.getByTestId("word-slot-row-CAT");
    expect(row).toBeInTheDocument();

    const tiles = row.querySelectorAll("[data-testid^='slot-tile-']");
    expect(tiles.length).toBe(3);
    // Unsolved tiles should not expose letters
    tiles.forEach((tile) => {
      expect(tile.textContent?.trim()).toBe("");
    });
  });

  it("renders revealed letters with amber styling when specified in revealedLetterIndices", () => {
    render(
      <WordSlotRow
        targetWord={MOCK_WORD_CAT}
        isSolved={false}
        revealedLetterIndices={[0, 2]} // 'C' and 'T' revealed, 'A' hidden
      />
    );

    const tile0 = screen.getByTestId("slot-tile-CAT-0");
    const tile1 = screen.getByTestId("slot-tile-CAT-1");
    const tile2 = screen.getByTestId("slot-tile-CAT-2");

    expect(tile0.textContent?.trim()).toBe("C");
    expect(tile0.className).toContain("amber");

    expect(tile1.textContent?.trim()).toBe("");

    expect(tile2.textContent?.trim()).toBe("T");
    expect(tile2.className).toContain("amber");
  });

  it("renders all letters with green styling when isSolved is true", () => {
    const handleSpeak = vi.fn();
    render(
      <WordSlotRow
        targetWord={MOCK_WORD_CAT}
        isSolved={true}
        onSpeakWord={handleSpeak}
      />
    );

    const row = screen.getByTestId("word-slot-row-CAT");
    expect(row).toBeInTheDocument();
    const tile0 = screen.getByTestId("slot-tile-CAT-0");
    const tile1 = screen.getByTestId("slot-tile-CAT-1");
    const tile2 = screen.getByTestId("slot-tile-CAT-2");

    expect(tile0.textContent?.trim()).toBe("C");
    expect(tile1.textContent?.trim()).toBe("A");
    expect(tile2.textContent?.trim()).toBe("T");

    expect(tile0.className).toContain("emerald");
    expect(tile1.className).toContain("emerald");
    expect(tile2.className).toContain("emerald");

    // Speak button should be available when solved
    const speakBtn = screen.getByRole("button", { name: /CAT/i });
    expect(speakBtn).toBeInTheDocument();
    fireEvent.click(speakBtn);
    expect(handleSpeak).toHaveBeenCalledWith("CAT");
  });
});

describe("WordSlotsBoard Component", () => {
  const targetWords = [MOCK_WORD_CAT, MOCK_WORD_ACT, MOCK_WORD_CATS];

  it("renders all target word rows and passes correct solved state and hints", () => {
    const handleSpeak = vi.fn();
    render(
      <WordSlotsBoard
        targetWords={targetWords}
        solvedWords={["CAT"]}
        revealedHints={{ ACT: [1] }}
        onSpeakWord={handleSpeak}
      />
    );

    expect(screen.getByTestId("word-slots-board")).toBeInTheDocument();
    expect(screen.getByTestId("word-slot-row-CAT")).toBeInTheDocument();
    expect(screen.getByTestId("word-slot-row-ACT")).toBeInTheDocument();
    expect(screen.getByTestId("word-slot-row-CATS")).toBeInTheDocument();

    // CAT is solved
    expect(screen.getByTestId("slot-tile-CAT-0").textContent?.trim()).toBe("C");
    expect(screen.getByTestId("slot-tile-CAT-1").textContent?.trim()).toBe("A");
    expect(screen.getByTestId("slot-tile-CAT-2").textContent?.trim()).toBe("T");

    // ACT has index 1 ("C") revealed
    expect(screen.getByTestId("slot-tile-ACT-0").textContent?.trim()).toBe("");
    expect(screen.getByTestId("slot-tile-ACT-1").textContent?.trim()).toBe("C");
    expect(screen.getByTestId("slot-tile-ACT-2").textContent?.trim()).toBe("");

    // CATS has no hints and is unsolved
    expect(screen.getByTestId("slot-tile-CATS-0").textContent?.trim()).toBe("");
  });
});

describe("LetterWheel Component", () => {
  const letters = ["A", "C", "T", "S"];

  it("renders letter wheel container and accessible circular letter buttons", () => {
    const handleSelect = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <LetterWheel
        letters={letters}
        selectedLetters={[]}
        onSelectLetter={handleSelect}
        onSubmit={handleSubmit}
      />
    );

    const wheel = screen.getByTestId("letter-wheel");
    expect(wheel).toBeInTheDocument();

    letters.forEach((letter, index) => {
      const node = screen.getByTestId(`letter-node-${index}`);
      expect(node).toBeInTheDocument();
      expect(node.textContent?.trim()).toBe(letter);
      expect(node).toHaveAttribute("aria-label");
      // Touch target should be at least 48px
      expect(node.className).toMatch(/w-(12|14|16|48px)|h-(12|14|16|48px)|min-w-\[48px\]/);
    });
  });

  it("triggers onSelectLetter when letter buttons are clicked (tap mode)", () => {
    const handleSelect = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <LetterWheel
        letters={letters}
        selectedLetters={[1]} // index 1 ("C") already selected
        onSelectLetter={handleSelect}
        onSubmit={handleSubmit}
      />
    );

    const node0 = screen.getByTestId("letter-node-0"); // "A"
    fireEvent.click(node0);
    expect(handleSelect).toHaveBeenCalledWith(0);

    const node1 = screen.getByTestId("letter-node-1"); // "C"
    expect(node1).toHaveAttribute("aria-pressed", "true");
    expect(node0).toHaveAttribute("aria-pressed", "false");
  });

  it("renders SVG connector lines between selected letters", () => {
    render(
      <LetterWheel
        letters={letters}
        selectedLetters={[1, 0, 2]} // C -> A -> T
        onSelectLetter={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const wheel = screen.getByTestId("letter-wheel");
    const svg = wheel.querySelector("svg");
    expect(svg).toBeInTheDocument();

    const polyline = svg?.querySelector("polyline");
    expect(polyline).toBeInTheDocument();
    expect(polyline).toHaveAttribute("points");
    expect(polyline?.getAttribute("points")?.split(" ").length).toBe(3);
  });

  it("supports continuous pointer drag and auto-submits on pointerUp", () => {
    const handleSelect = vi.fn();
    const handleSubmit = vi.fn();

    render(
      <LetterWheel
        letters={letters}
        selectedLetters={[1]}
        onSelectLetter={handleSelect}
        onSubmit={handleSubmit}
      />
    );

    const wheel = screen.getByTestId("letter-wheel");
    const node1 = screen.getByTestId("letter-node-1");
    const node0 = screen.getByTestId("letter-node-0");

    // Pointer down on letter 1 ("C")
    fireEvent.pointerDown(node1, { pointerId: 1, clientX: 100, clientY: 100 });
    expect(handleSelect).toHaveBeenCalledWith(1);

    // Pointer move over letter 0 ("A")
    fireEvent.pointerMove(node0, { pointerId: 1, clientX: 150, clientY: 100 });
    expect(handleSelect).toHaveBeenCalledWith(0);

    // Pointer up on wheel -> auto-submits
    fireEvent.pointerUp(wheel, { pointerId: 1 });
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("applies shake animation class when isShaking is true", () => {
    render(
      <LetterWheel
        letters={letters}
        selectedLetters={[]}
        onSelectLetter={vi.fn()}
        onSubmit={vi.fn()}
        isShaking={true}
      />
    );

    const wheel = screen.getByTestId("letter-wheel");
    expect(wheel.className).toContain("animate-shake");
  });

  it("disables all letter buttons when disabled is true", () => {
    const handleSelect = vi.fn();
    render(
      <LetterWheel
        letters={letters}
        selectedLetters={[]}
        onSelectLetter={handleSelect}
        onSubmit={vi.fn()}
        disabled={true}
      />
    );

    const node0 = screen.getByTestId("letter-node-0");
    expect(node0).toBeDisabled();
    fireEvent.click(node0);
    expect(handleSelect).not.toHaveBeenCalled();
  });
});

describe("WordConnectControls Component", () => {
  it("renders currentInput in pill badge and action buttons with accessible labels", () => {
    const handleShuffle = vi.fn();
    const handleHint = vi.fn();
    const handleClear = vi.fn();
    const handleBackspace = vi.fn();
    const handleSubmit = vi.fn();
    const handleBonus = vi.fn();

    render(
      <WordConnectControls
        currentInput="CAT"
        onShuffle={handleShuffle}
        onApplyHint={handleHint}
        onClear={handleClear}
        onBackspace={handleBackspace}
        onSubmit={handleSubmit}
        bonusWordsCount={3}
        onOpenBonusModal={handleBonus}
      />
    );

    expect(screen.getByTestId("word-connect-controls")).toBeInTheDocument();

    const display = screen.getByTestId("current-input-display");
    expect(display.textContent).toContain("CAT");

    // Shuffle button
    const shuffleBtn = screen.getByTestId("shuffle-button");
    expect(shuffleBtn).toHaveAttribute("aria-label");
    fireEvent.click(shuffleBtn);
    expect(handleShuffle).toHaveBeenCalledTimes(1);

    // Hint button
    const hintBtn = screen.getByTestId("hint-button");
    expect(hintBtn).toHaveAttribute("aria-label");
    fireEvent.click(hintBtn);
    expect(handleHint).toHaveBeenCalledTimes(1);

    // Backspace button
    const backspaceBtn = screen.getByTestId("backspace-button");
    expect(backspaceBtn).toHaveAttribute("aria-label");
    fireEvent.click(backspaceBtn);
    expect(handleBackspace).toHaveBeenCalledTimes(1);

    // Clear button
    const clearBtn = screen.getByTestId("clear-button");
    expect(clearBtn).toHaveAttribute("aria-label");
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);

    // Submit button
    const submitBtn = screen.getByTestId("submit-button");
    expect(submitBtn).toHaveAttribute("aria-label");
    fireEvent.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledTimes(1);

    // Bonus jar button
    const bonusBtn = screen.getByTestId("bonus-jar-button");
    expect(bonusBtn).toHaveAttribute("aria-label");
    expect(bonusBtn.textContent).toContain("3");
    fireEvent.click(bonusBtn);
    expect(handleBonus).toHaveBeenCalledTimes(1);
  });

  it("applies error shake animation to input badge when errorShake is true", () => {
    render(
      <WordConnectControls
        currentInput="INVALID"
        onShuffle={vi.fn()}
        onApplyHint={vi.fn()}
        onClear={vi.fn()}
        onBackspace={vi.fn()}
        onSubmit={vi.fn()}
        errorShake={true}
      />
    );

    const display = screen.getByTestId("current-input-display");
    expect(display.className).toContain("animate-shake");
  });

  it("disables backspace, clear, and submit when currentInput is empty", () => {
    render(
      <WordConnectControls
        currentInput=""
        onShuffle={vi.fn()}
        onApplyHint={vi.fn()}
        onClear={vi.fn()}
        onBackspace={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByTestId("backspace-button")).toBeDisabled();
    expect(screen.getByTestId("clear-button")).toBeDisabled();
    expect(screen.getByTestId("submit-button")).toBeDisabled();
  });

  it("disables all controls when disabled prop is true", () => {
    render(
      <WordConnectControls
        currentInput="CAT"
        onShuffle={vi.fn()}
        onApplyHint={vi.fn()}
        onClear={vi.fn()}
        onBackspace={vi.fn()}
        onSubmit={vi.fn()}
        disabled={true}
      />
    );

    expect(screen.getByTestId("shuffle-button")).toBeDisabled();
    expect(screen.getByTestId("hint-button")).toBeDisabled();
    expect(screen.getByTestId("backspace-button")).toBeDisabled();
    expect(screen.getByTestId("clear-button")).toBeDisabled();
    expect(screen.getByTestId("submit-button")).toBeDisabled();
  });
});
