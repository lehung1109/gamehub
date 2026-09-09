import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FallingWordBubble } from "@/components/game/falling-words/FallingWordBubble";
import { FallingWord } from "@/types/falling-words";

describe("FallingWordBubble Component", () => {
  const sampleWord: FallingWord = {
    id: "test-1",
    word: "DOLPHIN",
    clue: "Cá heo",
    emoji: "🐬",
    lane: 1,
    y: 40,
    speed: 12,
    typedIndex: 3,
    isTargeted: true,
  };

  it("renders the word with typed prefix highlighted and Vietnamese clue", () => {
    render(<FallingWordBubble word={sampleWord} />);
    expect(screen.getByText("Cá heo")).toBeInTheDocument();
    expect(screen.getByText("🐬")).toBeInTheDocument();
    expect(screen.getByText("DOL")).toBeInTheDocument();
    expect(screen.getByText("PHIN")).toBeInTheDocument();
  });

  it("positions bubble correctly according to lane and y coordinates", () => {
    render(<FallingWordBubble word={sampleWord} />);
    const bubble = screen.getByTestId("falling-word-test-1");
    // lane 1 -> 12.5 + 1 * 25 = 37.5%
    expect(bubble.style.left).toBe("37.5%");
    expect(bubble.style.top).toBe("40%");
  });

  it("applies target ring styling when isTargeted is true", () => {
    render(<FallingWordBubble word={sampleWord} />);
    const bubble = screen.getByTestId("falling-word-test-1");
    expect(bubble.className).toContain("ring-4 ring-emerald-400");
    expect(bubble.className).toContain("scale-105");
  });

  it("does not apply target ring when isTargeted is false", () => {
    const untargetedWord: FallingWord = {
      ...sampleWord,
      isTargeted: false,
    };
    render(<FallingWordBubble word={untargetedWord} />);
    const bubble = screen.getByTestId("falling-word-test-1");
    expect(bubble.className).not.toContain("ring-4 ring-emerald-400");
    expect(bubble.className).not.toContain("scale-105");
  });

  it("applies yellow styling and badge for double_score special power", () => {
    const specialWord: FallingWord = {
      ...sampleWord,
      specialType: "double_score",
    };
    const { container } = render(<FallingWordBubble word={specialWord} />);
    expect(container.querySelector(".border-amber-400")).toBeInTheDocument();
    expect(screen.getByText("2x⭐")).toBeInTheDocument();
  });

  it("applies pink styling and badge for heal_life special power", () => {
    const specialWord: FallingWord = {
      ...sampleWord,
      specialType: "heal_life",
    };
    const { container } = render(<FallingWordBubble word={specialWord} />);
    expect(container.querySelector(".border-pink-400")).toBeInTheDocument();
    expect(screen.getByText("+1💖")).toBeInTheDocument();
  });

  it("applies cyan styling and badge for slow_freeze special power", () => {
    const specialWord: FallingWord = {
      ...sampleWord,
      specialType: "slow_freeze",
    };
    const { container } = render(<FallingWordBubble word={specialWord} />);
    expect(container.querySelector(".border-cyan-400")).toBeInTheDocument();
    expect(screen.getByText("❄️")).toBeInTheDocument();
  });

  it("renders gracefully without emoji", () => {
    const noEmojiWord: FallingWord = {
      ...sampleWord,
      emoji: undefined,
    };
    render(<FallingWordBubble word={noEmojiWord} />);
    expect(screen.getByText("DOL")).toBeInTheDocument();
    expect(screen.getByText("PHIN")).toBeInTheDocument();
    expect(screen.queryByText("🐬")).not.toBeInTheDocument();
  });
});
