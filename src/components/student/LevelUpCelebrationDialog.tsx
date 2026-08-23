'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useStudentSession } from '@/hooks/use-student-session'
import { Sparkles, PartyPopper, ArrowRight } from 'lucide-react'

export function LevelUpCelebrationDialog() {
  const { celebration, dismissCelebration } = useStudentSession()

  if (!celebration.show || !celebration.level) {
    return null
  }

  const { level } = celebration

  return (
    <Dialog open={celebration.show} onOpenChange={(open) => !open && dismissCelebration()}>
      <DialogContent
        data-testid="level-up-dialog"
        showCloseButton={false}
        className="sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-3 border-amber-300 dark:border-amber-500/50 shadow-2xl rounded-3xl p-6 sm:p-8 overflow-hidden text-center"
      >
        {/* Background glow & sparkles */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-amber-300/30 to-orange-400/30 rounded-full blur-2xl pointer-events-none" />

        <DialogHeader className="text-center sm:text-center items-center gap-3 relative z-10">
          {/* Animated Celebration Icon Container */}
          <div className="relative">
            <div className="size-20 sm:size-24 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/30 transform hover:scale-105 transition-transform duration-300 animate-bounce">
              <span className="text-4xl sm:text-5xl select-none" role="img" aria-label={level.title}>
                {level.badge}
              </span>
            </div>
            <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300 shadow-md">
              <PartyPopper className="size-5 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          <div>
            <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
              <span>Chúc mừng bé đã thăng cấp!</span>
              <Sparkles className="size-6 text-amber-500 fill-amber-400 animate-pulse" />
            </DialogTitle>
            <DialogDescription className="text-base sm:text-lg font-bold text-amber-800 dark:text-amber-300 mt-2">
              Bé đã đạt <span className="font-extrabold text-amber-900 dark:text-amber-200">Cấp độ {level.level}</span>: {level.title}!
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Level details & milestone badge */}
        <div className="my-4 p-4 rounded-2xl bg-amber-50/80 dark:bg-slate-800/80 border-2 border-amber-200/80 dark:border-amber-500/30 space-y-2 relative z-10">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Bé học rất chăm chỉ và xuất sắc! Hãy tiếp tục rèn luyện để mở khóa thêm nhiều huy hiệu mới nhé!
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200/70 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-xs font-bold">
            <span>Huy hiệu mới:</span>
            <span className="text-base">{level.badge}</span>
            <span>{level.title}</span>
          </div>
        </div>

        <DialogFooter className="mt-2 flex-col sm:flex-row gap-2 pt-2 border-t-0 relative z-10">
          <Button
            type="button"
            onClick={dismissCelebration}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base shadow-lg shadow-orange-500/25 h-13 sm:h-14 gap-2 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <span>Tuyệt vời! Tiếp tục</span>
            <ArrowRight className="size-5 stroke-[2.5]" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
