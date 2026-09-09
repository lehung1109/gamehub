import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HangmanHeader } from "@/components/game/hangman/HangmanHeader";

describe("HangmanHeader Component", () => {
  it("renders back to GameHub button with min 44px vertical touch target", () => {
    render(
      <HangmanHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        currentIndex={0}
        totalWords={5}
        score={0}
        hintUsed={false}
        onUseHint={vi.fn()}
        wordStatus="playing"
        onNextWord={vi.fn()}
      />
    );

    const backLink = screen.getByRole("link", { name: /gamehub/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");
    expect(backLink.className).toContain("min-h-[44px]");
  });

  it("renders topic select with 5 topics and triggers onTopicChange", () => {
    const onTopicChange = vi.fn();
    render(
      <HangmanHeader
        topicId="animals"
        onTopicChange={onTopicChange}
        currentIndex={0}
        totalWords={5}
        score={0}
        hintUsed={false}
        onUseHint={vi.fn()}
        wordStatus="playing"
        onNextWord={vi.fn()}
      />
    );

    const select = screen.getByRole("combobox", { name: /chọn chủ đề/i });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue("animals");
    expect(select.className).toContain("min-h-[44px]");

    fireEvent.change(select, { target: { value: "fruits" } });
    expect(onTopicChange).toHaveBeenCalledWith("fruits");
  });

  it("renders word progress index and score badge", () => {
    render(
      <HangmanHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        currentIndex={2}
        totalWords={10}
        score={450}
        hintUsed={false}
        onUseHint={vi.fn()}
        wordStatus="playing"
        onNextWord={vi.fn()}
      />
    );

    expect(screen.getByText("Từ 3/10")).toBeInTheDocument();
    expect(screen.getByText("450")).toBeInTheDocument();
  });

  it("renders enabled hint button during playing state and handles click", () => {
    const onUseHint = vi.fn();
    render(
      <HangmanHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        currentIndex={1}
        totalWords={5}
        score={380}
        hintUsed={false}
        onUseHint={onUseHint}
        wordStatus="playing"
        onNextWord={vi.fn()}
      />
    );

    const hintBtn = screen.getByRole("button", { name: /gợi ý/i });
    expect(hintBtn).toBeInTheDocument();
    expect(hintBtn).toBeEnabled();
    expect(hintBtn.className).toContain("min-h-[44px]");

    fireEvent.click(hintBtn);
    expect(onUseHint).toHaveBeenCalledTimes(1);
  });

  it("disables hint button when hintUsed is true", () => {
    const onUseHint = vi.fn();
    render(
      <HangmanHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        currentIndex={1}
        totalWords={5}
        score={380}
        hintUsed={true}
        onUseHint={onUseHint}
        wordStatus="playing"
        onNextWord={vi.fn()}
      />
    );

    const hintBtn = screen.getByRole("button", { name: /gợi ý/i });
    expect(hintBtn).toBeDisabled();
    fireEvent.click(hintBtn);
    expect(onUseHint).not.toHaveBeenCalled();
  });

  it("shows next word button when wordStatus is won and handles click", () => {
    const onNextWord = vi.fn();
    render(
      <HangmanHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        currentIndex={1}
        totalWords={5}
        score={380}
        hintUsed={false}
        onUseHint={vi.fn()}
        wordStatus="won"
        onNextWord={onNextWord}
      />
    );

    expect(screen.queryByRole("button", { name: /gợi ý/i })).not.toBeInTheDocument();
    const nextBtn = screen.getByRole("button", { name: /từ tiếp theo/i });
    expect(nextBtn).toBeInTheDocument();
    expect(nextBtn.className).toContain("min-h-[44px]");

    fireEvent.click(nextBtn);
    expect(onNextWord).toHaveBeenCalledTimes(1);
  });

  it("shows next word button when wordStatus is lost and handles click", () => {
    const onNextWord = vi.fn();
    render(
      <HangmanHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        currentIndex={3}
        totalWords={5}
        score={100}
        hintUsed={true}
        onUseHint={vi.fn()}
        wordStatus="lost"
        onNextWord={onNextWord}
      />
    );

    expect(screen.queryByRole("button", { name: /gợi ý/i })).not.toBeInTheDocument();
    const nextBtn = screen.getByRole("button", { name: /từ tiếp theo/i });
    expect(nextBtn).toBeInTheDocument();
    expect(nextBtn.className).toContain("min-h-[44px]");

    fireEvent.click(nextBtn);
    expect(onNextWord).toHaveBeenCalledTimes(1);
  });

  it("conforms to typography standard with no sub-16px text classes", () => {
    const { container } = render(
      <HangmanHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        currentIndex={0}
        totalWords={5}
        score={100}
        hintUsed={false}
        onUseHint={vi.fn()}
        wordStatus="playing"
        onNextWord={vi.fn()}
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
