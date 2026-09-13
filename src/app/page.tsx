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
        {/* Top bar with Voice Switcher, Navigation links, Daily streak badge, Mistake notebook badge, Student profile badge, and Student badge */}
        <div className="flex flex-wrap justify-end items-center gap-2 mb-2">
          <QuickVoiceSwitcher />
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-xs hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Bản đồ lộ trình học tập"
          >
            <span>🗺️</span>
            <span>Lộ trình học</span>
          </Link>
          <Link
            href="/duel"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 shadow-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            title="Đấu trường 1v1 PvP"
          >
            <span>⚔️</span>
            <span>Đấu trường 1v1</span>
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-xs hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Bảng xếp hạng vinh danh"
          >
            <span>🏆</span>
            <span>Bảng xếp hạng</span>
          </Link>
          <Link
            href="/speaking"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-xs hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Luyện nói cùng Gia sư AI Sunny"
            data-testid="speaking-topbar-link"
          >
            <span>🎙️ Luyện nói AI</span>
          </Link>
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 shadow-xs hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Truyện tranh tương tác & Lồng tiếng"
            data-testid="stories-topbar-link"
          >
            <span>📖 Truyện tranh</span>
          </Link>
          <Link
            href="/chants"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-purple-950 dark:text-purple-200 bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 shadow-xs hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            title="Karaoke & Vè Phonics"
            data-testid="chants-topbar-link"
          >
            <span>🎵 Karaoke Vè</span>
          </Link>
          <Link
            href="/guilds"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-xs hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Bang hội học tập & Săn Boss"
            data-testid="guilds-topbar-link"
          >
            <span>🛡️ Bang hội</span>
          </Link>
          <Link
            href="/passport"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 shadow-xs hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="Hộ chiếu năng lực & Lễ tốt nghiệp"
            data-testid="passport-topbar-link"
          >
            <span>🎓 Hộ chiếu</span>
          </Link>
          <Link
            href="/games/voice-arcade"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-pink-950 dark:text-pink-200 bg-pink-100 dark:bg-pink-950/60 border border-pink-300 dark:border-pink-800 shadow-xs hover:bg-pink-200 dark:hover:bg-pink-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
            title="Khu trò chơi điều khiển bằng giọng nói"
            data-testid="voice-arcade-topbar-link"
          >
            <span>🕹️ Voice Arcade</span>
          </Link>
          <Link
            href="/spelling-bee"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-xs hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Đấu trường đánh vần Spelling Bee"
            data-testid="spelling-bee-topbar-link"
          >
            <span>🐝 Spelling Bee</span>
          </Link>
          <Link
            href="/cinema"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-xs hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Rạp chiếu phim hoạt hình Phonics tương tác"
            data-testid="cinema-topbar-link"
          >
            <span>🍿 Rạp Phim</span>
          </Link>
          <Link
            href="/escape-room"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shadow-xs hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Phòng thoát hiểm bí mật & Thám tử ngữ âm"
            data-testid="escape-room-topbar-link"
          >
            <span>🔍 Thoát Hiểm</span>
          </Link>
          <DailyStreakBadge />
          <MistakeNotebookBadge />
          <StudentProfileBadge />
          <StudentBadge />
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-card border border-border shadow-xs hover:bg-accent hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Đăng nhập dành cho giáo viên"
          >
            <LogIn className="size-3.5 sm:size-4" aria-hidden="true" />
            <span>Đăng nhập</span>
          </Link>
        </div>

        {/* Header Hero */}
        <header className="text-center py-4 sm:py-8 mb-6">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-black text-sm uppercase tracking-wider mb-4 animate-bounce motion-reduce:animate-none">
            <span>🎉 Học mà chơi, chơi mà học!</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground mb-4">
            🌟 <span className="text-emerald-700 dark:text-emerald-400">GameHub</span> Tiếng Anh 🎮
          </h1>

          <p className="text-base sm:text-xl font-medium text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            Cùng học từ vựng, chữ cái, số đếm và câu tiếng Anh thật vui với {games.length} trò chơi tương tác sinh động!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 my-6">
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base sm:text-lg shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400"
              title="Khám phá bản đồ lộ trình học tập"
            >
              <span className="text-xl">🗺️</span>
              <span>Bản đồ học tập (Lộ trình)</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/duel"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-linear-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black text-base sm:text-lg shadow-lg shadow-rose-600/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400"
              title="Thách đấu tiếng Anh 1v1"
            >
              <span className="text-xl">⚔️</span>
              <span>Đấu trường 1v1</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white font-black text-base sm:text-lg shadow-lg shadow-amber-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400"
              title="Bảng xếp hạng vinh danh"
            >
              <span className="text-xl">🏆</span>
              <span>Bảng xếp hạng</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-muted-foreground">
            <span className="bg-card px-3 py-1.5 rounded-full border shadow-xs">
              🛡️ Không cần đăng nhập
            </span>
            <span className="bg-card px-3 py-1.5 rounded-full border shadow-xs">
              🔊 Phát âm tiếng Anh chuẩn
            </span>
            <span className="bg-card px-3 py-1.5 rounded-full border shadow-xs">
              ⭐ Dành cho lớp 1-2
            </span>
          </div>
        </header>

        {/* Realtime 1v1 PvP Duel Arena Feature Banner */}
        <section aria-label="Đấu trường 1v1 Realtime PvP" className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-rose-950 via-red-900 to-amber-950 text-white p-6 sm:p-7 shadow-md border border-rose-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="absolute -right-12 -top-12 size-40 rounded-full bg-rose-500/20 blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-bold uppercase tracking-wider">
                <span>🔥 Tính năng mới: Realtime PvP</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                ⚔️ Đấu Trường 1v1 - Thách Đấu Tiếng Anh Trực Tiếp!
              </h2>
              <p className="text-xs sm:text-sm text-rose-100/90 max-w-xl">
                Tạo phòng đấu hoặc tham gia bằng mã số, so tài từ vựng theo thời gian thực và leo bảng xếp hạng cùng bạn bè.
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <Link
                href="/duel"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-rose-950 hover:bg-rose-50 font-black text-sm sm:text-base shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Vào Đấu trường 1v1"
              >
                <span>Tham Gia Đấu Trường</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Advanced / Workplace Learning Modules & AI Speaking Hub */}
        <section aria-label="Chương trình nâng cao & Luyện nói AI" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* AI Speaking Hub CTA */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 sm:p-7 shadow-md border border-amber-500/50 flex flex-col justify-between">
              <div className="absolute -right-12 -top-12 size-40 rounded-full bg-yellow-400/20 blur-2xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 size-40 rounded-full bg-red-500/20 blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/40 text-amber-100 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                  <span>🎙️ Gia sư AI Sunny</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Luyện Nói Tương Tác Cùng AI
                </h2>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed mb-4">
                  Thực hành giao tiếp 2 chiều theo tình huống thực tế A1-B2. Chấm điểm phát âm chuẩn xác và sửa lỗi tức thì.
                </p>
              </div>

              <div className="relative z-10 pt-2">
                <Link
                  href="/speaking"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-amber-950 hover:bg-amber-50 font-black text-sm shadow-sm transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Khám phá Hub Luyện Nói AI"
                  data-testid="speaking-cta-button"
                >
                  <span>🎙️ Luyện nói AI</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            {/* Workplace Tenses */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 shadow-md border border-indigo-700/50 flex flex-col justify-between">
              <div className="absolute -right-12 -top-12 size-40 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 size-40 rounded-full bg-sky-500/20 blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider">
                  <span>💼 Ngữ pháp công sở</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Luyện Thì Tiếng Anh Cho Người Đi Làm
                </h2>
                <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed mb-4">
                  Khám phá bản đồ 12 thì thực chiến: chia động từ email, săn lỗi sai văn phòng và ghép câu lịch trình chuẩn xác.
                </p>
              </div>

              <div className="relative z-10 pt-2">
                <Link
                  href="/tenses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-black text-sm shadow-sm transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Khám phá Hub 12 Thì Tiếng Anh Cho Người Đi Làm"
                >
                  <span>Khám phá Hub 12 Thì</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Workplace Parts of Speech */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-violet-900 via-purple-900 to-slate-900 text-white p-6 sm:p-7 shadow-md border border-purple-700/50 flex flex-col justify-between">
              <div className="absolute -right-12 -top-12 size-40 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 size-40 rounded-full bg-pink-500/20 blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 text-xs font-bold uppercase tracking-wider">
                  <span>📝 Từ loại thực chiến</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Luyện Từ Loại Tiếng Anh (Parts of Speech)
                </h2>
                <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed mb-4">
                  Nắm vững vị trí Noun, Verb, Adjective, Adverb trong báo cáo, email và hợp đồng thương mại không bị nhầm lẫn.
                </p>
              </div>

              <div className="relative z-10 pt-2">
                <Link
                  href="/parts-of-speech"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-purple-950 hover:bg-purple-50 font-black text-sm shadow-sm transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
