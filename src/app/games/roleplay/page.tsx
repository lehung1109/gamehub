'use client'

import React, { Suspense } from 'react'
import { ChatBubble } from '@/components/roleplay/ChatBubble'
import { ResponseChoices } from '@/components/roleplay/ResponseChoices'
import { BackButton } from '@/components/custom/BackButton'
import { useRoleplayGame } from '@/hooks/useRoleplayGame'
import { useSpeech } from '@/hooks/useSpeech'
import { useGameConfig } from '@/hooks/useGameConfig'
import orderingFoodData from '@/data/conversations/ordering-food.json'
import { ConversationScenario, LearnerResponse } from '@/types/roleplay'
import { RoleplaySettings } from '@/types/config'
import { useGameTracking } from '@/hooks/use-game-tracking'

const scenario = orderingFoodData as ConversationScenario

function RoleplayGameContent() {
  const { settings } = useGameConfig<RoleplaySettings>('roleplay')
  const { speak } = useSpeech()
  
  const { gameState, startGame, handleSelectOption, currentTurn, resetGame } = useRoleplayGame(scenario, {
    autoSpeak: settings?.autoSpeak ?? true,
    speak,
  })

  const { recordQuestion, submitSession, resetSession } = useGameTracking({
    gameType: 'roleplay',
    topic: scenario.titleEn,
    totalQuestions: scenario.turns.length,
  })

  const hasSubmittedRef = React.useRef(false)

  React.useEffect(() => {
    if (gameState.status === 'completed' && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true
      submitSession({ score: gameState.score, totalQuestions: scenario.turns.length })
    }
  }, [gameState.status, gameState.score, submitSession])

  const onSelectOption = (option: LearnerResponse) => {
    recordQuestion({
      prompt: currentTurn?.message || '',
      selectedAnswer: option.text,
      correctAnswer: currentTurn?.options.find((o) => o.isCorrect)?.text || '',
      isCorrect: option.isCorrect,
    })
    handleSelectOption(option)
  }

  const onTryAgain = () => {
    hasSubmittedRef.current = false
    resetSession()
    resetGame()
  }

  if (gameState.status === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="max-w-md w-full mb-4 flex justify-start">
          <BackButton href="/" label="Về trang chủ" />
        </div>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">{scenario.titleEn}</h1>
          <h2 className="text-lg text-gray-500 mb-6">{scenario.titleVi}</h2>
          <p className="text-gray-700 mb-8">{scenario.description}</p>
          <button
            onClick={startGame}
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Start Conversation
          </button>
        </div>
      </div>
    )
  }

  if (gameState.status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Conversation Completed!</h1>
          <p className="text-lg mb-2">Score: {gameState.score} / {scenario.turns.length}</p>
          <p className="text-lg mb-8 text-red-500">Mistakes: {gameState.mistakes}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onTryAgain}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <BackButton href="/" label="Về trang chủ" className="w-full justify-center" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gray-50">
      <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <BackButton href="/" label="Thoát" className="min-h-[44px] text-base px-3 rounded-xl" />
          <h1 className="font-semibold text-base sm:text-lg">{scenario.titleEn}</h1>
        </div>
        <span className="text-base bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-bold">
          Score: {gameState.score}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {gameState.messageHistory.map((msg, index) => (
          <ChatBubble
            key={index}
            text={msg.text}
            sender={msg.sender}
            characterName={msg.sender === 'character' ? (msg.characterName || currentTurn?.characterName) : undefined}
          />
        ))}
      </div>

      <div className="bg-white p-4 border-t">
        <p className="text-base text-gray-500 mb-2 font-medium">Choose your response:</p>
        <ResponseChoices
          options={currentTurn?.options || []}
          onSelect={onSelectOption}
          disabled={gameState.status !== 'playing'}
        />
      </div>
    </div>
  )
}

export default function RoleplayGamePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading game...</div>}>
      <RoleplayGameContent />
    </Suspense>
  )
}
