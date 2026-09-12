'use client'

import React from 'react'
import { useStudentSession } from '@/hooks/use-student-session'
import { Button } from '@/components/ui/button'
import { GraduationCap, User, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getStoredInventory, getShopItemById } from '@/lib/shop'

interface StudentBadgeProps {
  className?: string
}

export function StudentBadge({ className }: StudentBadgeProps) {
  const { session, isAnonymous, isLoaded, setOpen } = useStudentSession()

  if (!isLoaded) {
    return null
  }

  if (session) {
    const currentInventory = getStoredInventory(session.classCode, session.studentName)
    const equippedFrame = currentInventory.equippedFrameId
      ? getShopItemById(currentInventory.equippedFrameId)
      : undefined
    const equippedTitle = currentInventory.equippedTitleId
      ? getShopItemById(currentInventory.equippedTitleId)
      : undefined

    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
        className={cn(
          'group inline-flex items-center gap-2 px-3.5 py-1.5 h-auto rounded-2xl bg-amber-50 hover:bg-amber-100/80 border-2 border-amber-200 text-amber-900 font-medium shadow-xs transition-all hover:scale-102 active:scale-98',
          className
        )}
        title="Nhấn để đổi tên hoặc thông tin lớp học"
      >
        <div
          data-testid="student-avatar-frame"
          className={cn(
            'size-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs',
            equippedFrame?.cssClass
          )}
        >
          <GraduationCap className="size-3.5 stroke-[2.5]" />
        </div>
        <div className="flex flex-col text-left leading-tight min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1">
              <span className="truncate max-w-[120px] sm:max-w-[180px] xl:max-w-none xl:truncate-none">
                {session.studentName}
              </span>
              <Edit3 className="size-3 shrink-0 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </span>
            {equippedTitle && (
              <span
                data-testid="equipped-title-badge"
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-black px-1.5 py-0.5 rounded-full border shrink-0',
                  equippedTitle.titleBadgeClass || 'bg-amber-100 text-amber-800 border-amber-300'
                )}
              >
                <span>{equippedTitle.icon}</span>
                <span className="truncate max-w-[100px]">{equippedTitle.name}</span>
              </span>
            )}
          </div>
          {session.className && (
            <span className="text-xs font-semibold text-amber-700/80 truncate max-w-[120px] sm:max-w-[180px] xl:max-w-none xl:truncate-none">
              {session.className}
            </span>
          )}
        </div>
      </Button>
    )
  }

  if (isAnonymous) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 h-auto rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-600 font-medium text-xs shadow-xs transition-all hover:scale-102 active:scale-98',
          className
        )}
        title="Nhấn để nhập mã lớp và tên bé"
      >
        <User className="size-3.5 text-slate-500" />
        <span>Chơi tự do</span>
        <span className="text-xs text-amber-600 font-bold ml-0.5 underline">
          (Vào lớp)
        </span>
      </Button>
    )
  }

  return null
}
