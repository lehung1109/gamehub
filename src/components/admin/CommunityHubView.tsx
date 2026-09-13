'use client'

import React, { useState, useTransition } from 'react'
import {
  Sparkles,
  Search,
  Share2,
  Filter,
  RefreshCw,
  FolderPlus,
} from 'lucide-react'

import type { CommunitySharedConfig, CommunitySortOption } from '@/types/community'
import type { CefrLevel } from '@/types/word-bank'
import { CommunityConfigCard } from './CommunityConfigCard'
import { ShareConfigModal } from './ShareConfigModal'
import { getCommunityConfigsAction } from '@/app/actions/community'

export interface CommunityHubViewProps {
  initialConfigs: CommunitySharedConfig[]
  totalCount: number
  currentUserId?: string
  myConfigs: Array<{ id: string; name: string; game_id: string; created_at: string }>
}

const CEFR_TABS: Array<{ value: CefrLevel | 'all'; label: string }> = [
  { value: 'all', label: 'Tất cả trình độ' },
  { value: 'Pre-A1', label: 'Pre-A1' },
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
]

const GAME_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Tất cả trò chơi' },
  { value: 'flashcard', label: '🎴 Thẻ từ vựng (Flashcard)' },
  { value: 'word-search', label: '🔍 Tìm từ Ô chữ' },
  { value: 'memory-match', label: '🧠 Lật thẻ Trí nhớ' },
  { value: 'wordle', label: '🟩 Đoán từ (Wordle)' },
  { value: 'crossword', label: '📝 Giải ô chữ' },
  { value: 'falling-words', label: '🌧️ Mưa từ vựng' },
  { value: 'alphabet', label: '🔤 Bảng chữ cái' },
  { value: 'listening', label: '🎧 Luyện nghe' },
  { value: 'spelling', label: '✍️ Đánh vần' },
  { value: 'sentences', label: '🧩 Ghép câu' },
  { value: 'reading', label: '📖 Đọc hiểu' },
]

const SORT_OPTIONS: Array<{ value: CommunitySortOption; label: string }> = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất (Nhiều tim)' },
  { value: 'clones', label: 'Sao chép nhiều nhất' },
]

export function CommunityHubView({
  initialConfigs,
  totalCount,
  currentUserId,
  myConfigs,
}: CommunityHubViewProps) {
  const [configs, setConfigs] = useState<CommunitySharedConfig[]>(initialConfigs)
  const [total, setTotal] = useState(totalCount)
  const [search, setSearch] = useState('')
  const [selectedGame, setSelectedGame] = useState('all')
  const [selectedCefr, setSelectedCefr] = useState<CefrLevel | 'all'>('all')
  const [selectedSort, setSelectedSort] = useState<CommunitySortOption>('newest')
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function refreshList(overrides?: {
    search?: string
    gameId?: string
    cefrLevel?: CefrLevel | 'all'
    sortBy?: CommunitySortOption
  }) {
    const s = overrides?.search !== undefined ? overrides.search : search
    const g = overrides?.gameId !== undefined ? overrides.gameId : selectedGame
    const c = overrides?.cefrLevel !== undefined ? overrides.cefrLevel : selectedCefr
    const sort = overrides?.sortBy !== undefined ? overrides.sortBy : selectedSort

    startTransition(async () => {
      const res = await getCommunityConfigsAction({
        search: s,
        gameId: g,
        cefrLevel: c,
        sortBy: sort,
        page: 1,
        pageSize: 30,
      })

      if (res.success && res.data) {
        setConfigs(res.data)
        setTotal(res.total || res.data.length)
      }
    })
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    refreshList()
  }

  function handleGameChange(val: string) {
    setSelectedGame(val)
    refreshList({ gameId: val })
  }

  function handleCefrChange(val: CefrLevel | 'all') {
    setSelectedCefr(val)
    refreshList({ cefrLevel: val })
  }

  function handleSortChange(val: CommunitySortOption) {
    setSelectedSort(val)
    refreshList({ sortBy: val })
  }

  function handleConfigDeleted(deletedId: string) {
    setConfigs((prev) => prev.filter((c) => c.id !== deletedId))
    setTotal((prev) => Math.max(0, prev - 1))
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Hero Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-indigo-700 via-indigo-800 to-purple-800 p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-base font-bold backdrop-blur-xs">
              <Sparkles className="size-5" />
              <span>Cộng đồng Giáo viên GameHub</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Thư viện Bài giảng & Cấu hình Cộng đồng
            </h1>
            <p className="text-indigo-100 text-base md:text-lg max-w-2xl font-medium">
              Khám phá và sao chép hàng trăm bộ cấu hình trò chơi chuẩn CEFR được đóng góp bởi các thầy cô trên toàn quốc.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-6 py-3.5 bg-white hover:bg-indigo-50 text-indigo-900 font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base"
            >
              <Share2 className="size-5 text-indigo-700" />
              Chia sẻ cấu hình của bạn
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo chủ đề, tiêu đề, từ khóa..."
              className="w-full text-base font-medium pl-12 pr-28 py-3.5 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl transition-colors"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Game Select & Sort By */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-700">Trò chơi:</span>
              <select
                value={selectedGame}
                onChange={(e) => handleGameChange(e.target.value)}
                className="text-base font-semibold px-4 py-3 border border-slate-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {GAME_FILTER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-700">Sắp xếp:</span>
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value as CommunitySortOption)}
                className="text-base font-semibold px-4 py-3 border border-slate-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CEFR Level Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-base font-bold text-slate-600 mr-2 flex items-center gap-1.5">
            <Filter className="size-4" /> Trình độ:
          </span>
          {CEFR_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleCefrChange(tab.value)}
              className={`px-4 py-2 rounded-xl text-base font-bold transition-all ${
                selectedCefr === tab.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">
            Tất cả bài chia sẻ ({total})
          </h2>
          {isPending && (
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-base">
              <RefreshCw className="size-5 animate-spin" />
              <span>Đang tải...</span>
            </div>
          )}
        </div>

        {configs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <div className="size-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
              <FolderPlus className="size-10" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-2xl font-black text-slate-900">
                Chưa tìm thấy cấu hình nào
              </h3>
              <p className="text-base text-slate-600 font-medium">
                Hãy thử thay đổi bộ lọc tìm kiếm hoặc là người đầu tiên chia sẻ cấu hình tuyệt vời của bạn lên cộng đồng!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md text-base transition-all inline-flex items-center gap-2"
            >
              <Share2 className="size-5" />
              Chia sẻ cấu hình ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configs.map((config) => (
              <CommunityConfigCard
                key={config.id}
                config={config}
                currentUserId={currentUserId}
                onDeleted={handleConfigDeleted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareConfigModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onSuccess={() => refreshList()}
        myConfigs={myConfigs}
      />
    </div>
  )
}
