import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HangmanKeyboard } from "@/components/game/hangman/HangmanKeyboard";

describe("HangmanKeyboard Component", () => {
  it("renders keyboard container with role region and Vietnamese ARIA label", () => {
    render(
      <HangmanKeyboard
        guessedLetters={new Set()}
        currentWordLetters={new Set(["C", "A", "T"])}
        onKeyPress={vi.fn()}
        disabled={false}
      />
    );

    const region = screen.getByRole("region", { name: "Bàn phím chữ cái" });
    expect(region).toBeInTheDocument();
  });

  it("renders exactly 26 letter buttons, each having min 44px vertical touch target", () => {
    render(
      <HangmanKeyboard
        guessedLetters={new Set()}
        currentWordLetters={new Set(["A"])}
        onKeyPress={vi.fn()}
        disabled={false}
      />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(26);

    buttons.forEach((btn) => {
      expect(btn.className).toContain("min-h-[44px]");
    });
  });

  it("handles key press for unguessed letters", () => {
    const onKeyPress = vi.fn();
    render(
      <HangmanKeyboard
        guessedLetters={new Set(["A"])}
        currentWordLetters={new Set(["A", "T"])}
        onKeyPress={onKeyPress}
        disabled={false}
      />
    );

    const bKey = screen.getByRole("button", { name: "B" });
    expect(bKey).toBeEnabled();
    expect(bKey.className).toContain("bg-slate-800");

    fireEvent.click(bKey);
    expect(onKeyPress).toHaveBeenCalledWith("B");
  });

  it("styles correct guessed letters with emerald-600 and disables them", () => {
    const onKeyPress = vi.fn();
    render(
      <HangmanKeyboard
        guessedLetters={new Set(["A"])}
        currentWordLetters={new Set(["A", "T"])}
        onKeyPress={onKeyPress}
        disabled={false}
      />
    );

    const aKey = screen.getByRole("button", { name: "A" });
    expect(aKey).toBeDisabled();
    expect(aKey.className).toContain("bg-emerald-600");

    fireEvent.click(aKey);
    expect(onKeyPress).not.toHaveBeenCalled();
  });

  it("styles incorrect guessed letters with dimmed red and disables them", () => {
    const onKeyPress = vi.fn();
    render(
      <HangmanKeyboard
        guessedLetters={new Set(["Z"])}
        currentWordLetters={new Set(["A", "T"])}
        onKeyPress={onKeyPress}
        disabled={false}
      />
    );

    const zKey = screen.getByRole("button", { name: "Z" });
    expect(zKey).toBeDisabled();
    expect(zKey.className).toContain("bg-red-950/80");
    expect(zKey.className).toContain("opacity-40");

    fireEvent.click(zKey);
    expect(onKeyPress).not.toHaveBeenCalled();
  });

  it("disables all buttons when disabled prop is true", () => {
    const onKeyPress = vi.fn();
    render(
      <HangmanKeyboard
        guessedLetters={new Set()}
        currentWordLetters={new Set(["A"])}
        onKeyPress={onKeyPress}
        disabled={true}
      />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
      expect(btn.className).toContain("cursor-not-allowed");
    });

    const mKey = screen.getByRole("button", { name: "M" });
    fireEvent.click(mKey);
    expect(onKeyPress).not.toHaveBeenCalled();
  });

  it("conforms to typography standard with no sub-16px text classes", () => {
    const { container } = render(
      <HangmanKeyboard
        guessedLetters={new Set(["A"])}
        currentWordLetters={new Set(["A"])}
        onKeyPress={vi.fn()}
        disabled={false}
      />
    );

    const allElements = container.querySelectorAll("*");
    allElements.forEach((el) => {
      const classList = Array.from(el.classList);
      for (const cls of classList) {
        expect(cls).not.toMatch(/^text-(xs|sm|\[1[0-4]px\]|\[[1-9]px\])$/);
      }
    });
  });
});
