import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArcadeHeader } from "@/components/game/falling-words/ArcadeHeader";

describe("ArcadeHeader Component", () => {
  it("renders hearts, timer, score, combo and handles bomb click", () => {
    const onTriggerBomb = vi.fn();
    const onTopicChange = vi.fn();

    render(
      <ArcadeHeader
        topicId="animals"
        onTopicChange={onTopicChange}
        lives={3}
        timeLeft={45}
        score={350}
        combo={4}
        bombsAvailable={1}
        onTriggerBomb={onTriggerBomb}
      />
    );

    // Hearts aria-label
    expect(screen.getByLabelText(/số mạng còn lại: 3/i)).toBeInTheDocument();

    // Timer, score, combo
    expect(screen.getByText("45s")).toBeInTheDocument();
    expect(screen.getByText("350")).toBeInTheDocument();
    expect(screen.getByText("4x")).toBeInTheDocument();

    // Bomb button active
    const bombBtn = screen.getByRole("button", { name: /kích hoạt bom/i });
    expect(bombBtn).toBeEnabled();
    expect(bombBtn).toHaveClass("min-h-[44px]");
    fireEvent.click(bombBtn);
    expect(onTriggerBomb).toHaveBeenCalledTimes(1);

    // Back link to "/"
    const backLink = screen.getByRole("link", { name: /gamehub/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");
    expect(backLink).toHaveClass("min-h-[44px]");

    // Topic selector
    const topicSelect = screen.getByRole("combobox", { name: /chọn chủ đề/i });
    expect(topicSelect).toHaveValue("animals");
    expect(topicSelect).toHaveClass("min-h-[44px]");
    fireEvent.change(topicSelect, { target: { value: "fruits" } });
    expect(onTopicChange).toHaveBeenCalledWith("fruits");
  });

  it("disables bomb button when bombsAvailable is 0", () => {
    const onTriggerBomb = vi.fn();
    render(
      <ArcadeHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        lives={2}
        timeLeft={20}
        score={100}
        combo={0}
        bombsAvailable={0}
        onTriggerBomb={onTriggerBomb}
      />
    );

    const bombBtn = screen.getByRole("button", { name: /kích hoạt bom/i });
    expect(bombBtn).toBeDisabled();
    fireEvent.click(bombBtn);
    expect(onTriggerBomb).not.toHaveBeenCalled();
    expect(screen.getByText("BOM (0)")).toBeInTheDocument();
  });

  it("applies red pulse animation to timer when timeLeft <= 10", () => {
    const { rerender } = render(
      <ArcadeHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        lives={1}
        timeLeft={10}
        score={500}
        combo={2}
        bombsAvailable={0}
        onTriggerBomb={vi.fn()}
      />
    );

    const timerElement = screen.getByText("10s");
    expect(timerElement.className).toContain("text-red-400");
    expect(timerElement.className).toContain("animate-pulse");

    rerender(
      <ArcadeHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        lives={1}
        timeLeft={25}
        score={500}
        combo={2}
        bombsAvailable={0}
        onTriggerBomb={vi.fn()}
      />
    );

    const normalTimerElement = screen.getByText("25s");
    expect(normalTimerElement.className).toContain("text-emerald-400");
    expect(normalTimerElement.className).not.toContain("animate-pulse");
  });

  it("updates hearts aria-label with current lives", () => {
    render(
      <ArcadeHeader
        topicId="animals"
        onTopicChange={vi.fn()}
        lives={1}
        timeLeft={30}
        score={200}
        combo={1}
        bombsAvailable={0}
        onTriggerBomb={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/số mạng còn lại: 1/i)).toBeInTheDocument();
  });
});
