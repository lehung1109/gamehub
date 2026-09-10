import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SemanticWordItem, OddOneOutAnswerResult } from "@/types/odd-one-out";
import { SemanticWordCard } from "@/app/games/odd-one-out/components/SemanticWordCard";
import { WordCardGrid } from "@/app/games/odd-one-out/components/WordCardGrid";
import { ExplanationBanner } from "@/app/games/odd-one-out/components/ExplanationBanner";
import { OddOneOutControls } from "@/app/games/odd-one-out/components/OddOneOutControls";

const mockItems: SemanticWordItem[] = [
  {
    id: "dog-item",
    word: "Dog",
    vietnameseMeaning: "Con chó",
    phonetic: "/dɒɡ/",
    partOfSpeech: "noun",
    emoji: "🐶",
    isOdd: false,
  },
  {
    id: "cat-item",
    word: "Cat",
    vietnameseMeaning: "Con mèo",
    phonetic: "/kæt/",
    partOfSpeech: "noun",
    emoji: "🐱",
    isOdd: false,
  },
  {
    id: "carrot-item",
    word: "Carrot",
    vietnameseMeaning: "Củ cà rốt",
    phonetic: "/ˈkær.ət/",
    partOfSpeech: "noun",
    emoji: "🥕",
    isOdd: true,
    reasonVi: "Carrot là củ quả, các từ còn lại là vật nuôi",
    reasonEn: "Carrot is a vegetable, while the others are pets",
  },
  {
    id: "hamster-item",
    word: "Hamster",
    vietnameseMeaning: "Chuột hamster",
    phonetic: "/ˈhæm.stər/",
    partOfSpeech: "noun",
    emoji: "🐹",
    isOdd: false,
  },
];

describe("SemanticWordCard Component", () => {
  it("renders card content properly including shortcut badge, emoji, word, phonetic, vietnamese meaning, and part of speech", () => {
    render(
      <SemanticWordCard
        item={mockItems[0]}
        index={0}
        isSelected={false}
        isEliminated={false}
        isAnswerChecked={false}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText("[1]")).toBeInTheDocument();
    expect(screen.getByText("🐶")).toBeInTheDocument();
    expect(screen.getByText("Dog")).toBeInTheDocument();
    expect(screen.getByText("/dɒɡ/")).toBeInTheDocument();
    expect(screen.getByText("Con chó")).toBeInTheDocument();
    expect(screen.getByText(/noun/i)).toBeInTheDocument();
  });

  it("calls onSelect when clicked in normal interactive state", () => {
    const handleSelect = vi.fn();
    render(
      <SemanticWordCard
        item={mockItems[0]}
        index={0}
        isSelected={false}
        isEliminated={false}
        isAnswerChecked={false}
        onSelect={handleSelect}
      />
    );

    const card = screen.getByTestId("semantic-card-dog-item");
    fireEvent.click(card);
    expect(handleSelect).toHaveBeenCalledWith("dog-item");
  });

  it("supports keyboard selection via Enter and Space keys", () => {
    const handleSelect = vi.fn();
    render(
      <SemanticWordCard
        item={mockItems[0]}
        index={0}
        isSelected={false}
        isEliminated={false}
        isAnswerChecked={false}
        onSelect={handleSelect}
      />
    );

    const card = screen.getByTestId("semantic-card-dog-item");
    fireEvent.keyDown(card, { key: "Enter" });
    expect(handleSelect).toHaveBeenCalledWith("dog-item");

    fireEvent.keyDown(card, { key: " " });
    expect(handleSelect).toHaveBeenCalledTimes(2);
  });

  it("renders speech audio button with minimum 44px target and triggers onSpeak without triggering onSelect", () => {
    const handleSelect = vi.fn();
    const handleSpeak = vi.fn();

    render(
      <SemanticWordCard
        item={mockItems[0]}
        index={0}
        isSelected={false}
        isEliminated={false}
        isAnswerChecked={false}
        onSelect={handleSelect}
        onSpeak={handleSpeak}
      />
    );

    const speakBtn = screen.getByRole("button", { name: "Nghe phát âm Dog" });
    expect(speakBtn).toBeInTheDocument();
    expect(speakBtn.className).toMatch(/min-h-\[44px\]|h-11|h-12|min-w-\[44px\]|w-11|w-12/);

    fireEvent.click(speakBtn);
    expect(handleSpeak).toHaveBeenCalledWith("Dog");
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("applies highlight ring styling when card is selected", () => {
    render(
      <SemanticWordCard
        item={mockItems[0]}
        index={0}
        isSelected={true}
        isEliminated={false}
        isAnswerChecked={false}
        onSelect={vi.fn()}
      />
    );

    const card = screen.getByTestId("semantic-card-dog-item");
    expect(card.className).toMatch(/ring-4/);
    expect(card.className).toMatch(/ring-indigo-500|ring-amber-500/);
    expect(card).toHaveAttribute("aria-pressed", "true");
  });

  it("applies eliminated styling, is disabled and non-clickable when 50/50 eliminated", () => {
    const handleSelect = vi.fn();
    render(
      <SemanticWordCard
        item={mockItems[0]}
        index={0}
        isSelected={false}
        isEliminated={true}
        isAnswerChecked={false}
        onSelect={handleSelect}
      />
    );

    const card = screen.getByTestId("semantic-card-dog-item");
    expect(card.className).toContain("opacity-35");
    expect(card.className).toContain("line-through");
    expect(card.className).toContain("pointer-events-none");
    expect(card.className).toContain("scale-95");

    fireEvent.click(card);
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("applies green celebration styling to odd item when answer is checked", () => {
    render(
      <SemanticWordCard
        item={mockItems[2]} // carrot isOdd: true
        index={2}
        isSelected={true}
        isEliminated={false}
        isAnswerChecked={true}
        isOddItem={true}
        onSelect={vi.fn()}
      />
    );

    const card = screen.getByTestId("semantic-card-carrot-item");
    expect(card.className).toContain("border-emerald-500");
    expect(card.className).toContain("bg-emerald-50");
  });

  it("applies red error shake styling to incorrectly selected item when answer is checked", () => {
    render(
      <SemanticWordCard
        item={mockItems[0]} // dog isOdd: false
        index={0}
        isSelected={true}
        isEliminated={false}
        isAnswerChecked={true}
        isOddItem={false}
        onSelect={vi.fn()}
      />
    );

    const card = screen.getByTestId("semantic-card-dog-item");
    expect(card.className).toContain("border-rose-500");
    expect(card.className).toContain("bg-rose-50");
    expect(card.className).toContain("animate-shake");
  });

  it("does not call onSelect when disabled is true", () => {
    const handleSelect = vi.fn();
    render(
      <SemanticWordCard
        item={mockItems[0]}
        index={0}
        isSelected={false}
        isEliminated={false}
        isAnswerChecked={false}
        disabled={true}
        onSelect={handleSelect}
      />
    );

    const card = screen.getByTestId("semantic-card-dog-item");
    fireEvent.click(card);
    expect(handleSelect).not.toHaveBeenCalled();
  });
});

describe("WordCardGrid Component", () => {
  it("renders 2x2 grid container with 4 cards and proper testid", () => {
    render(
      <WordCardGrid
        items={mockItems}
        selectedId={null}
        eliminatedIds={[]}
        isAnswerChecked={false}
        onSelect={vi.fn()}
      />
    );

    const grid = screen.getByTestId("word-card-grid");
    expect(grid).toBeInTheDocument();
    expect(grid.className).toContain("grid");
    expect(grid.className).toContain("sm:grid-cols-2");

    mockItems.forEach((item) => {
      expect(screen.getByTestId(`semantic-card-${item.id}`)).toBeInTheDocument();
    });
  });

  it("forwards selection and passes eliminated states correctly to child cards", () => {
    const handleSelect = vi.fn();
    render(
      <WordCardGrid
        items={mockItems}
        selectedId="carrot-item"
        eliminatedIds={["dog-item", "cat-item"]}
        isAnswerChecked={false}
        onSelect={handleSelect}
      />
    );

    const dogCard = screen.getByTestId("semantic-card-dog-item");
    const carrotCard = screen.getByTestId("semantic-card-carrot-item");

    expect(dogCard.className).toContain("opacity-35");
    expect(carrotCard).toHaveAttribute("aria-pressed", "true");

    const hamsterCard = screen.getByTestId("semantic-card-hamster-item");
    fireEvent.click(hamsterCard);
    expect(handleSelect).toHaveBeenCalledWith("hamster-item");
  });

  it("forwards speech trigger to onSpeak prop", () => {
    const handleSpeak = vi.fn();
    render(
      <WordCardGrid
        items={mockItems}
        selectedId={null}
        eliminatedIds={[]}
        isAnswerChecked={false}
        onSelect={vi.fn()}
        onSpeak={handleSpeak}
      />
    );

    const speakCat = screen.getByRole("button", { name: "Nghe phát âm Cat" });
    fireEvent.click(speakCat);
    expect(handleSpeak).toHaveBeenCalledWith("Cat");
  });
});

describe("ExplanationBanner Component", () => {
  const correctResult: OddOneOutAnswerResult = {
    isCorrect: true,
    selectedItem: mockItems[2],
    oddItem: mockItems[2],
    explanationVi: "Chính xác! Cà rốt là thực vật, còn lại là thú cưng.",
    explanationEn: "Correct! Carrot is a plant, others are pets.",
  };

  const incorrectResult: OddOneOutAnswerResult = {
    isCorrect: false,
    selectedItem: mockItems[0],
    oddItem: mockItems[2],
    explanationVi: "Chưa đúng! 'Carrot' mới là kẻ lạc loài vì là thực vật.",
    explanationEn: "Not quite! 'Carrot' is the odd one out as it is a vegetable.",
  };

  it("renders nothing when isVisible is false or result is null", () => {
    const { rerender, container } = render(
      <ExplanationBanner result={correctResult} isVisible={false} />
    );
    expect(container.firstChild).toBeNull();

    rerender(<ExplanationBanner result={null} isVisible={true} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders bilingual explanation with green styling when correct", () => {
    render(<ExplanationBanner result={correctResult} isVisible={true} />);

    const banner = screen.getByTestId("explanation-banner");
    expect(banner).toBeInTheDocument();
    expect(banner.className).toContain("bg-emerald-50");
    expect(banner.className).toContain("border-emerald-500");

    expect(
      screen.getByText("Chính xác! Cà rốt là thực vật, còn lại là thú cưng.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Correct! Carrot is a plant, others are pets.")
    ).toBeInTheDocument();
  });

  it("renders bilingual explanation with rose styling when incorrect", () => {
    render(<ExplanationBanner result={incorrectResult} isVisible={true} />);

    const banner = screen.getByTestId("explanation-banner");
    expect(banner).toBeInTheDocument();
    expect(banner.className).toMatch(/bg-rose-50|bg-amber-50/);
    expect(banner.className).toMatch(/border-rose-500|border-amber-500/);

    expect(
      screen.getByText("Chưa đúng! 'Carrot' mới là kẻ lạc loài vì là thực vật.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Not quite! 'Carrot' is the odd one out as it is a vegetable."
      )
    ).toBeInTheDocument();
  });

  it("allows speaking the odd word via onSpeakWord", () => {
    const handleSpeakWord = vi.fn();
    render(
      <ExplanationBanner
        result={correctResult}
        isVisible={true}
        onSpeakWord={handleSpeakWord}
      />
    );

    const speakBtn = screen.getByRole("button", {
      name: "Nghe phát âm Carrot",
    });
    fireEvent.click(speakBtn);
    expect(handleSpeakWord).toHaveBeenCalledWith("Carrot");
  });
});

describe("OddOneOutControls Component", () => {
  it("renders check answer button and hint buttons when answer is not checked", () => {
    const handleCheck = vi.fn();
    const handleFiftyFifty = vi.fn();
    const handleToggleClue = vi.fn();

    render(
      <OddOneOutControls
        onCheckAnswer={handleCheck}
        onNextQuestion={vi.fn()}
        onApplyFiftyFifty={handleFiftyFifty}
        onToggleClue={handleToggleClue}
        canCheck={true}
        isAnswerChecked={false}
        isFiftyFiftyUsed={false}
        showThemeHint={false}
      />
    );

    const controls = screen.getByTestId("odd-one-out-controls");
    expect(controls).toBeInTheDocument();

    const checkBtn = screen.getByTestId("check-answer-btn");
    expect(checkBtn).toBeInTheDocument();
    expect(checkBtn).not.toBeDisabled();
    expect(checkBtn.className).toMatch(/min-h-\[44px\]|h-11|h-12/);

    fireEvent.click(checkBtn);
    expect(handleCheck).toHaveBeenCalledTimes(1);

    const fiftyFiftyBtn = screen.getByTestId("fifty-fifty-btn");
    expect(fiftyFiftyBtn).not.toBeDisabled();
    expect(fiftyFiftyBtn.className).toMatch(/min-h-\[44px\]|h-11|h-12/);

    fireEvent.click(fiftyFiftyBtn);
    expect(handleFiftyFifty).toHaveBeenCalledTimes(1);

    const clueBtn = screen.getByTestId("theme-clue-btn");
    expect(clueBtn).not.toBeDisabled();
    expect(clueBtn.className).toMatch(/min-h-\[44px\]|h-11|h-12/);

    fireEvent.click(clueBtn);
    expect(handleToggleClue).toHaveBeenCalledTimes(1);
  });

  it("disables check answer button when canCheck is false", () => {
    render(
      <OddOneOutControls
        onCheckAnswer={vi.fn()}
        onNextQuestion={vi.fn()}
        onApplyFiftyFifty={vi.fn()}
        onToggleClue={vi.fn()}
        canCheck={false}
        isAnswerChecked={false}
        isFiftyFiftyUsed={false}
        showThemeHint={false}
      />
    );

    expect(screen.getByTestId("check-answer-btn")).toBeDisabled();
  });

  it("renders next question button when isAnswerChecked is true and triggers onNextQuestion", () => {
    const handleNext = vi.fn();
    render(
      <OddOneOutControls
        onCheckAnswer={vi.fn()}
        onNextQuestion={handleNext}
        onApplyFiftyFifty={vi.fn()}
        onToggleClue={vi.fn()}
        canCheck={false}
        isAnswerChecked={true}
        isFiftyFiftyUsed={false}
        showThemeHint={false}
      />
    );

    const nextBtn = screen.getByTestId("next-question-btn");
    expect(nextBtn).toBeInTheDocument();
    expect(nextBtn.className).toMatch(/min-h-\[44px\]|h-11|h-12/);

    fireEvent.click(nextBtn);
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it("disables 50/50 button when isFiftyFiftyUsed is true", () => {
    render(
      <OddOneOutControls
        onCheckAnswer={vi.fn()}
        onNextQuestion={vi.fn()}
        onApplyFiftyFifty={vi.fn()}
        onToggleClue={vi.fn()}
        canCheck={true}
        isAnswerChecked={false}
        isFiftyFiftyUsed={true}
        showThemeHint={false}
      />
    );

    expect(screen.getByTestId("fifty-fifty-btn")).toBeDisabled();
  });

  it("displays clue text when showThemeHint is true and clueText is provided", () => {
    const { rerender } = render(
      <OddOneOutControls
        onCheckAnswer={vi.fn()}
        onNextQuestion={vi.fn()}
        onApplyFiftyFifty={vi.fn()}
        onToggleClue={vi.fn()}
        canCheck={true}
        isAnswerChecked={false}
        isFiftyFiftyUsed={false}
        showThemeHint={false}
        clueText="Các từ này đều là vật nuôi trong nhà"
      />
    );

    expect(
      screen.queryByText("Các từ này đều là vật nuôi trong nhà")
    ).not.toBeInTheDocument();

    rerender(
      <OddOneOutControls
        onCheckAnswer={vi.fn()}
        onNextQuestion={vi.fn()}
        onApplyFiftyFifty={vi.fn()}
        onToggleClue={vi.fn()}
        canCheck={true}
        isAnswerChecked={false}
        isFiftyFiftyUsed={false}
        showThemeHint={true}
        clueText="Các từ này đều là vật nuôi trong nhà"
      />
    );

    expect(
      screen.getByText(/Các từ này đều là vật nuôi trong nhà/i)
    ).toBeInTheDocument();
  });

  it("disables all controls when disabled prop is true", () => {
    render(
      <OddOneOutControls
        onCheckAnswer={vi.fn()}
        onNextQuestion={vi.fn()}
        onApplyFiftyFifty={vi.fn()}
        onToggleClue={vi.fn()}
        canCheck={true}
        isAnswerChecked={false}
        isFiftyFiftyUsed={false}
        showThemeHint={false}
        disabled={true}
      />
    );

    expect(screen.getByTestId("check-answer-btn")).toBeDisabled();
    expect(screen.getByTestId("fifty-fifty-btn")).toBeDisabled();
    expect(screen.getByTestId("theme-clue-btn")).toBeDisabled();
  });
});
