import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ConjugationQuestionUI } from "@/components/tenses/stages/ui/ConjugationQuestionUI";
import { ErrorHunterQuestionUI } from "@/components/tenses/stages/ui/ErrorHunterQuestionUI";
import { SentenceBuilderQuestionUI } from "@/components/tenses/stages/ui/SentenceBuilderQuestionUI";

// Mock the useSpeech hook to avoid errors
vi.mock("@/hooks/useSpeech", () => ({
  useSpeech: () => ({ speak: vi.fn(), isSpeaking: false, isSupported: true }),
}));

describe("Question UI Components", () => {
  it("renders ConjugationQuestionUI correctly", () => {
    const mockItem = {
      id: "1",
      scenarioVi: "Test scenario",
      contextType: "email" as const,
      subject: "Test subject",
      sender: "Test sender",
      recipient: "Test recipient",
      textBefore: "He ",
      baseVerb: "work",
      textAfter: " here.",
      correctAnswer: "works",
      options: ["work", "works", "working", "worked"],
      explanation: {
        ruleVi: "Test rule",
        detailedAnalysisVi: "Test analysis",
      },
    };

    render(
      <ConjugationQuestionUI
        item={mockItem}
        currentIndex={0}
        total={5}
        score={10}
        onNext={vi.fn()}
      />
    );

    expect(screen.getByText("Test scenario")).toBeInTheDocument();
    expect(screen.getByText("work")).toBeInTheDocument();
  });

  it("renders ErrorHunterQuestionUI correctly", () => {
    const mockItem = {
      id: "1",
      scenarioVi: "Test scenario",
      vietnameseMeaning: "Meaning",
      tokens: ["He", "work", "here"],
      errorTokenIndex: 1,
      correctToken: "works",
      fullCorrectSentence: "He works here.",
      options: [
        { label: "works", value: "works", isCorrect: true },
        { label: "working", value: "working", isCorrect: false },
      ],
      explanation: {
        whyWrongVi: "Wrong",
        workplaceImpactVi: "Impact",
      },
    };

    render(
      <ErrorHunterQuestionUI
        item={mockItem}
        currentIndex={0}
        total={5}
        score={10}
        onNext={vi.fn()}
      />
    );

    expect(screen.getByText("Test scenario")).toBeInTheDocument();
    expect(screen.getByText("Meaning")).toBeInTheDocument();
  });

  it("renders SentenceBuilderQuestionUI correctly", () => {
    const mockItem = {
      id: "1",
      scenarioVi: "Test scenario",
      vietnameseMeaning: "Meaning",
      scrambledTokens: [
        { id: "1", text: "here" },
        { id: "2", text: "He" },
        { id: "3", text: "works" },
      ],
      correctTokenOrder: ["He", "works", "here"],
      fullSentenceEn: "He works here",
      grammarTip: {
        titleVi: "Tip",
        tipVi: "Tip text",
      },
    };

    render(
      <SentenceBuilderQuestionUI
        item={mockItem}
        currentIndex={0}
        total={5}
        score={10}
        onNext={vi.fn()}
      />
    );

    expect(screen.getByText("Test scenario")).toBeInTheDocument();
    expect(screen.getByText("Meaning")).toBeInTheDocument();
  });
});
