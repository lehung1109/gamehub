import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  GameGuideModal,
  GameGuideHeaderButton,
} from "@/components/game/GameGuideModal";
import { getGameInstruction } from "@/data/game-instructions";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/games/spelling"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

describe("GameGuideModal component", () => {
  const instruction = getGameInstruction("spelling")!;

  it("renders game guide modal content when open", () => {
    render(
      <GameGuideModal
        instruction={instruction}
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByRole("heading", { name: "Đánh vần" })).toBeInTheDocument();
    expect(screen.getByText(/Spelling/i)).toBeInTheDocument();
    expect(screen.getByText(instruction.goal)).toBeInTheDocument();
    expect(screen.getByText(instruction.steps[0])).toBeInTheDocument();
    expect(screen.getByText(/Đã hiểu, chơi thôi!/i)).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when clicking the dismiss button", () => {
    const onOpenChange = vi.fn();
    render(
      <GameGuideModal
        instruction={instruction}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    const dismissBtn = screen.getByText(/Đã hiểu, chơi thôi!/i);
    fireEvent.click(dismissBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("GameGuideHeaderButton component", () => {
  it("renders the help button and opens modal on click based on current pathname", () => {
    render(<GameGuideHeaderButton />);

    const button = screen.getByRole("button", { name: /Hướng dẫn/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    // Should display the Spelling guide since pathname is /games/spelling
    expect(screen.getByRole("heading", { name: "Đánh vần" })).toBeInTheDocument();
  });
});
