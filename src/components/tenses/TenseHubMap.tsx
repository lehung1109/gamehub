"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Award, Sparkles } from "lucide-react";
import { TenseMetadata, TensesProgressMap, TenseGroup } from "@/types/tenses";
import { TenseCard } from "@/components/tenses/TenseCard";
import { getAllProgress } from "@/lib/tenses/storage";

export interface TenseHubMapProps {
  tenses: TenseMetadata[];
}

interface GroupConfig {
  key: TenseGroup;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  badgeColor: string;
}

const TENSE_GROUPS: GroupConfig[] = [
  {
    key: "present",
    titleVi: "Hiện Tại",
    titleEn: "Present Tenses",
    descriptionVi: "Thói quen, sự thật hiển nhiên, lịch trình và báo cáo tiến độ công việc hàng ngày.",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  {
    key: "past",
    titleVi: "Quá Khứ",
    titleEn: "Past Tenses",
    descriptionVi: "Báo cáo sự kiện đã diễn ra, tổng kết dự án và kinh nghiệm làm việc đã tích luỹ.",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  {
    key: "future",
    titleVi: "Tương Lai",
    titleEn: "Future Tenses",
    descriptionVi: "Đưa ra lời hứa hẹn, dự toán kế hoạch và cam kết deadline hoàn thành mục tiêu.",
    badgeColor: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  },
];

const emptySubscribe = () => () => {};

export function TenseHubMap({ tenses }: TenseHubMapProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const progressMap: TensesProgressMap = isClient ? getAllProgress() : {};

  // Calculate statistics across 12 tenses
  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;

  return (
    <div className="flex-1 flex flex-col justify-between py-2 sm:py-6 max-w-7xl mx-auto w-full px-3 sm:px-6">
      <div>
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-card border border-border shadow-xs hover:bg-accent hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <ArrowLeft className="size-3.5 sm:size-4" aria-hidden="true" />
            <span>Về trang chủ</span>
          </Link>

          {isClient && completedCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
              <Award className="size-3.5" aria-hidden="true" />
              <span>Đã hoàn thành {completedCount}/12 thì</span>
            </div>
          )}
        </div>

        {/* Header Hero */}
        <header className="text-center py-4 sm:py-8 mb-8">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 font-black text-xs sm:text-sm uppercase tracking-wider mb-4">
            <Sparkles className="size-4" aria-hidden="true" />
            <span>Chuyên đề ngữ pháp công sở</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mb-4">
            🧭 Bản Đồ <span className="text-indigo-600 dark:text-indigo-400">12 Thì Tiếng Anh</span> 💼
          </h1>

          <p className="text-base sm:text-lg font-medium text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            Hệ thống hóa toàn diện 12 thì tiếng Anh ứng dụng trực tiếp trong email, giao tiếp và báo cáo công việc hằng ngày.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-muted-foreground">
            <span className="bg-card px-3 py-1.5 rounded-full border shadow-xs flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-indigo-500" aria-hidden="true" />
              Ví dụ thực tế công sở
            </span>
            <span className="bg-card px-3 py-1.5 rounded-full border shadow-xs flex items-center gap-1.5">
              <Clock className="size-3.5 text-emerald-500" aria-hidden="true" />
              10-15 phút/bài học
            </span>
            <span className="bg-card px-3 py-1.5 rounded-full border shadow-xs flex items-center gap-1.5">
              <Award className="size-3.5 text-amber-500" aria-hidden="true" />
              3 Chặng thử thách tương tác
            </span>
          </div>
        </header>

        {/* 12-Tenses Map Sections */}
        <div className="space-y-12 mb-12">
          {TENSE_GROUPS.map((group) => {
            const groupTenses = tenses.filter((t) => t.group === group.key);

            return (
              <section
                key={group.key}
                aria-labelledby={`group-heading-${group.key}`}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border/80 pb-3 flex-wrap gap-2">
                  <div>
                    <h2
                      id={`group-heading-${group.key}`}
                      className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2"
                    >
                      <span>{group.titleVi}</span>
                      <span className="text-sm sm:text-base font-normal text-muted-foreground">
                        ({group.titleEn})
                      </span>
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {group.descriptionVi}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {groupTenses.map((tense) => (
                    <TenseCard
                      key={tense.id}
                      tense={tense}
                      progress={isClient ? progressMap[tense.id] : null}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 mt-8 text-xs sm:text-sm font-medium text-muted-foreground border-t border-border/50">
        <p>💼 Workplace English Tense Practice — Nâng tầm tiếng Anh công sở chuyên nghiệp</p>
      </footer>
    </div>
  );
}
