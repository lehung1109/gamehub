'use client'

import React from 'react'
import { StudentSessionProvider } from '@/hooks/use-student-session'
import { StudentJoinPopup } from '@/components/student/StudentJoinPopup'
import { StudentBadge } from '@/components/student/StudentBadge'
import { StudentProfileBadge } from '@/components/StudentProfileBadge'

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StudentSessionProvider>
      <div className="relative w-full flex flex-col min-h-full">
        <div className="w-full flex justify-end pb-2 gap-2">
          <StudentProfileBadge />
          <StudentBadge />
        </div>
        {children}
        <StudentJoinPopup />
      </div>
    </StudentSessionProvider>
  )
}
