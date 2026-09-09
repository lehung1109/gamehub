import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { WordleGrid } from "@/app/games/wordle/components/WordleGrid";
import { WordleKeyboard } from "@/app/games/wordle/components/WordleKeyboard";
import { WordleRow } from "@/app/games/wordle/components/WordleRow";
import { WordleTile } from "@/app/games/wordle/components/WordleTile";

describe("WordleGrid and WordleKeyboard Components", () => {
  describe("WordleGrid", () => {
    it("renders 6 rows with correct number of tiles per row", () => {
      render(
        <WordleGrid
          wordLength={5}
          maxAttempts={6}
          guesses={["LIGHT"]}
          currentGuess="AP"
          targetWord="APPLE"
          isShaking={false}
          revealedPositions={{}}
        />
      );

      const rows = screen.getAllByTestId(/^wordle-row-/);
      expect(rows.length).toBe(6);

      // Check first row (LIGHT) has 5 tiles
      const firstRow = screen.getByTestId("wordle-row-0");
      const tiles = firstRow.querySelectorAll("[data-testid^='wordle-tile-']");
      expect(tiles.length).toBe(5);
    });

    it("evaluates completed row letters against target word", () => {
      render(
        <WordleGrid
          wordLength={5}
          maxAttempts={6}
          guesses={["PAPER"]}
          currentGuess=""
          targetWord="APPLE"
          isShaking={false}
          revealedPositions={{}}
        />
      );

      const row0 = screen.getByTestId("wordle-row-0");
      // P: present (amber)
      expect(row0.querySelector("[data-testid='wordle-tile-0']")).toHaveAttribute("data-status", "present");
      // A: present (amber)
      expect(row0.querySelector("[data-testid='wordle-tile-1']")).toHaveAttribute("data-status", "present");
      // P: correct (emerald)
      expect(row0.querySelector("[data-testid='wordle-tile-2']")).toHaveAttribute("data-status", "correct");
      // E: present (amber)
      expect(row0.querySelector("[data-testid='wordle-tile-3']")).toHaveAttribute("data-status", "present");
      // R: absent (slate)
      expect(row0.querySelector("[data-testid='wordle-tile-4']")).toHaveAttribute("data-status", "absent");
    });

    it("renders current guess letters in active row", () => {
      render(
        <WordleGrid
          wordLength={5}
          maxAttempts={6}
          guesses={["TIGER"]}
          currentGuess="CAT"
          targetWord="APPLE"
          isShaking={false}
          revealedPositions={{}}
        />
      );

      const activeRow = screen.getByTestId("wordle-row-1");
      expect(activeRow.querySelector("[data-testid='wordle-tile-0']")).toHaveTextContent("C");
      expect(activeRow.querySelector("[data-testid='wordle-tile-1']")).toHaveTextContent("A");
      expect(activeRow.querySelector("[data-testid='wordle-tile-2']")).toHaveTextContent("T");
      expect(activeRow.querySelector("[data-testid='wordle-tile-3']")).toHaveTextContent("");
    });

    it("applies shake animation to active row when isShaking is true", () => {
      const { rerender } = render(
        <WordleGrid
          wordLength={5}
          maxAttempts={6}
          guesses={[]}
          currentGuess="XYZ"
          targetWord="APPLE"
          isShaking={true}
          revealedPositions={{}}
        />
      );

      const activeRow = screen.getByTestId("wordle-row-0");
      expect(activeRow.className).toContain("animate-shake");

      rerender(
        <WordleGrid
          wordLength={5}
          maxAttempts={6}
          guesses={[]}
          currentGuess="XYZ"
          targetWord="APPLE"
          isShaking={false}
          revealedPositions={{}}
        />
      );

      expect(activeRow.className).not.toContain("animate-shake");
    });

    it("displays revealed position hint in active row", () => {
      render(
        <WordleGrid
          wordLength={5}
          maxAttempts={6}
          guesses={[]}
          currentGuess=""
          targetWord="APPLE"
          isShaking={false}
          revealedPositions={{ 2: "P" }}
        />
      );

      const activeRow = screen.getByTestId("wordle-row-0");
      const tile2 = activeRow.querySelector("[data-testid='wordle-tile-2']");
      expect(tile2).toHaveTextContent("P");
      expect(tile2).toHaveAttribute("data-hint", "true");
    });
  });

  describe("WordleRow and WordleTile", () => {
    it("WordleTile renders with appropriate color classes for each status", () => {
      const { rerender } = render(<WordleTile char="A" status="correct" index={0} />);
      const tile = screen.getByTestId("wordle-tile-0");
      expect(tile.className).toContain("bg-emerald-600");
      expect(tile).toHaveTextContent("A");

      rerender(<WordleTile char="B" status="present" index={1} />);
      expect(screen.getByTestId("wordle-tile-1").className).toContain("bg-amber-500");

      rerender(<WordleTile char="C" status="absent" index={2} />);
      expect(screen.getByTestId("wordle-tile-2").className).toContain("bg-slate-500");
    });

    it("WordleTile applies staggered animation delay based on index", () => {
      render(<WordleTile char="A" status="correct" index={3} />);
      const tile = screen.getByTestId("wordle-tile-3");
      expect(tile.style.animationDelay).toBe("450ms");
    });

    it("WordleRow applies win bounce animation to tiles when isWinning is true", () => {
      render(
        <WordleRow
          rowIndex={0}
          wordLength={5}
          guess="APPLE"
          targetWord="APPLE"
          isCurrentRow={false}
          isWinning={true}
        />
      );

      const row = screen.getByTestId("wordle-row-0");
      const tiles = row.querySelectorAll("[data-testid^='wordle-tile-']");
      tiles.forEach((t) => {
        expect(t.className).toContain("animate-wordle-bounce");
      });
    });
  });

  describe("WordleKeyboard", () => {
    it("renders all QWERTY keyboard keys with Enter and Backspace", () => {
      const onKey = vi.fn();
      const onEnter = vi.fn();
      const onBackspace = vi.fn();

      render(
        <WordleKeyboard
          onKeyPress={onKey}
          onEnter={onEnter}
          onBackspace={onBackspace}
          keyStatus={{ A: "correct", B: "absent" }}
        />
      );

      const keyA = screen.getByRole("button", { name: "A" });
      fireEvent.click(keyA);
      expect(onKey).toHaveBeenCalledWith("A");

      const enterBtn = screen.getByRole("button", { name: /ENTER/i });
      fireEvent.click(enterBtn);
      expect(onEnter).toHaveBeenCalled();

      const backspaceBtn = screen.getByRole("button", { name: /DELETE|BACKSPACE|⌫/i });
      fireEvent.click(backspaceBtn);
      expect(onBackspace).toHaveBeenCalled();
    });

    it("applies correct color feedback to keys based on keyStatus", () => {
      render(
        <WordleKeyboard
          onKeyPress={vi.fn()}
          onEnter={vi.fn()}
          onBackspace={vi.fn()}
          keyStatus={{
            E: "correct",
            R: "present",
            T: "absent",
          }}
        />
      );

      const keyE = screen.getByRole("button", { name: "E" });
      expect(keyE.className).toContain("bg-emerald-600");

      const keyR = screen.getByRole("button", { name: "R" });
      expect(keyR.className).toContain("bg-amber-500");

      const keyT = screen.getByRole("button", { name: "T" });
      expect(keyT.className).toContain("bg-slate-500");
    });

    it("handles physical keyboard keydown events", () => {
      const onKey = vi.fn();
      const onEnter = vi.fn();
      const onBackspace = vi.fn();

      render(
        <WordleKeyboard
          onKeyPress={onKey}
          onEnter={onEnter}
          onBackspace={onBackspace}
          enablePhysicalKeyboard={true}
        />
      );

      fireEvent.keyDown(window, { key: "k" });
      expect(onKey).toHaveBeenCalledWith("K");

      fireEvent.keyDown(window, { key: "Enter" });
      expect(onEnter).toHaveBeenCalled();

      fireEvent.keyDown(window, { key: "Backspace" });
      expect(onBackspace).toHaveBeenCalled();
    });

    it("has touch target min-height of at least 44px", () => {
      render(
        <WordleKeyboard
          onKeyPress={vi.fn()}
          onEnter={vi.fn()}
          onBackspace={vi.fn()}
        />
      );

      const keyA = screen.getByRole("button", { name: "A" });
      expect(keyA.className).toMatch(/min-h-\[44px\]|min-h-\[48px\]|h-12|h-14/);
    });
  });
});
