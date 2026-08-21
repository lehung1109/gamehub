import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SpeakButton } from "@/components/custom/SpeakButton";

const mockSpeak = vi.fn();
vi.mock("@/hooks/useSpeech", () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    isSpeaking: false,
    isSupported: true,
    cancel: vi.fn(),
  }),
}));

describe("SpeakButton component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders button and triggers speech on click", () => {
    render(<SpeakButton text="Apple" />);
    const button = screen.getByRole("button", { name: /phát âm|nghe|speak/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockSpeak).toHaveBeenCalledWith("Apple", "en-US");
  });

  it("passes custom language if provided", () => {
    render(<SpeakButton text="Bonjour" lang="fr-FR" />);
    const button = screen.getByRole("button", { name: /phát âm|nghe|speak/i });

    fireEvent.click(button);
    expect(mockSpeak).toHaveBeenCalledWith("Bonjour", "fr-FR");
  });

  it("disables button when disabled prop is true", () => {
    render(<SpeakButton text="Apple" disabled />);
    const button = screen.getByRole("button", { name: /phát âm|nghe|speak/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockSpeak).not.toHaveBeenCalled();
  });
});
