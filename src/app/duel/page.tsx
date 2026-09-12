'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Swords,
  LogIn,
  Trophy,
  Zap,
  Flame,
  Target,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Container } from '@/components/ui/container'
import { CreateDuelModal } from '@/components/duel/CreateDuelModal'
import { JoinDuelModal } from '@/components/duel/JoinDuelModal'
import { DailyStreakBadge } from '@/components/student/DailyStreakBadge'
import { MistakeNotebookBadge } from '@/components/student/MistakeNotebookBadge'
import { StudentProfileBadge } from '@/components/StudentProfileBadge'
import { StudentBadge } from '@/components/student/StudentBadge'
import { StudentJoinPopup } from '@/components/student/StudentJoinPopup'

export default function DuelHubPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)

  return (
    <div
      data-testid="duel-hub"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground pb-20"
    >
      {/* Top HUD Bar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Back to Home & Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <ArrowLeft className="size-4" />
              <span>← Về trang chủ</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 text-sm font-black text-rose-600 dark:text-rose-400">
              <Swords className="size-4" />
              <span>GameHub PvP Arena</span>
            </div>
          </div>

          {/* Right actions: Leaderboard & Student badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-xs hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Trophy className="size-3.5 sm:size-4 text-amber-500" />
              <span>🏆 Xem bảng xếp hạng</span>
            </Link>
            <DailyStreakBadge />
            <MistakeNotebookBadge />
            <StudentProfileBadge />
            <StudentBadge />
          </div>
        </div>
      </header>

      <Container>
        <main className="max-w-4xl mx-auto pt-8 sm:pt-12">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-rose-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-rose-900/40 text-center mb-8">
            <div className="absolute -top-24 -right-24 size-60 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 size-60 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs sm:text-sm font-black uppercase tracking-wider">
                <Sparkles className="size-3.5 text-rose-400" />
                <span>1v1 Realtime PvP Arena</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                ⚔️ Đấu trường 1v1 - Thách đấu Tiếng Anh
              </h1>

              <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Tranh tài đối kháng trực tiếp cùng bạn bè trong lớp! Trả lời nhanh hơn, chính xác hơn để tích lũy điểm số và ghi tên trên bảng vàng.
              </p>

              {/* Quick perks */}
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 pt-2 text-xs sm:text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/10">
                  <Target className="size-3.5 text-emerald-400" /> +100 điểm cơ bản
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/10">
                  <Zap className="size-3.5 text-amber-400" /> Tối đa +100 điểm tốc độ
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/10">
                  <Flame className="size-3.5 text-rose-400" /> Điểm thưởng chuỗi đúng
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-8">
            {/* Card 1: Create Duel */}
            <div className="group relative rounded-3xl bg-card border border-border/80 shadow-md hover:shadow-xl transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 size-32 bg-linear-to-bl from-rose-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center justify-center size-14 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 mb-4 group-hover:scale-110 transition-transform">
                  <Swords className="size-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground mb-2">
                  Tạo phòng thách đấu
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                  Tự tạo trận đấu mới, chọn chủ đề và độ dài câu hỏi, sau đó chia sẻ mã phòng cho bạn cùng lớp để vào so tài ngay.
                </p>
              </div>
              <button
                type="button"
                data-testid="open-create-modal"
                onClick={() => setIsCreateOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-linear-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black text-base shadow-md shadow-rose-600/30 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400"
              >
                <Swords className="size-5" />
                <span>Tạo phòng thách đấu</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>

            {/* Card 2: Join Duel */}
            <div className="group relative rounded-3xl bg-card border border-border/80 shadow-md hover:shadow-xl transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 size-32 bg-linear-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center justify-center size-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 mb-4 group-hover:scale-110 transition-transform">
                  <LogIn className="size-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground mb-2">
                  Tham gia bằng mã
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                  Bạn đã có mã 6 ký tự từ bạn bè? Nhập mã phòng và tên của bạn để bước vào sàn đấu đối đầu ngay lập tức!
                </p>
              </div>
              <button
                type="button"
                data-testid="open-join-modal"
                onClick={() => setIsJoinOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-base shadow-md shadow-indigo-600/30 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400"
              >
                <LogIn className="size-5" />
                <span>Tham gia bằng mã</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          {/* Quick Info & Scoring Rules */}
          <section
            aria-label="Quy tắc tính điểm thi đấu"
            className="rounded-3xl bg-card border border-border p-6 sm:p-7 shadow-xs mb-8"
          >
            <h3 className="text-lg sm:text-xl font-black text-foreground mb-4 flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-500" />
              <span>Quy tắc tính điểm &amp; Bí quyết chiến thắng</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm mb-1">
                  <Target className="size-4" />
                  <span>Điểm chính xác</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-foreground mb-1">+100</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mỗi câu trả lời đúng được cộng 100 điểm nền móng.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm mb-1">
                  <Zap className="size-4" />
                  <span>Thưởng tốc độ</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-foreground mb-1">Tới +100</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Trả lời ngay giây đầu tiên nhận trọn 100 điểm thưởng tốc độ.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-1">
                  <Flame className="size-4" />
                  <span>Thưởng chuỗi đúng</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-foreground mb-1">+20/chuỗi</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Duy trì chuỗi đúng liên tiếp để nhân thêm điểm thưởng ngoạn mục.
                </p>
              </div>
            </div>
          </section>

          {/* Link to Leaderboards */}
          <div className="text-center py-4">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              <span>🏆 Xem Bảng Xếp Hạng Cao Thủ Toàn Trường</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </main>
      </Container>

      {/* Modals */}
      <CreateDuelModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <JoinDuelModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />

      <StudentJoinPopup />
    </div>
  )
}
