import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FlashcardTopicSelectionPage from "@/app/games/flashcard/page";
import topics from "@/data/topics.json";

describe("Flashcard Topic Selection Page", () => {
  it("renders heading, back button, and all available topics", () => {
    render(<FlashcardTopicSelectionPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /học từ vựng|flashcard/i })
    ).toBeInTheDocument();

    const backButton = screen.getByRole("link", { name: /về trang chủ|trang chủ/i });
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveAttribute("href", "/");

    topics.forEach((topic) => {
      expect(screen.getByText(topic.emoji)).toBeInTheDocument();
      expect(screen.getByText(topic.nameVi)).toBeInTheDocument();
      expect(screen.getByText(topic.nameEn)).toBeInTheDocument();

      const link = screen.getByRole("link", { name: new RegExp(topic.nameVi, "i") });
      expect(link).toHaveAttribute("href", `/games/flashcard/${topic.id}`);
    });
  });
});
