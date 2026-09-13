'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import type {
  SpeakingScenario,
  SpeakingPersona,
  SpeakingDialogueTurn,
  SpeakingScaffoldingHint,
  SpeakingSessionResult,
} from '@/types/speaking'
import { SpeakingBubble } from '@/components/speaking/SpeakingBubble'
import { ScaffoldingHints } from '@/components/speaking/ScaffoldingHints'
import { MicPulseButton } from '@/components/speaking/MicPulseButton'
import { SpeakingPodiumModal } from '@/components/speaking/SpeakingPodiumModal'
import { useSpeech } from '@/hooks/useSpeech'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { sendSpeakingTurnAction, completeSpeakingSessionAction } from '@/app/actions/speaking'
import { useStudentSession } from '@/hooks/use-student-session'
import { getStoredSrsDeck, saveStoredSrsDeck } from '@/lib/srs-storage'

export interface SpeakingArenaProps {
  scenario: SpeakingScenario
  onComplete?: (result: SpeakingSessionResult) => void
  initialPersona?: SpeakingPersona
  onAddToMistakes?: (words: string[]) => void
}

export function SpeakingArena({
  scenario,
  onComplete,
  initialPersona,
  onAddToMistakes,
}: SpeakingArenaProps) {
  const router = useRouter()
  const persona = initialPersona || scenario.persona
  const { session } = useStudentSession()
  const studentId = session?.classCode
    ? `${session.classCode}_${session.studentName}`
    : undefined

  // Speech synthesis
  const { speak, cancel: cancelSpeech } = useSpeech({ rate: 0.85, lang: 'en-US' })

  // Speech recognition
  const {
    isListening,
    transcript,
    isSupported: isMicSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ lang: 'en-US', continuous: false })

  // Dialogue turns state
  const [turns, setTurns] = useState<SpeakingDialogueTurn[]>(() => [
    {
      id: `turn-init-${scenario.id}`,
      sender: 'tutor',
      text: scenario.initialMessage,
      timestamp: new Date().toISOString(),
    },
  ])

  const [currentHints, setCurrentHints] = useState<SpeakingScaffoldingHint[]>(
    scenario.initialHints || []
  )
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [completionData, setCompletionData] = useState<SpeakingSessionResult | null>(null)

  const chatBottomRef = useRef<HTMLDivElement | null>(null)
  const turnStartTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (turnStartTimeRef.current === null) {
      turnStartTimeRef.current = Date.now()
    }
  }, [])

  // Scroll to bottom when new turns arrive
  useEffect(() => {
    if (chatBottomRef.current && typeof chatBottomRef.current.scrollIntoView === 'function') {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [turns, isProcessing])

  // Handle turn submission
  const handleSendTurn = async (rawMessage: string) => {
    const textToSend = rawMessage.trim()
    if (!textToSend || isProcessing || isCompleted) return

    setIsProcessing(true)
    const elapsedMs = turnStartTimeRef.current ? Date.now() - turnStartTimeRef.current : 0

    // Prepare student turn
    const studentTurnId = `student-${Date.now()}`
    const tempStudentTurn: SpeakingDialogueTurn = {
      id: studentTurnId,
      sender: 'student',
      text: textToSend,
      timestamp: new Date().toISOString(),
    }

    const updatedTurnsWithStudent = [...turns, tempStudentTurn]
    setTurns(updatedTurnsWithStudent)
    setInputText('')
    resetTranscript()

    try {
      const historyPayload = turns.map((t) => ({
        sender: t.sender,
        text: t.text,
      }))

      const response = await sendSpeakingTurnAction({
        scenarioId: scenario.id,
        personaId: persona.id,
        userMessage: textToSend,
        turnHistory: historyPayload,
        elapsedMs,
      })

      if (!response || !response.success) {
        console.error('Turn processing failed:', response?.error)
        setIsProcessing(false)
        return
      }

      // Update student turn with score and feedback
      const finalizedStudentTurn: SpeakingDialogueTurn = {
        ...tempStudentTurn,
        accuracyScore: response.accuracyScore,
        wordBreakdown: response.wordBreakdown,
        feedbackVi: response.feedbackVi,
      }

      let nextTurns = updatedTurnsWithStudent.map((t) =>
        t.id === studentTurnId ? finalizedStudentTurn : t
      )

      // Add tutor response turn if available
      if (response.tutorMessage) {
        const tutorTurn: SpeakingDialogueTurn = {
          id: `tutor-${Date.now()}`,
          sender: 'tutor',
          text: response.tutorMessage,
          timestamp: new Date().toISOString(),
        }
        nextTurns = [...nextTurns, tutorTurn]

        // Auto-play tutor voice
        speak(response.tutorMessage)
      }

      setTurns(nextTurns)

      // Update scaffolding hints
      if (response.hints && response.hints.length > 0) {
        setCurrentHints(response.hints)
      }

      turnStartTimeRef.current = Date.now()

      // Handle session completion
      if (response.isCompleted) {
        const studentTurnsList = nextTurns.filter((t) => t.sender === 'student')
        const totalAccuracy = studentTurnsList.reduce(
          (sum, t) => sum + (t.accuracyScore ?? 80),
          0
        )
        const avgAccuracy = Math.round(totalAccuracy / (studentTurnsList.length || 1))

        const mispronouncedWords: string[] = []
        studentTurnsList.forEach((st) => {
          st.wordBreakdown?.forEach((wb) => {
            if (wb.score < 60 && !mispronouncedWords.includes(wb.word.toLowerCase())) {
              mispronouncedWords.push(wb.word.toLowerCase())
            }
          })
        })

        const completionRes = await completeSpeakingSessionAction({
          studentId,
          scenarioId: scenario.id,
          personaId: persona.id,
          totalTurns: studentTurnsList.length,
          overallScore: avgAccuracy,
          pronunciationScore: avgAccuracy,
          fluencyScore: Math.min(100, avgAccuracy + 5),
          turns: nextTurns,
          mispronouncedWords,
        })

        const finalResult: SpeakingSessionResult =
          completionRes?.success && completionRes.data
            ? completionRes.data
            : {
                scenarioId: scenario.id,
                personaId: persona.id,
                totalTurns: studentTurnsList.length,
                overallScore: avgAccuracy,
                pronunciationScore: avgAccuracy,
                fluencyScore: Math.min(100, avgAccuracy + 5),
                stars: avgAccuracy >= 85 ? 3 : avgAccuracy >= 70 ? 2 : 1,
                xpEarned: 50,
                mispronouncedWords,
                turns: nextTurns,
              }

        setCompletionData(finalResult)
        setIsCompleted(true)
        onComplete?.(finalResult)
      }
    } catch (err) {
      console.error('Error submitting speaking turn:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Toggle voice listening
  const handleToggleListen = () => {
    if (isListening) {
      stopListening()
      const textToSend = (transcript || inputText).trim()
      if (textToSend) {
        void handleSendTurn(textToSend)
      }
    } else {
      cancelSpeech()
      resetTranscript()
      startListening()
    }
  }

  // Hint selection
  const handleSelectHint = (hint: SpeakingScaffoldingHint) => {
    setInputText(hint.textEn)
  }

  // Hint preview audio
  const handlePreviewAudio = (text: string) => {
    cancelSpeech()
    speak(text)
  }

  // Replay turn audio
  const handlePlayTurnAudio = (text: string) => {
    cancelSpeech()
    speak(text)
  }

  // Restart session
  const handleRestart = () => {
    cancelSpeech()
    resetTranscript()
    setTurns([
      {
        id: `turn-init-${scenario.id}-${Date.now()}`,
        sender: 'tutor',
        text: scenario.initialMessage,
        timestamp: new Date().toISOString(),
      },
    ])
    setCurrentHints(scenario.initialHints || [])
    setInputText('')
    setIsCompleted(false)
    setCompletionData(null)
    turnStartTimeRef.current = Date.now()
  }

  // Back to hub
  const handleBackToHub = () => {
    router.push('/speaking')
  }

  // Add mispronounced words to Mistake Notebook (SRS storage)
  const handleAddToMistakes = (words: string[]) => {
    if (!words || words.length === 0) return
    const currentDeck = getStoredSrsDeck(session?.classCode, session?.studentName)
    const nowIso = new Date().toISOString()
    const updatedDeck = [...currentDeck]

    words.forEach((word) => {
      const cleanWord = word.trim()
      if (!cleanWord) return
      const cardId = `speaking_${cleanWord.toLowerCase().replace(/\s+/g, '_')}`
      const existingIdx = updatedDeck.findIndex((c) => c.id === cardId)

      if (existingIdx >= 0) {
        const existing = updatedDeck[existingIdx]
        updatedDeck[existingIdx] = {
          ...existing,
          box: 1,
          mistakeCount: (existing.mistakeCount || 0) + 1,
          nextReviewAt: nowIso,
          isMastered: false,
        }
      } else {
        updatedDeck.push({
          id: cardId,
          prompt: 'Luyện phát âm từ vựng',
          correctAnswer: cleanWord,
          selectedAnswer: null,
          gameType: 'speaking',
          topic: scenario.titleVi || scenario.titleEn,
          box: 1,
          lastReviewedAt: null,
          nextReviewAt: nowIso,
          mistakeCount: 1,
          successCount: 0,
          isMastered: false,
        })
      }
    })

    saveStoredSrsDeck(session?.classCode, session?.studentName, updatedDeck)
    onAddToMistakes?.(words)
  }

  const activeInputValue = isListening && transcript ? transcript : inputText

  return (
    <div data-testid="speaking-arena" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar Navigation & Scenario Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl bg-card border-2 border-border shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/speaking"
            data-testid="back-to-hub-link"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-secondary/80 hover:bg-secondary text-base font-bold text-foreground transition-all shrink-0 border border-border"
          >
            <ArrowLeft className="size-4" />
            <span>← Chọn chủ đề khác</span>
          </Link>

          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl shrink-0" role="img" aria-label={scenario.titleVi}>
              {scenario.icon}
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-foreground truncate">
                {scenario.titleVi}
              </h2>
              <p className="text-base text-muted-foreground truncate italic">
                {scenario.titleEn}
              </p>
            </div>
          </div>
        </div>

        {/* Persona Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 shadow-2xs self-end sm:self-center">
          <span className="text-xl">{persona.avatar}</span>
          <div className="flex flex-col">
            <span className="text-base font-black text-amber-900 dark:text-amber-200 leading-tight">
              {persona.name}
            </span>
            <span className="text-base font-medium text-amber-700/80 dark:text-amber-300/80">
              {persona.role}
            </span>
          </div>
        </div>
      </div>

      {/* Main Dialogue Scroll Area */}
      <div className="rounded-3xl bg-card border-2 border-border/80 shadow-md p-4 sm:p-6 min-h-[360px] max-h-[500px] overflow-y-auto space-y-4">
        {turns.map((turn) => (
          <SpeakingBubble
            key={turn.id}
            turn={turn}
            persona={persona}
            onPlayAudio={handlePlayTurnAudio}
          />
        ))}

        {isProcessing && (
          <div className="flex items-center gap-3 my-3">
            <div className="size-11 sm:size-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-xl shrink-0">
              <span>{persona.avatar}</span>
            </div>
            <div className="rounded-3xl rounded-tl-xs bg-muted/60 border border-border px-5 py-3 flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-amber-500 animate-bounce" />
              <span className="inline-block size-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
              <span className="inline-block size-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-base font-bold text-muted-foreground ml-2">
                {persona.name} đang suy nghĩ phản hồi...
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Session Completion Podium Modal */}
      {completionData && (
        <SpeakingPodiumModal
          isOpen={isCompleted}
          result={completionData}
          scenario={scenario}
          onRestart={handleRestart}
          onBackToHub={handleBackToHub}
          onAddToMistakes={handleAddToMistakes}
        />
      )}

      {/* Scaffolding Hints Bar */}
      {!isCompleted && currentHints.length > 0 && (
        <ScaffoldingHints
          hints={currentHints}
          onSelectHint={handleSelectHint}
          onPreviewAudio={handlePreviewAudio}
        />
      )}

      {/* Voice Interaction & Text Fallback Control Area */}
      {!isCompleted && (
        <div className="rounded-3xl bg-card border-2 border-border p-4 sm:p-6 shadow-md space-y-6">
          {/* Concentric Mic Pulse Button */}
          <MicPulseButton
            isListening={isListening}
            isProcessing={isProcessing}
            isSupported={isMicSupported}
            onToggleListen={handleToggleListen}
          />

          {/* Text Input Fallback Bar */}
          <div className="pt-4 border-t border-border/70 space-y-2">
            <div className="flex items-center justify-between px-1">
              <label
                htmlFor="speaking-text-input"
                className="text-base font-bold text-foreground"
              >
                Hoặc gõ câu trả lời của bạn:
              </label>
              {(inputText || (isListening && transcript)) && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('')
                    resetTranscript()
                  }}
                  className="text-base font-bold text-muted-foreground hover:text-foreground"
                >
                  Xóa
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleSendTurn(activeInputValue)
              }}
              className="flex items-center gap-2"
            >
              <input
                id="speaking-text-input"
                type="text"
                data-testid="text-input-fallback"
                value={activeInputValue}
                disabled={isProcessing}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập câu tiếng Anh hoặc bấm gợi ý ở trên..."
                className="flex-1 px-4 py-3 rounded-2xl bg-background border-2 border-border focus:border-amber-500 text-base font-medium text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/30 transition-all"
              />

              <button
                type="submit"
                data-testid="text-submit-button"
                disabled={isProcessing || !activeInputValue.trim()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:bg-muted disabled:text-muted-foreground text-white text-base font-black shadow-md hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Gửi câu trả lời"
              >
                <Send className="size-5" />
                <span className="hidden sm:inline">Gửi</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
