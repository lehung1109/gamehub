import React from 'react'
import { Volume2 } from 'lucide-react'
import { useSpeech } from '@/hooks/useSpeech'

export interface ChatBubbleProps {
  text: string
  sender: 'character' | 'learner'
  characterName?: string
  audioText?: string
}

export function ChatBubble({ text, sender, characterName, audioText }: ChatBubbleProps) {
  const isLearner = sender === 'learner'
  const { speak, isSpeaking, isSupported } = useSpeech()

  return (
    <div className={`flex flex-col mb-4 ${isLearner ? 'items-end' : 'items-start'}`}>
      {!isLearner && characterName && (
        <span className="text-sm text-gray-500 mb-1 ml-2">{characterName}</span>
      )}
      <div className="flex items-center gap-2 group">
        {!isLearner && isSupported && (
          <button
            onClick={() => speak(audioText || text)}
            className={`p-2 rounded-full hover:bg-gray-100 ${isSpeaking ? 'text-blue-600' : 'text-gray-400'}`}
            title="Listen to message"
          >
            <Volume2 size={16} />
          </button>
        )}
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
            isLearner
              ? 'bg-blue-600 text-white rounded-tr-none'
              : 'bg-gray-200 text-gray-900 rounded-tl-none'
          }`}
        >
          <p>{text}</p>
        </div>
        {isLearner && isSupported && (
          <button
            onClick={() => speak(audioText || text)}
            className={`p-2 rounded-full hover:bg-gray-100 ${isSpeaking ? 'text-blue-600' : 'text-gray-400'}`}
            title="Listen to message"
          >
            <Volume2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
