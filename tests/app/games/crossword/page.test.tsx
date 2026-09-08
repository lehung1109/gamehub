import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CrosswordPage from "@/app/games/crossword/page";

const mockSpeak = vi.fn();
vi.mock("@/hooks/useSpeech", () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: vi.fn(),
    isSpeaking: false,
    isSupported: true,
  }),
}));

const mockSubmitSession = vi.fn().mockResolvedValue(true);
const mockResetSession = vi.fn();
vi.mock("@/hooks/use-game-tracking", () => ({
  useGameTracking: (params: unknown) => ({
    isTracking: true,
    isAnonymous: false,
    session: null,
    details: [],
    recordQuestion: vi.fn(),
    submitSession: mockSubmitSession,
    resetSession: mockResetSession,
    params,
  }),
}));

describe("Crossword Game Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders page header, back link, topic selector, timer, and score", () => {
    render(<CrosswordPage />);

    expect(screen.getByRole("link", { name: /GameHub/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /Chọn chủ đề ô chữ/i })).toBeInTheDocument();
    expect(screen.getByText(/ĐIỂM/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tạo đề ô chữ mới/i })).toBeInTheDocument();
  });

  it("renders clue panel with across and down sections and virtual keyboard", () => {
    render(<CrosswordPage />);

    expect(screen.getByText(/Hàng ngang \(Across\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Hàng dọc \(Down\)/i)).toBeInTheDocument();

    // Virtual keyboard letters
    expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Z" })).toBeInTheDocument();
  });

  it("handles physical keyboard typing", () => {
    render(<CrosswordPage />);

    fireEvent.keyDown(window, { key: "c" });
    fireEvent.keyDown(window, { key: "Backspace" });
    fireEvent.keyDown(window, { key: " " });
  });

  it("changes topic when selected from dropdown", () => {
    render(<CrosswordPage />);

    const select = screen.getByRole("combobox", { name: /Chọn chủ đề ô chữ/i });
    fireEvent.change(select, { target: { value: "fruits" } });
    expect(select).toHaveValue("fruits");
  });
});
