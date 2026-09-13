// src/components/kitchen/PhonicsKitchenExperience.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  getAllStations,
  getStationById,
  getRecipesByStation,
  getRecipeById,
  getDefaultKitchenProgress,
  cookRecipe,
} from '@/lib/phonics-kitchen-engine'
import type { KitchenStationType, KitchenProgress } from '@/types/phonics-kitchen'
import { KitchenHeaderBar } from './KitchenHeaderBar'
import { KitchenStationSelector } from './KitchenStationSelector'
import { CookingWorkbenchModal } from './CookingWorkbenchModal'
import { RecipeBookModal } from './RecipeBookModal'
import { createRhythmSynthesizer, type SoundSynthesizer } from '@/lib/rhythm-beat-synthesizer'
import { saveKitchenProgressAction } from '@/app/actions/phonics-kitchen'
import { Utensils, Volume2, Sparkles, ChefHat } from 'lucide-react'
import { useSpeech } from '@/hooks/useSpeech'

const STORAGE_KEY = 'gamehub_phonics_kitchen_v1'

interface PhonicsKitchenExperienceProps {
  initialProgress?: KitchenProgress
}

export function PhonicsKitchenExperience({ initialProgress }: PhonicsKitchenExperienceProps) {
  const { speak } = useSpeech()
  const stations = getAllStations()
  const [selectedStation, setSelectedStation] = useState<KitchenStationType>('pizzeria')
  const [progress, setProgress] = useState<KitchenProgress>(
    initialProgress || getDefaultKitchenProgress()
  )
  const [activeCookingRecipeId, setActiveCookingRecipeId] = useState<string | null>(null)
  const [isRecipeBookOpen, setIsRecipeBookOpen] = useState(false)

  const synthRef = useRef<SoundSynthesizer | null>(null)

  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    // Hydrate from localStorage asynchronously
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as KitchenProgress
        if (parsed && Array.isArray(parsed.masteredRecipeIds)) {
          setTimeout(() => {
            setProgress(parsed)
          }, 0)
        }
      }
    } catch {
      // fallback
    }
    return () => {
      void synthRef.current?.close()
    }
  }, [])

  const persistProgress = (newProg: KitchenProgress) => {
    setProgress(newProg)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProg))
    } catch {
      // ignore storage error
    }
    void saveKitchenProgressAction(newProg)
  }

  const handleSelectStation = (stationId: KitchenStationType) => {
    setSelectedStation(stationId)
    synthRef.current?.playWoodblock()
  }

  const handleCookComplete = (optionIndex: number) => {
    if (!activeCookingRecipeId) return
    const result = cookRecipe(progress, activeCookingRecipeId, optionIndex)
    if (result.success) {
      persistProgress(result.updatedProgress)
    }
    setActiveCookingRecipeId(null)
  }

  const handleResetProgress = () => {
    const cleanProgress = getDefaultKitchenProgress()
    persistProgress(cleanProgress)
  }

  const activeStationDef = getStationById(selectedStation) || stations[0]
  const currentRecipes = getRecipesByStation(selectedStation)
  const activeRecipeForWorkbench = activeCookingRecipeId
    ? getRecipeById(activeCookingRecipeId)
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header Bar */}
      <KitchenHeaderBar
        chefRank={progress.chefRank}
        totalMastered={progress.masteredRecipeIds.length}
        totalAvailable={12}
        chefStars={progress.chefStars}
        onOpenRecipeBook={() => setIsRecipeBookOpen(true)}
        onResetProgress={handleResetProgress}
      />

      {/* Main Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center gap-2">
            <span>Bếp Trưởng Nhí Phonics 🧑‍🍳</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium pt-1">
            Ghé thăm các quầy bếp quốc tế, chọn nguyên liệu ngữ âm chuẩn xác và nấu chín những món ăn thượng hạng!
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 font-black text-base shrink-0">
          <ChefHat className="size-5 text-amber-600" />
          <span>Quầy: {activeStationDef.nameVi}</span>
        </div>
      </div>

      {/* Station Selector Tabs */}
      <KitchenStationSelector
        stations={stations}
        selectedStation={selectedStation}
        completedStations={progress.completedStations}
        onSelectStation={handleSelectStation}
      />

      {/* Active Station Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl bg-linear-to-r ${activeStationDef.backgroundGradient} border-2 border-slate-200/80 shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-4`}
      >
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-xs text-slate-900 font-black text-base border border-slate-200">
            <Sparkles className="size-4 text-amber-500" />
            <span>Không Gian Bếp Chuyên Nghiệp</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {activeStationDef.nameVi} ({activeStationDef.nameEn})
          </h2>
          <p className="text-base sm:text-lg text-slate-700 font-medium max-w-2xl">
            {activeStationDef.descriptionVi}
          </p>
        </div>

        <div className="text-center md:text-right">
          <span className="text-base font-bold text-slate-600 block">Món đã thành công:</span>
          <span className="text-2xl font-black text-amber-700">
            {
              currentRecipes.filter((r) => progress.masteredRecipeIds.includes(r.id))
                .length
            }
            /3 món
          </span>
        </div>
      </div>

      {/* 3 Recipes Cards in Current Station */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentRecipes.map((recipe) => {
          const isMastered = progress.masteredRecipeIds.includes(recipe.id)

          return (
            <article
              key={recipe.id}
              data-testid={`kitchen-recipe-card-${recipe.id}`}
              className="flex flex-col justify-between p-6 rounded-3xl bg-white border-4 border-slate-200 hover:border-amber-400 shadow-lg hover:shadow-xl transition-all space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header Status & Pronounce */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full font-black text-base border ${
                      isMastered
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-amber-100 text-amber-950 border-amber-300'
                    }`}
                  >
                    {isMastered ? '⭐ Đã Nấu' : '🍳 Chưa Nấu'}
                  </span>

                  <button
                    type="button"
                    onClick={() => speak(recipe.nameEn)}
                    aria-label={`Nghe phát âm ${recipe.nameEn}`}
                    className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                  >
                    <Volume2 className="size-5" />
                  </button>
                </div>

                {/* Recipe Emoji & Info */}
                <div className="flex flex-col items-center text-center pt-2">
                  <div className="size-24 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-6xl shadow-inner group-hover:scale-110 transition-transform">
                    {recipe.emoji}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 pt-3 group-hover:text-amber-600 transition-colors">
                    {recipe.nameVi}
                  </h3>
                  <p className="text-base font-bold text-amber-700">
                    {recipe.nameEn}
                  </p>
                </div>

                {/* Phonics Focus */}
                <p className="text-base text-slate-600 font-medium text-center">
                  🎯 {recipe.phonicsFocus}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setActiveCookingRecipeId(recipe.id)}
                aria-label={`Nấu món ${recipe.nameVi}`}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                  isMastered
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-300 hover:scale-102 active:scale-98'
                }`}
              >
                <Utensils className="size-5" />
                <span>{isMastered ? 'Nấu Lại Thử Thách' : 'Nấu Món Ngay'}</span>
              </button>
            </article>
          )
        })}
      </div>

      {/* Cooking Workbench Modal */}
      {activeRecipeForWorkbench && (
        <CookingWorkbenchModal
          recipe={activeRecipeForWorkbench}
          isAlreadyMastered={progress.masteredRecipeIds.includes(activeRecipeForWorkbench.id)}
          onCookComplete={handleCookComplete}
          onClose={() => setActiveCookingRecipeId(null)}
          playChimeSound={() => synthRef.current?.playChime()}
          playKickSound={() => synthRef.current?.playKick()}
        />
      )}

      {/* MasterChef Recipe Book Modal */}
      {isRecipeBookOpen && (
        <RecipeBookModal
          masteredRecipeIds={progress.masteredRecipeIds}
          onClose={() => setIsRecipeBookOpen(false)}
        />
      )}
    </div>
  )
}
