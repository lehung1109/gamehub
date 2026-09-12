// src/types/ai-generator.ts

import type { CefrLevel, PartOfSpeech } from './word-bank'
import type { GameId } from './config'

export interface AiGeneratedVocabItem {
  id: string // Client UUID or temporary key
  english: string
  vietnamese: string
  phonetic: string
  partOfSpeech: PartOfSpeech
  cefrLevel: CefrLevel
  topic: string
  emoji: string
  exampleSentence: string
  exampleTranslation: string
  distractors: string[]
}

export interface AiGeneratedReadingQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export interface AiGeneratedReadingPassage {
  title: string
  passage: string
  vietnameseTranslation: string
  cefrLevel: CefrLevel
  topic: string
  questions: AiGeneratedReadingQuestion[]
}

export interface AiGeneratedGrammarItem {
  id: string
  incorrectSentence: string
  correctSentence: string
  errorPart: string
  ruleExplanation: string
  hint: string
}

export interface AiGenerateVocabInput {
  topic: string
  cefrLevel: CefrLevel
  count?: number
  customPrompt?: string
}

export interface AiGenerateReadingInput {
  topic: string
  cefrLevel: CefrLevel
  questionCount?: number
  customPrompt?: string
}

export interface AiGenerateGrammarInput {
  topic?: string
  focusRule?: string
  count?: number
  customPrompt?: string
}

export interface PublishAiContentInput {
  gameId: GameId
  name: string
  description?: string
  vocabItems?: AiGeneratedVocabItem[]
  readingPassage?: AiGeneratedReadingPassage
  grammarItems?: AiGeneratedGrammarItem[]
  saveToWordBank?: boolean
}
