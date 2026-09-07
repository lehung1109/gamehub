// src/app/games/word-search/page.tsx
'use client'

import React, { useState, useMemo, useCallback, Suspense } from 'react'
import topicsData from '@/data/topics.json'
import animalsWords from '@/data/words/animals.json'
import fruitsWords from '@/data/words/fruits.json'
import familyWords from '@/data/words/family.json'
import schoolWords from '@/data/words/school.json'
import bodyPartsWords from '@/data/words/body-parts.json'

import type { Topic, Word } from '@/types'
import type { WordSearchSettings } from '@/types/config'
import { BackButton } from '@/components/custom/BackButton'
import { SpeechUnsupportedBanner } from '@/components/custom/SpeechUnsupportedBanner'
import { ConfigBanner } from '@/components/game/ConfigBanner'
import { PreviewBanner } from '@/components/game/PreviewBanner'
import { WordSearchBoard } from '@/components/game/WordSearchBoard'
import { WordSearchWordList } from '@/components/game/WordSearchWordList'
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
import { useWordSearchGame } from '@/hooks/useWordSearchGame'
import {
  Lightbulb,
  RotateCcw,
  Clock,
  Star,
  Sparkles,
  CheckCircle2,
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

interface WordSearchGameContentProps {
  configId: string | null
  configName: string | null
  settings: WordSearchSettings | null
  isPreview: boolean
}

function WordSearchGameContent({
  configId,
  configName,
  settings,
  isPreview,
}: WordSearchGameContentProps) {
  const { isSupported: isSpeechSupported, speak } = useSpeech()

  // Filter allowed topics if specified by config
  const availableTopics = useMemo(() => {
    if (settings?.topics && settings.topics.length > 0) {
      return allTopics.filter((t) => settings.topics.includes(t.id))
    }
    return allTopics
  }, [settings])

  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    return availableTopics[0]?.id || 'animals'
  })

  const [wordCount, setWordCount] = useState<4 | 5 | 6>(() => {
    if (settings?.wordCount && [4, 5, 6].includes(settings.wordCount)) {
      return settings.wordCount as 4 | 5 | 6
    }
    return 5
  })

  const [showTopicSelector, setShowTopicSelector] = useState(false)

  // Hook for student progress tracking
  const { submitSession } = useGameTracking({
    gameType: 'word-search',
    topic: selectedTopicId,
    configId: configId || undefined,
    totalQuestions: wordCount,
  })

  const activeWordPool = useMemo(() => {
    if (selectedTopicId === 'all') return allWords
    return topicWordsMap[selectedTopicId] || allWords
  }, [selectedTopicId])

  const autoSpeak = settings?.autoSpeak !== undefined ? settings.autoSpeak : true
  const enableHints = settings?.enableHints !== undefined ? settings.enableHints : true
  const showTimer = settings?.showTimer !== undefined ? settings.showTimer : true

  const handleGameComplete = useCallback(
    ({
      wordsFound,
      elapsedSeconds,
      hintsUsed,
      stars,
    }: {
      wordsFound: number
      totalWords: number
      elapsedSeconds: number
      hintsUsed: number
      stars: 1 | 2 | 3
    }) => {
      const topicName =
        allTopics.find((t) => t.id === selectedTopicId)?.nameVi || selectedTopicId

      submitSession({
        score: stars,
        totalQuestions: wordCount,
        details: [
          {
            prompt: `Hoàn thành ${wordsFound} từ chủ đề ${topicName} trong ${elapsedSeconds}s (dùng ${hintsUsed} gợi ý)`,
            isCorrect: true,
            timeTakenMs: elapsedSeconds * 1000,
            attempts: hintsUsed,
          },
        ],
      })
    },
    [selectedTopicId, wordCount, submitSession]
  )

  const {
    grid,
    targetWords,
    hintCount,
    elapsedSeconds,
    stars,
    foundCount,
    remainingCount,
    isCompleted,
    handleCellPointerDown,
    handleCellPointerEnter,
    handleCellPointerUp,
    handleCellClick,
    useHint,
    restartGame,
  } = useWordSearchGame({
    words: activeWordPool,
    wordCount,
    topicId: selectedTopicId,
    autoSpeak,
    onWordFound: (foundWord) => {
      if (autoSpeak) {
        speak(foundWord.english)
      }
    },
    onGameComplete: handleGameComplete,
  })

  const currentTopic = allTopics.find((t) => t.id === selectedTopicId)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-4 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <BackButton href="/" label="Về trang chủ" />

          {/* Live Game Stats */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-1.5 bg-card px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border shadow-xs">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>
                {foundCount}/{targetWords.length} từ
              </span>
            </div>

            {showTimer && (
              <div className="flex items-center gap-1.5 bg-card px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border shadow-xs">
                <Clock className="size-4 text-amber-500" />
                <span className="font-mono">{formatTime(elapsedSeconds)}</span>
              </div>
            )}

            {enableHints && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={remainingCount === 0}
                onClick={useHint}
                className="h-7 sm:h-8 gap-1.5 rounded-full px-2.5 sm:px-3 text-xs font-bold border-amber-300 hover:bg-amber-50 text-amber-800 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-950"
              >
                <Lightbulb className="size-3.5 text-amber-500 fill-amber-500" />
                <span>Gợi ý</span>
                {hintCount > 0 && (
                  <span className="bg-amber-200 dark:bg-amber-800 rounded-full px-1.5 py-0.5 text-xs font-bold leading-none">
                    {hintCount}
                  </span>
                )}
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => restartGame()}
              className="size-7 sm:size-8 p-0 rounded-full"
              title="Chơi lại ván mới"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Banners */}
        {isPreview && <PreviewBanner />}
        {!isPreview && configName && <ConfigBanner configName={configName} />}
        <SpeechUnsupportedBanner show={!isSpeechSupported} />

        {/* Header Title & Topic Switcher */}
        <div className="bg-card p-4 sm:p-5 rounded-3xl border shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-11 sm:size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-2xl shadow-inner">
              {currentTopic?.emoji || '🔍'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-foreground">
                  Săn tìm từ vựng (Word Search)
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {currentTopic?.nameVi || 'Chủ đề'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Kéo chuột/ngón tay hoặc chạm ô đầu - ô cuối để tìm {wordCount} từ tiếng Anh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowTopicSelector((prev) => !prev)}
              className="rounded-2xl font-bold text-xs"
            >
              {showTopicSelector ? 'Đóng chọn chủ đề' : 'Đổi chủ đề & số từ'}
            </Button>
          </div>
        </div>

        {/* Collapsible Topic & Count Selectors */}
        {showTopicSelector && (
          <Card className="p-4 rounded-3xl border shadow-xs space-y-3 animate-in fade-in-50 duration-200">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Chọn chủ đề:
              </span>
              <div className="flex flex-wrap gap-2">
                {availableTopics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => {
                      setSelectedTopicId(topic.id)
                      setShowTopicSelector(false)
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all',
                      selectedTopicId === topic.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs scale-105'
                        : 'bg-card text-foreground hover:bg-accent border-border/80'
                    )}
                  >
                    <span>{topic.emoji}</span>
                    <span>{topic.nameVi}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Số từ mỗi ván:
              </span>
              <div className="flex gap-2">
                {([4, 5, 6] as const).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setWordCount(num)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all',
                      wordCount === num
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-card text-foreground hover:bg-accent border-border/80'
                    )}
                  >
                    {num} từ
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Main Board & Word List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Word Search 8x8 Board */}
          <div className="lg:col-span-8 flex justify-center">
            <WordSearchBoard
              grid={grid}
              disabled={isCompleted}
              onCellPointerDown={handleCellPointerDown}
              onCellPointerEnter={handleCellPointerEnter}
              onCellPointerUp={handleCellPointerUp}
              onCellClick={handleCellClick}
            />
          </div>

          {/* Target Words Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                Từ vựng cần tìm ({remainingCount} còn lại)
              </h2>
            </div>
            <WordSearchWordList
              words={targetWords}
              onPlayPronunciation={(text) => speak(text)}
            />
          </div>
        </div>

        {/* Completion Celebration Modal */}
        <Dialog open={isCompleted} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md text-center rounded-3xl p-6 sm:p-8">
            <DialogHeader className="items-center space-y-3">
              <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-3xl shadow-inner animate-bounce">
                🎉
              </div>
              <DialogTitle className="text-2xl font-black text-foreground">
                Bé Thật Tuyệt Vời!
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground">
                Bé đã tìm thấy tất cả {targetWords.length} từ vựng tiếng Anh trong chủ đề{' '}
                <span className="font-bold text-foreground">
                  {currentTopic?.nameVi || selectedTopicId}
                </span>
                !
              </DialogDescription>
            </DialogHeader>

            {/* Stars & Stats Box */}
            <div className="my-4 py-4 px-6 bg-accent/40 rounded-3xl border border-border/80 space-y-3">
              <div className="flex justify-center items-center gap-1.5">
                {[1, 2, 3].map((starNum) => (
                  <Star
                    key={starNum}
                    className={cn(
                      'size-8 transition-transform duration-300',
                      starNum <= stars
                        ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-md'
                        : 'text-slate-300 dark:text-slate-700'
                    )}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-bold pt-2 border-t border-border/60">
                <div>
                  <span className="text-muted-foreground block">Thời gian</span>
                  <span className="text-sm text-foreground font-mono">
                    {formatTime(elapsedSeconds)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Gợi ý đã dùng</span>
                  <span className="text-sm text-foreground font-mono">
                    {hintCount} lần
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowTopicSelector(true)
                  restartGame()
                }}
                className="w-full rounded-2xl font-bold"
              >
                Đổi chủ đề khác
              </Button>
              <Button
                type="button"
                onClick={() => restartGame()}
                className="w-full rounded-2xl font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md gap-1.5"
              >
                <Sparkles className="size-4" />
                <span>Chơi lại ván mới</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function WordSearchConfigLoader() {
  const { configId, configName, settings, isPreview, isLoading } =
    useGameConfig<WordSearchSettings>('word-search')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <div className="size-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-muted-foreground">Đang tải bàn ô chữ...</p>
        </div>
      </div>
    )
  }

  return (
    <WordSearchGameContent
      key={configId || (isPreview ? 'preview' : 'default')}
      configId={configId}
      configName={configName}
      settings={settings}
      isPreview={isPreview}
    />
  )
}

export default function WordSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="size-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <WordSearchConfigLoader />
    </Suspense>
  )
}
