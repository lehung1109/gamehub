// src/app/parent/page.tsx

import React from 'react'
import Link from 'next/link'
import { ParentAuthForm } from '@/components/parent/ParentAuthForm'
import { Sparkles, ArrowLeft, Heart, Shield, BookOpen, Trophy } from 'lucide-react'

export const metadata = {
  title: 'Cổng Thông Tin Phụ Huynh | GameHub',
  description: 'Theo dõi tiến trình học tập, chuỗi chuyên cần, điểm thưởng và kết nối cùng lớp học của bé.',
}

export default function ParentLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-background to-indigo-50/30 dark:from-slate-950 dark:via-background dark:to-slate-900 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Top bar navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold text-base transition-colors"
          >
            <ArrowLeft className="size-5" />
            <span>Về trang chủ GameHub</span>
          </Link>

          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold text-base border border-primary/20">
            <Heart className="size-5 fill-primary" />
            <span>Đồng hành cùng con</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 mb-2">
            <Sparkles className="size-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
            Cổng Thông Tin Phụ Huynh
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed">
            Theo dõi sự tiến bộ mỗi ngày của con, đón nhận những lời khen từ thầy cô và cùng bé duy trì niềm say mê học tiếng Anh.
          </p>
        </div>

        {/* Auth Card */}
        <ParentAuthForm />

        {/* Value Props / Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 max-w-3xl mx-auto">
          <div className="bg-card/60 backdrop-blur-sm border-2 border-border/80 rounded-2xl p-5 text-center space-y-2">
            <div className="size-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
              📊
            </div>
            <h2 className="text-lg font-bold text-foreground">Báo cáo học tập tuần</h2>
            <p className="text-base text-muted-foreground">
              Nắm bắt thời gian học, từ vựng mới và gợi ý hoạt động vui tại nhà.
            </p>
          </div>

          <div className="bg-card/60 backdrop-blur-sm border-2 border-border/80 rounded-2xl p-5 text-center space-y-2">
            <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto text-2xl">
              📢
            </div>
            <h2 className="text-lg font-bold text-foreground">Thông báo từ lớp học</h2>
            <p className="text-base text-muted-foreground">
              Nhận bài tập, lời nhắc nhở và xác nhận đã đọc chỉ với 1 chạm.
            </p>
          </div>

          <div className="bg-card/60 backdrop-blur-sm border-2 border-border/80 rounded-2xl p-5 text-center space-y-2">
            <div className="size-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto text-2xl">
              🏆
            </div>
            <h2 className="text-lg font-bold text-foreground">Bảng vàng chứng chỉ</h2>
            <p className="text-base text-muted-foreground">
              Tra cứu và lưu giữ những cột mốc thành tích đáng tự hào của bé.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
