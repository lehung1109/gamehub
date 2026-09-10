import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRoleplayGame } from "@/hooks/useRoleplayGame";
import { ConversationScenario } from "@/types/roleplay";

const mockScenario: ConversationScenario = {
  id: "test-dialogue",
  titleVi: "Thử thoại",
  titleEn: "Test Dialogue",
  description: "Test description",
  difficulty: 1,
  turns: [
    {
      id: "turn-1",
      characterName: "Waiter",
      message: "Can I take your order?",
      options: [
        { id: "opt-1", text: "Yes, I would like a coffee.", isCorrect: true },
        { id: "opt-2", text: "No, bye.", isCorrect: false, feedback: "A bit blunt!" },
      ],
    },
    {
      id: "turn-2",
      characterName: "Barista",
      message: "Hot or iced?",
      options: [
        { id: "opt-3", text: "Iced please.", isCorrect: true },
        { id: "opt-4", text: "Nothing.", isCorrect: false },
      ],
    },
  ],
};

describe("useRoleplayGame Hook", () => {
  it("initializes with intro state and empty message history", () => {
    const { result } = renderHook(() => useRoleplayGame(mockScenario));

    expect(result.current.gameState.status).toBe("intro");
    expect(result.current.gameState.currentTurnIndex).toBe(0);
    expect(result.current.gameState.messageHistory).toHaveLength(0);
  });

  it("starts game, sets playing status and records first character message with speaker name", () => {
    const speakMock = vi.fn();
    const { result } = renderHook(() =>
      useRoleplayGame(mockScenario, { autoSpeak: true, speak: speakMock })
    );

    act(() => {
      result.current.startGame();
    });

    expect(result.current.gameState.status).toBe("playing");
    expect(result.current.gameState.messageHistory).toHaveLength(1);
    expect(result.current.gameState.messageHistory[0]).toEqual({
      sender: "character",
      text: "Can I take your order?",
      characterName: "Waiter",
    });
    expect(speakMock).toHaveBeenCalledWith("Can I take your order?");
  });

  it("advances turn and preserves speaker name on correct response", () => {
    const { result } = renderHook(() => useRoleplayGame(mockScenario));

    act(() => {
      result.current.startGame();
    });

    act(() => {
      result.current.handleSelectOption(mockScenario.turns[0].options[0]);
    });

    expect(result.current.gameState.score).toBe(1);
    expect(result.current.gameState.currentTurnIndex).toBe(1);
    expect(result.current.gameState.messageHistory).toHaveLength(3);
    // 0: Waiter first message
    expect(result.current.gameState.messageHistory[0].characterName).toBe("Waiter");
    // 1: Learner response
    expect(result.current.gameState.messageHistory[1].sender).toBe("learner");
    // 2: Barista next message
    expect(result.current.gameState.messageHistory[2].characterName).toBe("Barista");
    expect(result.current.gameState.messageHistory[2].text).toBe("Hot or iced?");
  });

  it("increments mistakes and adds feedback with current character speaker on wrong response", () => {
    const { result } = renderHook(() => useRoleplayGame(mockScenario));

    act(() => {
      result.current.startGame();
    });

    act(() => {
      result.current.handleSelectOption(mockScenario.turns[0].options[1]);
    });

    expect(result.current.gameState.mistakes).toBe(1);
    expect(result.current.gameState.score).toBe(0);
    expect(result.current.gameState.currentTurnIndex).toBe(0);
    // Should append learner response + character feedback
    const lastMessage = result.current.gameState.messageHistory[2];
    expect(lastMessage.sender).toBe("character");
    expect(lastMessage.text).toBe("A bit blunt!");
    expect(lastMessage.characterName).toBe("Waiter");
  });

  it("completes conversation after final turn", () => {
    const { result } = renderHook(() => useRoleplayGame(mockScenario));

    act(() => {
      result.current.startGame();
    });
    act(() => {
      result.current.handleSelectOption(mockScenario.turns[0].options[0]);
    });
    act(() => {
      result.current.handleSelectOption(mockScenario.turns[1].options[0]);
    });

    expect(result.current.gameState.status).toBe("completed");
    expect(result.current.gameState.score).toBe(2);
  });
});
