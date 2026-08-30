import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WordFamilyStage } from "@/components/parts-of-speech/stages/WordFamilyStage";
import { WordFamilyItem } from "@/types/parts-of-speech";

const mockQuestions: WordFamilyItem[] = [
  {
    id: "wf_noun_1",
    baseWord: "manage",
    targetWord: "management",
    options: ["-ment", "-tion", "-ness", "-ity"],
    explanationVi: "Thêm đuôi '-ment'."
  },
  {
    id: "wf_noun_2",
    baseWord: "inform",
    targetWord: "information",
    options: ["-tion", "-ment", "-er", "-ness"],
    explanationVi: "Thêm đuôi '-tion'."
  }
];

describe("WordFamilyStage", () => {
  it("renders the stage with the first question", () => {
    render(<WordFamilyStage questions={mockQuestions} onComplete={vi.fn()} />);
    
    // Should show the base word
    expect(screen.getByText("manage")).toBeDefined();
    
    // Should show options
    expect(screen.getByText("-ment")).toBeDefined();
    expect(screen.getByText("-tion")).toBeDefined();
    
    // Check button is disabled
    const checkButton = screen.getByRole("button", { name: /kiểm tra/i });
    expect(checkButton.hasAttribute("disabled")).toBe(true);
  });

  it("handles correct answer and proceeds to next question", async () => {
    const onCompleteMock = vi.fn();
    render(<WordFamilyStage questions={mockQuestions} onComplete={onCompleteMock} />);
    
    // Click option to place it
    fireEvent.click(screen.getByRole("button", { name: "-ment" }));
    
    // Submit
    const checkButton = screen.getByRole("button", { name: /kiểm tra/i });
    expect(checkButton.hasAttribute("disabled")).toBe(false);
    fireEvent.click(checkButton);
    
    // Verify success feedback
    expect(screen.getByText("Chính xác!")).toBeDefined();
    
    // Next question
    const nextButton = screen.getByRole("button", { name: /câu tiếp theo/i });
    fireEvent.click(nextButton);
    
    // Now on second question
    expect(screen.getByText("inform")).toBeDefined();
    
    // Click wrong option
    fireEvent.click(screen.getByRole("button", { name: "-ment" }));
    fireEvent.click(screen.getByRole("button", { name: /kiểm tra/i }));
    
    // Verify wrong feedback
    expect(screen.getByText("Chưa chính xác!")).toBeDefined();
    
    // Complete stage
    const completeButton = screen.getByRole("button", { name: /hoàn thành chặng/i });
    fireEvent.click(completeButton);
    
    // Should have called onComplete with score 1 and total 2
    expect(onCompleteMock).toHaveBeenCalledWith(1, 2);
  });
});
