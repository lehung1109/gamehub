'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, ArrowLeft, Swords } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { useStudentSession } from '@/contexts/StudentSessionContext'
import {
  getClassLeaderboardAction,
  getGlobalLeaderboardAction,
  LeaderboardEntry,
} from '@/app/actions/leaderboards'
import { ClassLeaderboardTable } from '@/components/leaderboard/ClassLeaderboardTable'
import { GlobalLeaderboardTable } from '@/components/leaderboard/GlobalLeaderboardTable'
import { cn } from '@/lib/utils'

export default function LeaderboardHubPage() {
  const { session } = useStudentSession()

  // Tabs: 'class' | 'global'
  const [activeTab, setActiveTab] = useState<'class' | 'global'>('class')

  // Classroom Leaderboard state
  const [selectedClassCode, setSelectedClassCode] = useState<string | null>(null)
  const classCode = selectedClassCode ?? (session?.classCode || '')
  const [classEntries, setClassEntries] = useState<LeaderboardEntry[]>([])
  const [isClassLoading, setIsClassLoading] = useState<boolean>(() => Boolean(session?.classCode))
  const [classError, setClassError] = useState<string | null>(null)

  // Global Leaderboard state
  const [timeframe, setTimeframe] = useState<'weekly' | 'all'>('weekly')
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([])
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Fetch classroom leaderboard when classCode changes
  useEffect(() => {
    let ignore = false
    if (!classCode) return

    const loadData = async () => {
      try {
        const res = await getClassLeaderboardAction(classCode)
        if (!ignore) {
          if (res.success && res.data) {
            setClassEntries(res.data)
            setClassError(null)
          } else {
            setClassError(res.error || 'Không thể tải bảng xếp hạng lớp học')
            setClassEntries([])
          }
          setIsClassLoading(false)
        }
      } catch (err: unknown) {
        if (!ignore) {
          setClassError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra')
          setClassEntries([])
          setIsClassLoading(false)
        }
      }
    }

    loadData()
    return () => {
      ignore = true
    }
  }, [classCode])

  // Fetch global leaderboard when activeTab is global or timeframe changes
  useEffect(() => {
    let ignore = false
    if (activeTab !== 'global') return

    const loadData = async () => {
      try {
        const res = await getGlobalLeaderboardAction(timeframe)
        if (!ignore) {
          if (res.success && res.data) {
            setGlobalEntries(res.data)
            setGlobalError(null)
          } else {
            setGlobalError(res.error || 'Không thể tải bảng vàng toàn trường')
            setGlobalEntries([])
          }
          setIsGlobalLoading(false)
        }
      } catch (err: unknown) {
        if (!ignore) {
          setGlobalError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra')
          setGlobalEntries([])
          setIsGlobalLoading(false)
        }
      }
    }

    loadData()
    return () => {
      ignore = true
    }
  }, [activeTab, timeframe])

  const handleTabChange = (tab: 'class' | 'global') => {
    setActiveTab(tab)
    if (tab === 'global') {
      setIsGlobalLoading(true)
    }
  }

  const handleSearchClass = (code: string) => {
    setSelectedClassCode(code)
    setIsClassLoading(true)
  }

  const handleTimeframeChange = (tf: 'weekly' | 'all') => {
    setTimeframe(tf)
    setIsGlobalLoading(true)
  }

  return (
    <Container>
      <div data-testid="leaderboard-hub" className="min-h-[85vh] py-6 flex flex-col gap-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border border-border text-foreground hover:bg-muted font-bold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Trang chủ</span>
          </Link>

          <Link
            href="/duel"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-bold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <Swords className="size-4" />
            <span>Đấu trường 1v1</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
          <div className="size-16 rounded-3xl bg-linear-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 mb-4 ring-4 ring-amber-400/20">
            <Trophy className="size-8" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight mb-2">
            Bảng Xếp Hạng & Vinh Danh
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-medium">
            Ghi danh những học sinh tích cực nhất, chinh phục nhiều sao và bất bại trên đấu trường tiếng Anh!
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-muted border border-border/60 shadow-xs max-w-md w-full">
            <button
              type="button"
              data-testid="tab-class-leaderboard"
              onClick={() => handleTabChange('class')}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2',
                activeTab === 'class'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>🏫</span>
              <span>Lớp học của tôi</span>
            </button>

            <button
              type="button"
              data-testid="tab-global-leaderboard"
              onClick={() => handleTabChange('global')}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2',
                activeTab === 'global'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>🌍</span>
              <span>Bảng vàng toàn trường</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-2">
          {activeTab === 'class' ? (
            <ClassLeaderboardTable
              entries={classEntries}
              classCode={classCode}
              isLoading={isClassLoading}
              errorMessage={classError}
              onSearchClass={handleSearchClass}
            />
          ) : (
            <GlobalLeaderboardTable
              entries={globalEntries}
              timeframe={timeframe}
              onTimeframeChange={handleTimeframeChange}
              isLoading={isGlobalLoading}
              errorMessage={globalError}
            />
          )}
        </div>
      </div>
    </Container>
  )
}
