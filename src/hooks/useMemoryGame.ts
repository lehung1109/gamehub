'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Word } from '@/types'
import type { MemoryCard, MemoryCardType } from '@/types/memory-match'
import { shuffle } from '@/lib/shuffle'

export interface UseMemoryGameOptions {
  words: Word[]
  pairCount?: 4 | 6 | 8
  autoSpeak?: boolean
  onSpeak?: (text: string) => void
  onComplete?: (result: { flips: number; stars: 1 | 2 | 3; elapsedSeconds: number }) => void
}

export interface UseMemoryGameResult {
  cards: MemoryCard[]
  flippedIndices: number[]
  matchedWordIds: string[]
  flips: number
  stars: 1 | 2 | 3
  isLocked: boolean
  isCompleted: boolean
  elapsedSeconds: number
  handleCardClick: (index: number) => void
  restartGame: (newWords?: Word[], countOverride?: number) => void
}

function calculateStars(flips: number, pairCount: number): 1 | 2 | 3 {
  if (flips <= pairCount + 2) return 3
  if (flips <= pairCount * 2) return 2
  return 1
}

function createDeck(wordsPool: Word[], count: number): MemoryCard[] {
  if (wordsPool.length === 0) return []
  const shuffledWords = shuffle([...wordsPool]).slice(0, Math.min(count, wordsPool.length))
  const cards: MemoryCard[] = []

  shuffledWords.forEach((word) => {
    // Emoji card
    cards.push({
      id: `${word.id}-emoji`,
      wordId: word.id,
      type: 'emoji' as MemoryCardType,
      content: word.emoji,
      english: word.english,
      phonetic: word.phonetic,
      vietnamese: word.vietnamese,
      isFlipped: false,
      isMatched: false,
    })

    // Word card
    cards.push({
      id: `${word.id}-word`,
      wordId: word.id,
      type: 'word' as MemoryCardType,
      content: word.english,
      english: word.english,
      phonetic: word.phonetic,
      vietnamese: word.vietnamese,
      isFlipped: false,
      isMatched: false,
    })
  })

  return shuffle(cards)
}

export function useMemoryGame({
  words,
  pairCount = 6,
  autoSpeak = true,
  onSpeak,
  onComplete,
}: UseMemoryGameOptions): UseMemoryGameResult {
  const [cards, setCards] = useState<MemoryCard[]>(() => createDeck(words, pairCount))
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [matchedWordIds, setMatchedWordIds] = useState<string[]>([])
  const [flips, setFlips] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const cardsRef = useRef<MemoryCard[]>(cards)
  const flippedIndicesRef = useRef<number[]>([])
  const matchedWordIdsRef = useRef<string[]>([])
  const isLockedRef = useRef(false)
  const flipsRef = useRef(0)
  const isCompletedRef = useRef(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const mismatchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTimerStartedRef = useRef(false)
  const elapsedSecondsRef = useRef(0)
  const onCompleteRef = useRef(onComplete)
  const onSpeakRef = useRef(onSpeak)

  useEffect(() => {
    cardsRef.current = cards
  }, [cards])

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds
  }, [elapsedSeconds])

  useEffect(() => {
    onCompleteRef.current = onComplete
    onSpeakRef.current = onSpeak
  }, [onComplete, onSpeak])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (mismatchTimeoutRef.current) {
        clearTimeout(mismatchTimeoutRef.current)
        mismatchTimeoutRef.current = null
      }
    }
  }, [])

  // Stop timer on game completion or unmount
  useEffect(() => {
    if (isCompleted && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isCompleted])

  const restartGame = useCallback(
    (newWords?: Word[], countOverride?: number) => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (mismatchTimeoutRef.current) {
        clearTimeout(mismatchTimeoutRef.current)
        mismatchTimeoutRef.current = null
      }
      isTimerStartedRef.current = false

      const effectivePairCount = countOverride ?? pairCount
      const newDeck = createDeck(newWords || words, effectivePairCount)
      setCards(newDeck)
      cardsRef.current = newDeck
      setFlippedIndices([])
      flippedIndicesRef.current = []
      setMatchedWordIds([])
      matchedWordIdsRef.current = []
      setFlips(0)
      flipsRef.current = 0
      setIsLocked(false)
      isLockedRef.current = false
      setIsCompleted(false)
      isCompletedRef.current = false
      setElapsedSeconds(0)
      elapsedSecondsRef.current = 0
    },
    [words, pairCount]
  )

  const handleCardClick = useCallback(
    (index: number) => {
      if (
        isLockedRef.current ||
        isCompletedRef.current ||
        index < 0 ||
        index >= cardsRef.current.length
      ) {
        return
      }

      const currentCards = cardsRef.current
      const card = currentCards[index]

      // If clicked card is already matched, replay pronunciation without incrementing flips
      if (card.isMatched) {
        onSpeakRef.current?.(card.english)
        return
      }

      // If clicked card is already flipped in current turn, ignore
      if (card.isFlipped || flippedIndicesRef.current.includes(index)) {
        return
      }

      // Start timer on first card interaction
      if (!isTimerStartedRef.current) {
        isTimerStartedRef.current = true
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
          setElapsedSeconds((prev) => prev + 1)
        }, 1000)
      }

      // First card in turn
      if (flippedIndicesRef.current.length === 0) {
        flippedIndicesRef.current = [index]
        setFlippedIndices([index])

        setCards((prev) => {
          const updated = prev.map((c, i) => (i === index ? { ...c, isFlipped: true } : c))
          cardsRef.current = updated
          return updated
        })

        if (autoSpeak && card.type === 'word') {
          onSpeakRef.current?.(card.english)
        }
        return
      }

      // Second card in turn
      if (flippedIndicesRef.current.length === 1) {
        const firstIndex = flippedIndicesRef.current[0]
        const firstCard = currentCards[firstIndex]
        const nextFlips = flipsRef.current + 1
        flipsRef.current = nextFlips
        setFlips(nextFlips)

        if (autoSpeak && card.type === 'word') {
          onSpeakRef.current?.(card.english)
        }

        // Check if matching pair
        if (firstCard.wordId === card.wordId) {
          const newMatched = [...matchedWordIdsRef.current, card.wordId]
          matchedWordIdsRef.current = newMatched
          setMatchedWordIds(newMatched)
          flippedIndicesRef.current = []
          setFlippedIndices([])

          // Set both cards as matched and flipped
          setCards((prev) => {
            const updated = prev.map((c) =>
              c.wordId === card.wordId
                ? { ...c, isFlipped: true, isMatched: true }
                : c
            )
            cardsRef.current = updated
            return updated
          })

          // Audio feedback on match
          onSpeakRef.current?.(card.english)

          // Check win condition
          const totalPairs = Math.floor(cardsRef.current.length / 2)
          if (newMatched.length === totalPairs) {
            isCompletedRef.current = true
            setIsCompleted(true)
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            const finalStars = calculateStars(nextFlips, totalPairs)
            onCompleteRef.current?.({
              flips: nextFlips,
              stars: finalStars,
              elapsedSeconds: elapsedSecondsRef.current,
            })
          }
        } else {
          // Mismatch: lock interactions for 1000ms, then flip both back
          isLockedRef.current = true
          setIsLocked(true)
          flippedIndicesRef.current = [firstIndex, index]
          setFlippedIndices([firstIndex, index])

          setCards((prev) => {
            const updated = prev.map((c, i) => (i === index ? { ...c, isFlipped: true } : c))
            cardsRef.current = updated
            return updated
          })

          mismatchTimeoutRef.current = setTimeout(() => {
            setCards((prev) => {
              const updated = prev.map((c, i) =>
                i === firstIndex || i === index ? { ...c, isFlipped: false } : c
              )
              cardsRef.current = updated
              return updated
            })
            flippedIndicesRef.current = []
            setFlippedIndices([])
            isLockedRef.current = false
            setIsLocked(false)
          }, 1000)
        }
      }
    },
    [autoSpeak]
  )

  const currentTotalPairs = cards.length > 0 ? Math.floor(cards.length / 2) : pairCount
  const stars = calculateStars(flips, currentTotalPairs)

  return {
    cards,
    flippedIndices,
    matchedWordIds,
    flips,
    stars,
    isLocked,
    isCompleted,
    elapsedSeconds,
    handleCardClick,
    restartGame,
  }
}
