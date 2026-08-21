import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LetterGrid } from "@/components/game/LetterGrid";
import { Letter } from "@/types";

const mockLetters: Letter[] = [
  { letter: "A", phonetic: "/eɪ/", exampleWord: "Apple", exampleEmoji: "🍎" },
  { letter: "B", phonetic: "/biː/", exampleWord: "Ball", exampleEmoji: "⚽" },
  { letter: "C", phonetic: "/siː/", exampleWord: "Cat", exampleEmoji: "🐱" },
];

describe("LetterGrid Component", () => {
  it("renders all letters provided in the list", () => {
    render(<LetterGrid letters={mockLetters} />);

    mockLetters.forEach((l) => {
      expect(
        screen.getByRole("button", { name: new RegExp(`^Chữ ${l.letter}\\b`, "i") })
      ).toBeInTheDocument();
    });
  });

  it("calls onSelectLetter when a letter button is clicked", () => {
    const handleSelect = vi.fn();
    render(<LetterGrid letters={mockLetters} onSelectLetter={handleSelect} />);

    const buttonB = screen.getByRole("button", { name: new RegExp(`^Chữ B\\b`, "i") });
    fireEvent.click(buttonB);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockLetters[1]);
  });

  it("indicates selected letter state via aria-pressed or active styles", () => {
    render(
      <LetterGrid
        letters={mockLetters}
        selectedLetter="B"
      />
    );

    const buttonB = screen.getByRole("button", { name: new RegExp(`^Chữ B\\b`, "i") });
    expect(buttonB).toHaveAttribute("aria-pressed", "true");

    const buttonA = screen.getByRole("button", { name: new RegExp(`^Chữ A\\b`, "i") });
    expect(buttonA).toHaveAttribute("aria-pressed", "false");
  });

  it("disables all letter buttons when disabled prop is true", () => {
    const handleSelect = vi.fn();
    render(
      <LetterGrid
        letters={mockLetters}
        disabled={true}
        onSelectLetter={handleSelect}
      />
    );

    const buttonA = screen.getByRole("button", { name: new RegExp(`^Chữ A\\b`, "i") });
    expect(buttonA).toBeDisabled();

    fireEvent.click(buttonA);
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("applies correct and wrong styling when correctLetter or wrongLetter is provided", () => {
    render(
      <LetterGrid
        letters={mockLetters}
        correctLetter="A"
        wrongLetter="C"
      />
    );

    const buttonA = screen.getByRole("button", { name: new RegExp(`^Chữ A\\b`, "i") });
    expect(buttonA.className).toContain("bg-emerald-700");

    const buttonC = screen.getByRole("button", { name: new RegExp(`^Chữ C\\b`, "i") });
    expect(buttonC.className).toContain("bg-rose-600");
  });
});

