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
        "group block rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <Card className="h-full border-2 border-border/80 rounded-3xl bg-card transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-primary/50 active:translate-y-0 active:scale-[0.98] cursor-pointer overflow-hidden p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl select-none transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
              aria-hidden="true"
            >
              {game.emoji}
            </div>
            <Badge
              variant="secondary"
              className="font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200 border border-sky-200 dark:border-sky-800"
            >
              {game.titleEn}
            </Badge>
          </div>

          <CardHeader className="p-0 gap-1.5 mb-2">
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
              {game.titleVi}
            </h2>
            <CardDescription className="text-sm md:text-base font-medium text-muted-foreground leading-relaxed line-clamp-2">
              {game.description}
            </CardDescription>
          </CardHeader>
        </div>

        <CardContent className="p-0 pt-4 flex items-center justify-between">
          <span className="inline-flex items-center text-sm font-extrabold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
            Chơi ngay <span aria-hidden="true" className="ml-1">➔</span>
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
