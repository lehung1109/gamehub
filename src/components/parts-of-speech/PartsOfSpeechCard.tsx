import Link from "next/link";
import { Clock, CheckCircle2, ArrowRight, Lock, Award } from "lucide-react";
import { PartsOfSpeechMetadata, PartsOfSpeechProgressRecord } from "@/types/parts-of-speech";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export interface PartsOfSpeechCardProps {
  lesson: PartsOfSpeechMetadata;
  progress?: PartsOfSpeechProgressRecord | null;
}

export function PartsOfSpeechCard({ lesson, progress }: PartsOfSpeechCardProps) {
  const isActive = lesson.status === "active";
  const isCompleted = progress?.completed;
  const accuracy = progress?.accuracyPercentage ?? 0;

  if (!isActive) {
    return (
      <Card
        aria-disabled="true"
        className="opacity-75 bg-muted/40 border-dashed border-border/80 select-none relative overflow-hidden transition-all flex flex-col justify-between"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <Badge variant="secondary" className="text-xs font-semibold bg-muted text-muted-foreground gap-1">
              <Lock className="size-3" aria-hidden="true" />
              Coming Soon
            </Badge>
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold text-foreground/80">
            {lesson.vietnameseName}
          </CardTitle>
          <div className="text-xs font-semibold text-muted-foreground">
            {lesson.name}
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-2 xl:line-clamp-3 leading-relaxed">
            {lesson.description}
          </CardDescription>
        </CardContent>

        <CardFooter className="pt-0 border-t border-border/30 mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            <span>~{lesson.estimatedMinutes} phút</span>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden border-2 border-emerald-200/80 dark:border-emerald-900/60 hover:border-emerald-500 dark:hover:border-emerald-400 bg-card hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer">
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 pointer-events-none" />

      <CardHeader className="pb-3 pt-5">
        <CardTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {lesson.vietnameseName}
        </CardTitle>
        <div className="text-sm font-semibold text-muted-foreground">
          {lesson.name}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 xl:line-clamp-3 mb-3">
          {lesson.description}
        </CardDescription>

        {progress && (
          <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs relative z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              {isCompleted ? (
                <>
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  <span>Đã hoàn thành</span>
                </>
              ) : (
                <>
                  <Award className="size-4 text-emerald-500" aria-hidden="true" />
                  <span>Đang luyện tập</span>
                </>
              )}
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {accuracy}% chính xác
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {lesson.estimatedMinutes} phút
          </span>
        </div>

        <Link
          href={`/parts-of-speech/${lesson.slug}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors shadow-xs group-hover:translate-x-0.5 transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 after:absolute after:inset-0 after:content-[''] after:rounded-xl"
          aria-label={`Bắt đầu học ${lesson.vietnameseName}`}
        >
          <span>Vào học</span>
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
