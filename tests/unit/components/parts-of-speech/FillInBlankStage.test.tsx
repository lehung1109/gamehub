import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FillInBlankStage } from "@/components/parts-of-speech/stages/FillInBlankStage";
import { FillInBlankItem } from "@/types/parts-of-speech";

const mockQuestions: FillInBlankItem[] = [
  {
    id: "fib_noun_1",
    contextType: "email",
    textBefore: "We have received your ",
    textAfter: " and will process it shortly.",
    correctAnswer: "application",
    options: ["apply", "applicable", "application", "applied"],
    explanationVi: "Danh từ."
  }
];

describe("FillInBlankStage", () => {
  it("renders the stage with the question and options", () => {
    render(<FillInBlankStage questions={mockQuestions} onComplete={vi.fn()} />);
    
    expect(screen.getByText(/We have received your/)).toBeDefined();
    expect(screen.getByText(/and will process it shortly/)).toBeDefined();
    
    expect(screen.getByRole("button", { name: "apply" })).toBeDefined();
    expect(screen.getByRole("button", { name: "application" })).toBeDefined();
    
    const checkButton = screen.getByRole("button", { name: /kiểm tra/i });
    expect(checkButton.hasAttribute("disabled")).toBe(true);
  });

  it("handles correct answer and proceeds to next", () => {
    const onCompleteMock = vi.fn();
    render(<FillInBlankStage questions={mockQuestions} onComplete={onCompleteMock} />);
    
    // Select option
    fireEvent.click(screen.getByRole("button", { name: "application" }));
    
    // Check
    const checkButton = screen.getByRole("button", { name: /kiểm tra/i });
    expect(checkButton.hasAttribute("disabled")).toBe(false);
    fireEvent.click(checkButton);
    
    expect(screen.getByText("Chính xác!")).toBeDefined();
    
    // Complete
    fireEvent.click(screen.getByRole("button", { name: /hoàn thành chặng/i }));
    
    expect(onCompleteMock).toHaveBeenCalledWith(1, 1);
  });
});
