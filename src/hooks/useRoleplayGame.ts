import { useState, useCallback } from 'react'
import { ConversationScenario, LearnerResponse, RoleplayGameState } from '@/types/roleplay'

export interface UseRoleplayGameOptions {
  autoSpeak?: boolean
  speak?: (text: string) => void
}

export function useRoleplayGame(scenario: ConversationScenario, options?: UseRoleplayGameOptions) {
  const [gameState, setGameState] = useState<RoleplayGameState>({
    status: 'intro',
    currentTurnIndex: 0,
    messageHistory: [],
    score: 0,
    mistakes: 0,
  })
  
  const startGame = useCallback(() => {
    const firstMessage = scenario.turns[0].message
    setGameState((prev) => ({
      ...prev,
      status: 'playing',
      messageHistory: [
        {
          sender: 'character',
          text: firstMessage,
        },
      ],
    }))
    if (options?.autoSpeak && options?.speak) {
      options.speak(firstMessage)
    }
  }, [scenario, options])

  const handleSelectOption = useCallback((option: LearnerResponse) => {
    setGameState((prev) => {
      const isCorrect = option.isCorrect
      const newHistory = [
        ...prev.messageHistory,
        {
          sender: 'learner' as const,
          text: option.text,
          isCorrect,
        },
      ]
      
      let nextTurnIndex = prev.currentTurnIndex
      let status = prev.status
      let mistakes = prev.mistakes
      let score = prev.score

      if (isCorrect) {
        score += 1
        nextTurnIndex = prev.currentTurnIndex + 1
        
        if (nextTurnIndex < scenario.turns.length) {
          const nextMessage = scenario.turns[nextTurnIndex].message
          newHistory.push({
            sender: 'character',
            text: nextMessage,
          })
          if (options?.autoSpeak && options?.speak) {
            options.speak(nextMessage)
          }
        } else {
          status = 'completed'
        }
      } else {
        mistakes += 1
        if (option.feedback) {
          newHistory.push({
            sender: 'character',
            text: option.feedback,
          })
          if (options?.autoSpeak && options?.speak) {
            options.speak(option.feedback)
          }
        }
      }
      
      return {
        ...prev,
        currentTurnIndex: nextTurnIndex,
        messageHistory: newHistory,
        status,
        score,
        mistakes,
      }
    })
  }, [scenario, options])

  const resetGame = useCallback(() => {
    setGameState({
      status: 'intro',
      currentTurnIndex: 0,
      messageHistory: [],
      score: 0,
      mistakes: 0,
    })
  }, [])

  return {
    gameState,
    startGame,
    handleSelectOption,
    resetGame,
    currentTurn: scenario.turns[gameState.currentTurnIndex],
  }
}
