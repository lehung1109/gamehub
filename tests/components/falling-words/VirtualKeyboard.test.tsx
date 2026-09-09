import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VirtualKeyboard } from "@/components/game/falling-words/VirtualKeyboard";

describe("VirtualKeyboard Component", () => {
  it("renders with role=region and aria-label", () => {
    render(
      <VirtualKeyboard
        onKeyPress={vi.fn()}
        onTriggerBomb={vi.fn()}
        bombsAvailable={0}
      />
    );

    const keyboardRegion = screen.getByRole("region", { name: "Bàn phím ảo" });
    expect(keyboardRegion).toBeInTheDocument();
  });

  it("renders all 26 alphabet keys with min 44px vertical touch target", () => {
    const onKeyPress = vi.fn();
    render(
      <VirtualKeyboard
        onKeyPress={onKeyPress}
        onTriggerBomb={vi.fn()}
        bombsAvailable={0}
      />
    );

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    for (const letter of letters) {
      const keyBtn = screen.getByRole("button", { name: letter });
      expect(keyBtn).toBeInTheDocument();
      expect(keyBtn).toHaveClass("min-h-[44px]");
    }

    const aKey = screen.getByRole("button", { name: "A" });
    fireEvent.click(aKey);
    expect(onKeyPress).toHaveBeenCalledWith("A");

    const zKey = screen.getByRole("button", { name: "Z" });
    fireEvent.click(zKey);
    expect(onKeyPress).toHaveBeenCalledWith("Z");
  });

  it("handles Smart Bomb space button click when bombsAvailable > 0", () => {
    const onTriggerBomb = vi.fn();
    render(
      <VirtualKeyboard
        onKeyPress={vi.fn()}
        onTriggerBomb={onTriggerBomb}
        bombsAvailable={2}
      />
    );

    const bombSpaceBtn = screen.getByRole("button", {
      name: /phím cách bom tổng|bom toàn màn hình/i,
    });
    expect(bombSpaceBtn).toBeInTheDocument();
    expect(bombSpaceBtn).toBeEnabled();
    expect(bombSpaceBtn).toHaveClass("min-h-[44px]");
    expect(bombSpaceBtn).toHaveTextContent("BOM TOÀN MÀN HÌNH (SPACE)");

    fireEvent.click(bombSpaceBtn);
    expect(onTriggerBomb).toHaveBeenCalledTimes(1);
  });

  it("disables Smart Bomb space button when bombsAvailable === 0", () => {
    const onTriggerBomb = vi.fn();
    render(
      <VirtualKeyboard
        onKeyPress={vi.fn()}
        onTriggerBomb={onTriggerBomb}
        bombsAvailable={0}
      />
    );

    const bombSpaceBtn = screen.getByRole("button", {
      name: /phím cách bom tổng|bom toàn màn hình/i,
    });
    expect(bombSpaceBtn).toBeDisabled();
    fireEvent.click(bombSpaceBtn);
    expect(onTriggerBomb).not.toHaveBeenCalled();
  });
});
