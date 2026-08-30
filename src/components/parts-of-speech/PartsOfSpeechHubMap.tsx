"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Award, Sparkles } from "lucide-react";
import { PartsOfSpeechMetadata, PartsOfSpeechProgressMap } from "@/types/parts-of-speech";
import { PartsOfSpeechCard } from "./PartsOfSpeechCard";
import { getAllProgress } from "@/lib/parts-of-speech-storage";

export interface PartsOfSpeechHubMapProps {
  lessons: PartsOfSpeechMetadata[];
}

const emptySubscribe = () => () => {};

export function PartsOfSpeechHubMap({ lessons }: PartsOfSpeechHubMapProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const progressMap: PartsOfSpeechProgressMap = isClient ? getAllProgress() : {};
  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;

  return (
    <div className="flex-1 flex flex-col justify-between py-2 sm:py-6 max-w-7xl mx-auto w-full px-3 sm:px-6">
      <div>
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-card border border-border shadow-xs hover:bg-accent hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <ArrowLeft className="size-3.5 sm:size-4" aria-hidden="true" />
            <span>Về trang chủ</span>
          </Link>

          {isClient && completedCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
              <Award className="size-3.5" aria-hidden="true" />
              <span>Đã hoàn thành {completedCount}/{lessons.length} từ loại</span>
            </div>
          )}
        </div>

        {/* Header Hero */}
        <header className="text-center py-4 sm:py-8 mb-8">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-black text-xs sm:text-sm uppercase tracking-wider mb-4">
            <Sparkles className="size-4" aria-hidden="true" />
            <span>Chuyên đề ngữ pháp công sở</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            🧩 Parts of Speech <span className="text-emerald-600 dark:text-emerald-400">Practice</span> 💼
          </h1>

          <p className="text-base sm:text-lg font-medium text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            Nắm vững từ loại tiếng Anh giúp bạn viết email, lập báo cáo và giao tiếp công sở một cách chính xác, chuyên nghiệp.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-muted-foreground">
            <span className="bg-card px-3 py-1.5 rounded-full border shadow-xs flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-emerald-500" aria-hidden="true" />
              Ngữ cảnh công sở
            </span>
            <span className="bg-card px-3 py-1.5 rounded-full border shadow-xs flex items-center gap-1.5">
              <Clock className="size-3.5 text-teal-500" aria-hidden="true" />
              10 phút/bài học
            </span>
            <span className="bg-card px-3 py-1.5 rounded-full border shadow-xs flex items-center gap-1.5">
              <Award className="size-3.5 text-amber-500" aria-hidden="true" />
              3 Chặng thử thách
            </span>
          </div>
        </header>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {lessons.map((lesson) => (
            <PartsOfSpeechCard
              key={lesson.id}
              lesson={lesson}
              progress={isClient ? progressMap[lesson.id] : null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
