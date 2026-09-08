import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VirtualKeyboard } from "@/components/game/crossword/VirtualKeyboard";

describe("VirtualKeyboard Component", () => {
  it("renders keys and dispatches onKeyPress", () => {
    const handleKeyPress = vi.fn();
    const handleBackspace = vi.fn();
    const handleToggle = vi.fn();

    render(
      <VirtualKeyboard
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onToggleDirection={handleToggle}
        direction="across"
      />
    );

    const keyA = screen.getByRole("button", { name: "A" });
    fireEvent.click(keyA);
    expect(handleKeyPress).toHaveBeenCalledWith("A");

    const keyZ = screen.getByRole("button", { name: "Z" });
    fireEvent.click(keyZ);
    expect(handleKeyPress).toHaveBeenCalledWith("Z");

    const backspace = screen.getByRole("button", { name: /Xóa/i });
    fireEvent.click(backspace);
    expect(handleBackspace).toHaveBeenCalled();
  });

  it("toggles direction between across (Ngang) and down (Dọc)", () => {
    const handleToggle = vi.fn();
    const { rerender } = render(
      <VirtualKeyboard
        onKeyPress={vi.fn()}
        onBackspace={vi.fn()}
        onToggleDirection={handleToggle}
        direction="across"
      />
    );

    const toggleBtnAcross = screen.getByRole("button", { name: /Ngang/i });
    expect(toggleBtnAcross).toBeInTheDocument();
    fireEvent.click(toggleBtnAcross);
    expect(handleToggle).toHaveBeenCalledTimes(1);

    rerender(
      <VirtualKeyboard
        onKeyPress={vi.fn()}
        onBackspace={vi.fn()}
        onToggleDirection={handleToggle}
        direction="down"
      />
    );

    expect(screen.getByRole("button", { name: /Dọc/i })).toBeInTheDocument();
  });

  it("renders all 26 English alphabet keys", () => {
    render(
      <VirtualKeyboard
        onKeyPress={vi.fn()}
        onBackspace={vi.fn()}
        onToggleDirection={vi.fn()}
        direction="across"
      />
    );

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    for (const letter of letters) {
      expect(screen.getByRole("button", { name: letter })).toBeInTheDocument();
    }
  });
});
