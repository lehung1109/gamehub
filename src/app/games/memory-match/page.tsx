'use client'

import React, { useState, useMemo, useCallback, Suspense } from 'react'
import topicsData from '@/data/topics.json'
import animalsWords from '@/data/words/animals.json'
import fruitsWords from '@/data/words/fruits.json'
import familyWords from '@/data/words/family.json'
import schoolWords from '@/data/words/school.json'
import bodyPartsWords from '@/data/words/body-parts.json'

import type { Topic, Word } from '@/types'
import type { MemoryMatchSettings } from '@/types/config'
import { BackButton } from '@/components/custom/BackButton'
import { SpeechUnsupportedBanner } from '@/components/custom/SpeechUnsupportedBanner'
import { ConfigBanner } from '@/components/game/ConfigBanner'
import { PreviewBanner } from '@/components/game/PreviewBanner'
import { MemoryBoard } from '@/components/game/MemoryBoard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useSpeech } from '@/hooks/useSpeech'
import { useGameConfig } from '@/hooks/useGameConfig'
import { useGameTracking } from '@/hooks/use-game-tracking'
import { useMemoryGame } from '@/hooks/useMemoryGame'
import {
  Sparkles,
  RotateCcw,
  Clock,
  Layers,
  Star,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const allTopics = topicsData as Topic[]

const topicWordsMap: Record<string, Word[]> = {
  animals: animalsWords as Word[],
  fruits: fruitsWords as Word[],
  family: familyWords as Word[],
  school: schoolWords as Word[],
  'body-parts': bodyPartsWords as Word[],
}

const allWords: Word[] = [
  ...(animalsWords as Word[]),
  ...(fruitsWords as Word[]),
  ...(familyWords as Word[]),
  ...(schoolWords as Word[]),
  ...(bodyPartsWords as Word[]),
]

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface MemoryMatchGameContentProps {
  configId: string | null
  configName: string | null
  settings: MemoryMatchSettings | null
  isPreview: boolean
}

function MemoryMatchGameContent({
  configId,
  configName,
  settings,
  isPreview,
}: MemoryMatchGameContentProps) {
  const { isSupported: isSpeechSupported, speak } = useSpeech()

  // Filter allowed topics by config if configured
  const availableTopics = useMemo(() => {
    if (settings?.topics && settings.topics.length > 0) {
      return allTopics.filter((t) => settings.topics.includes(t.id))
    }
    return allTopics
  }, [settings])

  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    return availableTopics[0]?.id || 'animals'
  })

  const [pairCount, setPairCount] = useState<4 | 6 | 8>(() => {
    if (settings?.pairCount && [4, 6, 8].includes(settings.pairCount)) {
      return settings.pairCount as 4 | 6 | 8
    }
    return 6
  })


  // Hook for student progress tracking
  const { submitSession, resetSession } = useGameTracking({
    gameType: 'memory-match',
    topic: selectedTopicId,
    configId: configId || undefined,
    totalQuestions: pairCount,
  })

  // Get current word pool for selected topic
  const activeWordPool = useMemo(() => {
    if (selectedTopicId === 'all') {
      return allWords
    }
    return topicWordsMap[selectedTopicId] || allWords
  }, [selectedTopicId])

  const autoSpeak = settings?.autoSpeak !== undefined ? settings.autoSpeak : true
  const showTimer = settings?.showTimer !== undefined ? settings.showTimer : true

  // Handle game completion & progress tracking
  const handleGameComplete = useCallback(
    ({ flips, stars, elapsedSeconds }: { flips: number; stars: 1 | 2 | 3; elapsedSeconds: number }) => {
      const topicName =
        selectedTopicId === 'all'
          ? 'Tất cả'
          : allTopics.find((t) => t.id === selectedTopicId)?.nameVi || selectedTopicId

      submitSession({
        score: stars,
        totalQuestions: pairCount,
        details: [
          {
            prompt: `Hoàn thành chủ đề ${topicName} với ${flips} lượt lật trong ${elapsedSeconds}s`,
            isCorrect: true,
            timeTakenMs: elapsedSeconds * 1000,
            attempts: flips,
          },
        ],
      })
    },
    [selectedTopicId, pairCount, submitSession]
  )

  const {
    cards,
    matchedWordIds,
    flips,
    stars,
    isLocked,
    isCompleted,
    elapsedSeconds,
    handleCardClick,
    restartGame,
  } = useMemoryGame({
    words: activeWordPool,
    pairCount,
    autoSpeak,
    onSpeak: speak,
    onComplete: handleGameComplete,
  })

  const handleRestartGame = useCallback(
    (newWords?: Word[], countOverride?: number) => {
      resetSession()
      restartGame(newWords, countOverride)
    },
    [resetSession, restartGame]
  )

  const currentTopic = allTopics.find((t) => t.id === selectedTopicId)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-4 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-2">
          <BackButton href="/" label="Về trang chủ" />

          {/* Live Game Stats */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full border shadow-xs">
              <Layers className="size-4 text-indigo-500" />
              <span>
                {matchedWordIds.length}/{pairCount} cặp
              </span>
            </div>

            <div className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full border shadow-xs">
              <RotateCcw className="size-4 text-amber-500" />
              <span>{flips} lượt</span>
            </div>

            {showTimer && (
              <div className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full border shadow-xs">
                <Clock className="size-4 text-emerald-500" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Banners */}
        <SpeechUnsupportedBanner show={!isSpeechSupported} />
        {isPreview ? (
          <PreviewBanner />
        ) : (
          configName && <ConfigBanner configName={configName} />
        )}

        {/* Header & Controls */}
        <Card className="p-4 sm:p-6 bg-card rounded-3xl border shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">
                <span>🧠 Lật Thẻ Tìm Cặp</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground">
                Ghép Hình Ảnh &amp; Từ Tiếng Anh 🃏
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Lật 2 thẻ giống nhau để tìm cặp từ vựng! Chạm vào thẻ đã mở để nghe lại phát âm.
              </p>
            </div>

            {/* Controls: Difficulty (Pair count) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground mr-1">
                Số cặp:
              </span>
              {([4, 6, 8] as const).map((count) => (
                <Button
                  key={count}
                  size="sm"
                  variant={pairCount === count ? 'default' : 'outline'}
                  onClick={() => {
                    setPairCount(count)
                    handleRestartGame(undefined, count)
                  }}
                  className={cn(
                    'rounded-full text-xs font-bold px-3 py-1',
                    pairCount === count && 'bg-indigo-600 text-white'
                  )}
                >
                  {count} cặp
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRestartGame()}
                className="rounded-full gap-1.5 font-bold text-xs"
                title="Bốc tập từ mới và chơi lại"
              >
                <RotateCcw className="size-3.5" />
                <span>Ván mới</span>
              </Button>
            </div>
          </div>

          {/* Topic selection pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-border/60 mt-4 no-scrollbar">
            <span className="text-xs font-bold text-muted-foreground shrink-0 mr-1">
              Chủ đề:
            </span>
            {availableTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  setSelectedTopicId(topic.id)
                  handleRestartGame(topicWordsMap[topic.id] || allWords)
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border cursor-pointer select-none',
                  selectedTopicId === topic.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-card text-foreground hover:bg-muted border-border'
                )}
              >
                <span>{topic.emoji}</span>
                <span>{topic.nameVi}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Memory Board */}
        <main aria-label="Bàn cờ trò chơi lật thẻ">
          <MemoryBoard
            cards={cards}
            disabled={isLocked}
            onCardClick={handleCardClick}
          />
        </main>
      </div>

      {/* Win Celebration Modal */}
      <Dialog open={isCompleted}>
        <DialogContent className="sm:max-w-md text-center p-6 rounded-3xl">
          <DialogHeader className="flex flex-col items-center">
            <div className="size-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mb-2 animate-bounce">
              <Award className="size-8 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-black text-foreground">
              🎉 Hoàn Thành Xuất Sắc!
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Bé đã tìm đủ toàn bộ {pairCount} cặp từ vựng trong chủ đề{' '}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {currentTopic?.nameVi || 'Tiếng Anh'}
              </span>
              !
            </DialogDescription>
          </DialogHeader>

          {/* Star Rating Display */}
          <div className="py-4 flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2 text-amber-500">
              {[1, 2, 3].map((starIndex) => (
                <Star
                  key={starIndex}
                  className={cn(
                    'size-10 transition-transform duration-300',
                    starIndex <= stars
                      ? 'fill-amber-400 text-amber-500 scale-110'
                      : 'text-slate-300 dark:text-slate-700'
                  )}
                />
              ))}
            </div>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">
              {stars === 3
                ? '🌟🌟🌟 Xuất sắc nhất!'
                : stars === 2
                ? '⭐⭐ Rất giỏi!'
                : '⭐ Hoàn thành! Cố lên nhé!'}
            </span>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3 py-2 bg-muted/40 rounded-2xl p-3 mb-4">
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground font-medium">
                Số lượt lật
              </span>
              <span className="text-lg font-black text-foreground mt-0.5">
                {flips} lượt
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground font-medium">
                Thời gian
              </span>
              <span className="text-lg font-black text-foreground mt-0.5">
                {formatTime(elapsedSeconds)}
              </span>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-center">
            <Button
              onClick={() => handleRestartGame()}
              className="w-full sm:w-auto rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 px-6"
            >
              <RotateCcw className="size-4" />
              <span>Chơi lại ván mới</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const currentIndex = availableTopics.findIndex((t) => t.id === selectedTopicId)
                const nextIndex = (currentIndex + 1) % availableTopics.length
                const nextTopic = availableTopics[nextIndex]
                setSelectedTopicId(nextTopic.id)
                handleRestartGame(topicWordsMap[nextTopic.id] || allWords)
              }}
              className="w-full sm:w-auto rounded-full font-bold gap-2"
            >
              <Sparkles className="size-4 text-amber-500" />
              <span>Chủ đề tiếp theo</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MemoryMatchConfigLoader() {
  const { configId, configName, settings, isPreview, isLoading } =
    useGameConfig<MemoryMatchSettings>('memory-match')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center text-muted-foreground font-medium">
        Đang tải trò chơi Lật thẻ tìm cặp...
      </div>
    )
  }

  return (
    <MemoryMatchGameContent
      key={configId || (isPreview ? 'preview' : 'default')}
      configId={configId}
      configName={configName}
      settings={settings}
      isPreview={isPreview}
    />
  )
}

export default function MemoryMatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 text-center text-muted-foreground font-medium">
          Đang tải trò chơi Lật thẻ tìm cặp...
        </div>
      }
    >
      <MemoryMatchConfigLoader />
    </Suspense>
  )
}
