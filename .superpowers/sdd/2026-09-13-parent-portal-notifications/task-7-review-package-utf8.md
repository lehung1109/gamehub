diff --git a/src/app/actions/parent.ts b/src/app/actions/parent.ts
index 4b4982a..6ff8b73 100644
--- a/src/app/actions/parent.ts
+++ b/src/app/actions/parent.ts
@@ -725,3 +725,96 @@ export async function regenerateStudentParentPinAction(
   }
 }
 
+/**
+ * Fetches all announcements for a classroom with acknowledged counters for teachers
+ */
+export async function getClassAnnouncementsAction(
+  classroomId: string
+): Promise<{
+  success: boolean
+  announcements?: (ClassroomAnnouncement & { acknowledgedCount: number })[]
+  error?: string
+}> {
+  try {
+    if (!classroomId?.trim()) {
+      return { success: false, error: 'M├ú lß╗¢p hß╗ìc kh├┤ng hß╗úp lß╗ç' }
+    }
+
+    const supabase = await createClient()
+    const {
+      data: { user },
+    } = await supabase.auth.getUser()
+
+    if (!user) {
+      return { success: false, error: 'Bß║ín cß║ºn ─æ─âng nhß║¡p' }
+    }
+
+    // Verify ownership
+    const { data: classroom, error: classErr } = await supabase
+      .from('classrooms')
+      .select('id')
+      .eq('id', classroomId.trim())
+      .eq('teacher_id', user.id)
+      .maybeSingle()
+
+    if (classErr || !classroom) {
+      return { success: false, error: 'Kh├┤ng t├¼m thß║Ñy lß╗¢p hß╗ìc hoß║╖c kh├┤ng c├│ quyß╗ün truy cß║¡p' }
+    }
+
+    const adminSupabase = createAdminClient()
+    const { data: announcements, error: annErr } = await adminSupabase
+      .from('classroom_announcements')
+      .select('*')
+      .eq('classroom_id', classroom.id)
+      .order('created_at', { ascending: false })
+
+    if (annErr) {
+      return { success: false, error: 'Lß╗ùi khi tß║úi th├┤ng b├ío lß╗¢p hß╗ìc' }
+    }
+
+    // Fetch acknowledgment counts
+    const annIds = (announcements || []).map((a: { id: string }) => a.id)
+    const countMap = new Map<string, number>()
+
+    if (annIds.length > 0) {
+      const { data: acks } = await adminSupabase
+        .from('announcement_acknowledgments')
+        .select('announcement_id')
+        .in('announcement_id', annIds)
+
+      for (const ack of acks || []) {
+        countMap.set(ack.announcement_id, (countMap.get(ack.announcement_id) || 0) + 1)
+      }
+    }
+
+    const formatted = (announcements || []).map((ann: {
+      id: string
+      classroom_id: string
+      teacher_id: string
+      student_id: string | null
+      title: string
+      content: string
+      category: string
+      priority: string
+      created_at: string
+    }) => ({
+      id: ann.id,
+      classroomId: ann.classroom_id,
+      teacherId: ann.teacher_id,
+      studentId: ann.student_id,
+      title: ann.title,
+      content: ann.content,
+      category: ann.category as AnnouncementCategory,
+      priority: ann.priority as AnnouncementPriority,
+      createdAt: ann.created_at,
+      acknowledged: false,
+      acknowledgedCount: countMap.get(ann.id) || 0,
+    }))
+
+    return { success: true, announcements: formatted }
+  } catch (err: unknown) {
+    console.error('[getClassAnnouncementsAction] Error:', err)
+    return { success: false, error: 'Lß╗ùi hß╗ç thß╗æng khi tß║úi th├┤ng b├ío' }
+  }
+}
+
diff --git a/src/app/admin/dashboard/page.tsx b/src/app/admin/dashboard/page.tsx
index 15eee3a..d617808 100644
--- a/src/app/admin/dashboard/page.tsx
+++ b/src/app/admin/dashboard/page.tsx
@@ -8,7 +8,7 @@ import type { GameConfig } from '@/types/config'
 import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
 import { buttonVariants } from '@/components/ui/button'
 import { Badge } from '@/components/ui/badge'
-import { Plus, Settings, Gamepad2, Sparkles, Layers, BookOpen, Swords } from 'lucide-react'
+import { Plus, Settings, Gamepad2, Sparkles, Layers, BookOpen, Swords, Users } from 'lucide-react'
 import { isValidGameId } from '@/lib/game-config-schema'
 
 export const dynamic = 'force-dynamic'
@@ -76,7 +76,7 @@ export default async function AdminDashboardPage() {
       </div>
       
       {/* Quick Access */}
-      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
+      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
         <Link href="/admin/dashboard/classes" className="group">
           <Card className="border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-none">
             <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
@@ -96,6 +96,25 @@ export default async function AdminDashboardPage() {
           </Card>
         </Link>
 
+        <Link href="/admin/parents" className="group">
+          <Card className="border-teal-100 bg-teal-50/50 hover:bg-teal-50 hover:border-teal-200 transition-colors shadow-none">
+            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
+              <div className="flex items-center gap-3">
+                <div className="size-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
+                  <Users className="size-5" />
+                </div>
+                <div>
+                  <CardTitle className="text-base text-teal-900">Quß║ún l├╜ Phß╗Ñ huynh</CardTitle>
+                  <CardDescription className="text-teal-700/70 text-xs mt-0.5">Cß║Ñp PIN & th├┤ng b├ío dß║╖n d├▓</CardDescription>
+                </div>
+              </div>
+              <div className="text-teal-400 group-hover:text-teal-600 transition-colors">
+                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
+              </div>
+            </CardHeader>
+          </Card>
+        </Link>
+
         <Link href="/admin/word-bank" className="group">
           <Card className="border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors shadow-none">
             <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
diff --git a/src/app/admin/layout.tsx b/src/app/admin/layout.tsx
index 32da9f7..302b29d 100644
--- a/src/app/admin/layout.tsx
+++ b/src/app/admin/layout.tsx
@@ -5,7 +5,7 @@ import { redirect } from 'next/navigation'
 import { createClient } from '@/lib/supabase/server'
 import { logout } from '@/app/actions/auth'
 import { Button } from '@/components/ui/button'
-import { LayoutDashboard, UserCircle, LogOut, ExternalLink, Gamepad2, School, BookOpen, Sparkles, Swords } from 'lucide-react'
+import { LayoutDashboard, UserCircle, LogOut, ExternalLink, Gamepad2, School, BookOpen, Sparkles, Swords, Users } from 'lucide-react'
 
 export const metadata = {
   title: 'GameHub Admin | Quß║ún trß╗ï',
@@ -57,6 +57,13 @@ export default async function AdminLayout({
                 <School className="size-4" />
                 <span>Lß╗¢p hß╗ìc</span>
               </Link>
+              <Link
+                href="/admin/parents"
+                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
+              >
+                <Users className="size-4 text-emerald-600" />
+                <span>Phß╗Ñ huynh</span>
+              </Link>
               <Link
                 href="/admin/word-bank"
                 className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
diff --git a/src/app/admin/parents/page.tsx b/src/app/admin/parents/page.tsx
new file mode 100644
index 0000000..b039b64
--- /dev/null
+++ b/src/app/admin/parents/page.tsx
@@ -0,0 +1,93 @@
+// src/app/admin/parents/page.tsx
+
+import React from 'react'
+import Link from 'next/link'
+import { redirect } from 'next/navigation'
+import { createClient } from '@/lib/supabase/server'
+import { getClassParentsListAction, getClassAnnouncementsAction } from '@/app/actions/parent'
+import { ParentsClientContainer } from '@/components/admin/ParentsClientContainer'
+import { School, Plus, Users, HeartHandshake } from 'lucide-react'
+
+export const dynamic = 'force-dynamic'
+
+export const metadata = {
+  title: 'Quß║ún L├╜ Phß╗Ñ Huynh & Bß║úng Th├┤ng B├ío | GameHub Admin',
+  description: 'Quß║ún l├╜ m├ú PIN, li├¬n kß║┐t phß╗Ñ huynh v├á ─æ─âng tß║úi th├┤ng b├ío dß║╖n d├▓ cho lß╗¢p hß╗ìc.',
+}
+
+interface AdminParentsPageProps {
+  searchParams: Promise<{ classId?: string }>
+}
+
+export default async function AdminParentsPage({ searchParams }: AdminParentsPageProps) {
+  const supabase = await createClient()
+  const {
+    data: { user },
+  } = await supabase.auth.getUser()
+
+  if (!user) {
+    redirect('/login')
+  }
+
+  const resolvedSearchParams = await searchParams
+  const selectedParamClassId = resolvedSearchParams?.classId
+
+  // Fetch teacher's active classrooms
+  const { data: classrooms } = await supabase
+    .from('classrooms')
+    .select('id, name, code')
+    .eq('teacher_id', user.id)
+    .order('created_at', { ascending: false })
+
+  if (!classrooms || classrooms.length === 0) {
+    return (
+      <div className="max-w-3xl mx-auto py-12 text-center space-y-6">
+        <div className="size-20 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-4xl">
+          <School className="size-10" />
+        </div>
+
+        <div className="space-y-2">
+          <h1 className="text-3xl font-black text-slate-900">
+            Ch╞░a c├│ lß╗¢p hß╗ìc n├áo ─æ╞░ß╗úc tß║ío
+          </h1>
+          <p className="text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
+            ─Éß╗â quß║ún l├╜ m├ú PIN phß╗Ñ huynh v├á gß╗¡i th├┤ng b├ío, Thß║ºy/C├┤ cß║ºn tß║ío ├¡t nhß║Ñt mß╗Öt lß╗¢p hß╗ìc v├á th├¬m hß╗ìc sinh v├áo lß╗¢p.
+          </p>
+        </div>
+
+        <div>
+          <Link
+            href="/admin/dashboard/classes"
+            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-base hover:bg-indigo-700 shadow-md transition-colors"
+          >
+            <Plus className="size-5" />
+            <span>Tß║ío lß╗¢p hß╗ìc mß╗¢i ngay</span>
+          </Link>
+        </div>
+      </div>
+    )
+  }
+
+  const currentClass =
+    classrooms.find((c) => c.id === selectedParamClassId) || classrooms[0]
+
+  // Fetch parent access & announcements for this classroom
+  const [parentDataResult, announcementsResult] = await Promise.all([
+    getClassParentsListAction(currentClass.id),
+    getClassAnnouncementsAction(currentClass.id),
+  ])
+
+  const parents = parentDataResult.success && parentDataResult.list ? parentDataResult.list : []
+  const announcements = announcementsResult.success && announcementsResult.announcements ? announcementsResult.announcements : []
+
+  return (
+    <div className="space-y-8 max-w-7xl mx-auto">
+      <ParentsClientContainer
+        classrooms={classrooms}
+        initialClassroomId={currentClass.id}
+        initialParents={parents}
+        initialAnnouncements={announcements}
+      />
+    </div>
+  )
+}
diff --git a/src/components/admin/ParentAccessManager.tsx b/src/components/admin/ParentAccessManager.tsx
new file mode 100644
index 0000000..a21f44d
--- /dev/null
+++ b/src/components/admin/ParentAccessManager.tsx
@@ -0,0 +1,514 @@
+'use client'
+
+import React, { useState } from 'react'
+import type {
+  ParentAccessInfo,
+  ClassroomAnnouncement,
+  AnnouncementCategory,
+  AnnouncementPriority,
+  CreateAnnouncementInput,
+} from '@/types/parent'
+import {
+  Users,
+  KeyRound,
+  Link2,
+  Copy,
+  Check,
+  RefreshCw,
+  Plus,
+  Trash2,
+  Bell,
+  CheckCircle2,
+  AlertCircle,
+  X,
+  MessageSquare,
+  Sparkles,
+} from 'lucide-react'
+
+interface ParentAccessManagerProps {
+  classroomId: string
+  classroomName: string
+  classCode: string
+  parents: ParentAccessInfo[]
+  announcements: (ClassroomAnnouncement & { acknowledgedCount: number })[]
+  onPublishAnnouncement?: (input: CreateAnnouncementInput) => Promise<{ success: boolean; error?: string }>
+  onDeleteAnnouncement?: (announcementId: string) => Promise<{ success: boolean; error?: string }>
+  onRegeneratePin?: (studentId: string) => Promise<{ success: boolean; newPin?: string; error?: string }>
+}
+
+const CATEGORY_OPTIONS: { value: AnnouncementCategory; label: string }[] = [
+  { value: 'homework', label: '≡ƒô¥ B├ái tß║¡p vß╗ü nh├á' },
+  { value: 'reminder', label: 'ΓÅ░ Nhß║»c nhß╗ƒ hß╗ìc tß║¡p' },
+  { value: 'kudos', label: '≡ƒîƒ Khen th╞░ß╗ƒng / Biß╗âu d╞░╞íng' },
+  { value: 'announcement', label: '≡ƒôó Th├┤ng b├ío chung' },
+]
+
+export function ParentAccessManager({
+  classroomId,
+  classroomName,
+  classCode,
+  parents: initialParents,
+  announcements: initialAnnouncements,
+  onPublishAnnouncement,
+  onDeleteAnnouncement,
+  onRegeneratePin,
+}: ParentAccessManagerProps) {
+  const [parents, setParents] = useState<ParentAccessInfo[]>(initialParents)
+  const [announcements, setAnnouncements] = useState<(ClassroomAnnouncement & { acknowledgedCount: number })[]>(initialAnnouncements)
+  const [copiedId, setCopiedId] = useState<string | null>(null)
+  const [isModalOpen, setIsModalOpen] = useState(false)
+  const [isSubmitting, setIsSubmitting] = useState(false)
+  const [regeneratingStudentId, setRegeneratingStudentId] = useState<string | null>(null)
+  const [formError, setFormError] = useState<string | null>(null)
+
+  // Form State
+  const [title, setTitle] = useState('')
+  const [content, setContent] = useState('')
+  const [category, setCategory] = useState<AnnouncementCategory>('announcement')
+  const [priority, setPriority] = useState<AnnouncementPriority>('normal')
+  const [targetStudentId, setTargetStudentId] = useState<string>('')
+
+  const handleCopyLink = async (parent: ParentAccessInfo) => {
+    const origin = typeof window !== 'undefined' ? window.location.origin : ''
+    const url = `${origin}/parent/${parent.accessToken}`
+    await navigator.clipboard.writeText(url)
+    setCopiedId(parent.studentId)
+    setTimeout(() => setCopiedId(null), 2500)
+  }
+
+  const handleRegenerate = async (studentId: string) => {
+    if (!onRegeneratePin) return
+    setRegeneratingStudentId(studentId)
+    try {
+      const res = await onRegeneratePin(studentId)
+      if (res.success && res.newPin) {
+        setParents((prev) =>
+          prev.map((p) => (p.studentId === studentId ? { ...p, accessPin: res.newPin! } : p))
+        )
+      }
+    } finally {
+      setRegeneratingStudentId(null)
+    }
+  }
+
+  const handlePublish = async (e: React.FormEvent) => {
+    e.preventDefault()
+    if (!title.trim() || !content.trim()) {
+      setFormError('Vui l├▓ng nhß║¡p ─æß║ºy ─æß╗º ti├¬u ─æß╗ü v├á nß╗Öi dung th├┤ng b├ío.')
+      return
+    }
+
+    if (!onPublishAnnouncement) return
+
+    setIsSubmitting(true)
+    setFormError(null)
+
+    try {
+      const input: CreateAnnouncementInput = {
+        classroomId,
+        title: title.trim(),
+        content: content.trim(),
+        category,
+        priority,
+        studentId: targetStudentId ? targetStudentId : undefined,
+      }
+
+      const res = await onPublishAnnouncement(input)
+      if (res.success) {
+        // Optimistically add to list
+        const newAnnouncement: ClassroomAnnouncement & { acknowledgedCount: number } = {
+          id: `ann-${Date.now()}`,
+          classroomId,
+          teacherId: '',
+          studentId: targetStudentId ? targetStudentId : null,
+          title: title.trim(),
+          content: content.trim(),
+          category,
+          priority,
+          createdAt: new Date().toISOString(),
+          acknowledged: false,
+          acknowledgedCount: 0,
+        }
+        setAnnouncements([newAnnouncement, ...announcements])
+        setTitle('')
+        setContent('')
+        setCategory('announcement')
+        setPriority('normal')
+        setTargetStudentId('')
+        setIsModalOpen(false)
+      } else {
+        setFormError(res.error || '─É├ú xß║úy ra lß╗ùi khi tß║ío th├┤ng b├ío.')
+      }
+    } catch {
+      setFormError('Lß╗ùi kß║┐t nß╗æi khi gß╗¡i th├┤ng b├ío.')
+    } finally {
+      setIsSubmitting(false)
+    }
+  }
+
+  const handleDelete = async (announcementId: string) => {
+    if (!onDeleteAnnouncement) return
+    const confirmed = window.confirm('Thß║ºy/C├┤ c├│ chß║»c chß║»n muß╗æn x├│a th├┤ng b├ío n├áy kh├┤ng?')
+    if (!confirmed) return
+
+    const res = await onDeleteAnnouncement(announcementId)
+    if (res.success) {
+      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId))
+    }
+  }
+
+  return (
+    <div className="space-y-8">
+      {/* Header Bar */}
+      <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
+        <div className="space-y-1">
+          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-base border border-primary/20">
+            <Users className="size-5" />
+            <span>{classroomName}</span>
+            <span>({classCode})</span>
+          </div>
+          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
+            Quß║ún L├╜ Phß╗Ñ Huynh & Bß║úng Th├┤ng B├ío
+          </h1>
+          <p className="text-base text-muted-foreground">
+            Cung cß║Ñp m├ú PIN, link truy cß║¡p cho phß╗Ñ huynh v├á ─æ─âng tß║úi c├íc th├┤ng b├ío gß╗¡i ─æß║┐n gia ─æ├¼nh.
+          </p>
+        </div>
+
+        <button
+          type="button"
+          onClick={() => setIsModalOpen(true)}
+          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 shadow-md transition-all shrink-0 cursor-pointer"
+        >
+          <Plus className="size-5" />
+          <span>Tß║ío th├┤ng b├ío mß╗¢i</span>
+        </button>
+      </div>
+
+      {/* Announcements Section */}
+      <div className="space-y-4">
+        <div className="flex items-center justify-between">
+          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
+            <Bell className="size-6 text-indigo-600" />
+            <span>Th├┤ng B├ío ─É├ú Gß╗¡i Trong Lß╗¢p ({announcements.length})</span>
+          </h2>
+        </div>
+
+        {announcements.length === 0 ? (
+          <div className="bg-card border-2 border-border rounded-2xl p-8 text-center space-y-2">
+            <span className="text-4xl block" aria-hidden="true">≡ƒô¼</span>
+            <h3 className="text-xl font-bold text-foreground">Ch╞░a c├│ th├┤ng b├ío n├áo</h3>
+            <p className="text-base text-muted-foreground">
+              Bß║Ñm n├║t &quot;Tß║ío th├┤ng b├ío mß╗¢i&quot; ─æß╗â gß╗¡i b├ái tß║¡p hoß║╖c lß╗¥i khen ─æß║┐n phß╗Ñ huynh.
+            </p>
+          </div>
+        ) : (
+          <div className="grid grid-cols-1 gap-4">
+            {announcements.map((ann) => {
+              const targetStudent = ann.studentId
+                ? parents.find((p) => p.studentId === ann.studentId)?.studentName
+                : null
+
+              return (
+                <div
+                  key={ann.id}
+                  className="bg-card border-2 border-border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
+                >
+                  <div className="space-y-2 flex-1">
+                    <div className="flex flex-wrap items-center gap-2">
+                      <span className="px-3 py-1 rounded-full bg-muted font-bold text-base border border-border">
+                        {CATEGORY_OPTIONS.find((c) => c.value === ann.category)?.label || 'Th├┤ng b├ío'}
+                      </span>
+                      {ann.priority === 'urgent' && (
+                        <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-base border border-rose-300">
+                          ≡ƒÜ¿ Khß║⌐n cß║Ñp
+                        </span>
+                      )}
+                      {ann.priority === 'important' && (
+                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-base border border-amber-300">
+                          ΓÜí Quan trß╗ìng
+                        </span>
+                      )}
+                      {targetStudent && (
+                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-base border border-blue-300">
+                          Gß╗¡i ri├¬ng: {targetStudent}
+                        </span>
+                      )}
+                    </div>
+
+                    <h3 className="text-xl font-bold text-foreground">{ann.title}</h3>
+                    <p className="text-base text-foreground/90 whitespace-pre-line leading-relaxed">
+                      {ann.content}
+                    </p>
+
+                    <div className="flex flex-wrap items-center gap-4 text-base text-muted-foreground pt-1">
+                      <span>
+                        Ng├áy ─æ─âng:{' '}
+                        {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString('vi-VN') : 'Vß╗½a xong'}
+                      </span>
+                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
+                        {ann.acknowledgedCount} / {parents.length} phß╗Ñ huynh ─æ├ú ─æß╗ìc
+                      </span>
+                    </div>
+                  </div>
+
+                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
+                    <button
+                      type="button"
+                      onClick={() => handleDelete(ann.id)}
+                      className="p-3 rounded-xl border-2 border-border text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
+                      title="X├│a th├┤ng b├ío"
+                    >
+                      <Trash2 className="size-5" />
+                    </button>
+                  </div>
+                </div>
+              )
+            })}
+          </div>
+        )}
+      </div>
+
+      {/* Parent Roster Table */}
+      <div className="space-y-4">
+        <div className="flex items-center justify-between">
+          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
+            <KeyRound className="size-6 text-amber-600" />
+            <span>Danh S├ích M├ú PIN & Li├¬n Kß║┐t Phß╗Ñ Huynh ({parents.length})</span>
+          </h2>
+        </div>
+
+        <div className="bg-card border-2 border-border rounded-3xl overflow-hidden shadow-sm">
+          <div className="overflow-x-auto">
+            <table className="w-full text-left border-collapse">
+              <thead>
+                <tr className="border-b-2 border-border bg-muted/60">
+                  <th className="py-4 px-6 text-base font-bold text-foreground">T├¬n Hß╗ìc Sinh</th>
+                  <th className="py-4 px-6 text-base font-bold text-foreground">M├ú PIN Bß║úo Mß║¡t</th>
+                  <th className="py-4 px-6 text-base font-bold text-foreground">Li├¬n Kß║┐t Nhanh</th>
+                  <th className="py-4 px-6 text-base font-bold text-foreground">Lß║ºn Truy Cß║¡p Cuß╗æi</th>
+                  <th className="py-4 px-6 text-base font-bold text-foreground text-right">Thao T├íc</th>
+                </tr>
+              </thead>
+              <tbody className="divide-y divide-border">
+                {parents.map((parent) => (
+                  <tr key={parent.studentId} className="hover:bg-muted/30 transition-colors">
+                    <td className="py-4 px-6 text-base font-bold text-foreground">
+                      {parent.studentName}
+                    </td>
+                    <td className="py-4 px-6 text-base">
+                      <span className="font-mono font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-xl border border-amber-300">
+                        {parent.accessPin}
+                      </span>
+                    </td>
+                    <td className="py-4 px-6 text-base">
+                      <button
+                        type="button"
+                        onClick={() => handleCopyLink(parent)}
+                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-base transition-all cursor-pointer ${
+                          copiedId === parent.studentId
+                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
+                            : 'bg-background hover:bg-muted text-foreground border-border'
+                        }`}
+                      >
+                        {copiedId === parent.studentId ? (
+                          <>
+                            <Check className="size-4" />
+                            <span>─É├ú ch├⌐p link!</span>
+                          </>
+                        ) : (
+                          <>
+                            <Copy className="size-4" />
+                            <span>Sao ch├⌐p link</span>
+                          </>
+                        )}
+                      </button>
+                    </td>
+                    <td className="py-4 px-6 text-base text-muted-foreground">
+                      {parent.lastAccessedAt
+                        ? new Date(parent.lastAccessedAt).toLocaleDateString('vi-VN', {
+                            day: '2-digit',
+                            month: '2-digit',
+                            year: 'numeric',
+                            hour: '2-digit',
+                            minute: '2-digit',
+                          })
+                        : 'Ch╞░a truy cß║¡p'}
+                    </td>
+                    <td className="py-4 px-6 text-base text-right">
+                      <button
+                        type="button"
+                        disabled={regeneratingStudentId === parent.studentId}
+                        onClick={() => handleRegenerate(parent.studentId)}
+                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
+                        title="Tß║ío lß║íi m├ú PIN mß╗¢i cho phß╗Ñ huynh"
+                      >
+                        <RefreshCw
+                          className={`size-4 ${
+                            regeneratingStudentId === parent.studentId ? 'animate-spin' : ''
+                          }`}
+                        />
+                        <span>Tß║ío lß║íi PIN</span>
+                      </button>
+                    </td>
+                  </tr>
+                ))}
+              </tbody>
+            </table>
+          </div>
+        </div>
+      </div>
+
+      {/* Compose Announcement Modal */}
+      {isModalOpen && (
+        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
+          <div className="bg-card border-2 border-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6">
+            <div className="flex items-center justify-between border-b border-border pb-4">
+              <div className="flex items-center gap-3">
+                <span className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
+                  ≡ƒôó
+                </span>
+                <h3 className="text-2xl font-bold text-foreground">Tß║ío Th├┤ng B├ío Mß╗¢i</h3>
+              </div>
+              <button
+                type="button"
+                onClick={() => setIsModalOpen(false)}
+                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
+              >
+                <X className="size-6" />
+              </button>
+            </div>
+
+            {formError && (
+              <div
+                role="alert"
+                className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-3"
+              >
+                <AlertCircle className="size-5 shrink-0" />
+                <span className="text-base font-semibold">{formError}</span>
+              </div>
+            )}
+
+            <form onSubmit={handlePublish} className="space-y-4">
+              <div>
+                <label
+                  htmlFor="announcementTitle"
+                  className="block text-base font-bold text-foreground mb-2"
+                >
+                  Ti├¬u ─æß╗ü th├┤ng b├ío
+                </label>
+                <input
+                  id="announcementTitle"
+                  type="text"
+                  placeholder="VD: ├ön tß║¡p chuß║⌐n bß╗ï kiß╗âm tra giß╗»a kß╗│..."
+                  value={title}
+                  onChange={(e) => setTitle(e.target.value)}
+                  className="w-full px-4 py-3 rounded-2xl border-2 border-input bg-background text-foreground text-base font-medium focus:outline-none focus:border-primary transition-colors"
+                />
+              </div>
+
+              <div>
+                <label
+                  htmlFor="announcementContent"
+                  className="block text-base font-bold text-foreground mb-2"
+                >
+                  Nß╗Öi dung th├┤ng b├ío
+                </label>
+                <textarea
+                  id="announcementContent"
+                  rows={4}
+                  placeholder="Nhß║¡p nß╗Öi dung chi tiß║┐t b├ái hß╗ìc, l╞░u ├╜ dß║╖n d├▓..."
+                  value={content}
+                  onChange={(e) => setContent(e.target.value)}
+                  className="w-full px-4 py-3 rounded-2xl border-2 border-input bg-background text-foreground text-base font-medium focus:outline-none focus:border-primary transition-colors resize-none"
+                />
+              </div>
+
+              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
+                <div>
+                  <label
+                    htmlFor="announcementCategory"
+                    className="block text-base font-bold text-foreground mb-2"
+                  >
+                    Ph├ón loß║íi
+                  </label>
+                  <select
+                    id="announcementCategory"
+                    value={category}
+                    onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
+                    className="w-full px-4 py-3 rounded-2xl border-2 border-input bg-background text-foreground text-base font-medium focus:outline-none focus:border-primary transition-colors"
+                  >
+                    {CATEGORY_OPTIONS.map((opt) => (
+                      <option key={opt.value} value={opt.value}>
+                        {opt.label}
+                      </option>
+                    ))}
+                  </select>
+                </div>
+
+                <div>
+                  <label
+                    htmlFor="announcementPriority"
+                    className="block text-base font-bold text-foreground mb-2"
+                  >
+                    Mß╗⌐c ─æß╗Ö ╞░u ti├¬n
+                  </label>
+                  <select
+                    id="announcementPriority"
+                    value={priority}
+                    onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
+                    className="w-full px-4 py-3 rounded-2xl border-2 border-input bg-background text-foreground text-base font-medium focus:outline-none focus:border-primary transition-colors"
+                  >
+                    <option value="normal">B├¼nh th╞░ß╗¥ng</option>
+                    <option value="important">Quan trß╗ìng</option>
+                    <option value="urgent">Khß║⌐n cß║Ñp</option>
+                  </select>
+                </div>
+              </div>
+
+              <div>
+                <label
+                  htmlFor="targetStudent"
+                  className="block text-base font-bold text-foreground mb-2"
+                >
+                  ─Éß╗æi t╞░ß╗úng nhß║¡n
+                </label>
+                <select
+                  id="targetStudent"
+                  value={targetStudentId}
+                  onChange={(e) => setTargetStudentId(e.target.value)}
+                  className="w-full px-4 py-3 rounded-2xl border-2 border-input bg-background text-foreground text-base font-medium focus:outline-none focus:border-primary transition-colors"
+                >
+                  <option value="">Tß║Ñt cß║ú hß╗ìc sinh trong lß╗¢p ({parents.length})</option>
+                  {parents.map((p) => (
+                    <option key={p.studentId} value={p.studentId}>
+                      Chß╗ë gß╗¡i cho: {p.studentName}
+                    </option>
+                  ))}
+                </select>
+              </div>
+
+              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
+                <button
+                  type="button"
+                  onClick={() => setIsModalOpen(false)}
+                  className="px-5 py-3 rounded-2xl border-2 border-border font-bold text-base hover:bg-muted transition-colors cursor-pointer"
+                >
+                  Hß╗ºy bß╗Å
+                </button>
+
+                <button
+                  type="submit"
+                  disabled={isSubmitting}
+                  className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
+                >
+                  {isSubmitting ? '─Éang gß╗¡i...' : 'Gß╗¡i th├┤ng b├ío'}
+                </button>
+              </div>
+            </form>
+          </div>
+        </div>
+      )}
+    </div>
+  )
+}
diff --git a/src/components/admin/ParentsClientContainer.tsx b/src/components/admin/ParentsClientContainer.tsx
new file mode 100644
index 0000000..bf25250
--- /dev/null
+++ b/src/components/admin/ParentsClientContainer.tsx
@@ -0,0 +1,118 @@
+'use client'
+
+import React, { useState, useTransition } from 'react'
+import { ParentAccessManager } from '@/components/admin/ParentAccessManager'
+import {
+  getClassParentsListAction,
+  getClassAnnouncementsAction,
+  createClassAnnouncementAction,
+  deleteClassAnnouncementAction,
+  regenerateStudentParentPinAction,
+} from '@/app/actions/parent'
+import type { ParentAccessInfo, ClassroomAnnouncement, CreateAnnouncementInput } from '@/types/parent'
+import { School, Loader2 } from 'lucide-react'
+
+interface ClassroomOption {
+  id: string
+  name: string
+  code: string
+}
+
+interface ParentsClientContainerProps {
+  classrooms: ClassroomOption[]
+  initialClassroomId: string
+  initialParents: ParentAccessInfo[]
+  initialAnnouncements: (ClassroomAnnouncement & { acknowledgedCount: number })[]
+}
+
+export function ParentsClientContainer({
+  classrooms,
+  initialClassroomId,
+  initialParents,
+  initialAnnouncements,
+}: ParentsClientContainerProps) {
+  const [selectedClassroomId, setSelectedClassroomId] = useState(initialClassroomId)
+  const [parents, setParents] = useState<ParentAccessInfo[]>(initialParents)
+  const [announcements, setAnnouncements] = useState<(ClassroomAnnouncement & { acknowledgedCount: number })[]>(initialAnnouncements)
+  const [isPending, startTransition] = useTransition()
+
+  const selectedClass = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0]
+
+  const handleClassChange = (newClassId: string) => {
+    setSelectedClassroomId(newClassId)
+    startTransition(async () => {
+      const [parentRes, annRes] = await Promise.all([
+        getClassParentsListAction(newClassId),
+        getClassAnnouncementsAction(newClassId),
+      ])
+      if (parentRes.success && parentRes.list) {
+        setParents(parentRes.list)
+      }
+      if (annRes.success && annRes.announcements) {
+        setAnnouncements(annRes.announcements)
+      }
+    })
+  }
+
+  const handlePublish = async (input: CreateAnnouncementInput) => {
+    return await createClassAnnouncementAction(input)
+  }
+
+  const handleDelete = async (announcementId: string) => {
+    return await deleteClassAnnouncementAction(announcementId)
+  }
+
+  const handleRegenerate = async (studentId: string) => {
+    const res = await regenerateStudentParentPinAction(studentId, selectedClassroomId)
+    if (res.success && res.accessInfo) {
+      return { success: true, newPin: res.accessInfo.accessPin }
+    }
+    return { success: false, error: res.error }
+  }
+
+  return (
+    <div className="space-y-6">
+      {/* Class Selector Bar */}
+      {classrooms.length > 1 && (
+        <div className="bg-card border-2 border-border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
+          <div className="flex items-center gap-2 text-base font-bold text-foreground">
+            <School className="size-5 text-primary" />
+            <span>Chß╗ìn lß╗¢p hß╗ìc:</span>
+          </div>
+
+          <div className="flex items-center gap-3 w-full sm:w-auto">
+            <select
+              value={selectedClassroomId}
+              onChange={(e) => handleClassChange(e.target.value)}
+              disabled={isPending}
+              className="w-full sm:w-72 px-4 py-2.5 rounded-xl border-2 border-input bg-background text-foreground text-base font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
+            >
+              {classrooms.map((cls) => (
+                <option key={cls.id} value={cls.id}>
+                  {cls.name} ({cls.code})
+                </option>
+              ))}
+            </select>
+
+            {isPending && <Loader2 className="size-5 animate-spin text-primary shrink-0" />}
+          </div>
+        </div>
+      )}
+
+      {/* Main Access Manager */}
+      {selectedClass && (
+        <ParentAccessManager
+          key={selectedClass.id}
+          classroomId={selectedClass.id}
+          classroomName={selectedClass.name}
+          classCode={selectedClass.code}
+          parents={parents}
+          announcements={announcements}
+          onPublishAnnouncement={handlePublish}
+          onDeleteAnnouncement={handleDelete}
+          onRegeneratePin={handleRegenerate}
+        />
+      )}
+    </div>
+  )
+}
diff --git a/tests/unit/components/ParentAccessManager.test.tsx b/tests/unit/components/ParentAccessManager.test.tsx
new file mode 100644
index 0000000..e16fdbc
--- /dev/null
+++ b/tests/unit/components/ParentAccessManager.test.tsx
@@ -0,0 +1,191 @@
+import React from 'react'
+import { describe, it, expect, vi, beforeEach } from 'vitest'
+import { render, screen, fireEvent, waitFor } from '@testing-library/react'
+import { ParentAccessManager } from '@/components/admin/ParentAccessManager'
+import type { ParentAccessInfo, ClassroomAnnouncement } from '@/types/parent'
+
+const sampleParents: ParentAccessInfo[] = [
+  {
+    studentId: 'stud-1',
+    studentName: 'B├⌐ Linh ─Éan',
+    classroomId: 'class-1',
+    classroomName: 'Lß╗¢p 3A',
+    classCode: 'ABC123',
+    accessPin: 'P-AB12CD',
+    accessToken: 'token-linhdan-123',
+    lastAccessedAt: '2026-09-12T10:00:00.000Z',
+  },
+  {
+    studentId: 'stud-2',
+    studentName: 'B├⌐ Minh Triß║┐t',
+    classroomId: 'class-1',
+    classroomName: 'Lß╗¢p 3A',
+    classCode: 'ABC123',
+    accessPin: 'P-EF34GH',
+    accessToken: 'token-triet-456',
+    lastAccessedAt: null,
+  },
+]
+
+const sampleAnnouncements: (ClassroomAnnouncement & { acknowledgedCount: number })[] = [
+  {
+    id: 'ann-1',
+    classroomId: 'class-1',
+    teacherId: 'teacher-1',
+    studentId: null,
+    title: '├ön tß║¡p th├¼ Hiß╗çn Tß║íi Ho├án Th├ánh',
+    content: 'C├íc b├⌐ ho├án th├ánh 2 v├ín game Flashcard tr╞░ß╗¢c Chß╗º Nhß║¡t.',
+    category: 'homework',
+    priority: 'important',
+    createdAt: '2026-09-12T08:00:00.000Z',
+    acknowledgedCount: 1,
+  },
+]
+
+describe('ParentAccessManager Component', () => {
+  const onPublishAnnouncement = vi.fn().mockResolvedValue({ success: true })
+  const onDeleteAnnouncement = vi.fn().mockResolvedValue({ success: true })
+  const onRegeneratePin = vi.fn().mockResolvedValue({ success: true, newPin: 'P-999999' })
+
+  beforeEach(() => {
+    vi.clearAllMocks()
+    // Mock navigator.clipboard
+    Object.assign(navigator, {
+      clipboard: {
+        writeText: vi.fn().mockResolvedValue(undefined),
+      },
+    })
+  })
+
+  it('renders student parent list with PINs and status', () => {
+    render(
+      <ParentAccessManager
+        classroomId="class-1"
+        classroomName="Lß╗¢p 3A"
+        classCode="ABC123"
+        parents={sampleParents}
+        announcements={sampleAnnouncements}
+        onPublishAnnouncement={onPublishAnnouncement}
+        onDeleteAnnouncement={onDeleteAnnouncement}
+        onRegeneratePin={onRegeneratePin}
+      />
+    )
+
+    expect(screen.getByText('B├⌐ Linh ─Éan')).toBeInTheDocument()
+    expect(screen.getByText('P-AB12CD')).toBeInTheDocument()
+    expect(screen.getByText('B├⌐ Minh Triß║┐t')).toBeInTheDocument()
+    expect(screen.getByText('P-EF34GH')).toBeInTheDocument()
+    expect(screen.getByText(/Ch╞░a truy cß║¡p/i)).toBeInTheDocument()
+  })
+
+  it('copies student parent magic link to clipboard', async () => {
+    render(
+      <ParentAccessManager
+        classroomId="class-1"
+        classroomName="Lß╗¢p 3A"
+        classCode="ABC123"
+        parents={sampleParents}
+        announcements={sampleAnnouncements}
+        onPublishAnnouncement={onPublishAnnouncement}
+        onDeleteAnnouncement={onDeleteAnnouncement}
+        onRegeneratePin={onRegeneratePin}
+      />
+    )
+
+    const copyButtons = screen.getAllByRole('button', { name: /Sao ch├⌐p link/i })
+    expect(copyButtons.length).toBeGreaterThan(0)
+
+    await React.act(async () => {
+      fireEvent.click(copyButtons[0])
+    })
+    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
+      expect.stringContaining('/parent/token-linhdan-123')
+    )
+  })
+
+  it('renders announcements with read receipt counter', () => {
+    render(
+      <ParentAccessManager
+        classroomId="class-1"
+        classroomName="Lß╗¢p 3A"
+        classCode="ABC123"
+        parents={sampleParents}
+        announcements={sampleAnnouncements}
+        onPublishAnnouncement={onPublishAnnouncement}
+        onDeleteAnnouncement={onDeleteAnnouncement}
+        onRegeneratePin={onRegeneratePin}
+      />
+    )
+
+    expect(screen.getByText('├ön tß║¡p th├¼ Hiß╗çn Tß║íi Ho├án Th├ánh')).toBeInTheDocument()
+    expect(screen.getByText(/1 \/ 2 phß╗Ñ huynh ─æ├ú ─æß╗ìc/i)).toBeInTheDocument()
+  })
+
+  it('opens announcement modal and publishes new notice', async () => {
+    render(
+      <ParentAccessManager
+        classroomId="class-1"
+        classroomName="Lß╗¢p 3A"
+        classCode="ABC123"
+        parents={sampleParents}
+        announcements={sampleAnnouncements}
+        onPublishAnnouncement={onPublishAnnouncement}
+        onDeleteAnnouncement={onDeleteAnnouncement}
+        onRegeneratePin={onRegeneratePin}
+      />
+    )
+
+    // Open compose modal
+    const composeBtn = screen.getByRole('button', { name: /Tß║ío th├┤ng b├ío mß╗¢i/i })
+    fireEvent.click(composeBtn)
+
+    // Fill form
+    fireEvent.change(screen.getByLabelText(/Ti├¬u ─æß╗ü th├┤ng b├ío/i), {
+      target: { value: 'Nghß╗ë lß╗à Quß╗æc Kh├ính' },
+    })
+    fireEvent.change(screen.getByLabelText(/Nß╗Öi dung th├┤ng b├ío/i), {
+      target: { value: 'Lß╗¢p sß║╜ nghß╗ë hß╗ìc v├áo thß╗⌐ Hai tuß║ºn tß╗¢i.' },
+    })
+
+    const submitBtn = screen.getByRole('button', { name: /Gß╗¡i th├┤ng b├ío/i })
+    fireEvent.click(submitBtn)
+
+    await waitFor(() => {
+      expect(onPublishAnnouncement).toHaveBeenCalledWith(
+        expect.objectContaining({
+          classroomId: 'class-1',
+          title: 'Nghß╗ë lß╗à Quß╗æc Kh├ính',
+          content: 'Lß╗¢p sß║╜ nghß╗ë hß╗ìc v├áo thß╗⌐ Hai tuß║ºn tß╗¢i.',
+        })
+      )
+    })
+  })
+
+  it('complies strictly with the min-16px font size policy (no sub-16px typography)', () => {
+    const { container } = render(
+      <ParentAccessManager
+        classroomId="class-1"
+        classroomName="Lß╗¢p 3A"
+        classCode="ABC123"
+        parents={sampleParents}
+        announcements={sampleAnnouncements}
+        onPublishAnnouncement={onPublishAnnouncement}
+        onDeleteAnnouncement={onDeleteAnnouncement}
+        onRegeneratePin={onRegeneratePin}
+      />
+    )
+
+    const prohibitedRegex = /\b(text-xs|text-sm|text-\[1[0-4]px\]|text-\[[0-9]px\])\b/
+    const allElements = container.querySelectorAll('*')
+
+    const violations: string[] = []
+    allElements.forEach((el) => {
+      const className = el.getAttribute('class') || ''
+      if (prohibitedRegex.test(className)) {
+        violations.push(`${el.tagName}: ${className}`)
+      }
+    })
+
+    expect(violations).toEqual([])
+  })
+})
