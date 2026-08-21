import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import AlphabetGamePage from "@/app/games/alphabet/page";
import FlashcardTopicSelectionPage from "@/app/games/flashcard/page";
import ListeningGamePage from "@/app/games/listening/page";
import NumbersColorsPage from "@/app/games/numbers-colors/page";
import SentencesGamePage from "@/app/games/sentences/page";
import SpellingGamePage from "@/app/games/spelling/page";

// Mock useSpeech
vi.mock("@/hooks/useSpeech", () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    cancel: vi.fn(),
    isSpeaking: false,
    isSupported: true,
    supported: true,
  }),
}));

describe("Default Game Logic and Guard Clauses (US5)", () => {
  it("AlphabetGamePage renders properly with default settings and no config", () => {
    render(<AlphabetGamePage />);
    expect(screen.getByRole("heading", { level: 1, name: /Chữ cái & Phonics/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Chữ A\b/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Chữ Z\b/i })).toBeInTheDocument();
  });

  it("FlashcardTopicSelectionPage renders all default topics without config", () => {
    render(<FlashcardTopicSelectionPage />);
    expect(screen.getByRole("heading", { level: 1, name: /Học từ vựng qua Flashcard/i })).toBeInTheDocument();
    expect(screen.getByText("Động vật")).toBeInTheDocument();
    expect(screen.getByText("Trái cây")).toBeInTheDocument();
    expect(screen.getByText("Gia đình")).toBeInTheDocument();
    expect(screen.getByText("Trường học")).toBeInTheDocument();
    expect(screen.getByText("Cơ thể")).toBeInTheDocument();
  });

  it("ListeningGamePage renders full word pool and default topic filters", () => {
    render(<ListeningGamePage />);
    expect(screen.getByRole("heading", { level: 1, name: /Nghe hiểu/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tất cả/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nghe lại âm thanh/i })).toBeInTheDocument();
  });

  it("NumbersColorsPage renders default numbers 1-20 and color swatches", () => {
    render(<NumbersColorsPage />);
    expect(screen.getByRole("heading", { level: 1, name: /Số & Màu sắc/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Số 1 \(One\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Số 20 \(Twenty\)/i })).toBeInTheDocument();
  });

  it("SentencesGamePage renders default sentence challenges with all categories", () => {
    render(<SentencesGamePage />);
    expect(screen.getByRole("heading", { level: 1, name: /Luyện câu đơn giản/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tất cả/i })).toBeInTheDocument();
    expect(screen.getByText(/Câu 1 \//i)).toBeInTheDocument();
  });

  it("SpellingGamePage renders default spelling words with all topic filters", () => {
    render(<SpellingGamePage />);
    expect(screen.getByRole("heading", { level: 1, name: /Đánh vần & Ghép từ/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tất cả/i })).toBeInTheDocument();
    expect(screen.getByText(/Từ 1 \//i)).toBeInTheDocument();
  });
});
