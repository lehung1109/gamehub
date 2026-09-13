// src/components/admin/ai/AiClassroomCopilot.tsx

'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Swords,
  BookOpen,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Volume2,
} from 'lucide-react'
import type { GeneratedArenaPayload, CopilotLessonPlan } from '@/types/ai-copilot'
import {
  generateArenaFromPromptAction,
  generateRemediationPlanAction,
} from '@/app/actions/ai-copilot'
import { createLiveArenaAction } from '@/app/actions/arena'

const GRADE_OPTIONS = [
  { value: 'grade-1', label: 'Lớp 1 (Pre-A1)' },
  { value: 'grade-2', label: 'Lớp 2 (A1.1)' },
  { value: 'grade-3', label: 'Lớp 3 (A1.2)' },
  { value: 'grade-4', label: 'Lớp 4 (A2.1)' },
  { value: 'grade-5', label: 'Lớp 5 (A2.2)' },
] as const

const COMMON_PHONEMES = ['/s/', '/k/', '/t/', '/d/', '/θ/', '/ð/', '/ʃ/', '/tʃ/']

export function AiClassroomCopilot() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'arena' | 'remediation'>('arena')

  // Tab 1: Arena Generator State
  const [prompt, setPrompt] = useState('')
  const [gradeLevel, setGradeLevel] = useState<'grade-1' | 'grade-2' | 'grade-3' | 'grade-4' | 'grade-5'>('grade-3')
  const [questionCount, setQuestionCount] = useState(6)
  const [generatedArena, setGeneratedArena] = useState<GeneratedArenaPayload | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isCreatingArena, setIsCreatingArena] = useState(false)

  // Tab 2: Remediation Plan State
  const [planTopic, setPlanTopic] = useState('pronunciation')
  const [planGrade, setPlanGrade] = useState('grade-3')
  const [selectedPhonemes, setSelectedPhonemes] = useState<string[]>(['/s/', '/k/'])
  const [generatedPlan, setGeneratedPlan] = useState<CopilotLessonPlan | null>(null)

  function handleGenerateArena(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!prompt.trim()) {
      setErrorMessage('Vui lòng nhập yêu cầu đề bài hoặc chủ đề bài học.')
      return
    }

    startTransition(async () => {
      const res = await generateArenaFromPromptAction({
        prompt: prompt.trim(),
        gradeLevel,
        questionCount,
      })

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'Không thể tạo đề đấu trường.')
        return
      }

      setGeneratedArena(res.data)
    })
  }

  function handleLaunchLiveArena() {
    if (!generatedArena) return
    setIsCreatingArena(true)

    startTransition(async () => {
      const res = await createLiveArenaAction({
        title: generatedArena.title,
        gameId: 'flashcard',
        questions: generatedArena.questions,
      })

      setIsCreatingArena(false)

      if (res.success && res.data) {
        router.push(`/admin/arena/${res.data.id}`)
      } else {
        setErrorMessage(res.error || 'Không thể khởi tạo phòng đấu trực tiếp.')
      }
    })
  }

  function handleGeneratePlan(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    startTransition(async () => {
      const res = await generateRemediationPlanAction(
        planTopic,
        planGrade,
        selectedPhonemes
      )

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'Không thể tạo giáo án.')
        return
      }

      setGeneratedPlan(res.data)
    })
  }

  function togglePhonemeSelection(phoneme: string) {
    if (selectedPhonemes.includes(phoneme)) {
      if (selectedPhonemes.length > 1) {
        setSelectedPhonemes(selectedPhonemes.filter((p) => p !== phoneme))
      }
    } else {
      setSelectedPhonemes([...selectedPhonemes, phoneme])
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-base font-bold border border-indigo-500/30">
            <Sparkles className="size-5 text-indigo-400" />
            <span>AI Classroom Co-Pilot</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Trợ Lý AI Đồng Hành Lớp Học
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl">
            Tự động soạn đề Đấu Trường Live Arena theo mục tiêu giáo án và kiến tạo kế hoạch can thiệp lỗi âm tức thì.
          </p>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('arena')}
          className={`px-6 py-3.5 rounded-2xl font-bold text-base transition-all flex items-center gap-2.5 cursor-pointer ${
            activeTab === 'arena'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Swords className="size-5" />
          <span>Soạn Đấu Trường Live Arena</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('remediation')}
          className={`px-6 py-3.5 rounded-2xl font-bold text-base transition-all flex items-center gap-2.5 cursor-pointer ${
            activeTab === 'remediation'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="size-5" />
          <span>Giáo Án Can Thiệp Lỗi Âm</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-5 bg-rose-50 border-2 border-rose-200 text-rose-800 text-base rounded-2xl flex items-center gap-3 font-semibold">
          <AlertCircle className="size-6 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: ARENA GENERATOR */}
      {activeTab === 'arena' && (
        <div className="space-y-8">
          <form
            onSubmit={handleGenerateArena}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6"
          >
            <div className="space-y-2">
              <label className="block text-base font-bold text-slate-800 uppercase tracking-wider">
                Yêu cầu đề bài (Prompt tiếng Việt hoặc tiếng Anh)
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Nhập yêu cầu đề bài (Ví dụ: Tạo 6 câu trắc nghiệm và phát âm về Animals cho học sinh lớp 3...)"
                className="w-full p-4 text-base font-medium bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 focus:bg-white focus:outline-hidden text-slate-900 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-base font-bold text-slate-800">
                  Cấp độ khối lớp (Grade Level)
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value as typeof gradeLevel)}
                  className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-800 focus:border-indigo-600 focus:outline-hidden"
                >
                  {GRADE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-base font-bold text-slate-800">
                  Số lượng câu hỏi
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-800 focus:border-indigo-600 focus:outline-hidden"
                >
                  <option value={5}>5 câu (Khởi động nhanh 5 phút)</option>
                  <option value={6}>6 câu (Cân đối 3 thể loại)</option>
                  <option value={8}>8 câu (Trận đấu tiêu chuẩn)</option>
                  <option value={10}>10 câu (Đấu trường toàn diện)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-600/25 inline-flex items-center gap-3 cursor-pointer transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
              <span>Tạo Đề Đấu Trường Bằng AI</span>
            </button>
          </form>

          {/* Generated Questions Preview */}
          {generatedArena && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-base font-bold">
                    ✓ Đã tạo thành công {generatedArena.questions.length} câu hỏi
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 pt-1">
                    {generatedArena.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleLaunchLiveArena}
                  disabled={isCreatingArena}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base shadow-lg shadow-emerald-600/25 inline-flex items-center gap-3 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isCreatingArena ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Swords className="size-5" />
                  )}
                  <span>Khởi Tạo Phòng Đấu Ngay</span>
                  <ArrowRight className="size-5" />
                </button>
              </div>

              {/* Question list cards */}
              <div className="space-y-4">
                {generatedArena.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-600">Câu {idx + 1}</span>
                      <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-base font-bold border border-indigo-200">
                        {q.questionType === 'true_false'
                          ? 'Đúng / Sai'
                          : q.questionType === 'phonics_audio'
                          ? 'Phát âm Phonics'
                          : 'Trắc nghiệm 4 màu'}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900">{q.question}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-3 rounded-xl text-base font-bold border ${
                            opt.trim() === q.correctAnswer.trim()
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {opt} {opt.trim() === q.correctAnswer.trim() ? '✓ (Đáp án đúng)' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REMEDIATION LESSON PLANNER */}
      {activeTab === 'remediation' && (
        <div className="space-y-8">
          <form
            onSubmit={handleGeneratePlan}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6"
          >
            <div className="space-y-2">
              <label className="block text-base font-bold text-slate-800">
                Chọn các âm yếu cần can thiệp (Nhấp để chọn / bỏ chọn):
              </label>
              <div className="flex flex-wrap gap-3 pt-1">
                {COMMON_PHONEMES.map((ph) => {
                  const isSelected = selectedPhonemes.includes(ph)
                  return (
                    <button
                      key={ph}
                      type="button"
                      onClick={() => togglePhonemeSelection(ph)}
                      className={`px-5 py-3 rounded-2xl text-lg font-bold border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ph}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-600/25 inline-flex items-center gap-3 cursor-pointer transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-5 animate-spin" /> : <BookOpen className="size-5" />}
              <span>Tạo Giáo Án 15 Phút Can Thiệp</span>
            </button>
          </form>

          {/* Generated Lesson Plan Output */}
          {generatedPlan && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-1 pb-4 border-b border-slate-100">
                <span className="px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-base font-bold">
                  ✓ Thời lượng: {generatedPlan.durationMinutes} phút
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 pt-2">
                  {generatedPlan.title}
                </h3>
              </div>

              {/* Tongue Twister Warm-up */}
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                  <Volume2 className="size-5 text-amber-600" />
                  <span>Câu luyện phát âm nhanh (Tongue-Twister):</span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-amber-950 italic">
                  "{generatedPlan.warmUpTongueTwister}"
                </p>
              </div>

              {/* Interactive Activity */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-lg font-black text-slate-900">Hoạt động tương tác lớp:</h4>
                <p className="text-base text-slate-700 font-medium">
                  {generatedPlan.interactiveActivity}
                </p>
              </div>

              {/* Step-by-Step Script */}
              <div className="p-6 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
                <h4 className="text-lg font-black text-indigo-950">
                  Kịch bản hướng dẫn từng bước cho Thầy/Cô:
                </h4>
                <pre className="text-base text-indigo-900 font-sans whitespace-pre-line leading-relaxed">
                  {generatedPlan.teacherScriptVi}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
