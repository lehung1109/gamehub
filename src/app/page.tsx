import Link from "next/link";
import { LogIn } from "lucide-react";
import gamesData from "@/data/games.json";
import { Game } from "@/types";
import { GameCatalogSection } from "@/components/game/GameCatalogSection";
import { DailyStreakBadge } from "@/components/student/DailyStreakBadge";
import { MistakeNotebookBadge } from "@/components/student/MistakeNotebookBadge";
import { StudentProfileBadge } from "@/components/StudentProfileBadge";
import { StudentBadge } from "@/components/student/StudentBadge";
import { StudentJoinPopup } from "@/components/student/StudentJoinPopup";
import { QuickVoiceSwitcher } from "@/components/speech/QuickVoiceSwitcher";

import { Container } from "@/components/ui/container";

export interface HomePageProps {
  gamesOverride?: Game[];
}

export default function HomePage({ gamesOverride }: HomePageProps = {}) {
  const games: Game[] = [...(gamesOverride ?? (gamesData as Game[]))].sort(
    (a, b) => a.priority - b.priority
  );

  return (
    <Container>
      <div className="flex-1 flex flex-col justify-between">
        <div>
        {/* Tier 1: Utility & Brand Header */}
        <header className="py-2.5 mb-3 border-b border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Brand Logo & Tagline */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
                title="Trang chủ GameHub Tiếng Anh"
              >
                <span className="text-2xl sm:text-3xl transition-transform duration-200 group-hover:scale-110 select-none">
                  🎮
                </span>
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg font-black tracking-tight text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                    GameHub
                  </span>
                  <span className="text-xs font-bold text-muted-foreground leading-none">
                    Tiếng Anh Cho Bé
                  </span>
                </div>
              </Link>
            </div>

            {/* User Badges, Voice Switcher, and Login */}
            <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
              <QuickVoiceSwitcher />
              <DailyStreakBadge />
              <MistakeNotebookBadge />
              <StudentProfileBadge />
              <StudentBadge />
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-card border border-border/80 shadow-2xs hover:bg-accent hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                title="Đăng nhập dành cho giáo viên"
              >
                <LogIn className="size-3.5 sm:size-4" aria-hidden="true" />
                <span>Đăng nhập</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Tier 2: Mini-Worlds & Adventure Hubs Navigation Bar */}
        <nav
          aria-label="Khám phá các thế giới học tập"
          className="relative mb-6 rounded-2xl bg-card/60 backdrop-blur-xs border border-border/70 p-2 shadow-2xs"
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-800 shadow-2xs hover:bg-amber-100 dark:hover:bg-amber-900/60 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Bản đồ lộ trình học tập"
            >
              <span>🗺️</span>
              <span>Lộ trình học</span>
            </Link>
            <Link
              href="/duel"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/60 border border-rose-300/80 dark:border-rose-800 shadow-2xs hover:bg-rose-100 dark:hover:bg-rose-900/60 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              title="Đấu trường 1v1 PvP"
            >
              <span>⚔️</span>
              <span>Đấu trường 1v1</span>
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-800 shadow-2xs hover:bg-amber-100 dark:hover:bg-amber-900/60 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Bảng xếp hạng vinh danh"
            >
              <span>🏆</span>
              <span>Bảng xếp hạng</span>
            </Link>
            <Link
              href="/speaking"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-2xs hover:bg-amber-200 dark:hover:bg-amber-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Luyện nói cùng Gia sư AI Sunny"
              data-testid="speaking-topbar-link"
            >
              <span>🎙️ Luyện nói AI</span>
            </Link>
            <Link
              href="/stories"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 shadow-2xs hover:bg-indigo-200 dark:hover:bg-indigo-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Truyện tranh tương tác & Lồng tiếng"
              data-testid="stories-topbar-link"
            >
              <span>📖 Truyện tranh</span>
            </Link>
            <Link
              href="/chants"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-purple-950 dark:text-purple-200 bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 shadow-2xs hover:bg-purple-200 dark:hover:bg-purple-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              title="Karaoke & Vè Phonics"
              data-testid="chants-topbar-link"
            >
              <span>🎵 Karaoke Vè</span>
            </Link>
            <Link
              href="/guilds"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-2xs hover:bg-amber-200 dark:hover:bg-amber-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Bang hội học tập & Săn Boss"
              data-testid="guilds-topbar-link"
            >
              <span>🛡️ Bang hội</span>
            </Link>
            <Link
              href="/passport"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 shadow-2xs hover:bg-emerald-200 dark:hover:bg-emerald-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              title="Hộ chiếu năng lực & Lễ tốt nghiệp"
              data-testid="passport-topbar-link"
            >
              <span>🎓 Hộ chiếu</span>
            </Link>
            <Link
              href="/games/voice-arcade"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-pink-950 dark:text-pink-200 bg-pink-100 dark:bg-pink-950/60 border border-pink-300 dark:border-pink-800 shadow-2xs hover:bg-pink-200 dark:hover:bg-pink-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
              title="Khu trò chơi điều khiển bằng giọng nói"
              data-testid="voice-arcade-topbar-link"
            >
              <span>🕹️ Voice Arcade</span>
            </Link>
            <Link
              href="/spelling-bee"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-2xs hover:bg-amber-200 dark:hover:bg-amber-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Đấu trường đánh vần Spelling Bee"
              data-testid="spelling-bee-topbar-link"
            >
              <span>🐝 Spelling Bee</span>
            </Link>
            <Link
              href="/cinema"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-2xs hover:bg-amber-200 dark:hover:bg-amber-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Rạp chiếu phim hoạt hình Phonics tương tác"
              data-testid="cinema-topbar-link"
            >
              <span>🍿 Rạp Phim</span>
            </Link>
            <Link
              href="/escape-room"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-2xs hover:bg-amber-200 dark:hover:bg-amber-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Phòng thoát hiểm bí mật & Thám tử ngữ âm"
              data-testid="escape-room-topbar-link"
            >
              <span>🔍 Thoát Hiểm</span>
            </Link>
            <Link
              href="/town"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-2xs hover:bg-amber-200 dark:hover:bg-amber-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Thành phố ngữ âm & Xây dựng thế giới"
              data-testid="town-topbar-link"
            >
              <span>🏙️ Thành Phố</span>
            </Link>
            <Link
              href="/safari"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-2xs hover:bg-amber-200 dark:hover:bg-amber-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Thám hiểm Safari ngữ âm & Bách khoa động vật"
              data-testid="safari-topbar-link"
            >
              <span>🦁 Safari</span>
            </Link>
            <Link
              href="/kitchen"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-2xs hover:bg-amber-200 dark:hover:bg-amber-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Bếp trưởng nhí & Học viện nấu ăn ngữ âm"
              data-testid="kitchen-topbar-link"
            >
              <span>🍳 Nhà Bếp</span>
            </Link>
            <Link
              href="/space"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-2xs hover:bg-amber-200 dark:hover:bg-amber-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              title="Thám hiểm vũ trụ & Khám phá hành tinh ngữ âm"
              data-testid="space-topbar-link"
            >
              <span>🚀 Vũ Trụ</span>
            </Link>
            <Link
              href="/ocean"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-cyan-950 dark:text-cyan-200 bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800 shadow-2xs hover:bg-cyan-200 dark:hover:bg-cyan-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              title="Thám hiểm đại dương & Tàu ngầm ngữ âm"
              data-testid="ocean-topbar-link"
            >
              <span>🐬 Đại Dương</span>
            </Link>
            <Link
              href="/magic"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-purple-950 dark:text-purple-200 bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 shadow-2xs hover:bg-purple-200 dark:hover:bg-purple-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              title="Học viện phép thuật & Thần chú ngữ âm"
              data-testid="magic-topbar-link"
            >
              <span>🧙‍♂️ Phép Thuật</span>
            </Link>
            <Link
              href="/dino"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 shadow-2xs hover:bg-emerald-200 dark:hover:bg-emerald-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              title="Vương quốc khủng long & Khảo cổ tiền sử"
              data-testid="dino-topbar-link"
            >
              <span>🦖 Khủng Long</span>
            </Link>
            <Link
              href="/timetravel"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-purple-950 dark:text-purple-200 bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 shadow-2xs hover:bg-purple-200 dark:hover:bg-purple-900 hover:scale-105 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              title="Cỗ máy thời gian & Cuộc du hành lịch sử"
              data-testid="timetravel-topbar-link"
            >
              <span>⏳ Thời Gian</span>
            </Link>
          </div>
        </nav>

        {/* Header Hero */}
        <header className="relative text-center py-6 sm:py-10 mb-8 rounded-3xl bg-linear-to-b from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/15 p-4 sm:p-8 overflow-hidden shadow-2xs">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 size-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-black text-xs sm:text-sm uppercase tracking-wider mb-4 animate-bounce motion-reduce:animate-none shadow-2xs">
            <span>🎉 Học mà chơi, chơi mà học!</span>
          </div>

          <h1 className="relative z-10 text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground mb-4">
            🌟 <span className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400">GameHub</span> Tiếng Anh 🎮
          </h1>

          <p className="relative z-10 text-base sm:text-xl font-medium text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            Cùng học từ vựng, chữ cái, số đếm và câu tiếng Anh thật vui với {games.length} trò chơi tương tác sinh động!
          </p>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 my-6">
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base sm:text-lg shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400"
              title="Khám phá bản đồ lộ trình học tập"
            >
              <span className="text-xl">🗺️</span>
              <span>Bản đồ học tập (Lộ trình)</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/duel"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-linear-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black text-base sm:text-lg shadow-lg shadow-rose-600/30 hover:shadow-xl hover:shadow-rose-600/40 hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400"
              title="Thách đấu tiếng Anh 1v1"
            >
              <span className="text-xl">⚔️</span>
              <span>Đấu trường 1v1</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white font-black text-base sm:text-lg shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400"
              title="Bảng xếp hạng vinh danh"
            >
              <span className="text-xl">🏆</span>
              <span>Bảng xếp hạng</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-muted-foreground">
            <span className="bg-card/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-border/80 shadow-2xs">
              🛡️ Không cần đăng nhập
            </span>
            <span className="bg-card/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-border/80 shadow-2xs">
              🔊 Phát âm tiếng Anh chuẩn
            </span>
            <span className="bg-card/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-border/80 shadow-2xs">
              ⭐ Dành cho lớp 1-2
            </span>
          </div>
        </header>

        {/* Realtime 1v1 PvP Duel Arena Feature Banner */}
        <section aria-label="Đấu trường 1v1 Realtime PvP" className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-rose-950 via-red-900 to-amber-950 text-white p-6 sm:p-7 shadow-md border border-rose-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="absolute -right-12 -top-12 size-40 rounded-full bg-rose-500/20 blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-bold uppercase tracking-wider">
                <span>🔥 Tính năng mới: Realtime PvP</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                ⚔️ Đấu Trường 1v1 - Thách Đấu Tiếng Anh Trực Tiếp!
              </h2>
              <p className="text-xs sm:text-sm text-rose-100/90 max-w-xl leading-relaxed">
                Tạo phòng đấu hoặc tham gia bằng mã số, so tài từ vựng theo thời gian thực và leo bảng xếp hạng cùng bạn bè.
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <Link
                href="/duel"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-rose-950 hover:bg-rose-50 font-black text-sm sm:text-base shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                aria-label="Vào Đấu trường 1v1"
              >
                <span>Tham Gia Đấu Trường</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Advanced / Workplace Learning Modules & AI Speaking Hub */}
        <section aria-label="Chương trình nâng cao & Luyện nói AI" className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* AI Speaking Hub CTA */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-amber-600 via-orange-600 to-amber-700 text-white p-6 sm:p-7 shadow-md hover:shadow-xl hover:shadow-orange-500/10 border border-amber-400/40 flex flex-col justify-between transition-all duration-300">
              <div className="absolute -right-12 -top-12 size-40 rounded-full bg-yellow-400/20 blur-2xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 size-40 rounded-full bg-red-500/20 blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-amber-100 border border-white/20 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
                  <span>🎙️ Gia sư AI Sunny</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                  Luyện Nói Tương Tác Cùng AI
                </h2>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed mb-4 font-medium">
                  Thực hành giao tiếp 2 chiều theo tình huống thực tế A1-B2. Chấm điểm phát âm chuẩn xác và sửa lỗi tức thì.
                </p>
              </div>

              <div className="relative z-10 pt-3">
                <Link
                  href="/speaking"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-amber-950 hover:bg-amber-50 font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                  aria-label="Khám phá Hub Luyện Nói AI"
                  data-testid="speaking-cta-button"
                >
                  <span>🎙️ Luyện nói AI</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Workplace Tenses */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 border border-indigo-500/40 flex flex-col justify-between transition-all duration-300">
              <div className="absolute -right-12 -top-12 size-40 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 size-40 rounded-full bg-sky-500/20 blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 text-indigo-200 border border-white/20 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
                  <span>💼 Ngữ pháp công sở</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                  Luyện Thì Tiếng Anh Cho Người Đi Làm
                </h2>
                <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed mb-4 font-medium">
                  Khám phá bản đồ 12 thì thực chiến: chia động từ email, săn lỗi sai văn phòng và ghép câu lịch trình chuẩn xác.
                </p>
              </div>

              <div className="relative z-10 pt-3">
                <Link
                  href="/tenses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                  aria-label="Khám phá Hub 12 Thì Tiếng Anh Cho Người Đi Làm"
                >
                  <span>Khám phá Hub 12 Thì</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Workplace Parts of Speech */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-violet-900 via-purple-900 to-slate-900 text-white p-6 sm:p-7 shadow-md hover:shadow-xl hover:shadow-purple-500/10 border border-purple-500/40 flex flex-col justify-between transition-all duration-300">
              <div className="absolute -right-12 -top-12 size-40 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 size-40 rounded-full bg-pink-500/20 blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 text-purple-200 border border-white/20 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
                  <span>📝 Từ loại thực chiến</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                  Luyện Từ Loại Tiếng Anh (Parts of Speech)
                </h2>
                <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed mb-4 font-medium">
                  Nắm vững vị trí Noun, Verb, Adjective, Adverb trong báo cáo, email và hợp đồng thương mại không bị nhầm lẫn.
                </p>
              </div>

              <div className="relative z-10 pt-3">
                <Link
                  href="/parts-of-speech"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-purple-950 hover:bg-purple-50 font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                  aria-label="Khám phá Hub Từ Loại Tiếng Anh"
                >
                  <span>Khám phá Hub Từ Loại</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Game Catalog Section with Category Tabs and Search */}
        <GameCatalogSection games={games} />
        <StudentJoinPopup />
      </div>

      {/* Footer */}
      <footer className="text-center py-8 mt-12 text-sm font-medium text-muted-foreground border-t border-border/50">
        <p>🎈 GameHub Tiếng Anh cho bé — 100% An toàn &amp; Miễn phí</p>
      </footer>
      </div>
    </Container>
  );
}
