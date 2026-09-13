'use client'

import React, { useState, useTransition } from 'react'
import { ParentAccessManager } from '@/components/admin/ParentAccessManager'
import {
  getClassParentsListAction,
  getClassAnnouncementsAction,
  createClassAnnouncementAction,
  deleteClassAnnouncementAction,
  regenerateStudentParentPinAction,
} from '@/app/actions/parent'
import type { ParentAccessInfo, ClassroomAnnouncement, CreateAnnouncementInput } from '@/types/parent'
import { School, Loader2 } from 'lucide-react'

interface ClassroomOption {
  id: string
  name: string
  code: string
}

interface ParentsClientContainerProps {
  classrooms: ClassroomOption[]
  initialClassroomId: string
  initialParents: ParentAccessInfo[]
  initialAnnouncements: (ClassroomAnnouncement & { acknowledgedCount: number })[]
}

export function ParentsClientContainer({
  classrooms,
  initialClassroomId,
  initialParents,
  initialAnnouncements,
}: ParentsClientContainerProps) {
  const [selectedClassroomId, setSelectedClassroomId] = useState(initialClassroomId)
  const [parents, setParents] = useState<ParentAccessInfo[]>(initialParents)
  const [announcements, setAnnouncements] = useState<(ClassroomAnnouncement & { acknowledgedCount: number })[]>(initialAnnouncements)
  const [isPending, startTransition] = useTransition()

  const selectedClass = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0]

  const handleClassChange = (newClassId: string) => {
    setSelectedClassroomId(newClassId)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('classId', newClassId)
      window.history.replaceState(null, '', url.toString())
    }
    startTransition(async () => {
      const [parentRes, annRes] = await Promise.all([
        getClassParentsListAction(newClassId),
        getClassAnnouncementsAction(newClassId),
      ])
      if (parentRes.success && parentRes.list) {
        setParents(parentRes.list)
      }
      if (annRes.success && annRes.announcements) {
        setAnnouncements(annRes.announcements)
      }
    })
  }

  const handlePublish = async (input: CreateAnnouncementInput) => {
    return await createClassAnnouncementAction(input)
  }

  const handleDelete = async (announcementId: string) => {
    return await deleteClassAnnouncementAction(announcementId)
  }

  const handleRegenerate = async (studentId: string) => {
    const res = await regenerateStudentParentPinAction(studentId, selectedClassroomId)
    if (res.success && res.accessInfo) {
      return { success: true, newPin: res.accessInfo.accessPin }
    }
    return { success: false, error: res.error }
  }

  return (
    <div className="space-y-6">
      {/* Class Selector Bar */}
      {classrooms.length > 1 && (
        <div className="bg-card border-2 border-border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <School className="size-5 text-primary" />
            <span>Chọn lớp học:</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedClassroomId}
              onChange={(e) => handleClassChange(e.target.value)}
              disabled={isPending}
              className="w-full sm:w-72 px-4 py-2.5 rounded-xl border-2 border-input bg-background text-foreground text-base font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.code})
                </option>
              ))}
            </select>

            {isPending && <Loader2 className="size-5 animate-spin text-primary shrink-0" />}
          </div>
        </div>
      )}

      {/* Main Access Manager */}
      {selectedClass && (
        <ParentAccessManager
          key={selectedClass.id}
          classroomId={selectedClass.id}
          classroomName={selectedClass.name}
          classCode={selectedClass.code}
          parents={parents}
          announcements={announcements}
          onPublishAnnouncement={handlePublish}
          onDeleteAnnouncement={handleDelete}
          onRegeneratePin={handleRegenerate}
        />
      )}
    </div>
  )
}
