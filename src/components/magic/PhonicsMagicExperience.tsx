// src/components/magic/PhonicsMagicExperience.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  getAllTowers,
  getTowerById,
  getSpellsByTower,
  getSpellById,
  getDefaultMagicProgress,
  completeMagicSpell,
} from '@/lib/phonics-magic-engine'
import type { ElementalTowerId, MagicProgress } from '@/types/phonics-magic'
import { MagicHeaderBar } from './MagicHeaderBar'
import { MagicTowerSelector } from './MagicTowerSelector'
import { WandIncantationModal } from './WandIncantationModal'
import { AncientGrimoireModal } from './AncientGrimoireModal'
import { createRhythmSynthesizer, type SoundSynthesizer } from '@/lib/rhythm-beat-synthesizer'
import { saveMagicProgressAction } from '@/app/actions/phonics-magic'
import { Wand2, Volume2, Sparkles, Flame } from 'lucide-react'
import { useSpeech } from '@/hooks/useSpeech'

const STORAGE_KEY = 'gamehub_phonics_magic_v1'

interface PhonicsMagicExperienceProps {
  initialProgress?: MagicProgress
}

export function PhonicsMagicExperience({ initialProgress }: PhonicsMagicExperienceProps) {
  const { speak } = useSpeech()
  const towers = getAllTowers()
  const [selectedTower, setSelectedTower] = useState<ElementalTowerId>('fire')
  const [progress, setProgress] = useState<MagicProgress>(
    initialProgress || getDefaultMagicProgress()
  )
  const [activeSpellModalId, setActiveSpellModalId] = useState<string | null>(null)
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false)

  const synthRef = useRef<SoundSynthesizer | null>(null)

  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    // Hydrate from localStorage asynchronously
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as MagicProgress
        if (parsed && Array.isArray(parsed.completedSpellIds)) {
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

  const persistProgress = (newProg: MagicProgress) => {
    setProgress(newProg)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProg))
    } catch {
      // ignore storage error
    }
    void saveMagicProgressAction(newProg)
  }

  const handleSelectTower = (towerId: ElementalTowerId) => {
    setSelectedTower(towerId)
    synthRef.current?.playWoodblock()
  }

  const handleSpellComplete = () => {
    if (!activeSpellModalId) return
    const updated = completeMagicSpell(progress, activeSpellModalId)
    persistProgress(updated)
    setActiveSpellModalId(null)
  }

  const handleResetProgress = () => {
    const cleanProgress = getDefaultMagicProgress()
    persistProgress(cleanProgress)
  }

  const activeTowerDef = getTowerById(selectedTower) || towers[0]
  const currentSpells = getSpellsByTower(selectedTower)
  const activeSpellForIncantation = activeSpellModalId
    ? getSpellById(activeSpellModalId)
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header Bar */}
      <MagicHeaderBar
        wizardRank={progress.wizardRank}
        totalCompleted={progress.completedSpellIds.length}
        totalAvailable={12}
        manaCrystals={progress.manaCrystals}
        onOpenGrimoire={() => setIsGrimoireOpen(true)}
        onResetProgress={handleResetProgress}
      />

      {/* Main Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center gap-2">
            <span>Học Viện Phép Thuật & Thần Chú Ngữ Âm 🧙‍♂️</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium pt-1">
            Đồng hành cùng Đại Pháp Sư Merlin và Cú Oliver! Ghép cổ tự, vẫy đũa thần niệm 12 đại thần chú nguyên tố và mở khóa Sách Cổ Grimoire!
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-100 border border-purple-300 text-purple-950 font-black text-base shrink-0">
          <Flame className="size-5 text-purple-600" />
          <span>Ngọn Tháp: {activeTowerDef.nameVi}</span>
        </div>
      </div>

      {/* Elemental Tower Selector */}
      <MagicTowerSelector
        towers={towers}
        selectedTower={selectedTower}
        completedSpellIds={progress.completedSpellIds}
        onSelectTower={handleSelectTower}
      />

      {/* Active Tower Info Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl bg-linear-to-r ${activeTowerDef.bgGradient} border-2 border-slate-200/80 shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-4 text-white`}
      >
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white font-black text-base border border-white/30">
            <Sparkles className="size-4 text-purple-300" />
            <span>Tháp Nguyên Tố: {activeTowerDef.elementEmoji}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-purple-200">
            {activeTowerDef.nameVi} ({activeTowerDef.nameEn})
          </h2>
          <p className="text-base sm:text-lg text-slate-200 font-medium max-w-2xl">
            {activeTowerDef.descriptionVi}
          </p>
        </div>

        <div className="text-left md:text-right">
          <span className="text-base font-bold text-slate-300 block">Thần chú đã luyện:</span>
          <span className="text-2xl font-black text-purple-300">
            {
              currentSpells.filter((s) => progress.completedSpellIds.includes(s.id))
                .length
            }
            /3 thần chú
          </span>
        </div>
      </div>

      {/* 3 Spells Cards for Current Elemental Tower */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentSpells.map((spell) => {
          const isCompleted = progress.completedSpellIds.includes(spell.id)

          return (
            <article
              key={spell.id}
              data-testid={`magic-spell-card-${spell.id}`}
              className="flex flex-col justify-between p-6 rounded-3xl bg-white border-4 border-slate-200 hover:border-purple-400 shadow-lg hover:shadow-xl transition-all space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header Status & Pronounce */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full font-black text-base border ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-purple-100 text-purple-950 border-purple-300'
                    }`}
                  >
                    {isCompleted ? '⭐ Đã Thành Thạo' : '✨ Chưa Khai Mở'}
                  </span>

                  <button
                    type="button"
                    onClick={() => speak(spell.challenge.targetWord)}
                    aria-label={`Nghe phát âm ${spell.nameEn}`}
                    className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                  >
                    <Volume2 className="size-5" />
                  </button>
                </div>

                {/* Spell Emoji & Info */}
                <div className="flex flex-col items-center text-center pt-2">
                  <div className="size-24 rounded-3xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-6xl shadow-inner group-hover:scale-110 transition-transform">
                    {spell.spellEmoji}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 pt-3 group-hover:text-purple-600 transition-colors">
                    {spell.nameVi}
                  </h3>
                  <p className="text-base font-bold text-purple-700">
                    {spell.nameEn} ({spell.challenge.targetWord})
                  </p>
                </div>

                {/* Phonics Target */}
                <p className="text-base text-slate-600 font-medium text-center">
                  🎯 {spell.challenge.phonicsFocus}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setActiveSpellModalId(spell.id)}
                aria-label={`Niệm phép thần chú ${spell.nameVi}`}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                  isCompleted
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    : 'bg-purple-500 hover:bg-purple-400 text-slate-950 ring-2 ring-purple-300 hover:scale-102 active:scale-98'
                }`}
              >
                <Wand2 className="size-5" />
                <span>{isCompleted ? 'Niệm Lại Thần Chú' : 'Bắt Đầu Niệm Phép'}</span>
              </button>
            </article>
          )
        })}
      </div>

      {/* Wand Incantation Modal */}
      {activeSpellForIncantation && (
        <WandIncantationModal
          spell={activeSpellForIncantation}
          isAlreadyCompleted={progress.completedSpellIds.includes(activeSpellForIncantation.id)}
          onSpellComplete={handleSpellComplete}
          onClose={() => setActiveSpellModalId(null)}
          playChimeSound={() => synthRef.current?.playChime()}
          playKickSound={() => synthRef.current?.playKick()}
        />
      )}

      {/* Ancient Grimoire Modal */}
      {isGrimoireOpen && (
        <AncientGrimoireModal
          completedSpellIds={progress.completedSpellIds}
          onClose={() => setIsGrimoireOpen(false)}
        />
      )}
    </div>
  )
}
