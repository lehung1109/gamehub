import Link from "next/link";
import { Game } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface GameCardProps {
  game: Game;
  className?: string;
}

export function GameCard({ game, className }: GameCardProps) {
  return (
    <Link
      href={game.route}
      className={cn(
        "group block rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform",
        className
      )}
    >
      <Card className="relative h-full border-2 border-border/80 rounded-3xl bg-card transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/50 active:translate-y-0 active:scale-[0.98] cursor-pointer overflow-hidden p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-sky-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl select-none transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-active:scale-95 shadow-xs"
              aria-hidden="true"
            >
              {game.emoji}
            </div>
            <Badge
              variant="secondary"
              className="font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 shadow-xs"
            >
              {game.titleEn}
            </Badge>
          </div>

          <CardHeader className="p-0 gap-1.5 mb-2">
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {game.titleVi}
            </h2>
            <CardDescription className="text-sm md:text-base font-medium text-muted-foreground leading-relaxed line-clamp-2 xl:line-clamp-none">
              {game.description}
            </CardDescription>
          </CardHeader>
        </div>

        <CardContent className="p-0 pt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-extrabold border border-emerald-200 dark:border-emerald-800 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-200 shadow-xs">
            <span>Chơi ngay</span>
            <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">➔</span>
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
