import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FallingWordsArena } from "@/components/game/falling-words/FallingWordsArena";
import { FallingWord } from "@/types/falling-words";

describe("FallingWordsArena Component", () => {
  const sampleWords: FallingWord[] = [
    {
      id: "w-1",
      word: "LION",
      clue: "Sư tử",
      lane: 0,
      y: 20,
      speed: 10,
      typedIndex: 0,
      isTargeted: false,
    },
    {
      id: "w-2",
      word: "TIGER",
      clue: "Con hổ",
      lane: 2,
      y: 55,
      speed: 12,
      typedIndex: 1,
      isTargeted: true,
    },
  ];

  it("renders the arena container with role=region and Vietnamese aria-label", () => {
    render(<FallingWordsArena fallingWords={[]} isFrozen={false} />);
    const region = screen.getByRole("region", { name: /khu vực từ rơi/i });
    expect(region).toBeInTheDocument();
  });

  it("renders the danger zone warning banner at the bottom", () => {
    render(<FallingWordsArena fallingWords={[]} isFrozen={false} />);
    expect(screen.getByText(/danger zone/i)).toBeInTheDocument();
  });

  it("renders all falling word bubbles", () => {
    render(<FallingWordsArena fallingWords={sampleWords} isFrozen={false} />);
    expect(screen.getByTestId("falling-word-w-1")).toBeInTheDocument();
    expect(screen.getByTestId("falling-word-w-2")).toBeInTheDocument();
    expect(screen.getByText("Sư tử")).toBeInTheDocument();
    expect(screen.getByText("Con hổ")).toBeInTheDocument();
  });

  it("shows freeze banner when isFrozen is true", () => {
    render(<FallingWordsArena fallingWords={[]} isFrozen={true} />);
    expect(screen.getByText(/đóng băng thời gian/i)).toBeInTheDocument();
  });

  it("hides freeze banner when isFrozen is false", () => {
    render(<FallingWordsArena fallingWords={[]} isFrozen={false} />);
    expect(screen.queryByText(/đóng băng thời gian/i)).not.toBeInTheDocument();
  });

  it("renders 4 vertical guideline lane dividers", () => {
    const { container } = render(<FallingWordsArena fallingWords={[]} isFrozen={false} />);
    const laneGrid = container.querySelector(".grid-cols-4");
    expect(laneGrid).toBeInTheDocument();
    expect(laneGrid?.children.length).toBe(4);
  });
});
