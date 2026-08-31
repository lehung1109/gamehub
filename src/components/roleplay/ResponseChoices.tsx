import React from 'react'
import { LearnerResponse } from '@/types/roleplay'

export interface ResponseChoicesProps {
  options: LearnerResponse[]
  onSelect: (option: LearnerResponse) => void
  disabled?: boolean
}

export function ResponseChoices({ options, onSelect, disabled }: ResponseChoicesProps) {
  return (
    <div className="flex flex-col gap-2 w-full mt-4">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className="w-full text-left p-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {option.text}
        </button>
      ))}
    </div>
  )
}
