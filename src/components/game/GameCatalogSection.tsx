"use client";

import React, { useState, useMemo } from "react";
import { Search, X, RotateCcw } from "lucide-react";
import { Game, GameCategory } from "@/types";
import { GameCard } from "@/components/custom/GameCard";
import { cn } from "@/lib/utils";

export const CATALOG_CATEGORIES: { id: "all" | GameCategory; label: string; emoji: string }[] = [
  { id: "all", label: "Tất cả", emoji: "🌟" },
  { id: "vocab", label: "Từ vựng", emoji: "📚" },
  { id: "phonics-audio", label: "Phát âm & Nghe", emoji: "🎧" },
  { id: "grammar-sentence", label: "Ngữ pháp & Đặt câu", emoji: "✍️" },
  { id: "arcade-quiz", label: "Giải đố Arcade", emoji: "🎮" },
  { id: "roleplay-reading", label: "Đọc & Hội thoại", emoji: "📖" },
];

export interface GameCatalogSectionProps {
  games: Game[];
}

export function GameCatalogSection({ games }: GameCatalogSectionProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | GameCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: games.length,
    };
    for (const cat of CATALOG_CATEGORIES) {
      if (cat.id !== "all") {
        counts[cat.id] = games.filter((g) => g.category === cat.id).length;
      }
    }
    return counts;
  }, [games]);

  const filteredGames = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return games.filter((game) => {
      // Category filter
      if (activeCategory !== "all" && game.category !== activeCategory) {
        return false;
      }

      // Search query filter
      if (normalizedQuery) {
        const matchTitleVi = game.titleVi?.toLowerCase().includes(normalizedQuery);
        const matchTitleEn = game.titleEn?.toLowerCase().includes(normalizedQuery);
        const matchDescription = game.description?.toLowerCase().includes(normalizedQuery);
        const matchSlug = game.slug?.toLowerCase().includes(normalizedQuery);

        return Boolean(matchTitleVi || matchTitleEn || matchDescription || matchSlug);
      }

      return true;
    });
  }, [games, activeCategory, searchQuery]);

  const handleResetFilter = () => {
    setActiveCategory("all");
    setSearchQuery("");
  };

  if (games.length === 0) {
    return (
      <main aria-label="Danh sách trò chơi">
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
      </main>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div
          role="tablist"
          aria-label="Phân loại trò chơi"
          className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none"
        >
          {CATALOG_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                role="tab"
                id={`tab-${cat.id}`}
                aria-selected={isSelected}
                aria-controls="game-catalog-main"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20 scale-[1.02]"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-accent/60 border-border/80"
                )}
              >
                <span aria-hidden="true">{cat.emoji}</span>
                <span>{cat.label}</span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-black",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search
            className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm trò chơi (ví dụ: flashcard, nghe hiểu...)..."
            aria-label="Tìm kiếm trò chơi"
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-card border border-border/80 text-foreground placeholder:text-muted-foreground text-xs sm:text-sm font-medium shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
              aria-label="Xóa tìm kiếm"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Counter and Active Filter Info */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-muted-foreground px-1">
        <span>
          Hiển thị <strong className="text-foreground">{filteredGames.length}</strong> / {games.length} trò chơi
        </span>
        {filteredGames.length > 0 && (activeCategory !== "all" || searchQuery.trim() !== "") && (
          <button
            type="button"
            onClick={handleResetFilter}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>

      {/* Main Content Area: Grid or Search Empty State */}
      {filteredGames.length === 0 ? (
        <main
          id="game-catalog-main"
          aria-label="Danh sách trò chơi"
          className="text-center py-16 px-4 bg-card rounded-3xl border-2 border-dashed border-border/80 max-w-md mx-auto"
        >
          <span className="text-5xl mb-4 block" aria-hidden="true">
            🎈
          </span>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Không tìm thấy trò chơi nào
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Không có trò chơi nào phù hợp với từ khóa &quot;{searchQuery}&quot;. Bé hãy thử tìm bằng từ khóa khác hoặc đặt lại bộ lọc nhé!
          </p>
          <button
            type="button"
            onClick={handleResetFilter}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="size-4" />
            <span>Xóa bộ lọc</span>
          </button>
        </main>
      ) : (
        <main
          id="game-catalog-main"
          aria-label="Danh sách trò chơi"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
        >
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </main>
      )}
    </div>
  );
}
