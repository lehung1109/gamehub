import Link from "next/link";
import { LogIn } from "lucide-react";
import gamesData from "@/data/games.json";
import { Game } from "@/types";
import { GameCard } from "@/components/custom/GameCard";

import { Container } from "@/components/ui/container";

export interface HomePageProps {
  gamesOverride?: Game[];
}

export default function HomePage({ gamesOverride }: HomePageProps = {}) {
  const games: Game[] = (gamesOverride ?? [...gamesData]).sort(
    (a, b) => a.priority - b.priority
  );

  return (
    <Container>
      <div className="flex-1 flex flex-col justify-between">
        <div>
        {/* Top bar with Login link for teachers/admins */}
        <div className="flex justify-end mb-2">
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
            Cùng học từ vựng, chữ cái, số đếm và câu tiếng Anh thật vui với 6 trò chơi tương tác sinh động!
          </p>

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

        {/* Workplace Tenses Feature Banner */}
        <section aria-label="Luyện Thì Tiếng Anh Cho Người Đi Làm" className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-indigo-700/50">
            {/* Background glowing shapes */}
            <div className="absolute -right-12 -top-12 size-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 size-48 rounded-full bg-sky-500/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider">
                  <span>💼 Dành cho người đi làm &amp; sinh viên</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
                  Luyện Thì Tiếng Anh Cho Người Đi Làm
                </h2>
                <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                  Khám phá bản đồ 12 thì thực chiến: chia động từ email, săn lỗi sai văn phòng và ghép câu lịch trình với Thì Hiện Tại Đơn.
                </p>
              </div>

              <div className="flex items-center">
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
          </div>
        </section>

        {/* Games Grid or Empty State */}
        <main aria-label="Danh sách trò chơi">
          {games.length === 0 ? (
            <div className="text-center py-16 px-4 bg-card rounded-3xl border-2 border-dashed border-border/80 max-w-md mx-auto">
              <span className="text-5xl mb-4 block" aria-hidden="true">
                🎈
              </span>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Chưa có trò chơi nào
              </h2>
              <p className="text-sm text-muted-foreground">
                Các trò chơi đang được cập nhật, bé hãy quay lại sau nhé!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 mt-12 text-sm font-medium text-muted-foreground border-t border-border/50">
        <p>🎈 GameHub Tiếng Anh cho bé — 100% An toàn &amp; Miễn phí</p>
      </footer>
      </div>
    </Container>
  );
}
