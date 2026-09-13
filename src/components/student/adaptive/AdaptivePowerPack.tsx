// src/components/student/adaptive/AdaptivePowerPack.tsx

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Zap,
  Trophy,
  CheckCircle2,
  Circle,
  ArrowRight,
  Flame,
} from 'lucide-react'
import type { AdaptiveDailyPlan } from '@/types/adaptive-learning'

interface AdaptivePowerPackProps {
  plan: AdaptiveDailyPlan
  onCompleteStep?: (stepNumber: number) => void
}

export function AdaptivePowerPack({ plan, onCompleteStep }: AdaptivePowerPackProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    plan.steps.filter((s) => s.isCompleted).map((s) => s.stepNumber)
  )

  const isAllCompleted = completedSteps.length === plan.steps.length
  const totalEarnedExp = completedSteps.reduce((acc, stepNum) => {
    const step = plan.steps.find((s) => s.stepNumber === stepNum)
    return acc + (step?.expReward || 0)
  }, 0)

  function handleToggleStep(stepNumber: number) {
    if (completedSteps.includes(stepNumber)) {
      setCompletedSteps(completedSteps.filter((n) => n !== stepNumber))
    } else {
      const next = [...completedSteps, stepNumber]
      setCompletedSteps(next)
      onCompleteStep?.(stepNumber)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-100 shadow-xl space-y-6">
      {/* Header with Title & EXP Counter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b-2 border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-base font-bold border border-indigo-200">
            <Sparkles className="size-5 text-indigo-600" />
            <span>Gói Bài Tập Tăng Tốc Cá Nhân (Daily Power Pack)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Nhiệm Vụ Thích Ứng Hôm Nay
          </h2>
        </div>

        <div className="flex items-center gap-3 bg-amber-50 px-5 py-2.5 rounded-2xl border-2 border-amber-200 text-amber-900 shadow-xs">
          <Flame className="size-6 text-amber-500 fill-amber-500" />
          <div className="text-left">
            <span className="block text-base font-bold text-amber-800">EXP Tích Lũy</span>
            <span className="text-xl font-black text-amber-950">
              +{totalEarnedExp} / {plan.totalExpReward} EXP
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Status Text */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-base font-bold text-slate-700">
          <span>Tiến độ hoàn thành</span>
          <span className="text-indigo-600 font-black">
            {completedSteps.length} / {plan.steps.length} Nhiệm vụ
          </span>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 rounded-full"
            style={{
              width: `${(completedSteps.length / plan.steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Celebratory Banner when Completed */}
      {isAllCompleted && (
        <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-center gap-4 animate-in zoom-in-95 duration-200">
          <div className="size-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Trophy className="size-8" />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-black text-emerald-900">
              Xuất Sắc! Em Đã Hoàn Thành Toàn Bộ Gói Tăng Tốc!
            </h3>
            <p className="text-base text-emerald-800 font-semibold">
              Đã nhận trọn vẹn +{plan.totalExpReward} EXP và củng cố vững chắc điểm số năng lực cá nhân.
            </p>
          </div>
        </div>
      )}

      {/* 3 Steps List */}
      <div className="space-y-4">
        {plan.steps.map((step) => {
          const isDone = completedSteps.includes(step.stepNumber)
          return (
            <div
              key={step.stepNumber}
              className={`p-5 sm:p-6 rounded-2xl border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-200 opacity-90'
                  : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-white shadow-xs'
              }`}
            >
              {/* Step info */}
              <div className="flex items-start gap-4 flex-1">
                <button
                  type="button"
                  onClick={() => handleToggleStep(step.stepNumber)}
                  aria-label={`Đánh dấu bước ${step.stepNumber}`}
                  className="mt-1 size-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  {isDone ? (
                    <CheckCircle2 className="size-8 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="size-8 text-slate-400 hover:text-indigo-600" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-xl text-base font-black ${
                        step.type === 'warm_up'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : step.type === 'core_drill'
                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}
                    >
                      {step.type === 'warm_up'
                        ? 'Bước 1: Khởi Động'
                        : step.type === 'core_drill'
                        ? 'Bước 2: Luyện Cốt Lõi'
                        : 'Bước 3: Trùm Thử Thách'}
                    </span>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-base font-bold">
                      <Zap className="size-4 text-amber-500 fill-amber-500" />
                      <span>+{step.expReward} EXP</span>
                    </span>
                  </div>

                  <h4 className="text-xl font-black text-slate-900 pt-1">
                    {step.titleVi}
                  </h4>
                  <p className="text-base font-medium text-slate-600">
                    {step.descriptionVi}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-2 md:pt-0">
                <Link
                  href={step.targetUrl}
                  className={`w-full md:w-auto px-6 py-3.5 rounded-2xl font-black text-base inline-flex items-center justify-center gap-2 shadow-md transition-all ${
                    isDone
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
                  }`}
                >
                  <span>{isDone ? 'Luyện lại' : 'Bắt đầu làm bài'}</span>
                  <ArrowRight className="size-5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
