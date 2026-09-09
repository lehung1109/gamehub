import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WordDisplay } from "@/components/game/hangman/WordDisplay";
import { HangmanWord } from "@/types/hangman";

describe("WordDisplay Component", () => {
  const sampleWord: HangmanWord = {
    id: "tiger",
    word: "TIGER",
    clue: "Con hổ",
    emoji: "🐯",
    phonetic: "/ˈtaɪ.ɡɚ/",
  };

  it("renders accessible region with character count", () => {
    render(
      <WordDisplay
        word={sampleWord}
        guessedLetters={new Set(["T", "E"])}
        wordStatus="playing"
      />
    );

    expect(
      screen.getByRole("region", { name: "Từ gồm 5 chữ cái" })
    ).toBeInTheDocument();
  });

  it("renders letter slots correctly with guessed letters and blanks", () => {
    render(
      <WordDisplay
        word={sampleWord}
        guessedLetters={new Set(["T", "E"])}
        wordStatus="playing"
      />
    );

    const slots = screen.getAllByTestId("letter-slot");
    expect(slots).toHaveLength(5);

    // Slot 0: T (guessed)
    expect(slots[0]).toHaveTextContent("T");
    expect(slots[0].className).toContain("text-emerald-400");

    // Slot 1: I (not guessed, playing -> blank/underscore)
    expect(slots[1]).toHaveTextContent("_");
    expect(slots[1].className).toContain("text-transparent");

    // Slot 2: G (not guessed, playing)
    expect(slots[2]).toHaveTextContent("_");

    // Slot 3: E (guessed)
    expect(slots[3]).toHaveTextContent("E");
    expect(slots[3].className).toContain("text-emerald-400");

    // Slot 4: R (not guessed, playing)
    expect(slots[4]).toHaveTextContent("_");
  });

  it("reveals complete answer in amber when wordStatus is lost", () => {
    render(
      <WordDisplay
        word={sampleWord}
        guessedLetters={new Set(["T"])}
        wordStatus="lost"
      />
    );

    const slots = screen.getAllByTestId("letter-slot");
    expect(slots).toHaveLength(5);

    // T is guessed -> emerald
    expect(slots[0]).toHaveTextContent("T");
    expect(slots[0].className).toContain("text-emerald-400");

    // I, G, E, R are revealed in amber
    expect(slots[1]).toHaveTextContent("I");
    expect(slots[1].className).toContain("text-amber-300");

    expect(slots[2]).toHaveTextContent("G");
    expect(slots[2].className).toContain("text-amber-300");

    expect(slots[3]).toHaveTextContent("E");
    expect(slots[3].className).toContain("text-amber-300");

    expect(slots[4]).toHaveTextContent("R");
    expect(slots[4].className).toContain("text-amber-300");
  });

  it("renders clue banner with definition, emoji, and phonetic transcription", () => {
    render(
      <WordDisplay
        word={sampleWord}
        guessedLetters={new Set()}
        wordStatus="playing"
      />
    );

    expect(screen.getByText("Gợi ý nghĩa:")).toBeInTheDocument();
    expect(screen.getByText("Con hổ")).toBeInTheDocument();
    expect(screen.getByText("🐯")).toBeInTheDocument();
    expect(screen.getByText("(/ˈtaɪ.ɡɚ/)")).toBeInTheDocument();
  });

  it("renders clue banner without emoji or phonetic when optional fields are missing", () => {
    const minimalWord: HangmanWord = {
      id: "lion",
      word: "LION",
      clue: "Sư tử",
    };

    render(
      <WordDisplay
        word={minimalWord}
        guessedLetters={new Set()}
        wordStatus="playing"
      />
    );

    expect(screen.getByText("Gợi ý nghĩa:")).toBeInTheDocument();
    expect(screen.getByText("Sư tử")).toBeInTheDocument();
    expect(screen.queryByText("🐯")).not.toBeInTheDocument();
  });
});
