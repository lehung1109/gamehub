// src/components/admin/diagnostics/ClassSkillHeatmap.tsx

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import type { ClassDiagnosticSummary, StudentTier } from '@/types/adaptive-learning'

interface ClassSkillHeatmapProps {
  summary: ClassDiagnosticSummary
}

export function ClassSkillHeatmap({ summary }: ClassSkillHeatmapProps) {
  const [selectedTier, setSelectedTier] = useState<StudentTier | 'all'>('all')

  const filteredStudents = summary.studentRows.filter((s) => {
    if (selectedTier === 'all') return true
    return s.tier === selectedTier
  })

  function getScoreBadgeClass(score: number): string {
    if (score >= 80) return 'bg-emerald-100 text-emerald-900 border-emerald-300'
    if (score >= 50) return 'bg-amber-100 text-amber-900 border-amber-300'
    return 'bg-rose-100 text-rose-900 border-rose-300'
  }

  function getTierBadge(tier: StudentTier) {
    if (tier === 'advanced') {
      return (
        <span className="px-3.5 py-1 rounded-xl bg-purple-100 text-purple-900 font-bold text-base border border-purple-300">
          ⭐ Nâng cao
        </span>
      )
    }
    if (tier === 'target') {
      return (
        <span className="px-3.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-base border border-emerald-300">
          ✓ Đạt chuẩn
        </span>
      )
    }
    return (
      <span className="px-3.5 py-1 rounded-xl bg-rose-100 text-rose-900 font-bold text-base border border-rose-300">
        ⚠️ Cần hỗ trợ
      </span>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6 px-4">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-base font-bold border border-indigo-500/30">
            <Activity className="size-5 text-indigo-400" />
            <span>Chẩn Đoán Năng Lực & Phân Tuyến Bài Tập</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Bản Đồ Năng Lực: {summary.className}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl">
            Tổng hợp dữ liệu học tập đa kỹ năng, phát hiện lỗ hổng kiến thức và đề xuất phân hóa bài tập thích ứng cho {summary.studentCount} học sinh.
          </p>
        </div>

        <Link
          href="/admin/ai-copilot"
          className="px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2.5 transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="size-5" />
          <span>Tạo Giáo Án Can Thiệp AI</span>
          <ArrowRight className="size-5" />
        </Link>
      </div>

      {/* 4 Core Domain Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Phát Âm (Phonics)', score: summary.domainAverages.phonics, icon: '🎙️' },
          { label: 'Từ Vựng (Vocabulary)', score: summary.domainAverages.vocabulary, icon: '📚' },
          { label: 'Ngữ Pháp (Grammar)', score: summary.domainAverages.grammar, icon: '✏️' },
          { label: 'Nghe Hiểu (Listening)', score: summary.domainAverages.listening, icon: '👂' },
        ].map((d) => (
          <div
            key={d.label}
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{d.icon}</span>
              <span
                className={`px-3 py-1 rounded-xl text-base font-black border ${getScoreBadgeClass(
                  d.score
                )}`}
              >
                {d.score}%
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{d.label}</h3>
              <p className="text-base font-semibold text-slate-500">Trung bình cả lớp</p>
            </div>
          </div>
        ))}
      </div>

      {/* Weak Skill Hotspots Alert */}
      {summary.weakSkillFrequencies.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-200 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-950 font-bold text-lg">
            <AlertTriangle className="size-6 text-amber-600 shrink-0" />
            <span>Điểm nghẽn cần can thiệp ưu tiên trong tuần:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {summary.weakSkillFrequencies.map((f) => (
              <div
                key={f.skillId}
                className="px-4 py-2.5 rounded-2xl bg-white border border-amber-300 text-slate-800 font-bold text-base shadow-2xs flex items-center gap-2"
              >
                <span>{f.skillNameVi}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 text-base font-black">
                  {f.count} em
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Skill Matrix Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">
              Ma Trận Năng Lực Từng Học Sinh
            </h2>
            <p className="text-base font-medium text-slate-500">
              Phân loại nhóm năng lực để giao bài tập phân hóa
            </p>
          </div>

          {/* Tier Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'advanced', label: 'Nâng cao' },
              { key: 'target', label: 'Đạt chuẩn' },
              { key: 'support', label: 'Cần hỗ trợ' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedTier(tab.key as typeof selectedTier)}
                className={`px-4 py-2 rounded-xl text-base font-bold transition-all cursor-pointer ${
                  selectedTier === tab.key
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-base font-bold text-slate-700">
                <th className="py-3 px-4">Học Sinh</th>
                <th className="py-3 px-4">Xếp Loại</th>
                <th className="py-3 px-4 text-center">Phát Âm</th>
                <th className="py-3 px-4 text-center">Từ Vựng</th>
                <th className="py-3 px-4 text-center">Ngữ Pháp</th>
                <th className="py-3 px-4 text-center">Nghe Hiểu</th>
                <th className="py-3 px-4">Lỗ Hổng Trọng Tâm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.studentId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900 text-base">
                    {s.studentName}
                  </td>
                  <td className="py-4 px-4">{getTierBadge(s.tier)}</td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl text-base font-bold border ${getScoreBadgeClass(
                        s.domainScores.phonics
                      )}`}
                    >
                      {s.domainScores.phonics}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl text-base font-bold border ${getScoreBadgeClass(
                        s.domainScores.vocabulary
                      )}`}
                    >
                      {s.domainScores.vocabulary}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl text-base font-bold border ${getScoreBadgeClass(
                        s.domainScores.grammar
                      )}`}
                    >
                      {s.domainScores.grammar}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl text-base font-bold border ${getScoreBadgeClass(
                        s.domainScores.listening
                      )}`}
                    >
                      {s.domainScores.listening}%
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-600 text-base">
                    {s.primaryWeakSkill}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
