import gamesData from "@/data/games.json";
import { Game } from "@/types";
import { GameCard } from "@/components/custom/GameCard";

export interface HomePageProps {
  gamesOverride?: Game[];
}

export default function HomePage({ gamesOverride }: HomePageProps = {}) {
  const games: Game[] = (gamesOverride ?? [...gamesData]).sort(
    (a, b) => a.priority - b.priority
  );

  return (
    <div className="flex-1 flex flex-col justify-between py-2 sm:py-6">
      <div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
}
