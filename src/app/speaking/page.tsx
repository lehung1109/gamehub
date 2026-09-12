'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/ui/container'
import { ScenarioCard } from '@/components/speaking/ScenarioCard'
import { PersonaSelector } from '@/components/speaking/PersonaSelector'
import { useStudentSession } from '@/hooks/use-student-session'
import { getStudentSpeakingStatsAction } from '@/app/actions/speaking'
import rawScenarios from '@/data/speaking/scenarios.json'
import type { SpeakingScenario, SpeakingPersona, CEFRLevel } from '@/types/speaking'
import {
  Sparkles,
  ArrowLeft,
  Mic,
  Clock,
  Award,
  Flame,
  Volume2,
  CheckCircle2,
} from 'lucide-react'

const scenariosData = rawScenarios as SpeakingScenario[]

type FilterLevel = 'all' | CEFRLevel

export default function SpeakingHubPage() {
  const router = useRouter()
  const { session } = useStudentSession()
  const studentId =
    (session as unknown as { studentId?: string })?.studentId ||
    (session?.classCode ? `${session.classCode}_${session.studentName}` : undefined)

  const [activeFilter, setActiveFilter] = useState<FilterLevel>('all')
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    averageAccuracy: 0,
    totalStars: 0,
  })

  // Extract unique personas from scenario list
  const personas = useMemo<SpeakingPersona[]>(() => {
    const map = new Map<string, SpeakingPersona>()
    scenariosData.forEach((s) => {
      if (!map.has(s.persona.id)) {
        map.set(s.persona.id, s.persona)
      }
    })
    return Array.from(map.values())
  }, [])

  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(() => {
    return personas.find((p) => p.id === 'sunny-tutor')?.id || personas[0]?.id || 'sunny-tutor'
  })

  // Fetch speaking statistics for student
  useEffect(() => {
    let isMounted = true
    async function fetchStats() {
      try {
        const res = await getStudentSpeakingStatsAction(studentId)
        if (isMounted && res?.success && res.data) {
          setStats(res.data)
        }
      } catch (err) {
        console.error('Failed to load speaking stats:', err)
      }
    }
    void fetchStats()
    return () => {
      isMounted = false
    }
  }, [studentId])

  // Filtered scenarios
  const filteredScenarios = useMemo(() => {
    if (activeFilter === 'all') {
      return scenariosData
    }
    return scenariosData.filter((s) => s.level === activeFilter)
  }, [activeFilter])

  const handleSelectScenario = (scenario: SpeakingScenario) => {
    const url = `/speaking/${scenario.id}?persona=${encodeURIComponent(selectedPersonaId)}`
    router.push(url)
  }

  const filterOptions: { id: FilterLevel; label: string; testId: string }[] = [
    { id: 'all', label: 'Tất cả cấp độ', testId: 'filter-all' },
    { id: 'A1', label: 'Cơ bản (A1)', testId: 'filter-a1' },
    { id: 'A2', label: 'Sơ cấp (A2)', testId: 'filter-a2' },
    { id: 'B1', label: 'Trung cấp (B1)', testId: 'filter-b1' },
    { id: 'B2', label: 'Nâng cao (B2)', testId: 'filter-b2' },
  ]

  return (
    <Container>
      <div data-testid="speaking-hub" className="py-6 space-y-8">
        {/* Navigation & Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border border-border text-sm font-bold text-foreground hover:bg-accent transition-colors shadow-2xs group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            <span>← Về trang chủ</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-black uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            <span>Interactive AI Speech Partner</span>
          </div>
        </div>

        {/* Hero Banner with Sunny Companion */}
        <section
          aria-label="Giới thiệu Sunny và Phòng Luyện Nói AI"
          className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-6 sm:p-10 shadow-lg border border-amber-400/50"
        >
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-yellow-300/30 blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 size-48 rounded-full bg-orange-400/30 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 justify-between">
            <div className="space-y-3 text-center md:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-black uppercase tracking-wider">
                <span>🎙️ Gia sư AI Sunny</span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Phòng Luyện Nói Tương Tác AI ☀️
              </h1>
              <p className="text-sm sm:text-base text-amber-50/95 font-medium leading-relaxed">
                Chào mừng bạn đến với phòng luyện nói! Hãy tự tin bắt chuyện cùng gia sư Sunny và
                các bạn đồng hành AI qua các tình huống thực tế thường ngày. Hệ thống sẽ nhận diện giọng
                nói chuẩn xác, gợi ý câu mẫu thông minh và chấm điểm phát âm ngay lập tức!
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white border border-white/25 backdrop-blur-xs">
                  <CheckCircle2 className="size-3.5" />
                  <span>Sửa lỗi tức thì</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white border border-white/25 backdrop-blur-xs">
                  <Volume2 className="size-3.5" />
                  <span>Phát âm chuẩn bản xứ</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white border border-white/25 backdrop-blur-xs">
                  <Flame className="size-3.5" />
                  <span>Tích lũy sao &amp; XP</span>
                </span>
              </div>
            </div>

            {/* Sunny Big Avatar Graphic */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="size-28 sm:size-36 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-6xl sm:text-7xl shadow-xl hover:rotate-6 hover:scale-105 transition-all">
                <span>☀️</span>
              </div>
              <span className="mt-2 text-xs font-black uppercase tracking-widest text-amber-100">
                Sunny AI Mentor
              </span>
            </div>
          </div>
        </section>

        {/* Stats Summary Ribbon */}
        <section
          aria-label="Thống kê quá trình luyện nói"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border-2 border-border/80 shadow-2xs">
            <div className="size-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
              <Mic className="size-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Tổng số phiên đã nói
              </span>
              <span className="text-2xl font-black text-foreground">
                {stats.totalSessions}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border-2 border-border/80 shadow-2xs">
            <div className="size-12 rounded-xl bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
              <Clock className="size-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Số phút đã luyện
              </span>
              <span className="text-2xl font-black text-foreground">
                {stats.totalMinutes}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border-2 border-border/80 shadow-2xs">
            <div className="size-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
              <Award className="size-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Độ chuẩn phát âm
              </span>
              <span className="text-2xl font-black text-foreground">
                {stats.averageAccuracy}%
              </span>
            </div>
          </div>
        </section>

        {/* Persona Selector Section */}
        <section aria-label="Lựa chọn bạn đồng hành AI">
          <PersonaSelector
            personas={personas}
            selectedId={selectedPersonaId}
            onSelect={setSelectedPersonaId}
          />
        </section>

        {/* Scenario Discovery & CEFR Level Filter */}
        <section aria-label="Danh mục tình huống hội thoại" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
                <span>💬</span>
                <span>Khám Phá Tình Huống Giao Tiếp</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                Chọn bối cảnh bạn muốn thực hành để bắt đầu trò chuyện tương tác 2 chiều
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {filterOptions.map((f) => {
                const isActive = activeFilter === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    data-testid={f.testId}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-sm scale-105'
                        : 'bg-card text-muted-foreground border border-border/80 hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grid of Scenario Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onSelect={handleSelectScenario}
              />
            ))}
          </div>

          {filteredScenarios.length === 0 && (
            <div className="text-center py-12 bg-card rounded-3xl border border-dashed border-border p-8">
              <span className="text-4xl block mb-2">🔍</span>
              <h3 className="text-base font-bold text-foreground">
                Không tìm thấy tình huống nào phù hợp
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Hãy chọn cấp độ khác hoặc bấm &quot;Tất cả cấp độ&quot; để xem toàn bộ danh mục.
              </p>
            </div>
          )}
        </section>
      </div>
    </Container>
  )
}
