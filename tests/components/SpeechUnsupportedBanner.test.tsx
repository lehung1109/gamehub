import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SpeechUnsupportedBanner } from "@/components/custom/SpeechUnsupportedBanner";

describe("SpeechUnsupportedBanner component", () => {
  it("does not render when show is false", () => {
    const { container } = render(<SpeechUnsupportedBanner show={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders warning banner when show is true", () => {
    render(<SpeechUnsupportedBanner show={true} />);
    expect(screen.getByText(/trình duyệt chưa hỗ trợ phát âm/i)).toBeInTheDocument();
    expect(screen.getByText(/Chrome, Edge, hoặc Safari/i)).toBeInTheDocument();
  });

  it("calls onDismiss when close button is clicked", () => {
    const handleDismiss = vi.fn();
    render(<SpeechUnsupportedBanner show={true} onDismiss={handleDismiss} />);
    const closeBtn = screen.getByRole("button", { name: /đã hiểu|đóng/i });
    fireEvent.click(closeBtn);
    expect(handleDismiss).toHaveBeenCalled();
  });
});
