// src/components/kitchen/RecipeBookModal.tsx
'use client'

import React from 'react'
import { X, BookOpen, Volume2, CheckCircle2, Lock, Sparkles } from 'lucide-react'
import { getAllRecipes } from '@/lib/phonics-kitchen-engine'
import { useSpeech } from '@/hooks/useSpeech'

interface RecipeBookModalProps {
  masteredRecipeIds: string[]
  onClose: () => void
}

export function RecipeBookModal({
  masteredRecipeIds,
  onClose,
}: RecipeBookModalProps) {
  const { speak } = useSpeech()
  const allRecipes = getAllRecipes()
  const masteredCount = masteredRecipeIds.length

  const handlePronounce = (nameEn: string) => {
    speak(nameEn)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sổ tay công thức món ăn MasterChef"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl bg-slate-900 border-4 border-amber-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
              <BookOpen className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400">
                Sổ Tay Công Thức MasterChef
              </h2>
              <p className="text-base text-slate-300 font-medium">
                Tuyển tập công thức ẩm thực & quy tắc ngữ âm tiếng Anh ({masteredCount}/12 món)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng sổ tay công thức"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allRecipes.map((recipe) => {
            const isMastered = masteredRecipeIds.includes(recipe.id)

            if (!isMastered) {
              return (
                <div
                  key={recipe.id}
                  className="p-5 rounded-3xl bg-slate-800/40 border-2 border-dashed border-slate-700 flex items-center gap-4 opacity-75"
                >
                  <div className="size-18 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl grayscale">
                    <Lock className="size-8 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-400">
                      Món Ăn Bí Mật ({recipe.station.toUpperCase()})
                    </h3>
                    <p className="text-base text-slate-500">
                      Hãy ghé thăm quầy bếp và giải mã nguyên liệu để mở khóa công thức này!
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={recipe.id}
                className="p-5 rounded-3xl bg-slate-800/90 border-2 border-amber-400/60 flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="text-5xl">{recipe.emoji}</span>
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <span>{recipe.nameVi}</span>
                        <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                      </h3>
                      <p className="text-base font-bold text-amber-300">
                        {recipe.nameEn}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePronounce(recipe.nameEn)}
                    aria-label={`Nghe phát âm ${recipe.nameEn}`}
                    className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-transform active:scale-95 cursor-pointer shrink-0"
                  >
                    <Volume2 className="size-5" />
                  </button>
                </div>

                {/* Phonics Rule */}
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-base text-slate-200">
                  <span className="text-amber-400 font-bold">🎯 Quy tắc âm: </span>
                  {recipe.challenge.phoneticRuleVi}
                </div>

                {/* Story */}
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-900/50 text-base text-amber-200 flex items-start gap-2">
                  <Sparkles className="size-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{recipe.storyVi}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
