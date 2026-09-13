// src/components/story/ComicStoryReader.tsx

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Volume2,
  Mic,
  MicOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  GitBranch,
} from 'lucide-react'
import type { ComicStory } from '@/types/comic-story'
import type { PhonemeAssessmentResult } from '@/types/ai-copilot'
import { getNextPanel } from '@/lib/comic-story-engine'
import { evaluatePhonemePronunciation } from '@/lib/phoneme-evaluator'
import { PhonemeVisualizer } from '@/components/game/pronunciation/PhonemeVisualizer'
import { StoryCompletedModal } from './StoryCompletedModal'
import { useSpeech } from '@/hooks/useSpeech'

interface ComicStoryReaderProps {
  story: ComicStory
  onCompleteStory?: () => void
}

export function ComicStoryReader({ story, onCompleteStory }: ComicStoryReaderProps) {
  const [currentPanelId, setCurrentPanelId] = useState(story.panels[0]?.id || '')
  const [isRecording, setIsRecording] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<PhonemeAssessmentResult | null>(null)
  const [isStoryCompleted, setIsStoryCompleted] = useState(false)

  const { speak } = useSpeech({ rate: 0.85 })

  const currentPanel = story.panels.find((p) => p.id === currentPanelId) || story.panels[0]
  if (!currentPanel) return null

  function handleListenDialogue() {
    speak(currentPanel.dialogueEn)
  }

  function handleToggleVoiceActing() {
    if (isRecording) {
      setIsRecording(false)
      // Evaluate simulated spoken line matching target
      const res = evaluatePhonemePronunciation(
        currentPanel.dialogueEn,
        currentPanel.dialogueEn
      )
      setEvaluationResult(res)
    } else {
      setIsRecording(true)
      setEvaluationResult(null)
    }
  }

  function handleSelectBranch(choiceId: string) {
    const next = getNextPanel(story, currentPanel.id, choiceId)
    if (next) {
      setCurrentPanelId(next.id)
      setEvaluationResult(null)
    } else {
      setIsStoryCompleted(true)
      onCompleteStory?.()
    }
  }

  function handleNextPanel() {
    const next = getNextPanel(story, currentPanel.id)
    if (next) {
      setCurrentPanelId(next.id)
      setEvaluationResult(null)
    } else {
      setIsStoryCompleted(true)
      onCompleteStory?.()
    }
  }

  function handleReplay() {
    setCurrentPanelId(story.panels[0]?.id || '')
    setEvaluationResult(null)
    setIsStoryCompleted(false)
  }

  if (isStoryCompleted) {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <StoryCompletedModal
          storyTitle={story.titleVi}
          expGained={25}
          onReplay={handleReplay}
        />
      </div>
    )
  }

  const hasBranches = Boolean(currentPanel.branchChoices && currentPanel.branchChoices.length > 0)

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all"
        >
          <ArrowLeft className="size-5" />
          <span>Kho Truyện</span>
        </Link>

        <div className="text-center space-y-0.5">
          <span className="block text-base font-bold text-slate-500">
            Phân cảnh {currentPanel.panelNumber}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 truncate max-w-md">
            {story.titleVi}
          </h1>
        </div>

        <div className="px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-base font-black">
          {story.level}
        </div>
      </div>

      {/* Main Comic Panel Frame */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-slate-900 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Sound Effect Boom Tag */}
        {currentPanel.soundEffect && (
          <div className="absolute top-4 right-6 rotate-6 z-10">
            <span className="px-4 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl border-3 border-slate-950 shadow-md transform inline-block animate-pulse">
              {currentPanel.soundEffect}
            </span>
          </div>
        )}

        {/* Scene Illustration & Narrator Caption */}
        <div className="space-y-4">
          <div className="h-44 sm:h-52 bg-gradient-to-b from-indigo-50/80 to-slate-100 rounded-2xl border-2 border-slate-200 flex items-center justify-center">
            <span className="text-8xl sm:text-9xl drop-shadow-lg">
              {currentPanel.sceneEmoji}
            </span>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 text-amber-950 text-base font-bold italic">
            📖 Người kể chuyện: &ldquo;{currentPanel.narratorTextVi}&rdquo;
          </div>
        </div>

        {/* Character Speech Bubble */}
        <div className="p-6 sm:p-8 bg-slate-50 rounded-3xl border-3 border-slate-800 space-y-4 relative shadow-sm">
          {/* Character Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl">{currentPanel.characterAvatar}</span>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {currentPanel.characterName}
                </h3>
                <span className="text-base font-bold text-indigo-600">Lời thoại nhân vật:</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleListenDialogue}
              aria-label="Nghe câu thoại mẫu"
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base inline-flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/25 transition-all"
            >
              <Volume2 className="size-5" />
              <span>Nghe mẫu</span>
            </button>
          </div>

          {/* Dialogue Text & Phonetics */}
          <div className="space-y-1.5 pt-2">
            <p className="text-2xl sm:text-3xl font-black text-slate-950 tracking-wide">
              &ldquo;{currentPanel.dialogueEn}&rdquo;
            </p>
            <p className="text-base sm:text-lg font-mono font-bold text-slate-500">
              {currentPanel.dialogueIpa}
            </p>
            <p className="text-base text-slate-700 font-semibold pt-1">
              Dịch nghĩa: {currentPanel.dialogueMeaningVi}
            </p>
          </div>
        </div>

        {/* Voice-Acting Interactive Section */}
        {currentPanel.requiresVoiceActing && (
          <div className="p-6 rounded-3xl bg-indigo-50/60 border-2 border-indigo-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-indigo-900 font-black text-lg">
                  <Sparkles className="size-5 text-indigo-600" />
                  <span>Phòng Thu Lồng Tiếng Cho Nhân Vật</span>
                </div>
                <p className="text-base text-slate-600 font-medium">
                  Nhấn micro và đọc to câu thoại &ldquo;{currentPanel.dialogueEn}&rdquo; để diễn xuất nhé!
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleVoiceActing}
                className={`px-6 py-3.5 rounded-2xl font-black text-base inline-flex items-center gap-2.5 transition-all shadow-md cursor-pointer shrink-0 ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
                }`}
              >
                {isRecording ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                <span>{isRecording ? 'Dừng & Chấm Điểm' : 'Bắt Đầu Lồng Tiếng'}</span>
              </button>
            </div>

            {/* Granular Phoneme Assessment Display */}
            {evaluationResult && (
              <div className="pt-2 animate-in fade-in-50 duration-200">
                <PhonemeVisualizer result={evaluationResult} />
              </div>
            )}
          </div>
        )}

        {/* Branch Choices Section */}
        {hasBranches && (
          <div className="p-6 rounded-3xl bg-purple-50 border-2 border-purple-200 space-y-4">
            <div className="flex items-center gap-2 text-purple-950 font-black text-lg">
              <GitBranch className="size-5 text-purple-700" />
              <span>Ngã Rẽ Câu Chuyện: Em hãy chọn hướng đi tiếp theo!</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentPanel.branchChoices?.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleSelectBranch(choice.id)}
                  className="p-5 rounded-2xl bg-white border-2 border-purple-300 hover:border-purple-600 text-left space-y-1 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <span className="block text-lg font-black text-purple-950 group-hover:text-purple-700">
                    {choice.textEn} →
                  </span>
                  <span className="block text-base font-medium text-slate-600">
                    {choice.textVi}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Linear Progression Next Button (when no branch choices) */}
        {!hasBranches && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleNextPanel}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base shadow-lg shadow-emerald-600/25 inline-flex items-center gap-2.5 cursor-pointer transition-all"
            >
              <span>Tiếp Tục Diễn Biến Tiếp Theo</span>
              <ArrowRight className="size-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
