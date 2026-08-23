'use client'

import React, { useState, useMemo } from 'react'
import type { ClassDifficultWordItem } from '@/app/actions/classes'
import {
  filterDifficultWordsByGame,
  searchDifficultWords,
  sortDifficultWords,
} from '@/lib/analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AlertTriangle,
  Sparkles,
  Search,
  BookOpen,
  Users,
  Target,
  Gamepad2,
} from 'lucide-react'

interface DifficultWordsAnalysisProps {
  items: ClassDifficultWordItem[]
}

export function DifficultWordsAnalysis({ items }: DifficultWordsAnalysisProps) {
  const [selectedGame, setSelectedGame] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<'errorRate' | 'incorrectCount' | 'studentCount'>('errorRate')

  // Extract distinct game types from items for dynamic filter tabs
  const availableGameTypes = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of items) {
      if (!map.has(item.gameType)) {
        map.set(item.gameType, item.gameLabel)
      }
    }
    return Array.from(map.entries()).map(([type, label]) => ({ type, label }))
  }, [items])

  // Filter and sort items
  const processedItems = useMemo(() => {
    let result = filterDifficultWordsByGame(items, selectedGame)
    result = searchDifficultWords(result, searchQuery)
    result = sortDifficultWords(result, sortBy)
    return result
  }, [items, selectedGame, searchQuery, sortBy])

  // Summary statistics
  const summary = useMemo(() => {
    if (items.length === 0) return null
    const mostProblematic = items[0] // items are sorted by error rate desc by default
    const totalMistakes = items.reduce((sum, item) => sum + item.incorrectCount, 0)
    return {
      totalWords: items.length,
      mostProblematic,
      totalMistakes,
    }
  }, [items])

  return (
    <Card className="border-slate-200 shadow-xs bg-white">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500 shrink-0" />
              Phân tích từ khó toàn lớp
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Thống kê các từ vựng, chữ cái hoặc câu hỏi học sinh hay làm sai nhất để giáo viên có kế hoạch ôn tập phù hợp
            </CardDescription>
          </div>

          {summary && (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-2xs bg-amber-50 text-amber-800 border-amber-200 gap-1 py-1">
                <BookOpen className="size-3 text-amber-600" />
                <span>{summary.totalWords} từ cần ôn</span>
              </Badge>
              <Badge variant="outline" className="text-2xs bg-rose-50 text-rose-800 border-rose-200 gap-1 py-1">
                <Target className="size-3 text-rose-600" />
                <span>{summary.totalMistakes} lượt trả lời sai</span>
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {items.length === 0 ? (
          <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start sm:items-center gap-4">
            <div className="size-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">
                Không có từ nào làm sai! Cả lớp làm rất tốt ⭐
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Tất cả học sinh đều hoàn thành chính xác các câu hỏi trong khoảng thời gian này.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Filter and Search Bar */}
            <div className="space-y-3">
              {/* Game Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGame('all')}
                  className={`h-7 px-2.5 text-xs font-medium rounded-md transition-all ${
                    selectedGame === 'all'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({items.length})
                </Button>
                {availableGameTypes.map((game) => {
                  const count = items.filter((i) => i.gameType === game.type).length
                  return (
                    <Button
                      key={game.type}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedGame(game.type)}
                      className={`h-7 px-2.5 text-xs font-medium rounded-md transition-all ${
                        selectedGame === game.type
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white font-bold shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {game.label} ({count})
                    </Button>
                  )
                })}
              </div>

              {/* Search & Sort Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="relative w-full sm:w-64">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="search-difficult-words"
                    aria-label="Tìm từ hoặc câu hỏi"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm từ hoặc câu hỏi..."
                    className="h-8 pl-8 text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="sort-difficult-words" className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    Sắp xếp:
                  </label>
                  <select
                    id="sort-difficult-words"
                    aria-label="Sắp xếp"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'errorRate' | 'incorrectCount' | 'studentCount')}
                    className="h-8 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="errorRate">Tỷ lệ sai cao nhất</option>
                    <option value="incorrectCount">Số lượt sai nhiều nhất</option>
                    <option value="studentCount">Số học sinh sai nhiều nhất</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table of Difficult Words */}
            {processedItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Không tìm thấy từ khó nào phù hợp với bộ lọc hiện tại
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-2xs">
                      <th className="py-2.5 px-3">Từ / Câu hỏi</th>
                      <th className="py-2.5 px-3">Trò chơi & Chủ đề</th>
                      <th className="py-2.5 px-3 text-center">Học sinh sai</th>
                      <th className="py-2.5 px-3 text-center">Lượt sai</th>
                      <th className="py-2.5 px-3 text-right">Tỷ lệ sai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processedItems.map((item, index) => {
                      const errorRate = item.errorRatePercent
                      const badgeClass =
                        errorRate >= 60
                          ? 'bg-rose-100 text-rose-800'
                          : errorRate >= 35
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-yellow-100 text-yellow-800'

                      const progressColorClass =
                        errorRate >= 60
                          ? 'bg-rose-500'
                          : errorRate >= 35
                          ? 'bg-amber-500'
                          : 'bg-yellow-500'

                      return (
                        <tr
                          key={`${item.gameType}-${item.prompt}-${index}`}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Prompt / Word */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                {item.prompt}
                              </span>
                            </div>
                          </td>

                          {/* Game & Topic */}
                          <td className="py-3 px-3 text-slate-600">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge
                                variant="outline"
                                className="text-2xs font-normal border-slate-200 bg-slate-50 text-slate-700"
                              >
                                <Gamepad2 className="size-2.5 mr-1 text-slate-500" />
                                {item.gameLabel}
                              </Badge>
                              {item.topic && (
                                <Badge
                                  variant="outline"
                                  className="text-2xs font-normal border-slate-200 bg-slate-50 text-slate-600"
                                >
                                  {item.topic}
                                </Badge>
                              )}
                            </div>
                          </td>

                          {/* Incorrect Student Count */}
                          <td className="py-3 px-3 text-center text-slate-700 font-medium">
                            <span className="inline-flex items-center gap-1">
                              <Users className="size-3 text-slate-400" />
                              {item.incorrectStudentCount}
                              {item.totalStudentsAttempted > 0
                                ? `/${item.totalStudentsAttempted}`
                                : ''}{' '}
                              học sinh
                            </span>
                          </td>

                          {/* Incorrect Count / Total Attempts */}
                          <td className="py-3 px-3 text-center text-slate-700 font-medium">
                            <span className="font-mono">
                              {item.incorrectCount}/{item.totalAttempts} lượt
                            </span>
                          </td>

                          {/* Error Rate & Progress */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="secondary" className={`text-2xs font-extrabold ${badgeClass}`}>
                                {errorRate}% sai
                              </Badge>
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${progressColorClass}`}
                                  style={{ width: `${Math.max(5, errorRate)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
