// src/components/magic/WandIncantationModal.tsx
'use client'

import React, { useState } from 'react'
import { X, Volume2, Wand2, CheckCircle2, Sparkles, RotateCcw } from 'lucide-react'
import type { MagicSpell } from '@/types/phonics-magic'
import { useSpeech } from '@/hooks/useSpeech'

interface WandIncantationModalProps {
  spell: MagicSpell
  isAlreadyCompleted: boolean
  onSpellComplete: () => void
  onClose: () => void
  playChimeSound?: () => void
  playKickSound?: () => void
}

export function WandIncantationModal({
  spell,
  isAlreadyCompleted,
  onSpellComplete,
  onClose,
  playChimeSound,
  playKickSound,
}: WandIncantationModalProps) {
  const { speak } = useSpeech()
  const [selectedRuneIndices, setSelectedRuneIndices] = useState<number[]>([])
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isSpellCasting, setIsSpellCasting] = useState(false)

  const assembledWord = selectedRuneIndices
    .map((idx) => spell.challenge.runeScramble[idx])
    .join('')

  const handleSpeakSpell = () => {
    speak(`${spell.challenge.audioHint}! ${spell.challenge.vietnameseMeaning}`)
  }

  const handleToggleRune = (runeIndex: number) => {
    if (isAnswered) return
    if (selectedRuneIndices.includes(runeIndex)) {
      setSelectedRuneIndices((prev) => prev.filter((i) => i !== runeIndex))
    } else {
      setSelectedRuneIndices((prev) => [...prev, runeIndex])
    }
  }

  const handleResetRunes = () => {
    if (isAnswered) return
    setSelectedRuneIndices([])
  }

  const handleCastSpell = () => {
    if (isAnswered) return
    setIsAnswered(true)

    const correct = assembledWord.toUpperCase() === spell.challenge.targetWord.toUpperCase()
    setIsCorrect(correct)

    if (correct) {
      setIsSpellCasting(true)
      playChimeSound?.()
      setFeedbackMessage(
        `Thần chú khai mở thành công! Bạn nhận được +50 Pha Lê Ma Thuật 🔮`
      )
      speak(`Spell incanted! That is ${spell.challenge.targetWord}!`)

      setTimeout(() => {
        setIsSpellCasting(false)
        onSpellComplete()
      }, 1600)
    } else {
      playKickSound?.()
      setFeedbackMessage('Thần chú bị lệch tần số ma thuật! Hãy lắng nghe lại phát âm và ghép lại các cổ tự nhé!')
      speak('Adjust your incantation and try again!')

      setTimeout(() => {
        setIsAnswered(false)
        setFeedbackMessage(null)
        setSelectedRuneIndices([])
      }, 1800)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Điện thờ niệm phép ${spell.nameVi}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-4 border-purple-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
              <Wand2 className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-purple-400 flex items-center gap-2">
                <span>{spell.nameVi}</span>
                <span className="text-2xl">{spell.spellEmoji}</span>
              </h2>
              <p className="text-base text-slate-300 font-medium">
                {spell.incantationName} • Tiêu hao: {spell.manaCost} Mana
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng điện thờ niệm phép"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Magic Altar Screen */}
        <div
          className={`relative rounded-3xl bg-slate-950 border-2 border-dashed border-purple-400/60 p-6 flex flex-col items-center justify-center min-h-[190px] overflow-hidden transition-all ${
            isSpellCasting ? 'ring-4 ring-purple-500/60 shadow-purple-500/30 shadow-2xl' : ''
          }`}
        >
          <div className="text-center space-y-3">
            <span className="text-7xl block filter drop-shadow-md">{spell.spellEmoji}</span>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 text-purple-300 border border-slate-700 text-base font-bold">
              <span>{spell.descriptionVi}</span>
            </div>
          </div>
        </div>

        {/* Incantation Chamber */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-base font-bold text-purple-300 uppercase tracking-wide block">
                {spell.challenge.phonicsFocus}
              </span>
              <p className="text-lg sm:text-xl font-bold text-white">
                Ý nghĩa: {spell.challenge.vietnameseMeaning}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSpeakSpell}
              aria-label={`Nghe phát âm từ ${spell.challenge.targetWord}`}
              className="p-3 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              <Volume2 className="size-6" />
            </button>
          </div>

          {/* Assembled Rune Slot */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border-2 border-purple-500/40 min-h-[64px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-slate-400 mr-2">Thần Chú Đã Ghép:</span>
              {assembledWord ? (
                <span className="text-2xl font-black text-purple-300 tracking-wider">
                  {assembledWord}
                </span>
              ) : (
                <span className="text-base text-slate-500 italic">
                  Chạm các viên cổ tự bên dưới để niệm thần chú...
                </span>
              )}
            </div>

            {selectedRuneIndices.length > 0 && !isAnswered && (
              <button
                type="button"
                onClick={handleResetRunes}
                aria-label="Xóa thần chú đang ghép"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="size-5" />
              </button>
            )}
          </div>

          {/* Floating Rune Tiles Rack */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            {spell.challenge.runeScramble.map((chunk, idx) => {
              const isSelected = selectedRuneIndices.includes(idx)

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleToggleRune(idx)}
                  className={`px-5 py-3 rounded-2xl border-2 font-black text-lg sm:text-xl transition-all cursor-pointer shadow-md ${
                    isSelected
                      ? 'bg-purple-600 border-purple-300 text-white scale-95 opacity-50'
                      : 'bg-slate-700/90 hover:bg-purple-500/20 text-white border-slate-600 hover:border-purple-400 hover:scale-105'
                  }`}
                >
                  ✨ {chunk}
                </button>
              )
            })}
          </div>

          {/* Spell Cast Action Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isAnswered || selectedRuneIndices.length === 0}
              onClick={handleCastSpell}
              className={`w-full py-4 rounded-2xl font-black text-lg sm:text-xl transition-all flex items-center justify-center gap-2 ${
                isAnswered || selectedRuneIndices.length === 0
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 shadow-lg cursor-pointer hover:scale-[1.01] active:scale-98'
              }`}
            >
              <Wand2 className="size-6" />
              <span>Vẫy Đũa Niệm Phép Thần Chú</span>
            </button>
          </div>

          {/* Feedback Message */}
          {feedbackMessage && (
            <div
              className={`p-4 rounded-2xl border font-bold text-base flex items-center gap-2 ${
                isCorrect
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500 text-rose-200'
              }`}
            >
              <Sparkles className="size-5 shrink-0 text-purple-300" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {isAlreadyCompleted && !feedbackMessage && (
            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-200 font-bold text-base flex items-center gap-2">
              <CheckCircle2 className="size-5 text-purple-300 shrink-0" />
              <span>{spell.challenge.magicalLore}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
