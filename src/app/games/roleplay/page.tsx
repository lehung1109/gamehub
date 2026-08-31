'use client'

import React from 'react'
import { ChatBubble } from '@/components/roleplay/ChatBubble'
import { ResponseChoices } from '@/components/roleplay/ResponseChoices'
import { useRoleplayGame } from '@/hooks/useRoleplayGame'
import { useSpeech } from '@/hooks/useSpeech'
import { useGameConfig } from '@/hooks/useGameConfig'
import orderingFoodData from '@/data/conversations/ordering-food.json'
import { ConversationScenario } from '@/types/roleplay'
import { RoleplaySettings } from '@/types/config'

const scenario = orderingFoodData as ConversationScenario

export default function RoleplayGamePage() {
  const { settings } = useGameConfig<RoleplaySettings>('roleplay')
  const { speak } = useSpeech()
  
  const { gameState, startGame, handleSelectOption, currentTurn, resetGame } = useRoleplayGame(scenario, {
    autoSpeak: settings?.autoSpeak ?? true,
    speak,
  })

  if (gameState.status === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">{scenario.titleEn}</h1>
          <h2 className="text-lg text-gray-500 mb-6">{scenario.titleVi}</h2>
          <p className="text-gray-700 mb-8">{scenario.description}</p>
          <button
            onClick={startGame}
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors"
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
          <button
            onClick={resetGame}
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gray-50">
      <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm">
        <h1 className="font-semibold">{scenario.titleEn}</h1>
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          Score: {gameState.score}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {gameState.messageHistory.map((msg, index) => (
          <ChatBubble
            key={index}
            text={msg.text}
            sender={msg.sender}
            characterName={msg.sender === 'character' ? currentTurn?.characterName : undefined}
          />
        ))}
      </div>

      <div className="bg-white p-4 border-t">
        <p className="text-sm text-gray-500 mb-2 font-medium">Choose your response:</p>
        <ResponseChoices
          options={currentTurn?.options || []}
          onSelect={handleSelectOption}
          disabled={gameState.status !== 'playing'}
        />
      </div>
    </div>
  )
}
