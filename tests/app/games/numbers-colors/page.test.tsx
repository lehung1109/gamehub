import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import NumbersColorsPage from "@/app/games/numbers-colors/page";

// Mock useSpeech
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
let mockIsSupported = true;

vi.mock("@/hooks/useSpeech", () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: mockCancel,
    isSpeaking: false,
    isSupported: mockIsSupported,
    supported: mockIsSupported,
  }),
}));

describe("Numbers & Colors Game Page (app/games/numbers-colors/page.tsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSupported = true;
  });

  it("renders page title, back button, and primary category tabs (Số đếm & Màu sắc)", () => {
    render(<NumbersColorsPage />);

    expect(screen.getByRole("heading", { level: 1, name: /Số & Màu sắc/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Về trang chủ/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Số đếm/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Màu sắc/i })).toBeInTheDocument();
  });

  it("in Numbers Learn mode, shows number 1 by default, clicking number 5 updates detail and speaks", () => {
    render(<NumbersColorsPage />);

    // Default tab is Numbers, learn mode
    expect(screen.getByRole("button", { name: /^Số 5\b/i })).toBeInTheDocument();

    const num5Btn = screen.getByRole("button", { name: /^Số 5\b/i });
    fireEvent.click(num5Btn);

    expect(mockSpeak).toHaveBeenCalledWith("Five");
    expect(screen.getByLabelText(/Chi tiết số: 5 - Five/i)).toBeInTheDocument();
  });

  it("navigates numbers sequentially via Next and Prev buttons, disables appropriately at boundaries (1 and 20)", () => {
    render(<NumbersColorsPage />);

    const prevBtn = screen.getByRole("button", { name: /Số trước/i });
    const nextBtn = screen.getByRole("button", { name: /Số tiếp theo/i });

    // Number 1 is first -> prev disabled
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    // Click next -> advances to Number 2
    fireEvent.click(nextBtn);
    expect(mockSpeak).toHaveBeenCalledWith("Two");
    expect(screen.getByLabelText(/Chi tiết số: 2 - Two/i)).toBeInTheDocument();
    expect(prevBtn).toBeEnabled();

    // Click prev -> back to Number 1
    fireEvent.click(prevBtn);
    expect(mockSpeak).toHaveBeenCalledWith("One");
    expect(prevBtn).toBeDisabled();

    // Click number 20 button directly -> next should be disabled
    const num20Btn = screen.getByRole("button", { name: /^Số 20\b/i });
    fireEvent.click(num20Btn);
    expect(mockSpeak).toHaveBeenCalledWith("Twenty");
    expect(nextBtn).toBeDisabled();
    expect(prevBtn).toBeEnabled();
  });

  it("switches to Colors tab, shows color list and clicking a color speaks and updates detail", () => {
    render(<NumbersColorsPage />);

    const colorsTab = screen.getByRole("tab", { name: /Màu sắc/i });
    fireEvent.click(colorsTab);

    expect(mockCancel).toHaveBeenCalled();

    // In colors mode, color swatches are rendered
    const redBtn = screen.getByRole("button", { name: /Màu Red/i });
    expect(redBtn).toBeInTheDocument();

    const blueBtn = screen.getByRole("button", { name: /Màu Blue/i });
    fireEvent.click(blueBtn);

    expect(mockSpeak).toHaveBeenCalledWith("Blue");
    expect(screen.getByLabelText(/Chi tiết màu: Blue/i)).toBeInTheDocument();
  });

  it("navigates colors sequentially via Next and Prev buttons, disables appropriately at boundaries", () => {
    render(<NumbersColorsPage />);

    const colorsTab = screen.getByRole("tab", { name: /Màu sắc/i });
    fireEvent.click(colorsTab);

    const prevBtn = screen.getByRole("button", { name: /Màu trước/i });
    const nextBtn = screen.getByRole("button", { name: /Màu tiếp theo/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    // Click next color
    fireEvent.click(nextBtn);
    expect(mockSpeak).toHaveBeenCalled();
    expect(prevBtn).toBeEnabled();

    // Click last color (White) -> next should be disabled
    const whiteBtn = screen.getByRole("button", { name: /Màu White/i });
    fireEvent.click(whiteBtn);
    expect(nextBtn).toBeDisabled();
    expect(prevBtn).toBeEnabled();
  });

  it("allows switching to Numbers Quiz mode and presenting question options", () => {
    render(<NumbersColorsPage />);

    const quizModeTab = screen.getByRole("tab", { name: /Luyện tập \(Quiz\)/i });
    fireEvent.click(quizModeTab);

    expect(screen.getByText(/Câu 1 \/ 10/i)).toBeInTheDocument();
    expect(screen.getByText(/Bé hãy nghe và chọn đáp án đúng nhé!/i)).toBeInTheDocument();
  });

  it("allows switching to Colors Quiz mode and presenting color question options", () => {
    render(<NumbersColorsPage />);

    const colorsTab = screen.getByRole("tab", { name: /Màu sắc/i });
    fireEvent.click(colorsTab);

    const quizModeTab = screen.getByRole("tab", { name: /Luyện tập \(Quiz\)/i });
    fireEvent.click(quizModeTab);

    expect(screen.getByText(/Câu 1 \/ 10/i)).toBeInTheDocument();
    expect(screen.getByText(/Bé hãy nghe và chọn màu sắc đúng nhé!/i)).toBeInTheDocument();
  });

  it("supports keyboard navigation (ArrowRight, ArrowLeft, Space/Enter) in Learn mode", () => {
    render(<NumbersColorsPage />);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(mockSpeak).toHaveBeenCalledWith("Two");

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(mockSpeak).toHaveBeenCalledWith("One");

    fireEvent.keyDown(window, { key: "Enter" });
    expect(mockSpeak).toHaveBeenCalledWith("One");
  });

  it("renders SpeechUnsupportedBanner when speech is unsupported and allows dismissing it", () => {
    mockIsSupported = false;
    render(<NumbersColorsPage />);

    const banner = screen.getByText(/Trình duyệt chưa hỗ trợ phát âm/i);
    expect(banner).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /Đã hiểu/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Trình duyệt chưa hỗ trợ phát âm/i)).not.toBeInTheDocument();
  });

  it("displays correct counter format (current / total) in Numbers Learn mode", () => {
    render(<NumbersColorsPage />);

    expect(screen.getByText("1 / 20")).toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: /Số tiếp theo/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText("2 / 20")).toBeInTheDocument();
  });
});
