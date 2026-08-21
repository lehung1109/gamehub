import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FlashcardTopicPage, { generateStaticParams } from "@/app/games/flashcard/[topicId]/page";
import topics from "@/data/topics.json";

// Mock notFound from next/navigation
const mockNotFound = vi.fn();
vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

describe("Flashcard Topic Game Page ([topicId])", () => {
  it("generateStaticParams returns all topic IDs", async () => {
    const params = await generateStaticParams();
    expect(params).toHaveLength(topics.length);
    expect(params.map((p) => p.topicId)).toEqual(topics.map((t) => t.id));
  });

  it("renders topic flashcards with back button to topic selection", async () => {
    const page = await FlashcardTopicPage({
      params: Promise.resolve({ topicId: "animals" }),
    });

    render(page);

    // Check back button to topic selection
    const backButton = screen.getByRole("link", { name: /chọn chủ đề|chủ đề/i });
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveAttribute("href", "/games/flashcard");

    // Check accessible h1 heading
    expect(
      screen.getByRole("heading", { level: 1, name: /động vật/i })
    ).toBeInTheDocument();

    // Check topic title and initial card
    expect(screen.getAllByText(/động vật/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("🐱").length).toBeGreaterThanOrEqual(1);
  });

  it("calls notFound when topicId does not exist", async () => {
    mockNotFound.mockClear();
    try {
      await FlashcardTopicPage({
        params: Promise.resolve({ topicId: "invalid-topic" }),
      });
    } catch {
      // notFound throws in Next.js
    }

    expect(mockNotFound).toHaveBeenCalled();
  });
});
